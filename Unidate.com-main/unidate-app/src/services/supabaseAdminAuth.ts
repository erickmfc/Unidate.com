import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'super-admin' | 'moderator';
  isActive: boolean;
  twoFactorEnabled: boolean;
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

type RawAdminRole = AdminUser['role'] | 'admin';

const isAdminRole = (role: unknown): role is RawAdminRole =>
  role === 'super-admin' || role === 'moderator' || role === 'admin';

const mapAdminUser = (user: User): AdminUser | null => {
  // user_metadata is editable by the user. Administrative roles must come from
  // server-controlled app_metadata only.
  const roleClaim = user.app_metadata?.role;
  if (!isAdminRole(roleClaim)) return null;

  const role: AdminUser['role'] = roleClaim === 'admin' ? 'moderator' : roleClaim;
  const isSuperAdmin = role === 'super-admin';
  return {
    uid: user.id,
    email: user.email ?? '',
    displayName: user.user_metadata?.displayName ?? user.user_metadata?.name ?? user.email ?? 'Administrador',
    role,
    isActive: user.app_metadata?.is_active !== false,
    twoFactorEnabled: user.app_metadata?.two_factor_enabled === true,
    createdAt: new Date(user.created_at),
    permissions: {
      canManageUsers: isSuperAdmin,
      canModerateContent: true,
      canManageEvents: isSuperAdmin,
      canManageAdmins: isSuperAdmin,
      canAccessSystemSettings: isSuperAdmin,
    },
  };
};

const sessionFromUser = (user: User | null): AdminSession | null => {
  const adminUser = user ? mapAdminUser(user) : null;
  if (!adminUser) return null;
  const requiresTwoFactor = adminUser.twoFactorEnabled;
  return {
    user: adminUser,
    isAuthenticated: !requiresTwoFactor,
    requiresTwoFactor,
    twoFactorVerified: !requiresTwoFactor,
  };
};

export const loginAdmin = async (email: string, password: string): Promise<AdminSession> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  // Keep the documented local development account usable even when the
  // Supabase seed user has not yet been provisioned. This branch is compiled
  // out of production builds and never accepts these credentials in prod.
  if (error) {
    const isLocalDevAccount = import.meta.env.DEV &&
      email.trim().toLowerCase() === 'admin@unidate.com' &&
      password === 'admin123';
    if (isLocalDevAccount) {
      return {
        user: {
          uid: 'local-dev-admin',
          email: 'admin@unidate.com',
          displayName: 'Administrador UniDate',
          role: 'super-admin',
          isActive: true,
          twoFactorEnabled: false,
          createdAt: new Date(),
          permissions: {
            canManageUsers: true,
            canModerateContent: true,
            canManageEvents: true,
            canManageAdmins: true,
            canAccessSystemSettings: true,
          },
        },
        isAuthenticated: true,
        requiresTwoFactor: false,
        twoFactorVerified: true,
      };
    }
    throw error;
  }

  const session = sessionFromUser(data.user);
  if (!session) {
    await supabase.auth.signOut();
    throw new Error('A conta autenticada não possui uma função administrativa no Supabase.');
  }
  return session;
};

export const logoutAdmin = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const getCurrentAdminSession = async (): Promise<AdminSession | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return sessionFromUser(data.session?.user ?? null);
};

export const verifyTwoFactor = async (uid: string, code: string): Promise<AdminSession | null> => {
  const session = await getCurrentAdminSession();
  if (!session || session.user.uid !== uid) return null;
  if (!session.requiresTwoFactor) {
    return { ...session, isAuthenticated: true, twoFactorVerified: true };
  }
  if (!/^\d{6}$/.test(code)) return null;

  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
  if (factorsError) throw factorsError;
  const factor = factors.totp.find((candidate) => candidate.status === 'verified');
  if (!factor) throw new Error('Nenhum autenticador TOTP verificado está configurado para esta conta.');

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
  if (challengeError) throw challengeError;
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: factor.id,
    challengeId: challenge.id,
    code,
  });
  if (verifyError) return null;

  const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError) throw assuranceError;
  if (assurance.currentLevel !== 'aal2') return null;
  return { ...session, isAuthenticated: true, requiresTwoFactor: false, twoFactorVerified: true };
};

export const isAdminLoggedIn = async (): Promise<boolean> => Boolean(await getCurrentAdminSession());

export const onAdminAuthStateChanged = (callback: (session: AdminSession | null) => void) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(sessionFromUser(session?.user ?? null));
  });
  return () => data.subscription.unsubscribe();
};
