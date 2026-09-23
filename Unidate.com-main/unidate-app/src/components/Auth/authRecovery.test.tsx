import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import { resetPassword } from '../../firebase/auth';
import { supabase } from '../../supabaseClient';

jest.mock('../../firebase/auth', () => ({ resetPassword: jest.fn() }));
jest.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

const auth = supabase.auth as any;

describe('password recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (resetPassword as jest.Mock).mockResolvedValue(undefined);
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } }, error: null });
    auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
    auth.updateUser.mockResolvedValue({ error: null });
  });

  test('sends a recovery email and confirms the request', async () => {
    render(<MemoryRouter><ForgotPassword /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/E-mail institucional/i), { target: { value: 'aluna@faculdade.edu.br' } });
    fireEvent.click(screen.getByRole('button', { name: /Enviar instruções/i }));

    expect(await screen.findByText(/você receberá as instruções de recuperação/i)).toBeInTheDocument();
    expect(resetPassword).toHaveBeenCalledWith('aluna@faculdade.edu.br');
  });

  test('accepts a new password after validating the recovery session', async () => {
    render(<MemoryRouter><ResetPassword /></MemoryRouter>);

    fireEvent.change(await screen.findByLabelText('Nova senha'), { target: { value: 'senha-segura-123' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'senha-segura-123' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar nova senha/i }));

    await waitFor(() => expect(auth.updateUser).toHaveBeenCalledWith({ password: 'senha-segura-123' }));
    expect(await screen.findByText('Senha atualizada')).toBeInTheDocument();
  });
});
