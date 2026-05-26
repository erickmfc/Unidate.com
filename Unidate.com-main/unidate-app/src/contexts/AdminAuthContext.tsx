import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminSession, loginAdmin, logoutAdmin, verifyTwoFactor, getCurrentAdminSession, isAdminLoggedIn, onAdminAuthStateChanged } from '../firebase/adminAuth';

interface AdminAuthContextType {
  adminSession: AdminSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  verifyTwoFactor: (token: string) => Promise<boolean>;
  refreshAdminData: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  adminSession: null,
  loading: true,
  isAuthenticated: false,
  loginAdmin: async () => {},
  logoutAdmin: async () => {},
  verifyTwoFactor: async () => false,
  refreshAdminData: async () => {},
});

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        const currentSession = await getCurrentAdminSession();
        setAdminSession(currentSession);
      } catch (error) {
        console.error('Erro ao verificar sessão de admin:', error);
        setAdminSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    const unsubscribe = onAdminAuthStateChanged((session) => {
      setAdminSession(session);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLoginAdmin = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const session = await loginAdmin(email, password);
      setAdminSession(session);
    } catch (error: any) {
      console.error('Erro no login de admin:', error);
      setAdminSession(null);
      throw new Error(error.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAdmin = async (): Promise<void> => {
    try {
      await logoutAdmin();
      setAdminSession(null);
    } catch (error) {
      console.error('Erro no logout de admin:', error);
      throw error;
    }
  };

  const handleVerifyTwoFactor = async (token: string): Promise<boolean> => {
    try {
      if (!adminSession?.user.uid) {
        throw new Error('Sessão não encontrada');
      }

      const verifiedSession = await verifyTwoFactor(adminSession.user.uid, token);
      if (verifiedSession) {
        setAdminSession(verifiedSession);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erro na verificação 2FA:', error);
      throw new Error(error.message || 'Código 2FA inválido');
    }
  };

  const refreshAdminData = async (): Promise<void> => {
    try {
      setLoading(true);
      const currentSession = await getCurrentAdminSession();
      setAdminSession(currentSession);
    } catch (error) {
      console.error('Erro ao atualizar dados do admin:', error);
      setAdminSession(null);
    } finally {
      setLoading(false);
    }
  };

  const value: AdminAuthContextType = {
    adminSession,
    loading,
    isAuthenticated: adminSession?.isAuthenticated || false,
    loginAdmin: handleLoginAdmin,
    logoutAdmin: handleLogoutAdmin,
    verifyTwoFactor: handleVerifyTwoFactor,
    refreshAdminData,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
