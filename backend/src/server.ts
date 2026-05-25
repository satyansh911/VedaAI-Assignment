import http from 'http';
import { createApp } from './app';
import { connectMongo } from './config/db';
import { env } from './config/env';
import { initSocket, emitAssignmentEvent } from './ws/socket';
import { generationQueueEvents } from './queues/generationQueue';
import { Assignment } from './models/Assignment';

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
