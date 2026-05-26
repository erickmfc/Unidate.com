
export interface UserProfile {
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

export interface UserCredential {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
}

const mockUsers: { [key: string]: UserProfile } = {};
const mockCurrentUser: { [key: string]: any } = {};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const isInstitutionalEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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
  await delay(1000);

  if (!isInstitutionalEmail(email)) {
    throw new Error('Por favor, insira um e-mail válido');
  }

  if (mockUsers[email]) {
    throw new Error('Este e-mail já está em uso');
  }

  const uid = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const userProfile: UserProfile = {
    uid,
    email,
    displayName,
    userType: 'aluno',
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

export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  await delay(1000);

  const userProfile = mockUsers[email];
  if (!userProfile) {
    throw new Error('Usuário não encontrado');
  }

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

export const loginWithRegistration = async (registrationNumber: string, password: string): Promise<UserCredential> => {
  await delay(1000);

  const userProfile = await getUserByRegistration(registrationNumber);
  if (!userProfile) {
    throw new Error('Matrícula não encontrada');
  }

  return await loginUser(userProfile.email, password);
};

export const getUserByRegistration = async (registrationNumber: string): Promise<UserProfile | null> => {
  await delay(500);

  for (const user of Object.values(mockUsers)) {
    if (user.registrationNumber === registrationNumber) {
      return user;
    }
  }
  return null;
};

export const logoutUser = async (): Promise<void> => {
  await delay(500);
  Object.keys(mockCurrentUser).forEach(key => delete mockCurrentUser[key]);
};

export const resetPassword = async (email: string): Promise<void> => {
  await delay(1000);
  
  if (!mockUsers[email]) {
    throw new Error('Usuário não encontrado');
  }
  
  console.log(`E-mail de recuperação enviado para: ${email}`);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  await delay(500);

  for (const user of Object.values(mockUsers)) {
    if (user.uid === uid) {
      return user;
    }
  }
  return null;
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  await delay(500);

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

export const getCurrentUser = () => {
  const users = Object.values(mockCurrentUser);
  return users.length > 0 ? users[0] : null;
};

export const isUserLoggedIn = () => {
  return Object.keys(mockCurrentUser).length > 0;
};
