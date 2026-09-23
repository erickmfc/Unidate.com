import { resetPassword } from './auth';
import { supabase } from '../supabaseClient';

jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

test('password recovery points back to the current site reset page', async () => {
  const auth = supabase.auth as any;
  auth.resetPasswordForEmail.mockResolvedValue({ error: null });

  await resetPassword('aluna@faculdade.edu.br');

  expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('aluna@faculdade.edu.br', {
    redirectTo: `${window.location.origin}/reset-password`,
  });
});
