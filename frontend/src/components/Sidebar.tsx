'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  FileText,
  BookOpen,
  PieChart,
  Settings,
  Sparkles,
  Bell,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationsContext';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutGrid;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/assignments', icon: LayoutGrid },
  { label: 'My Groups', href: '/groups', icon: Users },
  { label: 'Assignments', href: '/assignments', icon: FileText },
  { label: 'AI Teacher’s Toolkit', href: '/toolkit', icon: BookOpen },
  { label: 'My Library', href: '/library', icon: PieChart },
  { label: 'Notifications', href: '/notifications', icon: Bell },
];

export function Sidebar({ assignmentCount = 0 }: { assignmentCount?: number }) {
  const pathname = usePathname();
  const isCreate = pathname?.startsWith('/create');
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-surface dark:bg-surface-dark rounded-3xl shadow-panel p-5 h-full">
      <div className="px-2 pb-3">
        <Logo />
      </div>

      <CreateAssignmentButton highlighted={isCreate} />

      <nav className="mt-8 flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/assignments' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          const badge =
            item.label === 'Assignments'
              ? assignmentCount
              : item.label === 'Notifications'
                ? unreadCount
                : 0;

          return (
            <Link key={item.label} href={item.href}>
              <div
                className={[
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors',
                  active
                    ? 'bg-ink-100 dark:bg-inset-dark text-ink-900 dark:text-white'
                    : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-inset-dark hover:text-ink-900 dark:hover:text-white',
                ].join(' ')}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[11px] font-semibold">
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 mt-4 border-t border-ink-200 dark:border-inset-dark space-y-3">
        <Link href="/settings">
          <div
            className={[
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-medium transition-colors',
              pathname?.startsWith('/settings')
                ? 'bg-ink-100 dark:bg-inset-dark text-ink-900 dark:text-white'
                : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-inset-dark hover:text-ink-900 dark:hover:text-white',
            ].join(' ')}
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={1.75} />
            Settings
          </div>
        </Link>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-ink-100 dark:bg-inset-dark">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 text-[14px] font-bold ring-1 ring-emerald-300">
            {schoolInitials(user?.school)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-ink-900 dark:text-white truncate">
              {user?.school ?? 'Delhi Public School'}
            </p>
            <p className="text-[11px] text-ink-500 dark:text-ink-400 truncate">
              {user?.schoolLocation ?? 'Bokaro Steel City'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function schoolInitials(school?: string): string {
  if (!school) return 'DPS';
  const parts = school.split(/\s+/).filter(Boolean);
  return (parts.slice(0, 3).map((p) => p[0]).join('') || school.slice(0, 3)).toUpperCase();
}

export function CreateAssignmentButton({
  highlighted = false,
  href = '/create',
  fullWidth = true,
}: {
  highlighted?: boolean;
  href?: string;
  fullWidth?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        'group relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-pill bg-ink-900 text-white text-[14px] font-semibold transition-all',
        'hover:bg-ink-800 shadow-dark-pill',
        highlighted ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface dark:ring-offset-surface-dark' : '',
        fullWidth ? 'w-full' : '',
      ].join(' ')}
    >
      <Sparkles className="w-4 h-4 text-accent-400" />
      <span>Create Assignment</span>
    </Link>
  );
}
