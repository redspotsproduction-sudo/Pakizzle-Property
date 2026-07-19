import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '../types';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'status'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isFirstLoadRef = useRef(true);
  const notificationsRef = useRef<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      notificationsRef.current = [];
      isFirstLoadRef.current = true;
      return;
    }

    const unsubscribe = notificationService.subscribeToNotifications(user.uid, (newNotifications) => {
      // Logic for toast on new unread notification
      if (!isFirstLoadRef.current) {
        const justAdded = newNotifications.find(n => 
          n.status === 'unread' && 
          !notificationsRef.current.some(old => old.id === n.id)
        );
        
        if (justAdded) {
          toast(justAdded.title, {
            description: justAdded.message,
            action: justAdded.link ? {
              label: 'View',
              onClick: () => {
                if (justAdded.link?.startsWith('http')) {
                  window.location.href = justAdded.link;
                } else if (justAdded.link) {
                  navigate(justAdded.link);
                }
              }
            } : undefined
          });
        }
      }

      notificationsRef.current = newNotifications;
      setNotifications(newNotifications);
      isFirstLoadRef.current = false;
    });

    return () => unsubscribe();
  }, [user?.uid, navigate]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.uid);
  }, [user]);

  const sendNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'status'>) => {
    await notificationService.sendNotification(notification);
  }, []);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      sendNotification
    }}>
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
