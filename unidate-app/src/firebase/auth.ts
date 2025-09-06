// Sistema de autenticação - usa Firebase real
import * as realAuth from './realAuth';

// Re-exportar todas as funções do Firebase real
export const {
  registerUser,
  loginUser,
  loginWithRegistration,
  getUserByRegistration,
  logoutUser,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  isInstitutionalEmail
} = realAuth;

// Re-exportar tipos
export type UserProfile = realAuth.UserProfile;
export type UserCredential = realAuth.UserCredential;