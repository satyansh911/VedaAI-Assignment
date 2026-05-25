'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  LayoutGrid,
  Users,
  FileText,
  BookOpen,
  PieChart,
  Settings,
  LogOut,
  Bell,
} from 'lucide-react';
import { Logo } from './Logo';
import { CreateAssignmentButton } from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationsContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Home', href: '/assignments', icon: LayoutGrid },
  { label: 'My Groups', href: '/groups', icon: Users },
  { label: 'Assignments', href: '/assignments', icon: FileText },
  { label: 'AI Teacher’s Toolkit', href: '/toolkit', icon: BookOpen },
  { label: 'My Library', href: '/library', icon: PieChart },
  { label: 'Notifications', href: '/notifications', icon: Bell, showBadge: true },
];

export function MobileMenu({ open, onClose }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <aside className="relative ml-auto w-[280px] h-full bg-surface dark:bg-surface-dark shadow-panel flex flex-col p-5">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-ink-100 dark:bg-inset-dark flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-ink-900 dark:text-white" />
          </button>
        </div>

        <div className="mt-6">
          <CreateAssignmentButton highlighted={pathname?.startsWith('/create')} />
        </div>

        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            const cls = [
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors',
              active
                ? 'bg-ink-100 dark:bg-inset-dark text-ink-900 dark:text-white'
                : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-inset-dark hover:text-ink-900 dark:hover:text-white',
            ].join(' ');
            return (
              <Link key={item.label} href={item.href} onClick={onClose} className={cls}>
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span className="flex-1">{item.label}</span>
                {item.showBadge && unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[11px] font-semibold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 mt-3 border-t border-ink-200 dark:border-inset-dark pt-3">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-inset-dark"
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={1.75} />
            Settings
          </Link>
          {user && (
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
              Logout
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
