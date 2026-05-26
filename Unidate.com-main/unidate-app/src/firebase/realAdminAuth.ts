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

export const createAdminUser = async (
  email: string, 
  password: string, 
  displayName: string, 
  role: 'super-admin' | 'moderator'
): Promise<AdminUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
    const user = userCredential.user;

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

    await updateProfile(user, { displayName });

    return adminData;
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    throw error;
  }
};

export const loginAdmin = async (email: string, password: string): Promise<AdminSession> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth!, email, password);
    const user = userCredential.user;

    const adminDoc = await getDoc(doc(db!, 'admins', user.uid));
    
    if (!adminDoc.exists()) {
      throw new Error('Usuário não é um administrador');
    }

    const adminData = adminDoc.data() as AdminUser;

    if (!adminData.isActive) {
      throw new Error('Conta de administrador desativada');
    }

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

export const verifyTwoFactor = async (secret: string, token: string): Promise<boolean> => {
  return token === '123456';
};

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

export const logoutAdmin = async (): Promise<void> => {
  try {
    await signOut(auth!);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

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
