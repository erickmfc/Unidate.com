import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from './config';

// Configuração do Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Configurar escopos adicionais se necessário
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Função para login com Google usando popup
export const signInWithGooglePopup = async () => {
  try {
    if (!auth) {
      throw new Error('Firebase não está disponível');
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    console.error('Erro no login com Google:', error);
    throw error;
  }
};

// Função para login com Google usando redirect
export const signInWithGoogleRedirect = async () => {
  try {
    if (!auth) {
      throw new Error('Firebase não está disponível');
    }
    
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error('Erro no login com Google:', error);
    throw error;
  }
};

// Função para obter resultado do redirect
export const getGoogleRedirectResult = async () => {
  try {
    if (!auth) {
      throw new Error('Firebase não está disponível');
    }
    
    const result = await getRedirectResult(auth);
    return result;
  } catch (error: any) {
    console.error('Erro ao obter resultado do Google:', error);
    throw error;
  }
};

// Função para criar perfil do usuário após login com Google
export const createGoogleUserProfile = async (user: any, additionalData: {
  registrationNumber: string;
  university: string;
  course: string;
  year: number;
  period: number;
}) => {
  try {
    if (!auth) {
      throw new Error('Firebase não está disponível');
    }

    // Aqui você pode salvar os dados adicionais no Firestore
    // Por enquanto, apenas retornamos os dados
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      ...additionalData
    };
  } catch (error: any) {
    console.error('Erro ao criar perfil do Google:', error);
    throw error;
  }
};
