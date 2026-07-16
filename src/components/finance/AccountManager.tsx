import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2, CreditCard } from 'lucide-react';

import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/useAccounts';
import { useUIStore } from '@/stores/uiStore';
import { accountSchema, type AccountFormData } from '@/validators/schemas';
import { ACCOUNT_TYPE_LABELS } from '@/constants/app';
import type { Account } from '@/types';
import { formatCurrency } from '@/utils/currency';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { IconPicker, LucideIcon } from '@/components/ui/IconPicker';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface AccountManagerProps {
  initialMode?: 'list' | 'create';
}

export function AccountManager({ initialMode = 'list' }: AccountManagerProps) {
  const { data: accounts, isLoading } = useAccounts();
  const deleteAccountMutation = useDeleteAccount();
  const openConfirmDialog = useUIStore((s) => s.openConfirmDialog);

  const [isModalOpen, setIsModalOpen] = useState(initialMode === 'create');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = (account: Account) => {
    openConfirmDialog({
      title: 'Excluir Conta?',
      description: `Tem certeza que deseja excluir a conta "${account.name}"? Isso não apagará os lançamentos já feitos, mas ela não poderá mais ser selecionada.`,
      variant: 'danger',
      onConfirm: () => deleteAccountMutation.mutate(account.id),
    });
  };

  if (isLoading) {
    return <SkeletonList count={3} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h3 className="font-semibold text-lg text-[var(--color-text)]">Contas e Cartões</h3>
        <Button size="sm" onClick={handleOpenCreate} icon={<Plus size={16} />}>
          Nova Conta
        </Button>
      </div>

      {!accounts || accounts.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={40} />}
          title="Nenhuma conta cadastrada"
          description="Crie uma conta ou cartão para começar a lançar."
          actionLabel="Criar Conta"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid gap-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`flex min-w-0 flex-col gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between ${account.archived ? 'opacity-60 grayscale' : ''}`}
            >
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: account.color }}
                >
                  <LucideIcon name={account.icon} size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h4 className="min-w-0 break-words font-semibold text-[var(--color-text)]">{account.name}</h4>
                    {account.archived && <span className="bg-[var(--color-warning)] text-[var(--color-bg)] font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Arquivada</span>}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {ACCOUNT_TYPE_LABELS[account.type]}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center justify-end gap-1 border-t border-[var(--color-border)] pt-2 sm:border-0 sm:pt-0">
                <div className="mr-auto min-w-0 text-left sm:mr-2 sm:text-right">
                  {account.type === 'credit_card' && account.creditLimit ? (
                    <>
                      <p className="text-xs text-[var(--color-text-secondary)]">Limite</p>
                      <p className="font-medium text-[var(--color-text)]">{formatCurrency(account.creditLimit)}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-[var(--color-text-secondary)]">Saldo Inicial</p>
                      <p className="font-medium text-[var(--color-text)]">{formatCurrency(account.initialBalance)}</p>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleOpenEdit(account)}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-button)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                  aria-label="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(account)}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                  aria-label="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          account={editingAccount}
        />
      )}
    </div>
  );
}

// Modal Form Component separated for cleaner code
function AccountModal({ isOpen, onClose, account }: { isOpen: boolean, onClose: () => void, account: Account | null }) {
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: account ? {
      name: account.name,
      type: account.type,
      color: account.color,
      icon: account.icon,
      initialBalance: account.initialBalance,
      creditLimit: account.creditLimit,
      closingDay: account.closingDay,
      dueDay: account.dueDay,
      archived: account.archived,
    } : {
      name: '',
      type: 'wallet',
      color: 'var(--color-primary)',
      icon: 'Wallet',
      initialBalance: 0,
      creditLimit: null,
      closingDay: null,
      dueDay: null,
      archived: false,
    }
  });

  const accountType = watch('type');
  const isCreditCard = accountType === 'credit_card';

  // Reset form when modal opens with different account
  useEffect(() => {
    if (isOpen) {
      if (account) {
        reset({
          name: account.name,
          type: account.type,
          color: account.color,
          icon: account.icon,
          initialBalance: account.initialBalance,
          creditLimit: account.creditLimit,
          closingDay: account.closingDay,
          dueDay: account.dueDay,
          archived: account.archived,
        });
      } else {
        reset({
          name: '',
          type: 'wallet',
          color: 'var(--color-primary)',
          icon: 'Wallet',
          initialBalance: 0,
          creditLimit: null,
          closingDay: null,
          dueDay: null,
          archived: false,
        });
      }
    }
  }, [isOpen, account, reset]);

  const onSubmit = async (data: AccountFormData) => {
    // Limpar campos de cartão se o tipo mudar
    if (!isCreditCard) {
      data.creditLimit = null;
      data.closingDay = null;
      data.dueDay = null;
    }

    try {
      if (account) {
        await updateMutation.mutateAsync({ id: account.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (e) {
      // erro tratado no hook
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? 'Editar Conta' : 'Nova Conta'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label="Nome da conta/cartão"
          placeholder="Ex: Nubank, Carteira..."
          error={errors.name?.message}
          {...register('name')}
        />

        <Select
          label="Tipo"
          error={errors.type?.message}
          {...register('type')}
          options={Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
        />

        {isCreditCard ? (
          <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)]">
            <div className="col-span-2">
              <Controller
                control={control}
                name="creditLimit"
                render={({ field }) => (
                  <CurrencyInput
                    label="Limite do Cartão"
                    value={field.value ?? 0}
                    onChange={field.onChange}
                    error={errors.creditLimit?.message}
                  />
                )}
              />
            </div>
            <Input
              label="Dia do Fechamento"
              type="number"
              min="1" max="31"
              error={errors.closingDay?.message}
              {...register('closingDay', { valueAsNumber: true })}
            />
            <Input
              label="Dia do Vencimento"
              type="number"
              min="1" max="31"
              error={errors.dueDay?.message}
              {...register('dueDay', { valueAsNumber: true })}
            />
          </div>
        ) : (
          <Controller
            control={control}
            name="initialBalance"
            render={({ field }) => (
              <CurrencyInput
                label="Saldo Inicial (Atual)"
                value={field.value}
                onChange={field.onChange}
                error={errors.initialBalance?.message}
              />
            )}
          />
        )}

        <div className="pt-2 border-t border-[var(--color-border)]">
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <ColorPicker
                label="Cor Principal"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="pt-2 border-t border-[var(--color-border)]">
          <p className="input-label mb-2">Ícone</p>
          <Controller
            control={control}
            name="icon"
            render={({ field }) => (
              <IconPicker
                value={field.value}
                onChange={field.onChange}
                color={watch('color')}
              />
            )}
          />
          {errors.icon && <p className="input-error mt-1">{errors.icon.message}</p>}
        </div>

        {account && (
          <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--color-text)]">Arquivar conta</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Oculta da tela inicial e lançamentos</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register('archived')} />
              <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--color-primary)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-button)]"></div>
            </label>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={isLoading} className="flex-1">
            {account ? 'Salvar' : 'Criar Conta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
