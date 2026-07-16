import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, query, getDocs, setDoc, deleteDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import type { Reminder } from '@/types';

export function useReminders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reminders', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const colRef = collection(db, `users/${user.uid}/reminders`);
      const snapshot = await getDocs(query(colRef));
      
      return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Reminder)
        .sort((a, b) => a.dueDate.toMillis() - b.dueDate.toMillis()); // Ordena por data de vencimento mais próxima
    },
    enabled: !!user,
  });
}

export function useCreateReminder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: Omit<Reminder, 'id' | 'isDone' | 'createdAt'>) => {
      if (!user) throw new Error('Não autenticado');
      
      const newRef = doc(collection(db, `users/${user.uid}/reminders`));
      const reminder: Reminder = {
        ...data,
        id: newRef.id,
        isDone: false,
        createdAt: serverTimestamp() as Timestamp,
      };

      await setDoc(newRef, reminder);
      return reminder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      addToast({ type: 'success', title: 'Lembrete criado!' });
    },
    onError: () => addToast({ type: 'error', title: 'Erro ao criar lembrete' }),
  });
}

type EditableReminderData = Pick<Reminder, 'title' | 'amount' | 'dueDate' | 'recurrence' | 'linkedAccountId' | 'notifyDaysBefore'>;

export function useUpdateReminder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditableReminderData }) => {
      if (!user) throw new Error('Não autenticado');
      await updateDoc(doc(db, `users/${user.uid}/reminders/${id}`), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      addToast({ type: 'success', title: 'Lembrete atualizado!' });
    },
    onError: () => addToast({ type: 'error', title: 'Erro ao atualizar lembrete' }),
  });
}

export function useToggleReminder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }) => {
      if (!user) throw new Error('Não autenticado');
      await updateDoc(doc(db, `users/${user.uid}/reminders/${id}`), { isDone });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useDeleteReminder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Não autenticado');
      await deleteDoc(doc(db, `users/${user.uid}/reminders/${id}`));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      addToast({ type: 'success', title: 'Lembrete excluído' });
    },
    onError: () => addToast({ type: 'error', title: 'Erro ao excluir' }),
  });
}
