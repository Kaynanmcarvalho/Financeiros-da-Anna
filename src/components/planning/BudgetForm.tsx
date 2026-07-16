import { useEffect, useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSaveBudget } from '@/hooks/useBudgets';
import { useUIStore } from '@/stores/uiStore';
import type { Budget, Category } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { LucideIcon } from '@/components/ui/IconPicker';

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
  budget: Budget | null | undefined;
  categories: Category[];
}

export function BudgetForm({ isOpen, onClose, month, budget, categories }: BudgetFormProps) {
  const [values, setValues] = useState<Record<string, number>>({});
  const saveMutation = useSaveBudget();
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    if (!isOpen) return;
    setValues(Object.fromEntries((budget?.limits ?? []).map((item) => [item.categoryId, item.limit])));
  }, [budget, isOpen, month]);

  const [year = 0, monthNumber = 1] = month.split('-').map(Number);
  const monthLabel = format(new Date(year, monthNumber - 1, 1), 'MMMM yyyy', { locale: ptBR });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const limits = categories
      .map((category) => ({ categoryId: category.id, limit: values[category.id] ?? 0 }))
      .filter((item) => item.limit > 0);

    if (limits.length === 0) {
      addToast({ type: 'warning', title: 'Informe ao menos um limite' });
      return;
    }

    try {
      await saveMutation.mutateAsync({ month, limits });
      onClose();
    } catch {
      // O hook apresenta a mensagem de erro.
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budget ? 'Editar planejamento' : 'Adicionar planejamento'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-5">
        <div className="rounded-2xl border border-[var(--color-warning)]/20 bg-gradient-to-br from-[var(--color-warning)]/15 to-[var(--surface-raised)] p-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-warning)]">Mês planejado</span>
          <p className="mt-1 capitalize text-lg font-extrabold text-[var(--color-text)]">{monthLabel}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Defina limites realistas para cada categoria.</p>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-4 text-sm text-[var(--color-text-secondary)]">
            Crie uma categoria de despesa no perfil antes de adicionar o planejamento.
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-3">
            <p className="text-sm text-[var(--color-text-secondary)]">Defina quanto pretende gastar em cada categoria:</p>
            {categories.map((category) => (
              <div key={category.id} className="flex min-w-0 flex-col gap-3 rounded-xl border border-[var(--color-border)] p-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <LucideIcon name={category.icon} size={20} />
                  </div>
                  <span className="min-w-0 break-words text-sm font-semibold text-[var(--color-text)]">{category.name}</span>
                </div>
                <CurrencyInput
                  value={values[category.id] ?? 0}
                  onChange={(value) => setValues((current) => ({ ...current, [category.id]: value }))}
                  className="w-full min-w-0 sm:w-44"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saveMutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={saveMutation.isPending} disabled={categories.length === 0}>
            Salvar planejamento
          </Button>
        </div>
      </form>
    </Modal>
  );
}