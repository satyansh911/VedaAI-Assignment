'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, BookOpen, Sparkles, Users } from 'lucide-react';

const items = [
  { label: 'Home', href: '/assignments', icon: LayoutGrid },
  { label: 'Groups', href: '/groups', icon: Users },
  { label: 'Library', href: '/library', icon: BookOpen },
  { label: 'Toolkit', href: '/toolkit', icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-30 bg-ink-900 rounded-pill px-3 py-2.5 flex justify-around shadow-dark-pill">
      {items.map((item) => {
        const active = pathname?.startsWith(item.href);
        const Icon = item.icon;
        const cls = [
          'flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-colors text-[10px] font-medium min-w-[60px]',
          active ? 'bg-white/15 text-white' : 'text-white/60',
        ].join(' ');
        return (
          <Link key={item.label} href={item.href} className={cls}>
            <Icon className="w-4 h-4" strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
