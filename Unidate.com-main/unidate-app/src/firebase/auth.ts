import * as offlineAuth from './offlineAuth';

export const registerUser = offlineAuth.registerUserOffline;
export const loginUser = offlineAuth.loginUserOffline;
export const loginWithRegistration = offlineAuth.loginUserOfflineByRegistration;
export const getUserByRegistration = offlineAuth.getUserByRegistrationOffline;
export const logoutUser = offlineAuth.logoutUserOffline;
export const resetPassword = offlineAuth.resetPasswordOffline;
export const getUserProfile = offlineAuth.getUserProfileOffline;
export const updateUserProfile = offlineAuth.updateUserProfileOffline;

export const isInstitutionalEmail = (email: string): boolean => {
  // Accepts any valid email (not restricted to .edu.br)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export type UserProfile = offlineAuth.OfflineUserProfile;
