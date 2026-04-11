import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

export interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  responseTime: number;
  ip: string;
  userAgent: string;
}

export function useSocket(token: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io({
      auth: { token },
    });

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return { socket, isConnected };
}
