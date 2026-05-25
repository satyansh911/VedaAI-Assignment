'use client';

import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Users,
  Bookmark,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationsContext';
import { Notification, NotificationType } from '@/types/notification';

const iconFor: Record<NotificationType, React.ReactNode> = {
  assignment_completed: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  assignment_failed: <AlertTriangle className="w-4 h-4 text-red-600" />,
  group_created: <Users className="w-4 h-4 text-indigo-600" />,
  library_saved: <Bookmark className="w-4 h-4 text-accent" />,
  system: <Bell className="w-4 h-4 text-ink-500" />,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationsView() {
  const { items, unreadCount, loading, markAllRead, markRead, remove } = useNotifications();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-ink-900 dark:text-white">Notifications</h1>
          <p className="text-[13px] text-ink-500 dark:text-ink-400">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`
              : 'You are all caught up.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-pill bg-ink-900 dark:bg-accent text-white text-[13px] font-semibold hover:bg-ink-800"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading && items.length === 0 ? (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-10 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-ink-500" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card divide-y divide-ink-100 dark:divide-inset-dark">
          {items.map((n) => (
            <Item key={n._id} n={n} onRead={markRead} onRemove={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function Item({
  n,
  onRead,
  onRemove,
}: {
  n: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const body = (
    <div className="flex items-start gap-3 p-4">
      <span className="mt-1 w-8 h-8 rounded-full bg-ink-100 dark:bg-inset-dark flex items-center justify-center">
        {iconFor[n.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className={[
            'text-[14px]',
            n.read ? 'text-ink-700 dark:text-ink-300' : 'font-semibold text-ink-900 dark:text-white',
          ].join(' ')}
        >
          {n.title}
        </p>
        <p className="mt-0.5 text-[13px] text-ink-500 dark:text-ink-400">{n.message}</p>
        <p className="mt-1 text-[11px] text-ink-400">{timeAgo(n.createdAt)}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {!n.read && (
          <span className="w-2 h-2 rounded-full bg-accent mt-3" aria-label="Unread" />
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(n._id);
          }}
          className="w-8 h-8 rounded-full hover:bg-ink-100 dark:hover:bg-inset-dark flex items-center justify-center text-ink-500"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (n.link) {
    return (
      <Link
        href={n.link}
        onClick={() => !n.read && onRead(n._id)}
        className="block hover:bg-ink-50 dark:hover:bg-inset-dark transition-colors"
      >
        {body}
      </Link>
    );
  }

  return (
    <div
      onClick={() => !n.read && onRead(n._id)}
      className={n.read ? '' : 'cursor-pointer hover:bg-ink-50 dark:hover:bg-inset-dark'}
    >
      {body}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-ink-100 dark:bg-inset-dark flex items-center justify-center">
        <Bell className="w-6 h-6 text-ink-500" />
      </div>
      <h3 className="mt-4 text-[16px] font-bold text-ink-900 dark:text-white">
        No notifications yet
      </h3>
      <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-400">
        We will let you know here when there is something new — like a generated assignment.
      </p>
    </div>
  );
}
