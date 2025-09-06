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
const mockAdminSessions: { [key: string]: AdminSession } = {};
const mockCurrentAdmin: AdminSession | null = null;

// Simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Credenciais mock para desenvolvimento
const MOCK_ADMIN_CREDENTIALS = {
  'admin@unidate.com': {
    password: 'admin123',
    displayName: 'Admin UniDate',
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

  // Armazenar sessão temporariamente
  mockAdminSessions[session.user.uid] = session;

  return session;
};

// Verificar código 2FA
export const verifyTwoFactor = async (sessionId: string, code: string): Promise<AdminSession> => {
  await delay(500); // Simular delay de rede

  const session = Object.values(mockAdminSessions).find(s => s.user.uid === sessionId);
  
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

  return session;
};

// Logout de administrador
export const logoutAdmin = async (): Promise<void> => {
  await delay(500); // Simular delay de rede
  // Limpar todas as sessões
  Object.keys(mockAdminSessions).forEach(key => delete mockAdminSessions[key]);
};

// Obter sessão atual do admin
export const getCurrentAdminSession = (): AdminSession | null => {
  const sessions = Object.values(mockAdminSessions);
  return sessions.find(s => s.isAuthenticated) || null;
};

// Verificar se admin está logado
export const isAdminLoggedIn = (): boolean => {
  const session = getCurrentAdminSession();
  return session?.isAuthenticated || false;
};
