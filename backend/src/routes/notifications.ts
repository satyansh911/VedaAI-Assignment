import { Router } from 'express';
import { Notification } from '../models/Notification';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const items = await Notification.find({ userId: req.user!.sub })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      userId: req.user!.sub,
      read: false,
    });
    res.json({ items, unreadCount });
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user!.sub, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/read', async (req, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.sub },
      { read: true },
      { new: true },
    );
    if (!n) return res.status(404).json({ error: 'Not found' });
    res.json(n);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const n = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user!.sub });
    if (!n) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
