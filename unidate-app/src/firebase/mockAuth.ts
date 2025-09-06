// Sistema de autenticação mock para desenvolvimento
// Este arquivo substitui o Firebase Auth durante o desenvolvimento

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  registrationNumber: string;
  university: string;
  course: string;
  year: number;
  period: number;
  bio?: string;
  interests: string[];
  isVerified: boolean;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCredential {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
}

// Armazenamento local para simular banco de dados
const mockUsers: { [key: string]: UserProfile } = {};
const mockCurrentUser: { [key: string]: any } = {};

// Simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Validar e-mail (aceita qualquer e-mail válido)
export const isInstitutionalEmail = (email: string): boolean => {
  // Regex básico para validar formato de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Registrar novo usuário
export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  registrationNumber: string,
  university: string,
  course: string,
  year: number,
  period: number
): Promise<UserCredential> => {
  await delay(1000); // Simular delay de rede

  // Verificar se é um e-mail válido
  if (!isInstitutionalEmail(email)) {
    throw new Error('Por favor, insira um e-mail válido');
  }

  // Verificar se usuário já existe
  if (mockUsers[email]) {
    throw new Error('Este e-mail já está em uso');
  }

  // Criar novo usuário
  const uid = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const userProfile: UserProfile = {
    uid,
    email,
    displayName,
    registrationNumber,
    university,
    course,
    year,
    period,
    interests: [],
    isVerified: false,
    isEmailVerified: false,
    onboardingCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockUsers[email] = userProfile;
  mockCurrentUser[uid] = {
    uid,
    email,
    displayName,
    photoURL: null,
  };

  return {
    user: mockCurrentUser[uid]
  };
};

// Fazer login
export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  await delay(1000); // Simular delay de rede

  const userProfile = mockUsers[email];
  if (!userProfile) {
    throw new Error('Usuário não encontrado');
  }

  // Simular verificação de senha (em produção seria hash)
  if (password.length < 6) {
    throw new Error('Senha incorreta');
  }

  mockCurrentUser[userProfile.uid] = {
    uid: userProfile.uid,
    email: userProfile.email,
    displayName: userProfile.displayName,
    photoURL: userProfile.photoURL,
  };

  return {
    user: mockCurrentUser[userProfile.uid]
  };
};

// Fazer login com matrícula
export const loginWithRegistration = async (registrationNumber: string, password: string): Promise<UserCredential> => {
  await delay(1000); // Simular delay de rede

  // Buscar usuário pela matrícula
  const userProfile = await getUserByRegistration(registrationNumber);
  if (!userProfile) {
    throw new Error('Matrícula não encontrada');
  }

  return await loginUser(userProfile.email, password);
};

// Buscar usuário por matrícula
export const getUserByRegistration = async (registrationNumber: string): Promise<UserProfile | null> => {
  await delay(500); // Simular delay de rede

  for (const user of Object.values(mockUsers)) {
    if (user.registrationNumber === registrationNumber) {
      return user;
    }
  }
  return null;
};

// Fazer logout
export const logoutUser = async (): Promise<void> => {
  await delay(500); // Simular delay de rede
  // Limpar usuário atual
  Object.keys(mockCurrentUser).forEach(key => delete mockCurrentUser[key]);
};

// Recuperar senha
export const resetPassword = async (email: string): Promise<void> => {
  await delay(1000); // Simular delay de rede
  
  if (!mockUsers[email]) {
    throw new Error('Usuário não encontrado');
  }
  
  // Em produção, enviaria e-mail de recuperação
  console.log(`E-mail de recuperação enviado para: ${email}`);
};

// Buscar perfil do usuário
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  await delay(500); // Simular delay de rede

  for (const user of Object.values(mockUsers)) {
    if (user.uid === uid) {
      return user;
    }
  }
  return null;
};

// Atualizar perfil do usuário
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  await delay(500); // Simular delay de rede

  for (const email in mockUsers) {
    if (mockUsers[email].uid === uid) {
      mockUsers[email] = {
        ...mockUsers[email],
        ...updates,
        updatedAt: new Date(),
      };
      break;
    }
  }
};

// Obter usuário atual
export const getCurrentUser = () => {
  const users = Object.values(mockCurrentUser);
  return users.length > 0 ? users[0] : null;
};

// Verificar se usuário está logado
export const isUserLoggedIn = () => {
  return Object.keys(mockCurrentUser).length > 0;
};
