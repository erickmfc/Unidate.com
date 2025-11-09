// Sistema de autenticação mock para administradores
// Este arquivo substitui o Firebase Auth para admins durante o desenvolvimento

export interface AdminSession {
  user: {
    uid: string;
    email: string;
    displayName: string;
    role: 'super-admin' | 'moderator';
  };
  requiresTwoFactor: boolean;
  isAuthenticated: boolean;
}

// Armazenamento local para simular sessões de admin
// Usar localStorage para persistir entre recarregamentos
const STORAGE_KEY = 'unidate_admin_session';

const getStoredSessions = (): { [key: string]: AdminSession } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveStoredSessions = (sessions: { [key: string]: AdminSession }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
  }
};

// Simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Credenciais mock para desenvolvimento
const MOCK_ADMIN_CREDENTIALS = {
  'admin1': {
    password: 'admin123',
    displayName: 'Admin UniDate',
    role: 'super-admin' as const,
    twoFactorSecret: '123456'
  },
  'admin': {
    password: 'admin123',
    displayName: 'Admin UniDate',
    role: 'super-admin' as const,
    twoFactorSecret: '123456'
  },
  'admin@unidate.com': {
    password: 'admin123',
    displayName: 'Admin UniDate',
    role: 'super-admin' as const,
    twoFactorSecret: '123456'
  },
  'erick': {
    password: 'admin123',
    displayName: 'Erick Admin',
    role: 'super-admin' as const,
    twoFactorSecret: '123456'
  },
  'mathe': {
    password: 'admin123',
    displayName: 'Mathe Admin',
    role: 'super-admin' as const,
    twoFactorSecret: '123456'
  },
  'root': {
    password: 'admin123',
    displayName: 'Root Admin',
    role: 'super-admin' as const,
    twoFactorSecret: '123456'
  },
  'super': {
    password: 'admin123',
    displayName: 'Super Admin',
    role: 'super-admin' as const,
    twoFactorSecret: '123456'
  }
};

// Login de administrador
export const loginAdmin = async (email: string, password: string): Promise<AdminSession> => {
  await delay(1000); // Simular delay de rede

  const admin = MOCK_ADMIN_CREDENTIALS[email as keyof typeof MOCK_ADMIN_CREDENTIALS];
  
  if (!admin || admin.password !== password) {
    throw new Error('Credenciais inválidas');
  }

  const session: AdminSession = {
    user: {
      uid: `admin_${Date.now()}`,
      email,
      displayName: admin.displayName,
      role: admin.role,
    },
    requiresTwoFactor: true,
    isAuthenticated: false,
  };

  // Armazenar sessão no localStorage
  const sessions = getStoredSessions();
  sessions[session.user.uid] = session;
  saveStoredSessions(sessions);

  return session;
};

// Verificar código 2FA
export const verifyTwoFactor = async (sessionId: string, code: string): Promise<AdminSession> => {
  await delay(500); // Simular delay de rede

  const sessions = getStoredSessions();
  const session = Object.values(sessions).find(s => s.user.uid === sessionId);
  
  if (!session) {
    throw new Error('Sessão não encontrada');
  }

  // Código mock para desenvolvimento
  if (code !== '123456') {
    throw new Error('Código 2FA inválido');
  }

  // Marcar como autenticado
  session.requiresTwoFactor = false;
  session.isAuthenticated = true;

  // Salvar sessão atualizada
  sessions[session.user.uid] = session;
  saveStoredSessions(sessions);

  return session;
};

// Logout de administrador
export const logoutAdmin = async (): Promise<void> => {
  await delay(500); // Simular delay de rede
  // Limpar todas as sessões do localStorage
  localStorage.removeItem(STORAGE_KEY);
};

// Obter sessão atual do admin
export const getCurrentAdminSession = (): AdminSession | null => {
  const sessions = getStoredSessions();
  const authenticatedSessions = Object.values(sessions).filter(s => s.isAuthenticated);
  return authenticatedSessions.length > 0 ? authenticatedSessions[0] : null;
};

// Verificar se admin está logado
export const isAdminLoggedIn = (): boolean => {
  const session = getCurrentAdminSession();
  return session?.isAuthenticated || false;
};
