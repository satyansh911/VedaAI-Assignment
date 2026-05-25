import { Worker } from 'bullmq';
import { connectMongo } from '../config/db';
import { redisConnection, cache } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { Notification } from '../models/Notification';
import { GENERATION_QUEUE, GenerationJobData } from '../queues/generationQueue';
import { generatePaper } from '../services/llm';

function cacheKey(userId: string, assignmentId: string) {
  return `assignment:${userId}:${assignmentId}`;
}

async function main() {
  await connectMongo();

  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    async (job) => {
      const { assignmentId } = job.data;
      console.log(`[worker] job ${job.id} → assignment ${assignmentId}`);

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

      const userId = String(assignment.userId);

      assignment.status = 'processing';
      assignment.error = undefined;
      await assignment.save();
      await cache.del(cacheKey(userId, assignmentId));
      await job.updateProgress({ stage: 'processing' });

      const paper = await generatePaper(assignment);

      assignment.paper = paper;
      assignment.status = 'completed';
      await assignment.save();

      await cache.set(cacheKey(userId, assignmentId), assignment.toObject(), 3600);

      await Notification.create({
        userId: assignment.userId,
        type: 'assignment_completed',
        title: 'Question paper ready',
        message: `"${assignment.title}" has been generated and is ready to view.`,
        link: `/assignment/${assignmentId}`,
      });

      return { assignmentId, ok: true };
    },
    {
      connection: redisConnection,
      concurrency: 2,
    },
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    console.error(`[worker] job ${job.id} failed:`, err.message);
    try {
      const assignment = await Assignment.findByIdAndUpdate(
        job.data.assignmentId,
        { status: 'failed', error: err.message },
        { new: true },
      );
      if (assignment) {
        await cache.del(cacheKey(String(assignment.userId), job.data.assignmentId));
        await Notification.create({
          userId: assignment.userId,
          type: 'assignment_failed',
          title: 'Generation failed',
          message: `Could not generate "${assignment.title}". ${err.message.slice(0, 140)}`,
          link: `/assignment/${job.data.assignmentId}`,
        });
      }
    } catch (e) {
      console.error('[worker] failed to persist failure state:', e);
    }
  });

  worker.on('completed', (job) => {
    console.log(`[worker] job ${job.id} completed`);
  });

  console.log('[worker] generation worker running');
}

main().catch((err) => {
  console.error('[worker] fatal:', err);
  process.exit(1);
});
