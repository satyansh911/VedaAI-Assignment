import { AppShell } from '@/components/AppShell';
import { NotificationsView } from '@/components/NotificationsView';

export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
  return (
    <AppShell topBar={{ title: 'Notifications', variant: 'default' }}>
      <div className="max-w-3xl mx-auto px-1">
        <NotificationsView />
      </div>
    </AppShell>
  );
}
