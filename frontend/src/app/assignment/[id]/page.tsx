import { AssignmentView } from '@/components/AssignmentView';
import { AppShell } from '@/components/AppShell';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default function AssignmentPage({ params }: PageProps) {
  return (
    <AppShell topBar={{ title: 'Home', variant: 'default' }}>
      <AssignmentView assignmentId={params.id} />
    </AppShell>
  );
}
