import { AppShell } from '@/components/AppShell';
import { ToolkitView } from '@/components/ToolkitView';

export const dynamic = 'force-dynamic';

export default function ToolkitPage() {
  return (
    <AppShell topBar={{ title: 'AI Teacher’s Toolkit', variant: 'create' }}>
      <div className="max-w-5xl mx-auto px-1">
        <ToolkitView />
      </div>
    </AppShell>
  );
}
