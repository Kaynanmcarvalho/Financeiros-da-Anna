import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Timestamp } from 'firebase/firestore';

import { useCreateReminder, useUpdateReminder } from '@/hooks/useReminders';
import { reminderSchema, type ReminderFormData } from '@/validators/schemas';
import type { Reminder } from '@/types';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CurrencyInput } from '@/components/ui/CurrencyInput';

interface ReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
  reminder?: Reminder | null;
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const emptyReminder = (): ReminderFormData => ({
  title: '',
  amount: null,
  dueDate: toDateInput(new Date()),
  recurrence: 'none',
  linkedAccountId: null,
  notifyDaysBefore: 3,
});

export function ReminderForm({ isOpen, onClose, reminder }: ReminderFormProps) {
  const createMutation = useCreateReminder();
  const updateMutation = useUpdateReminder();
  const isEditing = Boolean(reminder);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: emptyReminder(),
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(reminder ? {
      title: reminder.title,
      amount: reminder.amount,
      dueDate: toDateInput(reminder.dueDate.toDate()),
      recurrence: reminder.recurrence,
      linkedAccountId: reminder.linkedAccountId,
      notifyDaysBefore: reminder.notifyDaysBefore,
    } : emptyReminder());
  }, [isOpen, reminder, reset]);

  const hasAmount = watch('amount') !== null;

  const onSubmit = async (data: ReminderFormData) => {
    try {
      const [year = 0, month = 1, day = 1] = data.dueDate.split('-').map(Number);
      const editableData = {
        title: data.title,
        amount: data.amount,
        dueDate: Timestamp.fromDate(new Date(year, month - 1, day, 12)),
        recurrence: data.recurrence,
        linkedAccountId: data.linkedAccountId,
        notifyDaysBefore: data.notifyDaysBefore,
      };

      if (reminder) {
        await updateMutation.mutateAsync({ id: reminder.id, data: editableData });
      } else {
        await createMutation.mutateAsync(editableData);
      }
      onClose();
    } catch {
      // O hook exibe a mensagem de erro.
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar lembrete' : 'Novo lembrete'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex min-w-0 flex-col gap-5">
        <div className="rounded-2xl border border-[var(--color-button)]/15 bg-gradient-to-br from-[var(--color-primary)]/25 to-[var(--surface-raised)] p-4">
          <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-button)]">Agenda financeira</span>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {isEditing ? 'Atualize os dados para manter sua agenda organizada.' : 'Cadastre uma conta ou compromisso para não perder o vencimento.'}
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--color-text)]">Identificação</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Dê um nome fácil de reconhecer.</p>
          </div>
          <Input label="Título do lembrete" placeholder="Ex: Conta de luz, internet..." error={errors.title?.message} {...register('title')} />
        </section>

        <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--color-text)]">Data e frequência</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Escolha quando deseja ser lembrada.</p>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Vencimento" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
            <Select
              label="Frequência"
              error={errors.recurrence?.message}
              {...register('recurrence')}
              options={[
                { value: 'none', label: 'Não repete' },
                { value: 'weekly', label: 'Toda semana' },
                { value: 'monthly', label: 'Todo mês' },
                { value: 'yearly', label: 'Todo ano' },
              ]}
            />
          </div>
        </section>

        <Controller control={control} name="amount" render={({ field }) => (
          <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--surface-raised)] p-4">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-[var(--color-text)]">Valor previsto</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Opcional para contas de valor variável.</p>
              </div>
              {hasAmount && (
                <button
                  type="button"
                  onClick={() => field.onChange(null)}
                  className="shrink-0 rounded-xl bg-[var(--surface-elevated)] px-3 py-2 text-xs font-bold text-[var(--color-button)] transition-colors hover:bg-[var(--color-primary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-button)]/25"
                >
                  Limpar
                </button>
              )}
            </div>
            <div className="min-w-0 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3 shadow-sm">
              <CurrencyInput
                value={field.value || 0}
                onChange={(value) => field.onChange(value === 0 ? null : value)}
                error={errors.amount?.message}
                className="w-full min-w-0 border-none bg-transparent text-center font-extrabold text-[var(--color-text)] focus:ring-0"
              />
            </div>
          </section>
        )} />

        <div className="grid min-w-0 grid-cols-1 gap-3 border-t border-[var(--border-subtle)] pt-4 sm:grid-cols-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Criar lembrete'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
