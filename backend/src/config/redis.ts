import IORedis from 'ioredis';
import { env } from './env';

export const redisConnection = new IORedis({
  host: env.redis.host,
  port: env.redis.port,
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => {
  console.log('[redis] connected:', `${env.redis.host}:${env.redis.port}`);
});

redisConnection.on('error', (err) => {
  console.error('[redis] error:', err.message);
});

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await redisConnection.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async set<T>(key: string, value: T, ttlSec = 3600) {
    await redisConnection.set(key, JSON.stringify(value), 'EX', ttlSec);
  },
  async del(key: string) {
    await redisConnection.del(key);
  },
};
