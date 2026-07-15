import { EmptyState } from '@/components/ui/EmptyState';
import { Heart } from 'lucide-react';

export default function GoalsPage() {
  return (
    <div className="page">
      <EmptyState
        icon={<Heart size={48} strokeWidth={1.2} />}
        title="Desejos"
        description="As metas e desejos serão implementados na Fase 6."
      />
    </div>
  );
}
