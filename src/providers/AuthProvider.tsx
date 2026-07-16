import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { UserProfile } from '@/types';
import { DEFAULT_PREFERENCES } from '@/constants/app';

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  setUserProfile: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userProfile: null,
  loading: true,
  setUserProfile: () => {},
});

async function registerSessionVisit(uid: string) {
  const sessionKey = `visit-recorded:${uid}`;

  try {
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, 'true');
  } catch {
    // O navegador pode bloquear sessionStorage; a autenticação deve continuar funcionando.
  }

  try {
    await addDoc(collection(db, 'userVisits'), {
      uid,
      visitedAt: serverTimestamp(),
    });
  } catch (error) {
    // Analytics nunca deve impedir o acesso ao aplicativo.
    console.warn('Não foi possível registrar a visita:', error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const setPreferences = usePreferencesStore((s) => s.setPreferences);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeProfile?.();
      unsubscribeProfile = undefined;
      setUser(firebaseUser);
      setUserProfile(null);
      setLoading(true);

      if (!firebaseUser) {
        setPreferences(DEFAULT_PREFERENCES);
        setLoading(false);
        return;
      }

      const profileRef = doc(db, 'users', firebaseUser.uid);
      unsubscribeProfile = onSnapshot(
        profileRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setUserProfile(null);
            setPreferences(DEFAULT_PREFERENCES);
            setLoading(false);
            return;
          }

          const data = snapshot.data() as UserProfile;
          const profile: UserProfile = {
            ...data,
            uid: data.uid ?? snapshot.id,
            role: data.role ?? 'user',
            blocked: data.blocked ?? false,
          };

          setUserProfile(profile);
          setPreferences(profile.preferences ?? DEFAULT_PREFERENCES);
          setLoading(false);

          if (!profile.blocked) {
            void registerSessionVisit(firebaseUser.uid);
          }
        },
        (error) => {
          console.error('Erro ao acompanhar o perfil:', error);
          setUserProfile(null);
          setPreferences(DEFAULT_PREFERENCES);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, [setPreferences]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
