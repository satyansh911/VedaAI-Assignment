import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { Types } from 'mongoose';
import { Assignment } from '../models/Assignment';
import { generationQueue } from '../queues/generationQueue';
import { cache } from '../config/redis';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(process.cwd(), 'uploads'),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-z0-9.\-_]/gi, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['application/pdf', 'text/plain'].includes(file.mimetype);
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or .txt files are allowed'));
    }
  },
});

const QuestionTypeSchema = z.object({
  type: z.string().min(1, 'Question type is required'),
  count: z.coerce.number().int().positive('Count must be positive'),
  marksPerQuestion: z.coerce.number().int().positive('Marks must be positive'),
});

const CreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  dueDate: z.coerce.date().refine((d) => d.getTime() > Date.now() - 86_400_000, {
    message: 'Due date must be today or later',
  }),
  questionTypes: z
    .array(QuestionTypeSchema)
    .min(1, 'Add at least one question type'),
  additionalInstructions: z.string().optional(),
  groupId: z.string().optional(),
});

async function extractText(file: Express.Multer.File | undefined): Promise<{
  text?: string;
  filename?: string;
}> {
  if (!file) return {};
  try {
    if (file.mimetype === 'application/pdf') {
      const buf = await fs.readFile(file.path);
      const parsed = await pdfParse(buf);
      return { text: parsed.text, filename: file.originalname };
    }
    const text = await fs.readFile(file.path, 'utf8');
    return { text, filename: file.originalname };
  } finally {
    fs.unlink(file.path).catch(() => undefined);
  }
}

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (typeof body.questionTypes === 'string') {
      try {
        body.questionTypes = JSON.parse(body.questionTypes);
      } catch {
        return res.status(400).json({ error: 'questionTypes must be valid JSON' });
      }
    }

    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        issues: parsed.error.flatten(),
      });
    }

    const { text, filename } = await extractText(req.file);

    const { groupId, ...rest } = parsed.data;
    const assignment = await Assignment.create({
      ...rest,
      userId: new Types.ObjectId(req.user!.sub),
      groupId: groupId ? new Types.ObjectId(groupId) : undefined,
      sourceText: text,
      sourceFileName: filename,
      status: 'pending',
    });

    const job = await generationQueue.add(
      'generate',
      { assignmentId: assignment.id },
      { jobId: `assignment_${assignment.id}` },
    );

    assignment.jobId = job.id;
    await assignment.save();

    res.status(201).json({
      id: assignment.id,
      status: assignment.status,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = { userId: req.user!.sub };
    if (req.query.groupId) filter.groupId = req.query.groupId;
    if (req.query.savedToLibrary === 'true') filter.savedToLibrary = true;

    const items = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .select('title subject status createdAt dueDate groupId savedToLibrary');
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const cacheKey = `assignment:${userId}:${req.params.id}`;
    const cached = await cache.get<{ _id: string }>(cacheKey);
    if (cached) {
      return res.json({ ...cached, _cache: 'hit' });
    }

    const assignment = await Assignment.findOne({ _id: req.params.id, userId });
    if (!assignment) return res.status(404).json({ error: 'Not found' });

    const obj = assignment.toObject();
    if (assignment.status === 'completed') {
      await cache.set(cacheKey, obj, 3600);
    }
    res.json(obj);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/regenerate', async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user!.sub });
    if (!assignment) return res.status(404).json({ error: 'Not found' });

    assignment.status = 'pending';
    assignment.error = undefined;
    assignment.paper = undefined;
    await assignment.save();
    await cache.del(`assignment:${req.user!.sub}:${req.params.id}`);

    const job = await generationQueue.add(
      'generate',
      { assignmentId: assignment.id },
      { jobId: `assignment_${assignment.id}_${Date.now()}` },
    );

    assignment.jobId = job.id;
    await assignment.save();

    res.json({ id: assignment.id, status: assignment.status });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/library', async (req, res, next) => {
  try {
    const { saved } = req.body as { saved?: boolean };
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.sub },
      { savedToLibrary: !!saved },
      { new: true },
    );
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    await cache.del(`assignment:${req.user!.sub}:${req.params.id}`);
    res.json({ id: assignment.id, savedToLibrary: assignment.savedToLibrary });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.sub,
    });
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    await cache.del(`assignment:${req.user!.sub}:${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
