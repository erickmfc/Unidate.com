import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { AdminUser, AdminSession, loginAdmin, logoutAdmin, verifyTwoFactor } from '../firebase/adminAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

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
    const unsubscribe = onAuthStateChanged(auth!, async (user) => {
      try {
        if (user) {
          // Verificar se o usuário é um admin
          const adminDoc = await getDoc(doc(db!, 'admins', user.uid));
          if (adminDoc.exists()) {
            const adminData = adminDoc.data() as AdminUser;
            setAdminSession({
              user: adminData,
              isAuthenticated: true,
              requiresTwoFactor: adminData.twoFactorEnabled,
              twoFactorVerified: !adminData.twoFactorEnabled
            });
          } else {
            setAdminSession(null);
          }
        } else {
          setAdminSession(null);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão de admin:', error);
        setAdminSession(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginAdmin = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const session = await loginAdmin(email, password);
      setAdminSession(session);
    } catch (error) {
      console.error('Erro no login de admin:', error);
      throw error;
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
        return false;
      }

      const isValid = await verifyTwoFactor(adminSession.user.twoFactorSecret || '', token);
      if (isValid && adminSession) {
        setAdminSession({
          ...adminSession,
          requiresTwoFactor: false
        });
      }
      return isValid;
    } catch (error) {
      console.error('Erro na verificação 2FA:', error);
      return false;
    }
  };

  const refreshAdminData = async (): Promise<void> => {
    try {
      if (adminSession?.user) {
        setLoading(true);
        const adminDoc = await getDoc(doc(db!, 'admins', adminSession.user.uid));
        if (adminDoc.exists()) {
          const adminData = adminDoc.data() as AdminUser;
          setAdminSession({
            user: adminData,
            isAuthenticated: true,
            requiresTwoFactor: adminData.twoFactorEnabled,
            twoFactorVerified: !adminData.twoFactorEnabled
          });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do admin:', error);
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