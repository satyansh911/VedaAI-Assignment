import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';
import { generateToolkitContent } from '../services/toolkit';

const router = Router();
router.use(requireAuth);

const InputSchema = z.object({
  tool: z.enum(['lesson_plan', 'rubric', 'study_notes']),
  topic: z.string().min(2, 'Topic is required').max(200),
  gradeLevel: z.string().max(40).optional(),
  subject: z.string().max(80).optional(),
  duration: z.coerce.number().int().min(5).max(240).optional(),
  notes: z.string().max(2000).optional(),
});

router.post('/generate', async (req, res, next) => {
  try {
    const parsed = InputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten() });
    }
    const content = await generateToolkitContent(parsed.data);
    res.json({ content });
  } catch (err) {
    next(err);
  }
});

export default router;
