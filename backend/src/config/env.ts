import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/vedaai',
  redis: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
    tls: process.env.REDIS_TLS === 'true',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY ?? '',
    model: process.env.GROQ_MODEL ?? 'mixtral-8x7b-32768',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me',
    jwtExpires: process.env.JWT_EXPIRES ?? '7d',
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  },
};
