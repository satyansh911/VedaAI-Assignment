import { AppShell } from '@/components/AppShell';
import { SettingsView } from '@/components/SettingsView';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <AppShell topBar={{ title: 'Settings', variant: 'default' }}>
      <div className="max-w-3xl mx-auto px-1">
        <SettingsView />
      </div>
    </AppShell>
  );
}
