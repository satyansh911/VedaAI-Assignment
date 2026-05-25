import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Group } from '../models/Group';
import { Assignment } from '../models/Assignment';
import { Notification } from '../models/Notification';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

const CreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  description: z.string().max(400).optional(),
  gradeLevel: z.string().max(40).optional(),
  subject: z.string().max(80).optional(),
  studentCount: z.coerce.number().int().min(0).max(2000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const groups = await Group.find({ userId: req.user!.sub }).sort({ createdAt: -1 });
    const ids = groups.map((g) => g._id);
    const counts = await Assignment.aggregate([
      { $match: { userId: new Types.ObjectId(req.user!.sub), groupId: { $in: ids } } },
      { $group: { _id: '$groupId', count: { $sum: 1 } } },
    ]);
    const map = new Map(counts.map((c) => [String(c._id), c.count]));
    res.json(
      groups.map((g) => ({ ...g.toObject(), assignmentCount: map.get(String(g._id)) ?? 0 })),
    );
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = CreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten() });
    }
    const group = await Group.create({ ...parsed.data, userId: req.user!.sub });
    await Notification.create({
      userId: req.user!.sub,
      type: 'group_created',
      title: 'Group created',
      message: `Your group "${group.name}" is ready.`,
      link: `/groups`,
    });
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, userId: req.user!.sub });
    if (!group) return res.status(404).json({ error: 'Not found' });
    const assignments = await Assignment.find({
      userId: req.user!.sub,
      groupId: group._id,
    })
      .sort({ createdAt: -1 })
      .select('title subject status createdAt dueDate');
    res.json({ ...group.toObject(), assignments });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const parsed = CreateSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten() });
    }
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.sub },
      parsed.data,
      { new: true },
    );
    if (!group) return res.status(404).json({ error: 'Not found' });
    res.json(group);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const group = await Group.findOneAndDelete({ _id: req.params.id, userId: req.user!.sub });
    if (!group) return res.status(404).json({ error: 'Not found' });
    await Assignment.updateMany(
      { userId: req.user!.sub, groupId: group._id },
      { $unset: { groupId: '' } },
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
