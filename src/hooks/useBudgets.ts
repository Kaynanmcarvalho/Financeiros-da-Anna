import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import { deleteDocument, getDocument, serverTimestamp, setDocument } from '@/firebase/firestore';
import type { Budget, BudgetLimit } from '@/types';

export function useBudget(month: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['budget', user?.uid, month],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      return getDocument<Budget>(`users/${user.uid}/budgets/${month}`);
    },
    enabled: !!user && Boolean(month),
  });
}

export function useSaveBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async ({ month, limits }: { month: string; limits: BudgetLimit[] }) => {
      if (!user) throw new Error('Não autenticado');
      const path = `users/${user.uid}/budgets/${month}`;
      const existingBudget = await getDocument<Budget>(path);

      await setDocument(path, {
        id: month,
        month,
        limits,
        createdAt: existingBudget?.createdAt ?? serverTimestamp(),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budget', user?.uid, variables.month] });
      addToast({ type: 'success', title: 'Planejamento salvo!' });
    },
    onError: () => addToast({ type: 'error', title: 'Erro ao salvar planejamento' }),
  });
}

export function useDeleteBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (month: string) => {
      if (!user) throw new Error('Não autenticado');
      await deleteDocument(`users/${user.uid}/budgets/${month}`);
    },
    onSuccess: (_data, month) => {
      queryClient.invalidateQueries({ queryKey: ['budget', user?.uid, month] });
      addToast({ type: 'success', title: 'Planejamento excluído' });
    },
    onError: () => addToast({ type: 'error', title: 'Erro ao excluir planejamento' }),
  });
}