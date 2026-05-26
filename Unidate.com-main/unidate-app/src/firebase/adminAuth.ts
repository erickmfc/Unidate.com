

import * as secureAdminAuth from './secureAdminAuth';

export const {
  loginAdmin,
  verifyTwoFactor,
  logoutAdmin,
  getCurrentAdminSession,
  isAdminLoggedIn,
  onAdminAuthStateChanged
} = secureAdminAuth;

export type AdminSession = secureAdminAuth.AdminSession;
export type AdminUser = secureAdminAuth.AdminUser;

export const signInAdmin = loginAdmin;
export const signOutAdmin = logoutAdmin;

export const createAdminUser = async () => { 
  throw new Error('Criação de admin requer Cloud Functions. Use o backend para criar admins.'); 
};
export const getAllAdmins = async () => {
  throw new Error('Listar admins requer Cloud Functions. Use o backend.');
};
export const updateAdminPermissions = async () => {
  throw new Error('Atualizar permissões requer Cloud Functions. Use o backend.');
};
export const toggleAdminStatus = async () => {
  throw new Error('Alterar status requer Cloud Functions. Use o backend.');
};
export const enableTwoFactor = async () => {
  throw new Error('Habilitar 2FA requer Cloud Functions. Use o backend.');
};
