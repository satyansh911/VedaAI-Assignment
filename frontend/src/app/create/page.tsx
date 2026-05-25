import { CreateForm } from '@/components/CreateForm';
import { AppShell } from '@/components/AppShell';

export default function CreatePage() {
  return (
    <AppShell topBar={{ title: 'Create New', variant: 'create' }}>
      <div className="max-w-4xl mx-auto px-1">
        <CreateForm />
      </div>
    </AppShell>
  );
}
