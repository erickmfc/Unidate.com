import { supabase } from '../supabaseClient';

// Mantém os nomes exportados para compatibilidade com os componentes existentes;
// a autenticação social agora é realizada pelo Supabase Auth.
export const signInWithGooglePopup = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
  return data;
};

export const signInWithGoogleRedirect = signInWithGooglePopup;

export const getGoogleRedirectResult = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const createGoogleUserProfile = async (user: any, additionalData: {
  registrationNumber: string;
  university: string;
  course: string;
  year: number;
  period: number;
}) => ({
  uid: user.id || user.uid,
  email: user.email,
  displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.displayName,
  photoURL: user.user_metadata?.avatar_url || user.photoURL,
  ...additionalData,
});
