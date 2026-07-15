import { useState, useMemo } from 'react';
import { Plus, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Search, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { useUIStore } from '@/stores/uiStore';
import { formatCurrency } from '@/utils/currency';
import type { Transaction } from '@/types';

import { MonthSelector } from '@/components/transactions/MonthSelector';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { LucideIcon } from '@/components/ui/IconPicker';

export default function TransactionsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | undefined>(undefined);
  const openConfirmDialog = useUIStore((s) => s.openConfirmDialog);

  const { data: transactions, isLoading } = useTransactions(currentDate.getMonth(), currentDate.getFullYear());
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const deleteMutation = useDeleteTransaction();

  // Calcula Totais do Mês
  const totals = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0, balance: 0 };
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === 'income') acc.income += tx.amount;
        if (tx.type === 'expense') acc.expense += tx.amount;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [transactions]);
  totals.balance = totals.income - totals.expense;

  const handleDelete = (tx: Transaction) => {
    openConfirmDialog({
      title: 'Excluir Lançamento?',
      description: `O valor de ${formatCurrency(tx.amount)} será estornado do saldo da sua conta.`,
      variant: 'danger',
      onConfirm: () => deleteMutation.mutate(tx),
    });
  };

  const getCategoryDetails = (categoryId: string) => {
    return categories?.find(c => c.id === categoryId) || { name: 'Desconhecido', icon: 'Tag', color: 'var(--color-border)' };
  };

  const getAccountName = (accountId: string | null) => {
    if (!accountId) return 'Dinheiro Vivo';
    return accounts?.find(a => a.id === accountId)?.name || 'Conta apagada';
  };

  return (
    <div className="page max-w-2xl mx-auto flex flex-col gap-6 pb-24">
      <div className="sticky top-0 z-10 bg-[var(--color-bg)] pt-2 pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card card-glass p-3 flex flex-col gap-1 border-b-2 border-b-[var(--color-success)]">
          <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
            <ArrowDownRight size={14} className="text-[var(--color-success)]" /> Receitas
          </span>
          <span className="font-semibold text-sm sm:text-base text-[var(--color-success)]">
            {formatCurrency(totals.income)}
          </span>
        </div>
        <div className="card card-glass p-3 flex flex-col gap-1 border-b-2 border-b-[var(--color-danger)]">
          <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
            <ArrowUpRight size={14} className="text-[var(--color-danger)]" /> Despesas
          </span>
          <span className="font-semibold text-sm sm:text-base text-[var(--color-danger)]">
            {formatCurrency(totals.expense)}
          </span>
        </div>
      </div>

      {isLoading ? (
        <SkeletonList count={5} />
      ) : !transactions || transactions.length === 0 ? (
        <EmptyState
          icon={<Search size={40} />}
          title="Nenhum lançamento"
          description="Você ainda não registrou nada neste mês."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {transactions.map((tx) => {
            const isTransfer = tx.type === 'transfer';
            const cat = isTransfer ? { name: 'Transferência', icon: 'ArrowRightLeft', color: 'var(--color-info)' } : getCategoryDetails(tx.categoryId);
            
            return (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] group transition-shadow hover:shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  >
                    <LucideIcon name={cat.icon} size={20} />
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-[var(--color-text)] truncate text-sm sm:text-base">{tx.description}</span>
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                      <span className="font-medium text-[var(--color-text)] opacity-80">{cat.name}</span>
                      <span className="opacity-50">•</span>
                      <span>{getAccountName(tx.accountId)}</span>
                      {isTransfer && tx.toAccountId && (
                        <>
                          <ArrowRightLeft size={10} className="mx-0.5" />
                          <span>{getAccountName(tx.toAccountId)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <div className="flex flex-col items-end">
                    <span className={`font-semibold text-sm sm:text-base whitespace-nowrap ${tx.type === 'expense' ? 'text-[var(--color-danger)]' : tx.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}`}>
                      {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                      {format(tx.date.toDate(), "dd 'de' MMM", { locale: ptBR })}
                    </span>
                  </div>
                  
                  
                  <button 
                    onClick={() => { setTransactionToEdit(tx); setIsFormOpen(true); }}
                    className="p-1.5 sm:p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-info)] hover:bg-[var(--color-bg-secondary)] transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                    aria-label="Editar"
                  >
                    <Pencil size={16} />
                  </button>

                  <button 
                    onClick={() => handleDelete(tx)}
                    className="p-1.5 sm:p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-bg-secondary)] transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                    aria-label="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => { setTransactionToEdit(undefined); setIsFormOpen(true); }}
        className="fixed bottom-24 right-4 sm:right-auto sm:left-1/2 sm:ml-[260px] w-14 h-14 bg-[var(--color-button)] text-white rounded-full shadow-lg shadow-[var(--color-button)]/30 flex items-center justify-center hover:scale-105 transition-transform z-40 focus:outline-none focus:ring-4 focus:ring-[var(--color-button)]/20"
        aria-label="Novo Lançamento"
      >
        <Plus size={24} />
      </button>

      {isFormOpen && (
        <TransactionForm 
          isOpen={isFormOpen} 
          onClose={() => { setIsFormOpen(false); setTransactionToEdit(undefined); }} 
          initialData={transactionToEdit}
        />
      )}
    </div>
  );
}
