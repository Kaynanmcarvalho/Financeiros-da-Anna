import { useMemo } from 'react';
import { useAccounts } from './useAccounts';
import { useTransactions } from './useTransactions';

export function useDashboardData() {
  const currentDate = new Date();
  
  // 1. Buscamos as contas para o Saldo Geral
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();
  
  // 2. Buscamos as transações do mês corrente para o Cashflow
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions(
    currentDate.getMonth(), 
    currentDate.getFullYear()
  );

  const isLoading = isLoadingAccounts || isLoadingTransactions;

  const dashboardData = useMemo(() => {
    if (isLoading || !accounts || !transactions) {
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
        recentTransactions: [],
      };
    }

    // Calcular o Saldo Geral (soma de todas as contas não arquivadas)
    // Para simplificar, assumimos que 'initialBalance' atua como saldo corrente devido aos nossos Batches.
    const totalBalance = accounts
      .filter((a) => !a.archived)
      .reduce((acc, account) => acc + account.initialBalance, 0);

    // Calcular Cashflow do Mês
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income') monthlyIncome += tx.amount;
      if (tx.type === 'expense') monthlyExpense += tx.amount;
    });

    // Pegar as 4 últimas transações (já vêm ordenadas por data descrescente do Firestore)
    const recentTransactions = transactions.slice(0, 4);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      recentTransactions,
    };
  }, [accounts, transactions, isLoading]);

  return {
    ...dashboardData,
    isLoading,
  };
}
