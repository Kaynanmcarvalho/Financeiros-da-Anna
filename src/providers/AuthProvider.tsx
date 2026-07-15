import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getDocument } from '@/firebase/firestore';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const setPreferences = usePreferencesStore((s) => s.setPreferences);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const profile = await getDocument<UserProfile>(`users/${firebaseUser.uid}`);
          setUserProfile(profile);

          // Apply user preferences before first paint
          if (profile?.preferences) {
            setPreferences(profile.preferences);
          } else {
            setPreferences(DEFAULT_PREFERENCES);
          }
        } catch {
          setPreferences(DEFAULT_PREFERENCES);
        }
      } else {
        setUserProfile(null);
        setPreferences(DEFAULT_PREFERENCES);
      }

      setLoading(false);
    });

    return () => unsubscribe();
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
