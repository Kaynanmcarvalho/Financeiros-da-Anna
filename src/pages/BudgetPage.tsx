import { EmptyState } from '@/components/ui/EmptyState';
import { Target } from 'lucide-react';

export default function BudgetPage() {
  return (
    <div className="page">
      <EmptyState
        icon={<Target size={48} strokeWidth={1.2} />}
        title="Planejamento"
        description="O orçamento mensal será implementado na Fase 6."
      />
    </div>
  );
}
