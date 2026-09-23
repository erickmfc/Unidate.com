import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { getUserProfile, UserProfile } from '../services/supabaseAuth';
import { logSiteActivity } from '../services/activityLogService';

interface AuthContextType {
  currentUser: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  logoutUser: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  isAuthenticated: false,
  logoutUser: async () => {},
  refreshUserProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUser({ ...session.user, uid: session.user.id });
          const profile = await getUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (e) {
        console.error('Erro ao ler usuário do Supabase:', e);
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Keep this callback synchronous: Supabase Auth holds a lock while it runs.
    // Profile reads are deferred so they cannot block sign-in or recovery events.
    let authEventId = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentEventId = ++authEventId;
      setLoading(true);
      if (session) {
        setCurrentUser({ ...session.user, uid: session.user.id });
        setTimeout(() => {
          void getUserProfile(session.user.id)
            .then(profile => {
              if (authEventId === currentEventId) setUserProfile(profile);
            })
            .catch(error => console.error('Erro ao carregar perfil após autenticação:', error))
            .finally(() => {
              if (authEventId === currentEventId) setLoading(false);
            });
        }, 0);
        if (event === 'SIGNED_IN') {
          setTimeout(() => void logSiteActivity(session.user.id, 'login'), 0);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logoutUser = async (): Promise<void> => {
    try {
      if (currentUser?.id) {
        await logSiteActivity(currentUser.id, 'logout');
      }
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.id);
        setUserProfile(profile);
      } catch (error) {
        console.error('Erro ao recarregar perfil do usuário:', error);
      }
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    isAuthenticated: !!currentUser,
    logoutUser,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
