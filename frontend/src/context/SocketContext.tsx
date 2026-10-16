import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { NotificationPayload } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: string[];
  notifications: NotificationPayload[];
  clearNotifications: () => void;
  joinBoard: (boardId: string) => void;
  leaveBoard: (boardId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const currentBoardRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (currentBoardRef.current) {
        newSocket.emit('join-board', currentBoardRef.current);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('presence:update', (data: { boardId: string; activeUsers: string[] }) => {
      if (data.boardId === currentBoardRef.current) {
        setActiveUsers(data.activeUsers);
      }
    });

    newSocket.on('notification:new', (notification: NotificationPayload) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const joinBoard = useCallback((boardId: string) => {
    currentBoardRef.current = boardId;
    if (socket && socket.connected) {
      socket.emit('join-board', boardId);
    }
  }, [socket]);

  const leaveBoard = useCallback((boardId: string) => {
    if (currentBoardRef.current === boardId) {
      currentBoardRef.current = null;
    }
    if (socket && socket.connected) {
      socket.emit('leave-board', boardId);
    }
    setActiveUsers([]);
  }, [socket]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeUsers,
        notifications,
        clearNotifications,
        joinBoard,
        leaveBoard,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
