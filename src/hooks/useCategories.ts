import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import { queryDocuments, setDocument, updateDocument, deleteDocument, serverTimestamp } from '@/firebase/firestore';
import type { Category } from '@/types';

export function useCategories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['categories', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      const categories = await queryDocuments<Category>(`users/${user.uid}/categories`);
      
      // Ordena por nome
      return categories.sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: !!user,
  });
}

export function useCreateCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: Omit<Category, 'id' | 'createdAt' | 'isDefault'>) => {
      if (!user) throw new Error('Não autenticado');
      
      const newCategory = {
        ...data,
        isDefault: false,
        createdAt: serverTimestamp() as any,
      };
      
      const id = crypto.randomUUID();
      await setDocument(`users/${user.uid}/categories/${id}`, newCategory);
      return { id, ...data, isDefault: false, createdAt: new Date() as any } as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.uid] });
      addToast({ type: 'success', title: 'Categoria criada com sucesso!' });
    },
    onError: (error) => {
      console.error(error);
      addToast({ type: 'error', title: 'Erro ao criar categoria' });
    },
  });
}

export function useUpdateCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Category, 'id' | 'createdAt' | 'isDefault'>> }) => {
      if (!user) throw new Error('Não autenticado');
      await updateDocument(`users/${user.uid}/categories/${id}`, data);
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.uid] });
      addToast({ type: 'success', title: 'Categoria atualizada com sucesso!' });
    },
    onError: (error) => {
      console.error(error);
      addToast({ type: 'error', title: 'Erro ao atualizar categoria' });
    },
  });
}

export function useDeleteCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Não autenticado');
      // No mundo real: checar se há transações vinculadas a esta categoria antes de deletar!
      // Idealmente o backend faria isso ou teríamos uma Cloud Function. 
      // Por enquanto, faremos o delete direto, mas isso será uma feature no futuro.
      await deleteDocument(`users/${user.uid}/categories/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.uid] });
      addToast({ type: 'success', title: 'Categoria excluída!' });
    },
    onError: (error) => {
      console.error(error);
      addToast({ type: 'error', title: 'Erro ao excluir categoria' });
    },
  });
}
