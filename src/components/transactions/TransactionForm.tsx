import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Timestamp } from 'firebase/firestore';

import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { transactionSchema, type TransactionFormData } from '@/validators/schemas';
import type { TransactionType, Transaction } from '@/types';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Tabs } from '@/components/ui/Tabs';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  initialData?: Transaction;
}

export function TransactionForm({ isOpen, onClose, defaultType = 'expense', initialData }: TransactionFormProps) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      amount: 0,
      description: '',
      categoryId: '',
      accountId: '',
      toAccountId: '',
      date: new Date().toISOString().substring(0, 10), // YYYY-MM-DD local format
      isPaid: true,
      isRecurring: false,
      recurrenceRule: null,
      installments: null,
      notes: null,
    }
  });

  const txType = watch('type');

  // Reset values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          type: initialData.type,
          amount: initialData.amount,
          description: initialData.description,
          categoryId: initialData.categoryId,
          accountId: initialData.accountId || '',
          toAccountId: initialData.toAccountId || '',
          date: new Date(initialData.date.toMillis()).toISOString().substring(0, 10),
          isPaid: initialData.isPaid,
          isRecurring: initialData.isRecurring,
          recurrenceRule: initialData.recurrenceRule,
          installments: initialData.installments,
          notes: initialData.notes || '',
        });
      } else {
        reset({
          type: defaultType,
          amount: 0,
          description: '',
          categoryId: '',
          accountId: '',
          toAccountId: '',
          date: new Date().toISOString().substring(0, 10),
          isPaid: true,
          isRecurring: false,
          recurrenceRule: null,
          installments: null,
          notes: null,
        });
      }
    }
  }, [isOpen, defaultType, reset, initialData]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const fallbackDate = new Date().toISOString().substring(0, 10);
      const dateStr: string = data.date ? String(data.date) : fallbackDate;
      const parts = dateStr.split('-');
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);
      const dateObj = new Date(year, month - 1, day, 12, 0, 0); // Noon to avoid timezone shifts
      
      const payload = {
        type: data.type,
        amount: data.amount,
        description: data.description,
        categoryId: data.categoryId,
        accountId: data.accountId || null,
        toAccountId: data.type === 'transfer' ? (data.toAccountId || null) : null,
        date: Timestamp.fromDate(dateObj),
        isPaid: data.isPaid,
        isRecurring: data.isRecurring,
        recurrenceRule: data.recurrenceRule,
        installments: data.installments,
        notes: data.notes || null,
      };

      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, oldTx: initialData, newTx: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (e) {
      // errors handled by mutation
    }
  };

  const accountOptions = (accounts || [])
    .filter(a => !a.archived)
    .map(a => ({ value: a.id, label: a.name }));
    
  const categoryOptions = (categories || [])
    .filter(c => c.type === txType)
    .map(c => ({ value: c.id, label: c.name }));

  // Dinamic Color for the Amount Input
  const amountColor = txType === 'expense' ? 'var(--color-danger)' : txType === 'income' ? 'var(--color-success)' : 'var(--color-text)';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Lançamento" : "Novo Lançamento"} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        
        <Tabs 
          activeTab={txType}
          onTabChange={(v) => {
            const newType = v as TransactionType;
            setValue('type', newType);
            setValue('categoryId', ''); // Reset category when switching type
            if (newType !== 'transfer') setValue('toAccountId', null);
          }}
          tabs={[
            { value: 'expense', label: 'Despesa' },
            { value: 'income', label: 'Receita' },
            { value: 'transfer', label: 'Transf.' }
          ]} 
        />

        <div className="flex justify-center rounded-2xl border border-[var(--color-info)]/15 bg-gradient-to-br from-[var(--color-info)]/10 to-[var(--surface-raised)] p-4 shadow-sm sm:p-6">
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <div className="flex flex-col items-center">
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.amount?.message}
                  style={{ color: amountColor, fontSize: '32px', textAlign: 'center', backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
                  className="font-bold w-full max-w-[200px]"
                />
              </div>
            )}
          />
        </div>

        <Input
          label="Descrição"
          placeholder="Ex: Almoço, Salário, Pix..."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Data"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />

          {txType !== 'transfer' && (
            <Select
              label="Categoria"
              error={errors.categoryId?.message}
              {...register('categoryId')}
              options={[{ value: '', label: 'Selecione...' }, ...categoryOptions]}
            />
          )}
        </div>

        {txType === 'transfer' ? (
          <div className="grid min-w-0 grid-cols-1 gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 sm:grid-cols-2">
            <Select
              label="Conta Origem"
              error={errors.accountId?.message}
              {...register('accountId')}
              options={[{ value: '', label: 'Nenhuma / Dinheiro Vivo' }, ...accountOptions]}
            />
            <Select
              label="Conta Destino"
              error={errors.toAccountId?.message}
              {...register('toAccountId')}
              options={[{ value: '', label: 'Nenhuma / Dinheiro Vivo' }, ...accountOptions.filter(a => a.value !== watch('accountId'))]}
            />
          </div>
        ) : (
          <Select
            label="Conta / Cartão (Opcional)"
            error={errors.accountId?.message}
            {...register('accountId')}
            options={[{ value: '', label: 'Nenhuma / Dinheiro Vivo' }, ...accountOptions]}
          />
        )}

        {txType !== 'transfer' && (
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium">Já foi {txType === 'expense' ? 'pago' : 'recebido'}?</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register('isPaid')} />
              <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-button)]"></div>
            </label>
          </div>
        )}

        <div className="grid min-w-0 grid-cols-1 gap-3 border-t border-[var(--border-subtle)] pt-4 sm:grid-cols-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
            {initialData ? 'Salvar Alterações' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
