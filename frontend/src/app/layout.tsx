import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VedaAI — Assessment Creator',
  description: 'AI Teacher’s Toolkit by VedaAI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <body className="font-sans bg-page text-ink-900 dark:bg-page-dark dark:text-white overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
