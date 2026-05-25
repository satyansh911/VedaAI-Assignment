import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { env } from '../config/env';

let io: IOServer | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new IOServer(httpServer, {
    cors: {
      origin: env.clientOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    socket.on('subscribe', (assignmentId: string) => {
      if (typeof assignmentId === 'string' && assignmentId.length > 0) {
        socket.join(`assignment:${assignmentId}`);
      }
    });

    socket.on('unsubscribe', (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });
  });

  console.log('[socket.io] initialised');
  return io;
}

export function getIO(): IOServer {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
}

export type AssignmentEvent =
  | { type: 'status'; status: 'pending' | 'processing' | 'completed' | 'failed'; message?: string }
  | { type: 'completed'; assignmentId: string }
  | { type: 'failed'; assignmentId: string; error: string };

export function emitAssignmentEvent(assignmentId: string, event: AssignmentEvent) {
  if (!io) return;
  io.to(`assignment:${assignmentId}`).emit('assignment:update', event);
}
