'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  LayoutGrid,
  Sparkles,
  Menu,
  Settings,
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
} from 'lucide-react';
import { Logo } from './Logo';
import { useState, useRef, useEffect } from 'react';
import { MobileMenu } from './MobileMenu';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationsContext';

interface Props {
  title?: string;
  variant?: 'create' | 'default';
}

export function TopBar({ title, variant = 'default' }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { unreadCount } = useNotifications();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const showBack = pathname !== '/' && pathname !== '/assignments';
  const Icon = variant === 'create' ? Sparkles : LayoutGrid;
  const initials = (user?.name ?? 'U')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <header className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full bg-ink-100 dark:bg-inset-dark hover:bg-ink-200 dark:hover:bg-surface-dark-2 flex items-center justify-center transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-ink-900 dark:text-white" />
            </button>
          )}
          <div className="hidden lg:flex items-center gap-2 text-[15px] font-medium">
            <Icon
              className={
                variant === 'create' ? 'w-4 h-4 text-accent' : 'w-4 h-4 text-ink-500 dark:text-ink-400'
              }
            />
            <span className={variant === 'create' ? 'text-accent' : 'text-ink-500 dark:text-ink-400'}>
              {title ?? 'Home'}
            </span>
          </div>

          <Link href="/assignments" className="lg:hidden ml-1">
            <Logo size={28} />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className="w-9 h-9 rounded-full bg-ink-100 dark:bg-inset-dark hover:bg-ink-200 dark:hover:bg-surface-dark-2 flex items-center justify-center transition-colors"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-white" />
            ) : (
              <Moon className="w-4 h-4 text-ink-900" />
            )}
          </button>

          <Link
            href="/notifications"
            className="relative w-9 h-9 rounded-full bg-ink-100 dark:bg-inset-dark hover:bg-ink-200 dark:hover:bg-surface-dark-2 flex items-center justify-center transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-ink-900 dark:text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface dark:ring-surface-dark">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <div ref={profileRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 pr-2 hover:opacity-90"
            >
              <Avatar initials={initials} avatarUrl={user?.avatarUrl} />
              <span className="hidden md:inline text-[14px] font-semibold text-ink-900 dark:text-white">
                {user?.name ?? 'Guest'}
              </span>
              <ChevronDown className="hidden md:inline w-4 h-4 text-ink-500 dark:text-ink-400" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 bg-surface dark:bg-surface-dark rounded-2xl shadow-panel ring-1 ring-ink-200 dark:ring-inset-dark py-2 z-30">
                <div className="px-4 py-2 border-b border-ink-200 dark:border-inset-dark">
                  <p className="text-[13px] font-bold text-ink-900 dark:text-white truncate">
                    {user?.name ?? 'Guest'}
                  </p>
                  <p className="text-[11px] text-ink-500 dark:text-ink-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] text-ink-900 dark:text-white hover:bg-ink-100 dark:hover:bg-inset-dark"
                >
                  <UserIcon className="w-4 h-4" /> Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] text-ink-900 dark:text-white hover:bg-ink-100 dark:hover:bg-inset-dark"
                >
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="lg:hidden w-9 h-9 rounded-full bg-ink-100 dark:bg-inset-dark flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4 text-ink-900 dark:text-white" />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function Avatar({ initials, avatarUrl }: { initials: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={initials}
        width={36}
        height={36}
        className="w-9 h-9 rounded-full ring-1 ring-ink-200 dark:ring-inset-dark object-cover"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 ring-1 ring-ink-200 dark:ring-inset-dark flex items-center justify-center text-ink-900 text-xs font-bold">
      {initials}
    </div>
  );
}
