import { AppShell } from '@/components/AppShell';
import { GroupsView } from '@/components/GroupsView';

export const dynamic = 'force-dynamic';

export default function GroupsPage() {
  return (
    <AppShell topBar={{ title: 'My Groups', variant: 'default' }}>
      <div className="max-w-6xl mx-auto px-1">
        <GroupsView />
      </div>
    </AppShell>
  );
}
