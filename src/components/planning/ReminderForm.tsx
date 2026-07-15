import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Timestamp } from 'firebase/firestore';

import { useCreateReminder } from '@/hooks/useReminders';
import { reminderSchema, type ReminderFormData } from '@/validators/schemas';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CurrencyInput } from '@/components/ui/CurrencyInput';

interface ReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReminderForm({ isOpen, onClose }: ReminderFormProps) {
  const createMutation = useCreateReminder();

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: '',
      amount: null,
      dueDate: new Date().toISOString().substring(0, 10), // YYYY-MM-DD local format
      recurrence: 'none',
      linkedAccountId: null,
      notifyDaysBefore: 3,
    }
  });

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const hasAmount = watch('amount') !== null;

  const onSubmit = async (data: ReminderFormData) => {
    try {
      const dateStr = data.dueDate as string;
      const parts = dateStr.split('-');
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);
      const dueDateTimestamp = Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0));

      await createMutation.mutateAsync({
        title: data.title,
        amount: data.amount,
        dueDate: dueDateTimestamp,
        recurrence: data.recurrence,
        linkedAccountId: data.linkedAccountId,
        notifyDaysBefore: data.notifyDaysBefore,
      });
      onClose();
    } catch (e) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Lembrete de Conta" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        
        <Input
          label="Nome da Conta"
          placeholder="Ex: Conta de Luz, Internet..."
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Vencimento"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
          <Select
            label="Repete?"
            error={errors.recurrence?.message}
            {...register('recurrence')}
            options={[
              { value: 'none', label: 'Não repete' },
              { value: 'monthly', label: 'Todo mês' },
              { value: 'yearly', label: 'Todo ano' }
            ]}
          />
        </div>

        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1 flex justify-between">
                <span>Valor (Opcional)</span>
                {hasAmount && (
                  <button type="button" onClick={() => field.onChange(null)} className="text-[10px] text-[var(--color-button)]">Limpar</button>
                )}
              </label>
              <div className="p-3 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)]">
                <CurrencyInput
                  value={field.value || 0}
                  onChange={(val) => field.onChange(val === 0 ? null : val)}
                  error={errors.amount?.message}
                  className="font-bold text-center text-[var(--color-text)] w-full bg-transparent border-none focus:ring-0"
                />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] ml-1">Deixe zerado se for conta variável (ex: Água).</span>
            </div>
          )}
        />

        <div className="flex gap-3 mt-4">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={createMutation.isPending} className="flex-1">
            Criar Lembrete
          </Button>
        </div>
      </form>
    </Modal>
  );
}
