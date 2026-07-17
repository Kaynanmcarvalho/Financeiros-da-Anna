import { useMemo } from 'react';
import { useAccounts } from './useAccounts';
import { useAllTransactions, useTransactions } from './useTransactions';

export function useDashboardData() {
  const currentDate = new Date();

  // Os saldos das contas já são atualizados a cada lançamento vinculado.
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();

  // O histórico completo é necessário apenas para calcular Dinheiro Vivo (sem conta).
  const { data: allTransactions, isLoading: isLoadingAllTransactions } = useAllTransactions();

  // Transações do mês corrente alimentam o resumo e a lista recente.
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions(
    currentDate.getMonth(),
    currentDate.getFullYear(),
  );

  const dashboardData = useMemo(() => {
    // Cartões de crédito representam limite/dívida, não dinheiro disponível.
    const accountsBalance = (accounts ?? [])
      .filter((account) => !account.archived && account.type !== 'credit_card')
      .reduce(
        (total, account) => total + (Number.isFinite(account.initialBalance) ? account.initialBalance : 0),
        0,
      );

    // Lançamentos vinculados já alteraram initialBalance. Somamos aqui somente
    // Dinheiro Vivo para não contar receitas/despesas de contas duas vezes.
    const cashBalance = (allTransactions ?? []).reduce((total, tx) => {
      if (tx.accountId || !Number.isFinite(tx.amount)) return total;
      if (tx.type === 'income') return total + tx.amount;
      if (tx.type === 'expense') return total - tx.amount;
      return total;
    }, 0);

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    (transactions ?? []).forEach((tx) => {
      if (tx.type === 'income') monthlyIncome += tx.amount;
      if (tx.type === 'expense') monthlyExpense += tx.amount;
    });

    // Pegar as 4 últimas transações (já vêm ordenadas por data decrescente do Firestore)
    const recentTransactions = (transactions ?? []).slice(0, 4);

    return {
      totalBalance: accountsBalance + cashBalance,
      monthlyIncome,
      monthlyExpense,
      recentTransactions,
    };
  }, [accounts, allTransactions, transactions]);

  return {
    ...dashboardData,
    isLoading: isLoadingAccounts || isLoadingAllTransactions,
    isLoadingTransactions,
  };
}
