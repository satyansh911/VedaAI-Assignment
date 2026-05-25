'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/lib/api';
import { AssignmentEvent } from '@/types/assignment';

export function useAssignmentSocket(
  assignmentId: string | null,
  onEvent: (event: AssignmentEvent) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!assignmentId) return;

    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe', assignmentId);
    });

    socket.on('assignment:update', (event: AssignmentEvent) => {
      handlerRef.current(event);
    });

    return () => {
      socket.emit('unsubscribe', assignmentId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [assignmentId]);
}
