import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import * as offlineAuth from './offlineAuth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  registrationNumber: string;
  university: string;
  course: string;
  year: number;
  period: number;
  bio?: string;
  interests: string[];
  isVerified: boolean;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Validar e-mail (aceita qualquer e-mail válido)
export const isInstitutionalEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Registrar novo usuário
export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  registrationNumber: string,
  university: string,
  course: string,
  year: number,
  period: number
): Promise<UserCredential> => {
  try {
    // Verificar se é um e-mail válido
    if (!isInstitutionalEmail(email)) {
      throw new Error('Por favor, insira um e-mail válido');
    }

    // Se Firebase não estiver disponível, usar sistema offline
    if (!auth || !db) {
      console.log('🔄 Firebase não disponível, usando sistema offline...');
      const result = await offlineAuth.registerUserOffline(
        email, password, displayName, registrationNumber, university, course, year, period
      );
      
      // Simular UserCredential para compatibilidade
      return {
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          emailVerified: result.user.emailVerified,
        } as User,
        providerId: 'offline',
        operationType: 'signIn'
      } as UserCredential;
    }

    const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
    const user = userCredential.user;

    // Atualizar perfil do usuário
    await updateProfile(user, {
      displayName: displayName,
    });

    // Enviar e-mail de verificação
    await sendEmailVerification(user);

    // Criar perfil do usuário no Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      registrationNumber,
      university,
      course,
      year,
      period,
      interests: [],
      isVerified: false,
      isEmailVerified: false,
      onboardingCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db!, 'users', user.uid), userProfile);

    return userCredential;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Fazer login
export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  try {
    // Se Firebase não estiver disponível, usar sistema offline
    if (!auth) {
      console.log('🔄 Firebase não disponível, usando sistema offline...');
      const result = await offlineAuth.loginUserOffline(email, password);
      
      // Simular UserCredential para compatibilidade
      return {
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          emailVerified: result.user.emailVerified,
        } as User,
        providerId: 'offline',
        operationType: 'signIn'
      } as UserCredential;
    }

    return await signInWithEmailAndPassword(auth!, email, password);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Fazer login com matrícula
export const loginWithRegistration = async (registrationNumber: string, password: string): Promise<UserCredential> => {
  try {
    // Buscar usuário pela matrícula
    const userProfile = await getUserByRegistration(registrationNumber);
    if (!userProfile) {
      throw new Error('Matrícula não encontrada');
    }

    return await signInWithEmailAndPassword(auth!, userProfile.email, password);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Buscar usuário por matrícula
export const getUserByRegistration = async (registrationNumber: string): Promise<UserProfile | null> => {
  try {
    const usersRef = collection(db!, 'users');
    const q = query(usersRef, where('registrationNumber', '==', registrationNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Fazer logout
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth!);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Recuperar senha
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth!, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Buscar perfil do usuário
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db!, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db!, 'users', uid);
    await setDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error: any) {
    throw new Error(error.message);
  }
};
