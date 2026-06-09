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

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        displayName,
        registrationNumber,
        university,
        course,
        year,
        period,
        userType
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao registrar usuário');
    }

    const { user } = await response.json();
    const formattedUser: OfflineUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: true
    };

    localStorage.setItem('unidate_offline_user', JSON.stringify(formattedUser));
    localStorage.setItem('unidate_offline_profile', JSON.stringify(user));
    window.dispatchEvent(new Event('auth-state-changed'));

    console.log('✅ Usuário registrado via SQLite:', formattedUser);
    return { user: formattedUser };
  } catch (error) {
    console.error('Erro no registro offline:', error);
    throw error;
  }
};

export const loginUserOffline = async (
  email: string,
  password: string
): Promise<{ user: OfflineUser }> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao fazer login');
    }

    const { user } = await response.json();
    const formattedUser: OfflineUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: true
    };

    localStorage.setItem('unidate_offline_user', JSON.stringify(formattedUser));
    localStorage.setItem('unidate_offline_profile', JSON.stringify(user));
    window.dispatchEvent(new Event('auth-state-changed'));

    console.log('✅ Usuário logado via SQLite:', formattedUser);
    return { user: formattedUser };
  } catch (error) {
    console.error('Erro no login offline:', error);
    throw error;
  }
};

export const logoutUserOffline = async (): Promise<void> => {
  localStorage.removeItem('unidate_offline_user');
  localStorage.removeItem('unidate_offline_profile');
  console.log('✅ Usuário deslogado offline');
  window.dispatchEvent(new Event('auth-state-changed'));
};

export const sendEmailVerificationOffline = async (user: OfflineUser): Promise<void> => {
  console.log('📧 E-mail de verificação simulado enviado para:', user.email);
};

export const verifyEmailOffline = async (user: OfflineUser): Promise<void> => {
  console.log('✅ E-mail verificado simulado offline para:', user.email);
};

export const getUserProfileOffline = async (uid: string): Promise<OfflineUserProfile | null> => {
  try {
    const response = await fetch(`${API_URL}/users/${uid}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar perfil offline:', error);
    return null;
  }
};

export const updateUserProfileOffline = async (
  uid: string,
  updates: Partial<OfflineUserProfile>
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/users/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar perfil no backend');
    }

    const updatedUser = await response.json();
    localStorage.setItem('unidate_offline_profile', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('auth-state-changed'));
    console.log('✅ Perfil atualizado via SQLite:', updates);
  } catch (error) {
    console.error('Erro ao atualizar perfil offline:', error);
    throw error;
  }
};

export const getUserByRegistrationOffline = async (
  registrationNumber: string
): Promise<OfflineUserProfile | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/login-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationNumber, password: '123' })
    });
    if (!response.ok) {
      return null;
    }
    const { user } = await response.json();
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário por matrícula:', error);
    return null;
  }
};

export const resetPasswordOffline = async (email: string): Promise<void> => {
  console.log('📧 E-mail de reset de senha enviado para:', email);
};

export const loginUserOfflineByRegistration = async (
  registrationNumber: string,
  password: string
): Promise<{ user: OfflineUser }> => {
  try {
    const response = await fetch(`${API_URL}/auth/login-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationNumber, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Matrícula não encontrada');
    }

    const { user } = await response.json();
    const formattedUser: OfflineUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: true
    };

    localStorage.setItem('unidate_offline_user', JSON.stringify(formattedUser));
    localStorage.setItem('unidate_offline_profile', JSON.stringify(user));
    window.dispatchEvent(new Event('auth-state-changed'));
    
    console.log('✅ Usuário logado offline por matrícula via SQLite:', formattedUser);
    return { user: formattedUser };
  } catch (error) {
    console.error('Erro no login por matrícula:', error);
    throw error;
  }
};
