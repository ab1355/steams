import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export const useSocket = () => {
  const { data: session } = useSession();
  const socket = useRef<Socket>();

  useEffect(() => {
    if (!socket.current && session?.user?.id) {
      socket.current = io({
        path: '/api/socket',
      });

      socket.current.on('connect', () => {
        console.log('Connected to WebSocket');
        socket.current?.emit('join', session.user.id);
      });

      socket.current.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [session]);

  return socket.current;
};
