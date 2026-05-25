import { Queue, QueueEvents } from 'bullmq';
import { redisConnection } from '../config/redis';

export const GENERATION_QUEUE = 'paper-generation';

export interface GenerationJobData {
  assignmentId: string;
}

export const generationQueue = new Queue<GenerationJobData>(GENERATION_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600 },
  },
});

export const generationQueueEvents = new QueueEvents(GENERATION_QUEUE, {
  connection: redisConnection,
});
