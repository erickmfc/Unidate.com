// Sistema de autenticação real para administradores
import * as realAdminAuth from './realAdminAuth';

// Re-exportar todas as funções do Firebase real
export const {
  createAdminUser,
  loginAdmin,
  verifyTwoFactor,
  enableTwoFactor,
  logoutAdmin,
  getAllAdmins,
  updateAdminPermissions,
  toggleAdminStatus
} = realAdminAuth;

// Re-exportar tipos
export type AdminUser = realAdminAuth.AdminUser;
export type AdminSession = realAdminAuth.AdminSession;

// Funções adicionais para compatibilidade
export const signInAdmin = loginAdmin;
export const signOutAdmin = logoutAdmin;