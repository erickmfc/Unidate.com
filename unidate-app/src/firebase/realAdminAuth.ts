import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './config';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'super-admin' | 'moderator';
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
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

// Função para criar um novo administrador
export const createAdminUser = async (
  email: string, 
  password: string, 
  displayName: string, 
  role: 'super-admin' | 'moderator'
): Promise<AdminUser> => {
  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
    const user = userCredential.user;

    // Definir permissões baseadas no role
    const permissions = {
      'super-admin': {
        canManageUsers: true,
        canModerateContent: true,
        canManageEvents: true,
        canManageAdmins: true,
        canAccessSystemSettings: true,
      },
      'moderator': {
        canManageUsers: true,
        canModerateContent: true,
        canManageEvents: false,
        canManageAdmins: false,
        canAccessSystemSettings: false,
      }
    };

    // Criar documento do admin no Firestore
    const adminData: AdminUser = {
      uid: user.uid,
      email: user.email!,
      displayName,
      role,
      isActive: true,
      twoFactorEnabled: false,
      createdAt: new Date(),
      permissions: permissions[role]
    };

    await setDoc(doc(db!, 'admins', user.uid), adminData);

    // Atualizar perfil do usuário
    await updateProfile(user, { displayName });

    return adminData;
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    throw error;
  }
};

// Função para fazer login de administrador
export const loginAdmin = async (email: string, password: string): Promise<AdminSession> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth!, email, password);
    const user = userCredential.user;

    // Buscar dados do admin no Firestore
    const adminDoc = await getDoc(doc(db!, 'admins', user.uid));
    
    if (!adminDoc.exists()) {
      throw new Error('Usuário não é um administrador');
    }

    const adminData = adminDoc.data() as AdminUser;

    if (!adminData.isActive) {
      throw new Error('Conta de administrador desativada');
    }

    // Atualizar último login
    await updateDoc(doc(db!, 'admins', user.uid), {
      lastLogin: new Date()
    });

    return {
      user: adminData,
      isAuthenticated: true,
      requiresTwoFactor: adminData.twoFactorEnabled,
      twoFactorVerified: !adminData.twoFactorEnabled
    };
  } catch (error) {
    console.error('Erro no login de administrador:', error);
    throw error;
  }
};

// Função para verificar 2FA (simulada - em produção usar biblioteca real)
export const verifyTwoFactor = async (secret: string, token: string): Promise<boolean> => {
  // Em produção, usar biblioteca como 'speakeasy' ou similar
  // Por agora, simular verificação
  return token === '123456'; // Token de teste
};

// Função para habilitar 2FA
export const enableTwoFactor = async (uid: string, secret: string): Promise<void> => {
  try {
    await updateDoc(doc(db!, 'admins', uid), {
      twoFactorEnabled: true,
      twoFactorSecret: secret
    });
  } catch (error) {
    console.error('Erro ao habilitar 2FA:', error);
    throw error;
  }
};

// Função para fazer logout
export const logoutAdmin = async (): Promise<void> => {
  try {
    await signOut(auth!);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

// Função para buscar todos os administradores
export const getAllAdmins = async (): Promise<AdminUser[]> => {
  try {
    const adminsQuery = query(collection(db!, 'admins'));
    const querySnapshot = await getDocs(adminsQuery);
    
    return querySnapshot.docs.map(doc => doc.data() as AdminUser);
  } catch (error) {
    console.error('Erro ao buscar administradores:', error);
    throw error;
  }
};

// Função para atualizar permissões de um admin
export const updateAdminPermissions = async (
  uid: string, 
  permissions: Partial<AdminUser['permissions']>
): Promise<void> => {
  try {
    await updateDoc(doc(db!, 'admins', uid), {
      permissions: { ...permissions }
    });
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    throw error;
  }
};

// Função para desativar/ativar admin
export const toggleAdminStatus = async (uid: string, isActive: boolean): Promise<void> => {
  try {
    await updateDoc(doc(db!, 'admins', uid), {
      isActive
    });
  } catch (error) {
    console.error('Erro ao alterar status do admin:', error);
    throw error;
  }
};
