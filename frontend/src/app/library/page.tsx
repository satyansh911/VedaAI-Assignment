import { AppShell } from '@/components/AppShell';
import { LibraryView } from '@/components/LibraryView';

export const dynamic = 'force-dynamic';

export default function LibraryPage() {
  return (
    <AppShell topBar={{ title: 'My Library', variant: 'default' }}>
      <div className="max-w-6xl mx-auto px-1">
        <LibraryView />
      </div>
    </AppShell>
  );
}
