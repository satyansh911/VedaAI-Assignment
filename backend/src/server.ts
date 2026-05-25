import http from 'http';
import { Worker } from 'bullmq';
import { createApp } from './app';
import { connectMongo } from './config/db';
import { env } from './config/env';
import { redisConnection, cache } from './config/redis';
import { initSocket, emitAssignmentEvent } from './ws/socket';
import { generationQueueEvents, GENERATION_QUEUE, GenerationJobData } from './queues/generationQueue';
import { Assignment } from './models/Assignment';
import { Notification } from './models/Notification';
import { generatePaper } from './services/llm';

async function main() {
  await connectMongo();

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);

  generationQueueEvents.on('active', ({ jobId }) => {
    const id = jobIdToAssignmentId(jobId);
    if (id) emitAssignmentEvent(id, { type: 'status', status: 'processing' });
  });

  generationQueueEvents.on('completed', async ({ jobId }) => {
    const id = jobIdToAssignmentId(jobId);
    if (!id) return;
    emitAssignmentEvent(id, { type: 'completed', assignmentId: id });
  });

  generationQueueEvents.on('failed', async ({ jobId, failedReason }) => {
    const id = jobIdToAssignmentId(jobId);
    if (!id) return;
    emitAssignmentEvent(id, {
      type: 'failed',
      assignmentId: id,
      error: failedReason ?? 'Unknown error',
    });
  });

  server.listen(env.port, () => {
    console.log(`[server] http://localhost:${env.port}`);
    console.log(`[server] CORS origin: ${env.clientOrigin}`);
  });

  startWorker();
}

function startWorker() {
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
      await cache.del(`assignment:${userId}:${assignmentId}`);
      await job.updateProgress({ stage: 'processing' });

      const paper = await generatePaper(assignment);

      assignment.paper = paper;
      assignment.status = 'completed';
      await assignment.save();

      await cache.set(`assignment:${userId}:${assignmentId}`, assignment.toObject(), 3600);

      await Notification.create({
        userId: assignment.userId,
        type: 'assignment_completed',
        title: 'Question paper ready',
        message: `"${assignment.title}" has been generated and is ready to view.`,
        link: `/assignment/${assignmentId}`,
      });

      return { assignmentId, ok: true };
    },
    { connection: redisConnection, concurrency: 2 },
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
        await cache.del(`assignment:${String(assignment.userId)}:${job.data.assignmentId}`);
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

  console.log('[worker] generation worker started (in-process)');
}

function jobIdToAssignmentId(jobId: string): string | null {
  if (!jobId.startsWith('assignment:')) return null;
  const parts = jobId.split(':');
  return parts[1] ?? null;
}

main().catch((err) => {
  console.error('[server] fatal:', err);
  process.exit(1);
});

void Assignment;
