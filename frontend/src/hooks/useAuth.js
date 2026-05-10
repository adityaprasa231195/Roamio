import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, DEV_AUTH } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';

export function useAuth() {
  const { user, token, setUser, setToken, logout, isLoading } = useAuthStore();

  useEffect(() => {
    // Dev bypass mode — use persisted state or set demo user
    if (DEV_AUTH) {
      if (!user && !token) {
        // Not logged in — let AuthPage handle login
        useAuthStore.getState().setLoading(false);
      } else {
        useAuthStore.getState().setLoading(false);
      }
      return;
    }

    // Firebase auth listener
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        try {
          const { data } = await api.post('/api/auth/sync', {}, {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          setUser(data.user);
        } catch {
          setUser({ id: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName });
        }
      } else {
        logout();
        useAuthStore.getState().setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return { user, token, isLoading };
}
