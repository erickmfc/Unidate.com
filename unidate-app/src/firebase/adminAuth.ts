// Sistema de autenticação mock para administradores
// Usar mock durante desenvolvimento para evitar problemas com Firebase

import * as mockAdminAuth from './mockAdminAuth';

// Re-exportar todas as funções do mock
export const {
  loginAdmin,
  verifyTwoFactor,
  logoutAdmin,
  getCurrentAdminSession,
  isAdminLoggedIn
} = mockAdminAuth;

// Re-exportar tipos
export type AdminSession = mockAdminAuth.AdminSession;

// Funções adicionais para compatibilidade
export const signInAdmin = loginAdmin;
export const signOutAdmin = logoutAdmin;

// Funções que não existem no mock - implementar como stubs
export const createAdminUser = async () => { 
  throw new Error('Criação de admin não disponível no modo mock'); 
};
export const getAllAdmins = async () => [];
export const updateAdminPermissions = async () => {};
export const toggleAdminStatus = async () => {};
export const enableTwoFactor = async () => {};