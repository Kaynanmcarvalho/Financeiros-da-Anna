import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import { queryDocuments, addDocument, updateDocument, deleteDocument, serverTimestamp } from '@/firebase/firestore';
import type { Account } from '@/types';

export function useAccounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['accounts', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      // A query real no firestore seria: collection('users/uid/accounts'), orderBy('createdAt', 'desc')
      // Como não criamos esse index específico ainda, vamos buscar tudo e ordenar no client
      // já que a lista de contas costuma ser pequena (< 20 itens)
      const accounts = await queryDocuments<Account>(`users/${user.uid}/accounts`);
      
      // Sort by creation date or name
      return accounts.sort((a, b) => {
        // Priorizar não arquivadas
        if (a.archived && !b.archived) return 1;
        if (!a.archived && b.archived) return -1;
        return a.name.localeCompare(b.name);
      });
    },
    enabled: !!user,
  });
}

export function useCreateAccount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: Omit<Account, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('Não autenticado');
      
      const newAccount = {
        ...data,
        createdAt: serverTimestamp() as any,
      };
      
      const id = await addDocument(`users/${user.uid}/accounts`, newAccount);
      return { id, ...data, createdAt: new Date() as any } as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.uid] });
      addToast({ type: 'success', title: 'Conta criada com sucesso!' });
    },
    onError: (error) => {
      console.error(error);
      addToast({ type: 'error', title: 'Erro ao criar conta', description: 'Tente novamente.' });
    },
  });
}

export function useUpdateAccount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Account, 'id' | 'createdAt'>> }) => {
      if (!user) throw new Error('Não autenticado');
      await updateDocument(`users/${user.uid}/accounts/${id}`, data);
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.uid] });
      addToast({ type: 'success', title: 'Conta atualizada com sucesso!' });
    },
    onError: (error) => {
      console.error(error);
      addToast({ type: 'error', title: 'Erro ao atualizar conta' });
    },
  });
}

export function useDeleteAccount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Não autenticado');
      await deleteDocument(`users/${user.uid}/accounts/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.uid] });
      addToast({ type: 'success', title: 'Conta excluída com sucesso!' });
    },
    onError: (error) => {
      console.error(error);
      addToast({ type: 'error', title: 'Erro ao excluir conta' });
    },
  });
}
