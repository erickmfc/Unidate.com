import { supabase } from '../supabaseClient';

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
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  registrationNumber: string,
  university: string,
  course: string,
  year: number,
  period: number,
  userType: 'aluno' | 'professor' | 'uni' = 'aluno'
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          displayName,
          registrationNumber,
          university,
          course,
          year: Number(year),
          period: Number(period),
          userType
        }
      }
    });

    if (error) throw error;
    
    // Simulate user credentials structure
    return {
      user: {
        uid: data.user?.id,
        email: data.user?.email,
        displayName: displayName,
        emailVerified: false
      }
    };
  } catch (error: any) {
    console.error('Erro ao registrar no Supabase:', error);
    throw new Error(error.message);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    return {
      user: {
        uid: data.user?.id,
        email: data.user?.email,
        displayName: data.user?.user_metadata?.displayName || '',
        emailVerified: true
      }
    };
  } catch (error: any) {
    console.error('Erro ao fazer login no Supabase:', error);
    throw new Error(error.message);
  }
};

export const loginWithRegistration = async (registrationNumber: string, password: string) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('registration_number', registrationNumber)
      .single();

    if (profileError || !profile) {
      throw new Error('Matrícula não encontrada');
    }

    return await loginUser(profile.email, password);
  } catch (error: any) {
    console.error('Erro ao fazer login por matrícula no Supabase:', error);
    throw new Error(error.message);
  }
};

export const getUserByRegistration = async (registrationNumber: string): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('registration_number', registrationNumber)
      .single();

    if (error) return null;
    return mapProfile(profile);
  } catch (error) {
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const resetPassword = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    if (error) throw error;
    return mapProfile(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const dbUpdates: any = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.photoURL !== undefined) dbUpdates.photo_url = updates.photoURL;
    if (updates.userType !== undefined) dbUpdates.user_type = updates.userType;
    if (updates.registrationNumber !== undefined) dbUpdates.registration_number = updates.registrationNumber;
    if (updates.university !== undefined) dbUpdates.university = updates.university;
    if (updates.course !== undefined) dbUpdates.course = updates.course;
    if (updates.year !== undefined) dbUpdates.year = Number(updates.year);
    if (updates.period !== undefined) dbUpdates.period = Number(updates.period);
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
    if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', uid);

    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao atualizar perfil no Supabase:', error);
    throw new Error(error.message);
  }
};

export const isInstitutionalEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const mapProfile = (dbProfile: any): UserProfile => {
  return {
    uid: dbProfile.id,
    email: dbProfile.email || '',
    displayName: dbProfile.display_name || 'Usuário',
    photoURL: dbProfile.photo_url || '',
    userType: dbProfile.user_type || 'aluno',
    registrationNumber: dbProfile.registration_number || '',
    university: dbProfile.university || '',
    course: dbProfile.course || '',
    year: dbProfile.year || 2026,
    period: dbProfile.period || 1,
    bio: dbProfile.bio || '',
    interests: dbProfile.interests || [],
    isVerified: dbProfile.is_verified || false,
    onboardingCompleted: dbProfile.onboarding_completed || false,
    createdAt: dbProfile.created_at || '',
    updatedAt: dbProfile.updated_at || ''
  };
};
