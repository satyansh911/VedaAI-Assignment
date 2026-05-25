import { AppShell } from '@/components/AppShell';
import { AssignmentsList } from '@/components/AssignmentsList';

export const dynamic = 'force-dynamic';

export default function AssignmentsPage() {
  return (
    <AppShell topBar={{ title: 'Assignment', variant: 'default' }}>
      <div className="max-w-6xl mx-auto px-1">
        <AssignmentsList />
      </div>
    </AppShell>
  );
}
