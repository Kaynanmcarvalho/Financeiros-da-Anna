import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateGoal } from '@/hooks/useGoals';
import { goalSchema, type GoalFormData } from '@/validators/schemas';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { IconPicker } from '@/components/ui/IconPicker';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Timestamp } from 'firebase/firestore';

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalForm({ isOpen, onClose }: GoalFormProps) {
  const createMutation = useCreateGoal();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      targetAmount: 0,
      deadline: null,
      color: '#A78BFA', // default purple
      icon: 'Target',
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: GoalFormData) => {
    try {
      let deadlineTimestamp: Timestamp | null = null;
      
      // Ajuste de data seguro, assim como no TransactionForm
      if (data.deadline) {
        // Se a data for string (devido ao input type="date")
        const dateStr = typeof data.deadline === 'string' ? data.deadline : (data.deadline as Date).toISOString().substring(0, 10);
        const parts = dateStr.split('-');
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);
        deadlineTimestamp = Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0));
      }

      await createMutation.mutateAsync({
        title: data.title,
        targetAmount: data.targetAmount,
        deadline: deadlineTimestamp,
        color: data.color,
        icon: data.icon,
        imageURL: null,
      });
      onClose();
    } catch (e) {
      // Handled in mutation
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Desejo / Meta" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        
        <div className="flex gap-3 justify-center mb-2">
          <Controller
            control={control}
            name="icon"
            render={({ field }) => (
              <IconPicker value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <ColorPicker value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <Input
          label="Título da Meta"
          placeholder="Ex: Viagem para Paris"
          error={errors.title?.message}
          {...register('title')}
        />

        <Controller
          control={control}
          name="targetAmount"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-secondary)] ml-1">
                Qual o valor alvo?
              </label>
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)]">
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.targetAmount?.message}
                  className="font-bold text-center text-[var(--color-primary)] text-xl w-full bg-transparent border-none focus:ring-0"
                />
              </div>
            </div>
          )}
        />

        <Input
          label="Data Limite (Opcional)"
          type="date"
          error={errors.deadline?.message}
          {...register('deadline')}
        />

        <div className="flex gap-3 mt-4">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={createMutation.isPending} className="flex-1">
            Salvar Meta
          </Button>
        </div>
      </form>
    </Modal>
  );
}
