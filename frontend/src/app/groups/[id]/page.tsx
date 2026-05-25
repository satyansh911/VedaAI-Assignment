import { AppShell } from '@/components/AppShell';
import { GroupDetailView } from '@/components/GroupDetailView';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default function GroupDetailPage({ params }: PageProps) {
  return (
    <AppShell topBar={{ title: 'My Groups', variant: 'default' }}>
      <div className="max-w-6xl mx-auto px-1">
        <GroupDetailView groupId={params.id} />
      </div>
    </AppShell>
  );
}
