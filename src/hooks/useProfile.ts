import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/uiStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { updateUserProfile as updateFirebaseAuthProfile } from '@/firebase/auth';
import { updateDocument } from '@/firebase/firestore';
import type { UserProfile, UserPreferences } from '@/types';

export function useUpdateProfile() {
  const { user, userProfile, setUserProfile } = useAuth();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (data: { name?: string; photoURL?: string }) => {
      if (!user || !userProfile) throw new Error('Não autenticado');

      // Update in Firebase Auth
      if (data.name || data.photoURL !== undefined) {
        await updateFirebaseAuthProfile({
          displayName: data.name ?? user.displayName ?? undefined,
          photoURL: data.photoURL ?? user.photoURL ?? undefined,
        });
      }

      // Update in Firestore profile doc
      const updates: Record<string, unknown> = {};
      if (data.name) updates.name = data.name;
      if (data.photoURL !== undefined) updates.photoURL = data.photoURL;

      if (Object.keys(updates).length > 0) {
        await updateDocument(`users/${user.uid}`, updates);
      }

      return { ...userProfile, ...updates };
    },
    onSuccess: (updatedProfile) => {
      setUserProfile(updatedProfile as UserProfile);
      addToast({
        type: 'success',
        title: 'Perfil atualizado com sucesso!',
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error);
      addToast({
        type: 'error',
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar as alterações do perfil.',
      });
    },
  });
}

export function useUpdatePreferences() {
  const { user, userProfile, setUserProfile } = useAuth();
  const queryClient = useQueryClient();
  const setPreferencesState = usePreferencesStore((s) => s.setPreferences);

  return useMutation({
    mutationFn: async (newPreferences: UserPreferences) => {
      if (!user || !userProfile) throw new Error('Não autenticado');

      await updateDocument(`users/${user.uid}`, { preferences: newPreferences });
      return newPreferences;
    },
    onMutate: async (newPreferences) => {
      // Optimistic update in Zustand store for instant visual feedback
      setPreferencesState(newPreferences);
    },
    onSuccess: (newPreferences) => {
      if (userProfile) {
        setUserProfile({ ...userProfile, preferences: newPreferences });
      }
      // Invalidate queries if preferences change affects them (like hiding values)
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error, _variables, _context) => {
      console.error('Erro ao salvar preferências:', error);
      // We could rollback the zustand store here by saving the previous state in onMutate context
      // But since it's just theme/colors, it's fine for now.
    },
  });
}
