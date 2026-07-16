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
    <div className="page mx-auto flex min-w-0 max-w-2xl flex-col gap-5 overflow-x-hidden pb-24">
      <section className="relative overflow-hidden rounded-[28px] border border-[var(--color-info)]/20 bg-gradient-to-br from-[var(--color-info)]/15 via-[var(--surface-raised)] to-[var(--color-primary)]/15 p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--color-info)]/10 blur-2xl" />
        <div className="relative flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-info)] to-[var(--color-button)] text-white shadow-lg shadow-[var(--color-info)]/20">
            <Plus size={25} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-info)]">Movimentação financeira</span>
            <h1 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">Meus lançamentos</h1>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">Registre suas entradas e saídas com clareza e acompanhe cada movimento.</p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <div className="min-w-0 rounded-2xl border border-[var(--color-success)]/15 bg-[var(--surface-elevated)]/85 p-3 backdrop-blur-sm">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
              <ArrowDownRight size={14} className="text-[var(--color-success)]" /> Receitas
            </span>
            <strong className="mt-1 block min-w-0 break-all text-base font-extrabold text-[var(--color-success)] sm:text-lg">{formatCurrency(totals.income)}</strong>
          </div>
          <div className="min-w-0 rounded-2xl border border-[var(--color-danger)]/15 bg-[var(--surface-elevated)]/85 p-3 backdrop-blur-sm">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
              <ArrowUpRight size={14} className="text-[var(--color-danger)]" /> Despesas
            </span>
            <strong className="mt-1 block min-w-0 break-all text-base font-extrabold text-[var(--color-danger)] sm:text-lg">{formatCurrency(totals.expense)}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { setTransactionToEdit(undefined); setIsFormOpen(true); }}
          className="relative mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--color-info)] to-[var(--color-button)] px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-[var(--color-info)]/20 transition-all hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-info)]/20"
        >
          <Plus size={18} /> Novo lançamento
        </button>
      </section>

      <div className="sticky top-0 z-10 -mx-4 border-y border-[var(--border-subtle)] bg-[var(--surface-nav)] px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
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
              <div key={tx.id} className="group relative flex min-w-0 items-center justify-between overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-info)]/25 hover:shadow-[var(--shadow-raised)] sm:p-5">
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
