'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '@/lib/api';
import { Notification } from '@/types/notification';
import { useAuth } from './AuthContext';

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const NotificationsCtx = createContext<NotificationsState | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const data = await api.listNotifications();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
    if (!user) return;
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, [refresh, user]);

  const markAllRead = useCallback(async () => {
    await api.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const markRead = useCallback(async (id: string) => {
    await api.markRead(id);
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteNotification(id);
    setItems((prev) => {
      const removed = prev.find((n) => n._id === id);
      if (removed && !removed.read) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((n) => n._id !== id);
    });
  }, []);

  const value = useMemo(
    () => ({ items, unreadCount, loading, refresh, markAllRead, markRead, remove }),
    [items, unreadCount, loading, refresh, markAllRead, markRead, remove],
  );

  return <NotificationsCtx.Provider value={value}>{children}</NotificationsCtx.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsCtx);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>');
  return ctx;
}
