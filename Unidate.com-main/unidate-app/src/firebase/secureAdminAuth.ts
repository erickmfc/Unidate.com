/**
 * Sistema seguro de autenticação de administradores
 * Usa Firebase Auth com Custom Claims para identificar admins
 * NÃO armazena credenciais no frontend
 */

import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User,
  getIdTokenResult
} from 'firebase/auth';
import { 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './config';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'super-admin' | 'moderator';
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  permissions: {
    canManageUsers: boolean;
    canModerateContent: boolean;
    canManageEvents: boolean;
    canManageAdmins: boolean;
    canAccessSystemSettings: boolean;
  };
}

export interface AdminSession {
  user: AdminUser;
  isAuthenticated: boolean;
  requiresTwoFactor: boolean;
  twoFactorVerified: boolean;
}

/**
 * Verifica se um usuário tem claim de admin
 * Custom Claims são definidos no backend (Cloud Functions)
 */
const checkAdminClaim = async (user: User): Promise<boolean> => {
  try {
    const tokenResult = await getIdTokenResult(user, true);
    return tokenResult.claims.admin === true || tokenResult.claims.role === 'admin';
  } catch (error) {
    console.error('Erro ao verificar claim de admin:', error);
    return false;
  }
};

/**
 * Verifica se o usuário está na coleção de admins do Firestore
 * Fallback caso Custom Claims não estejam configurados
 */
const checkAdminInFirestore = async (uid: string): Promise<AdminUser | null> => {
  try {
    if (!db) return null;
    
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (!adminDoc.exists()) {
      return null;
    }

    const adminData = adminDoc.data();
    return {
      uid: adminDoc.id,
      email: adminData.email,
      displayName: adminData.displayName,
      role: adminData.role || 'moderator',
      isActive: adminData.isActive !== false,
      twoFactorEnabled: adminData.twoFactorEnabled === true,
      lastLogin: adminData.lastLogin?.toDate(),
      createdAt: adminData.createdAt?.toDate() || new Date(),
      permissions: adminData.permissions || {
        canManageUsers: adminData.role === 'super-admin',
        canModerateContent: true,
        canManageEvents: adminData.role === 'super-admin',
        canManageAdmins: adminData.role === 'super-admin',
        canAccessSystemSettings: adminData.role === 'super-admin',
      }
    } as AdminUser;
  } catch (error) {
    console.error('Erro ao verificar admin no Firestore:', error);
    return null;
  }
};

/**
 * Faz login de administrador usando Firebase Auth
 * NÃO aceita credenciais hardcoded - apenas Firebase Auth
 */
export const loginAdmin = async (email: string, password: string): Promise<AdminSession> => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth não inicializado');
    }

    // Autenticar com Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verificar se é admin via Custom Claims
    const hasAdminClaim = await checkAdminClaim(user);
    
    // Se não tiver claim, verificar no Firestore (fallback)
    let adminData: AdminUser | null = null;
    if (!hasAdminClaim) {
      adminData = await checkAdminInFirestore(user.uid);
      if (!adminData) {
        // Não é admin - fazer logout
        await signOut(auth);
        throw new Error('Usuário não possui permissões de administrador');
      }
    } else {
      // Buscar dados do admin no Firestore
      adminData = await checkAdminInFirestore(user.uid);
      if (!adminData) {
        // Criar registro básico se não existir
        if (!db) throw new Error('Firestore não inicializado');
        
        adminData = {
          uid: user.uid,
          email: user.email || email,
          displayName: user.displayName || 'Admin',
          role: 'moderator',
          isActive: true,
          twoFactorEnabled: false,
          createdAt: new Date(),
          permissions: {
            canManageUsers: true,
            canModerateContent: true,
            canManageEvents: false,
            canManageAdmins: false,
            canAccessSystemSettings: false,
          }
        };

        await setDoc(doc(db, 'admins', user.uid), {
          ...adminData,
          createdAt: serverTimestamp()
        }, { merge: true });
      }
    }

    // Verificar se a conta está ativa
    if (!adminData.isActive) {
      await signOut(auth);
      throw new Error('Conta de administrador desativada');
    }

    // Atualizar último login
    if (db) {
      await updateDoc(doc(db, 'admins', user.uid), {
        lastLogin: serverTimestamp()
      });
    }

    return {
      user: adminData,
      isAuthenticated: true,
      requiresTwoFactor: adminData.twoFactorEnabled,
      twoFactorVerified: !adminData.twoFactorEnabled
    };
  } catch (error: any) {
    console.error('Erro no login de administrador:', error);
    throw new Error(error.message || 'Erro na autenticação');
  }
};

/**
 * Verifica código 2FA (implementação básica - em produção usar biblioteca real)
 */
export const verifyTwoFactor = async (uid: string, code: string): Promise<AdminSession | null> => {
  try {
    if (!auth?.currentUser || auth.currentUser.uid !== uid) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar dados do admin
    const adminData = await checkAdminInFirestore(uid);
    if (!adminData) {
      throw new Error('Admin não encontrado');
    }

    // TODO: Implementar verificação real de 2FA usando biblioteca como 'otplib'
    // Por enquanto, apenas verificar se o código não está vazio
    if (!code || code.trim().length === 0) {
      throw new Error('Código 2FA inválido');
    }

    return {
      user: adminData,
      isAuthenticated: true,
      requiresTwoFactor: false,
      twoFactorVerified: true
    };
  } catch (error) {
    console.error('Erro na verificação 2FA:', error);
    throw error;
  }
};

/**
 * Faz logout do administrador
 */
export const logoutAdmin = async (): Promise<void> => {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (error) {
    console.error('Erro no logout de administrador:', error);
    throw error;
  }
};

/**
 * Obtém a sessão atual do admin
 */
export const getCurrentAdminSession = async (): Promise<AdminSession | null> => {
  try {
    if (!auth?.currentUser) {
      return null;
    }

    const user = auth.currentUser;
    
    // Verificar se é admin
    const hasAdminClaim = await checkAdminClaim(user);
    if (!hasAdminClaim) {
      const adminData = await checkAdminInFirestore(user.uid);
      if (!adminData) {
        return null;
      }
    }

    // Buscar dados do admin
    const adminData = await checkAdminInFirestore(user.uid);
    if (!adminData || !adminData.isActive) {
      return null;
    }

    return {
      user: adminData,
      isAuthenticated: true,
      requiresTwoFactor: adminData.twoFactorEnabled,
      twoFactorVerified: !adminData.twoFactorEnabled
    };
  } catch (error) {
    console.error('Erro ao obter sessão atual:', error);
    return null;
  }
};

/**
 * Verifica se há um admin logado
 */
export const isAdminLoggedIn = async (): Promise<boolean> => {
  const session = await getCurrentAdminSession();
  return session?.isAuthenticated === true;
};

/**
 * Observa mudanças no estado de autenticação
 */
export const onAdminAuthStateChanged = (
  callback: (session: AdminSession | null) => void
): (() => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const session = await getCurrentAdminSession();
      callback(session);
    } else {
      callback(null);
    }
  });
};

