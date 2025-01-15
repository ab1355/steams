'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/hooks/useSocket';

interface Notification {
  id: string;
  type: 'message' | 'progress' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (socket && session?.user?.id) {
      socket.on('newMessage', (message: any) => {
        if (message.receiverId === session.user.id) {
          const notification: Notification = {
            id: `msg-${message.id}`,
            type: 'message',
            title: `New message from ${message.sender.name}`,
            message: message.content,
            timestamp: new Date(),
            read: false,
            data: message,
          };
          setNotifications((prev) => [notification, ...prev]);
          showBrowserNotification(notification);
        }
      });

      socket.on('progressUpdate', (data: any) => {
        const notification: Notification = {
          id: `progress-${Date.now()}`,
          type: 'progress',
          title: 'Progress Update',
          message: `You've completed ${data.completedCount} lessons in ${data.pathName}!`,
          timestamp: new Date(),
          read: false,
          data,
        };
        setNotifications((prev) => [notification, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off('newMessage');
        socket.off('progressUpdate');
      }
    };
  }, [socket, session]);

  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== id)
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
