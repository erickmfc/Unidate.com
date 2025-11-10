// Sistema de autenticação offline para desenvolvimento
export interface OfflineUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
}

export interface OfflineUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  userType: 'aluno' | 'professor' | 'uni';
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

// Simular dados de usuários
const mockUsers: OfflineUser[] = [];
const mockProfiles: OfflineUserProfile[] = [];

// Função para gerar UID único
const generateUID = (): string => {
  return 'offline_' + Math.random().toString(36).substr(2, 9);
};

// Simular registro de usuário
export const registerUserOffline = async (
  email: string,
  password: string,
  displayName: string,
  registrationNumber: string,
  university: string,
  course: string,
  year: number,
  period: number,
  userType: 'aluno' | 'professor' | 'uni' = 'aluno'
): Promise<{ user: OfflineUser }> => {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const uid = generateUID();
  const user: OfflineUser = {
    uid,
    email,
    displayName,
    emailVerified: false
  };
  
  const profile: OfflineUserProfile = {
    uid,
    email,
    displayName,
    userType,
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
    updatedAt: new Date()
  };
  
  mockUsers.push(user);
  mockProfiles.push(profile);
  
  console.log('✅ Usuário registrado offline:', user);
  
  return { user };
};

// Simular login
export const loginUserOffline = async (
  email: string,
  password: string
): Promise<{ user: OfflineUser }> => {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  
  console.log('✅ Usuário logado offline:', user);
  return { user };
};

// Simular logout
export const logoutUserOffline = async (): Promise<void> => {
  console.log('✅ Usuário deslogado offline');
};

// Simular envio de e-mail de verificação
export const sendEmailVerificationOffline = async (user: OfflineUser): Promise<void> => {
  console.log('📧 E-mail de verificação enviado para:', user.email);
  console.log('🔗 Link de verificação: http://localhost:3000/verify-email?token=offline_verification');
};

// Simular verificação de e-mail
export const verifyEmailOffline = async (user: OfflineUser): Promise<void> => {
  const userIndex = mockUsers.findIndex(u => u.uid === user.uid);
  if (userIndex !== -1) {
    mockUsers[userIndex].emailVerified = true;
  }
  
  const profileIndex = mockProfiles.findIndex(p => p.uid === user.uid);
  if (profileIndex !== -1) {
    mockProfiles[profileIndex].isEmailVerified = true;
  }
  
  console.log('✅ E-mail verificado offline para:', user.email);
};

// Simular busca de perfil
export const getUserProfileOffline = async (uid: string): Promise<OfflineUserProfile | null> => {
  const profile = mockProfiles.find(p => p.uid === uid);
  return profile || null;
};

// Simular atualização de perfil
export const updateUserProfileOffline = async (
  uid: string,
  updates: Partial<OfflineUserProfile>
): Promise<void> => {
  const profileIndex = mockProfiles.findIndex(p => p.uid === uid);
  if (profileIndex !== -1) {
    mockProfiles[profileIndex] = {
      ...mockProfiles[profileIndex],
      ...updates,
      updatedAt: new Date()
    };
    console.log('✅ Perfil atualizado offline:', updates);
  }
};

// Simular busca por matrícula
export const getUserByRegistrationOffline = async (
  registrationNumber: string
): Promise<OfflineUserProfile | null> => {
  const profile = mockProfiles.find(p => p.registrationNumber === registrationNumber);
  return profile || null;
};

// Simular reset de senha
export const resetPasswordOffline = async (email: string): Promise<void> => {
  console.log('📧 E-mail de reset de senha enviado para:', email);
  console.log('🔗 Link de reset: http://localhost:3000/reset-password?token=offline_reset');
};
