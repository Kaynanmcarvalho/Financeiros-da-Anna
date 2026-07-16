import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { addDays, addMonths, addWeeks, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { db } from '@/firebase/config';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import type { UserProfile, UserVisit } from '@/types';

export type VisitPeriod = 'day' | 'week' | 'month';

function getPeriodBounds(period: VisitPeriod) {
  const now = new Date();
  if (period === 'day') {
    const start = startOfDay(now);
    return { start, end: addDays(start, 1) };
  }
  if (period === 'week') {
    const start = startOfWeek(now, { weekStartsOn: 1 });
    return { start, end: addWeeks(start, 1) };
  }
  const start = startOfMonth(now);
  return { start, end: addMonths(start, 1) };
}

export function useAdminUsers() {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['admin-users'],
    enabled: userProfile?.role === 'admin' && !userProfile.blocked,
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data() as UserProfile;
        return { ...data, uid: data.uid ?? snapshotDoc.id, role: data.role ?? 'user', blocked: data.blocked ?? false };
      }).sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
    },
  });
}
export function useAdminVisits(period: VisitPeriod) {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['admin-visits', period],
    enabled: userProfile?.role === 'admin' && !userProfile.blocked,
    queryFn: async () => {
      const { start, end } = getPeriodBounds(period);
      const visitsQuery = query(
        collection(db, 'userVisits'),
        where('visitedAt', '>=', Timestamp.fromDate(start)),
        where('visitedAt', '<', Timestamp.fromDate(end))
      );
      const snapshot = await getDocs(visitsQuery);
      return snapshot.docs.map((visitDoc) => ({ id: visitDoc.id, ...visitDoc.data() }) as UserVisit);
    },
  });
}

export function useToggleUserBlocked() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async ({ target, blocked }: { target: UserProfile; blocked: boolean }) => {
      if (!user || userProfile?.role !== 'admin') throw new Error('Acesso não autorizado');
      if (target.uid === user.uid) throw new Error('Você não pode bloquear sua própria conta');
      if (target.role === 'admin') throw new Error('Contas administrativas não podem ser bloqueadas pelo aplicativo');

      await updateDoc(doc(db, 'users', target.uid), {
        blocked,
        blockedAt: blocked ? serverTimestamp() : null,
        blockedBy: blocked ? user.uid : null,
      });
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      addToast({
        type: 'success',
        title: variables.blocked ? 'Usuário bloqueado' : 'Usuário desbloqueado',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Não foi possível alterar o acesso',
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    },
  });
}
