import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, query, where, orderBy, getDocs, writeBatch, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import type { Transaction } from '@/types';

// Helper: Start of month and end of month for queries
function getMonthBounds(month: number, year: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start: Timestamp.fromDate(start), end: Timestamp.fromDate(end) };
}

export function useTransactions(month: number, year: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.uid, month, year],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const { start, end } = getMonthBounds(month, year);
      const colRef = collection(db, `users/${user.uid}/transactions`);
      
      const q = query(
        colRef,
        where('date', '>=', start),
        where('date', '<=', end),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction);
    },
    enabled: !!user,
  });
}

/** Histórico completo usado para calcular o saldo de Dinheiro Vivo (sem conta). */
export function useAllTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.uid, 'all'],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');

      const colRef = collection(db, `users/${user.uid}/transactions`);
      const snapshot = await getDocs(query(colRef, orderBy('date', 'desc')));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction);
    },
    enabled: !!user,
  });
}

export function useCreateTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('Não autenticado');
      
      const batch = writeBatch(db);
      
      // 1. Create transaction doc
      const txRef = doc(collection(db, `users/${user.uid}/transactions`));
      batch.set(txRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Update account(s) balance if an account is selected
      if (data.accountId) {
        const accountRef = doc(db, `users/${user.uid}/accounts/${data.accountId}`);
        
        if (data.type === 'expense') {
          batch.update(accountRef, { initialBalance: increment(-data.amount) });
        } else if (data.type === 'income') {
          batch.update(accountRef, { initialBalance: increment(data.amount) });
        } else if (data.type === 'transfer' && data.toAccountId) {
          // Decrease from source account
          batch.update(accountRef, { initialBalance: increment(-data.amount) });
        }
      }

      // Increase to destination account in transfer
      if (data.type === 'transfer' && data.toAccountId) {
        const destAccountRef = doc(db, `users/${user.uid}/accounts/${data.toAccountId}`);
        batch.update(destAccountRef, { initialBalance: increment(data.amount) });
      }

      await batch.commit();
      return txRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] }); // Balances changed
      addToast({ type: 'success', title: 'Lançamento salvo!' });
    },
    onError: (error) => {
      console.error(error);
      addToast({ type: 'error', title: 'Erro ao salvar lançamento' });
    },
  });
}

export function useDeleteTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (tx: Transaction) => {
      if (!user) throw new Error('Não autenticado');

      const batch = writeBatch(db);
      
      // 1. Delete transaction doc
      const txRef = doc(db, `users/${user.uid}/transactions/${tx.id}`);
      batch.delete(txRef);

      // 2. Revert account(s) balance if an account was selected
      if (tx.accountId) {
        const accountRef = doc(db, `users/${user.uid}/accounts/${tx.accountId}`);
        
        if (tx.type === 'expense') {
          batch.update(accountRef, { initialBalance: increment(tx.amount) });
        } else if (tx.type === 'income') {
          batch.update(accountRef, { initialBalance: increment(-tx.amount) });
        } else if (tx.type === 'transfer' && tx.toAccountId) {
          batch.update(accountRef, { initialBalance: increment(tx.amount) });
        }
      }

      // Revert destination account in transfer
      if (tx.type === 'transfer' && tx.toAccountId) {
        const destAccountRef = doc(db, `users/${user.uid}/accounts/${tx.toAccountId}`);
        batch.update(destAccountRef, { initialBalance: increment(-tx.amount) });
      }

      await batch.commit();
      return tx.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      addToast({ type: 'success', title: 'Lançamento excluído e saldo revertido.' });
    },
    onError: (error) => {
      console.error(error);
      addToast({ type: 'error', title: 'Erro ao excluir lançamento' });
    },
  });
}

export function useUpdateTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, oldTx, newTx }: { id: string, oldTx: Transaction, newTx: Partial<Omit<Transaction, 'id' | 'createdAt'>> }) => {
      if (!user) throw new Error('Not authenticated');

      const batch = writeBatch(db);
      const txRef = doc(db, `users/${user.uid}/transactions/${id}`);

      // 1. Revert old balance
      if (oldTx.accountId) {
        const oldAccRef = doc(db, `users/${user.uid}/accounts/${oldTx.accountId}`);
        if (oldTx.type === 'expense') batch.update(oldAccRef, { initialBalance: increment(oldTx.amount) });
        else if (oldTx.type === 'income') batch.update(oldAccRef, { initialBalance: increment(-oldTx.amount) });
        else if (oldTx.type === 'transfer' && oldTx.toAccountId) {
          batch.update(oldAccRef, { initialBalance: increment(oldTx.amount) });
          const oldDestRef = doc(db, `users/${user.uid}/accounts/${oldTx.toAccountId}`);
          batch.update(oldDestRef, { initialBalance: increment(-oldTx.amount) });
        }
      }

      // 2. Apply new balance
      const newType = newTx.type || oldTx.type;
      const newAmount = newTx.amount !== undefined ? newTx.amount : oldTx.amount;
      const newAccountId = newTx.accountId !== undefined ? newTx.accountId : oldTx.accountId;
      const newToAccountId = newTx.toAccountId !== undefined ? newTx.toAccountId : oldTx.toAccountId;

      if (newAccountId) {
        const newAccRef = doc(db, `users/${user.uid}/accounts/${newAccountId}`);
        if (newType === 'expense') batch.update(newAccRef, { initialBalance: increment(-newAmount) });
        else if (newType === 'income') batch.update(newAccRef, { initialBalance: increment(newAmount) });
        else if (newType === 'transfer' && newToAccountId) {
          batch.update(newAccRef, { initialBalance: increment(-newAmount) });
          const newDestRef = doc(db, `users/${user.uid}/accounts/${newToAccountId}`);
          batch.update(newDestRef, { initialBalance: increment(newAmount) });
        }
      }

      // 3. Update transaction document
      batch.update(txRef, {
        ...newTx,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      addToast({ type: 'success', title: 'Lançamento atualizado!' });
    },
    onError: (error) => {
      console.error(error);
      addToast({ type: 'error', title: 'Erro ao atualizar lançamento' });
    },
  });
}
