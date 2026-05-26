import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile, UserProfile } from '../firebase/auth';

interface AuthContextType {
  currentUser: User | null;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      const loadOfflineUser = () => {
        try {
          const storedUser = localStorage.getItem('unidate_offline_user');
          const storedProfile = localStorage.getItem('unidate_offline_profile');
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          } else {
            setCurrentUser(null);
          }
          if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
          } else {
            setUserProfile(null);
          }
        } catch (e) {
          console.error('Erro ao ler usuário offline:', e);
          setCurrentUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      };

      loadOfflineUser();
      window.addEventListener('auth-state-changed', loadOfflineUser);
      return () => {
        window.removeEventListener('auth-state-changed', loadOfflineUser);
      };
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logoutUser = async (): Promise<void> => {
    try {
      if (auth) {
        await signOut(auth);
      } else {
        localStorage.removeItem('unidate_offline_user');
        localStorage.removeItem('unidate_offline_profile');
        window.dispatchEvent(new Event('auth-state-changed'));
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
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
