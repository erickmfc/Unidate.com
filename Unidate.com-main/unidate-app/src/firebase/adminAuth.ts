/**
 * Sistema de autenticação de administradores
 * Usa Firebase Auth com Custom Claims - SEGURO
 * 
 * IMPORTANTE: NÃO armazena credenciais no frontend
 * Custom Claims devem ser definidos no backend (Cloud Functions)
 */

import * as secureAdminAuth from './secureAdminAuth';

// Re-exportar todas as funções seguras
export const {
  loginAdmin,
  verifyTwoFactor,
  logoutAdmin,
  getCurrentAdminSession,
  isAdminLoggedIn,
  onAdminAuthStateChanged
} = secureAdminAuth;

// Re-exportar tipos
export type AdminSession = secureAdminAuth.AdminSession;
export type AdminUser = secureAdminAuth.AdminUser;

// Funções adicionais para compatibilidade
export const signInAdmin = loginAdmin;
export const signOutAdmin = logoutAdmin;

// Funções que requerem backend (Cloud Functions)
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