import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Timestamp } from 'firebase/firestore';

import { useCreateGoal, useUpdateGoal } from '@/hooks/useGoals';
import { goalSchema, type GoalFormData } from '@/validators/schemas';
import type { Goal } from '@/types';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { IconPicker } from '@/components/ui/IconPicker';
import { ColorPicker } from '@/components/ui/ColorPicker';

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
}

const emptyGoal: GoalFormData = {
  title: '',
  targetAmount: 0,
  deadline: null,
  color: '#A78BFA',
  icon: 'Target',
};

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function GoalForm({ isOpen, onClose, goal }: GoalFormProps) {
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const isEditing = Boolean(goal);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: emptyGoal,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(goal ? {
      title: goal.title,
      targetAmount: goal.targetAmount,
      deadline: goal.deadline ? toDateInput(goal.deadline.toDate()) : null,
      color: goal.color,
      icon: goal.icon,
    } : emptyGoal);
  }, [goal, isOpen, reset]);

  const onSubmit = async (data: GoalFormData) => {
    try {
      let deadline: Timestamp | null = null;
      if (data.deadline) {
        const [year = 0, month = 1, day = 1] = data.deadline.split('-').map(Number);
        deadline = Timestamp.fromDate(new Date(year, month - 1, day, 12));
      }

      const editableData = {
        title: data.title,
        targetAmount: data.targetAmount,
        deadline,
        color: data.color,
        icon: data.icon,
      };

      if (goal) {
        await updateMutation.mutateAsync({ id: goal.id, data: editableData });
      } else {
        await createMutation.mutateAsync({ ...editableData, imageURL: null });
      }
      onClose();
    } catch {
      // O hook exibe a mensagem de erro.
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar desejo' : 'Novo desejo'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex min-w-0 flex-col gap-5">
        <div className="rounded-2xl border border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent)]/15 to-[var(--surface-raised)] p-4">
          <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-accent)]">Sonhos e conquistas</span>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {isEditing ? 'Atualize sua meta e continue acompanhando essa conquista.' : 'Dê o primeiro passo para transformar esse desejo em realidade.'}
          </p>
        </div>
        <div className="mb-2 flex min-w-0 flex-wrap justify-center gap-3">
          <Controller control={control} name="icon" render={({ field }) => (
            <IconPicker value={field.value} onChange={field.onChange} />
          )} />
          <Controller control={control} name="color" render={({ field }) => (
            <ColorPicker value={field.value} onChange={field.onChange} />
          )} />
        </div>

        <Input label="Título da Meta" placeholder="Ex: Viagem para Paris" error={errors.title?.message} {...register('title')} />

        <Controller control={control} name="targetAmount" render={({ field }) => (
          <div className="flex min-w-0 flex-col gap-1">
            <label className="ml-1 text-sm font-medium text-[var(--color-text-secondary)]">Qual o valor alvo?</label>
            <div className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
              <CurrencyInput
                value={field.value}
                onChange={field.onChange}
                error={errors.targetAmount?.message}
                className="w-full min-w-0 border-none bg-transparent text-center text-xl font-bold text-[var(--color-primary)] focus:ring-0"
              />
            </div>
          </div>
        )} />

        <Input label="Data Limite (Opcional)" type="date" error={errors.deadline?.message} {...register('deadline')} />

        <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={isPending}>
            {isEditing ? 'Salvar Alterações' : 'Salvar Meta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
