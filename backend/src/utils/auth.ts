import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

const googleClient = new OAuth2Client(env.auth.googleClientId);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.auth.jwtSecret, { expiresIn: env.auth.jwtExpires } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.auth.jwtSecret) as JwtPayload;
}

export async function verifyGoogleIdToken(idToken: string): Promise<{
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}> {
  if (!env.auth.googleClientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured on the server');
  }
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.auth.googleClientId,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) {
    throw new Error('Invalid Google ID token');
  }
  return {
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
    googleId: payload.sub,
    picture: payload.picture,
  };
}
