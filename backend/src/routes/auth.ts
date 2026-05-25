import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { hashPassword, verifyPassword, signToken, verifyGoogleIdToken } from '../utils/auth';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

const GoogleSchema = z.object({
  idToken: z.string().min(1, 'idToken required'),
});

function tokenForUser(user: { id: string; email: string; name: string }) {
  return signToken({ sub: user.id, email: user.email, name: user.name });
}

router.post('/signup', async (req, res, next) => {
  try {
    const parsed = SignupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten() });
    }
    const { name, email, password } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      provider: 'credentials',
    });

    const token = tokenForUser({ id: user.id, email: user.email, name: user.name });
    res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten() });
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = tokenForUser({ id: user.id, email: user.email, name: user.name });
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const parsed = GoogleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten() });
    }

    const profile = await verifyGoogleIdToken(parsed.data.idToken);

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        provider: 'google',
        googleId: profile.googleId,
        avatarUrl: profile.picture,
      });
    } else if (!user.googleId) {
      user.googleId = profile.googleId;
      user.provider = user.provider ?? 'google';
      if (profile.picture && !user.avatarUrl) user.avatarUrl = profile.picture;
      await user.save();
    }

    const token = tokenForUser({ id: user.id, email: user.email, name: user.name });
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user!.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
});

const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  school: z.string().optional(),
  schoolLocation: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  preferences: z
    .object({
      darkMode: z.boolean().optional(),
    })
    .optional(),
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten() });
    }
    const user = await User.findById(req.user!.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, school, schoolLocation, avatarUrl, preferences } = parsed.data;
    if (name !== undefined) user.name = name;
    if (school !== undefined) user.school = school;
    if (schoolLocation !== undefined) user.schoolLocation = schoolLocation;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl || undefined;
    if (preferences?.darkMode !== undefined) {
      user.preferences = { ...user.preferences, darkMode: preferences.darkMode };
    }
    await user.save();
    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
});

export default router;
