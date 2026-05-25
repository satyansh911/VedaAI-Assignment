'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/context/AuthContext';

interface Props {
  children: ReactNode;
  topBar?: { title?: string; variant?: 'create' | 'default' };
  assignmentCount?: number;
}

export function AppShell({ children, topBar, assignmentCount }: Props) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-page dark:bg-page-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-ink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page dark:bg-page-dark p-3 lg:p-4">
      <div className="flex gap-4 max-w-[1600px] mx-auto h-[calc(100vh-24px)] lg:h-[calc(100vh-32px)]">
        <Sidebar assignmentCount={assignmentCount} />

        <main className="flex-1 flex flex-col min-w-0 gap-4 overflow-hidden">
          <TopBar title={topBar?.title} variant={topBar?.variant} />
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-4">{children}</div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
