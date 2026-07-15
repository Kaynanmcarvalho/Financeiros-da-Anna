import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, query, getDocs, setDoc, deleteDoc, serverTimestamp, Timestamp, arrayUnion, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import type { Goal } from '@/types';

export function useGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goals', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const colRef = collection(db, `users/${user.uid}/goals`);
      const snapshot = await getDocs(query(colRef));
      
      return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Goal)
        .filter((g) => g.status !== 'archived')
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    },
    enabled: !!user,
  });
}

export function useCreateGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: Omit<Goal, 'id' | 'savedAmount' | 'status' | 'contributions' | 'createdAt'>) => {
      if (!user) throw new Error('Não autenticado');
      
      const newRef = doc(collection(db, `users/${user.uid}/goals`));
      const goal: Goal = {
        ...data,
        id: newRef.id,
        savedAmount: 0,
        status: 'active',
        contributions: [],
        createdAt: serverTimestamp() as Timestamp,
      };

      await setDoc(newRef, goal);
      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      addToast({ type: 'success', title: 'Meta criada com sucesso!' });
    },
    onError: () => addToast({ type: 'error', title: 'Erro ao criar meta' }),
  });
}

export function useAddGoalContribution() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ goalId, amount, currentSaved }: { goalId: string; amount: number; currentSaved: number }) => {
      if (!user) throw new Error('Não autenticado');
      
      const goalRef = doc(db, `users/${user.uid}/goals/${goalId}`);
      await updateDoc(goalRef, {
        savedAmount: currentSaved + amount,
        contributions: arrayUnion({ amount, date: Timestamp.now() }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      addToast({ type: 'success', title: 'Depósito registrado!' });
    },
    onError: () => addToast({ type: 'error', title: 'Erro ao depositar' }),
  });
}

export function useDeleteGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (goalId: string) => {
      if (!user) throw new Error('Não autenticado');
      await deleteDoc(doc(db, `users/${user.uid}/goals/${goalId}`));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      addToast({ type: 'success', title: 'Meta excluída' });
    },
    onError: () => addToast({ type: 'error', title: 'Erro ao excluir' }),
  });
}
