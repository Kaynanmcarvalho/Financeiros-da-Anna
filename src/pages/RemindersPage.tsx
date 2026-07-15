import { EmptyState } from '@/components/ui/EmptyState';
import { Bell } from 'lucide-react';

export default function RemindersPage() {
  return (
    <div className="page">
      <EmptyState
        icon={<Bell size={48} strokeWidth={1.2} />}
        title="Lembretes"
        description="Os lembretes de contas serão implementados na Fase 6."
      />
    </div>
  );
}
