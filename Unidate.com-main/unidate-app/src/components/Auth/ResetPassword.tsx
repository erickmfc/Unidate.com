import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, LockKeyhole, Save } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const ResetPassword: React.FC = () => {
  const [checkingLink, setCheckingLink] = useState(true);
  const [canReset, setCanReset] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let mounted = true;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const hasRecoveryCallback = hashParams.get('type') === 'recovery' || new URLSearchParams(window.location.search).has('code');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && session && event === 'PASSWORD_RECOVERY') {
        setCanReset(true);
        setCheckingLink(false);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      const hasSession = Boolean(data.session);
      setCanReset(hasSession);
      setCheckingLink(false);
      if (error) setMessage('Não foi possível validar o link. Solicite outro e-mail de recuperação.');
      else if (!hasSession && !hasRecoveryCallback) setMessage('Abra o link de recuperação que enviamos ao seu e-mail.');
      else if (!hasSession) setMessage('Este link expirou ou já foi usado. Solicite um novo e-mail de recuperação.');
    }).catch(() => {
      if (!mounted) return;
      setCanReset(false);
      setCheckingLink(false);
      setMessage('Não foi possível validar o link. Solicite outro e-mail de recuperação.');
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (password.length < 6) {
      setMessage('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setMessage('As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setCompleted(true);
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      setMessage(error?.message || 'Não foi possível salvar a nova senha. Solicite outro link e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <Link to="/login" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
          <ArrowLeft className="h-4 w-4" /> Voltar para o login
        </Link>

        {completed ? (
          <div className="py-6 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Senha atualizada</h1>
            <p className="mt-2 text-gray-600">Sua nova senha já pode ser usada para entrar no UniDate.</p>
            <Link to="/dashboard" className="btn-primary mt-6 inline-flex justify-center">Acessar minha conta</Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Criar nova senha</h1>
              <p className="mt-2 text-gray-600">Escolha uma senha com pelo menos 6 caracteres.</p>
            </div>

            {checkingLink ? (
              <div className="py-8 text-center text-sm text-gray-500">Validando link de recuperação…</div>
            ) : canReset ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block text-sm font-medium text-gray-700" htmlFor="new-password">
                  Nova senha
                  <input id="new-password" type="password" autoComplete="new-password" required minLength={6}
                    value={password} onChange={event => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100" />
                </label>
                <label className="block text-sm font-medium text-gray-700" htmlFor="confirm-password">
                  Confirmar nova senha
                  <input id="confirm-password" type="password" autoComplete="new-password" required minLength={6}
                    value={confirmation} onChange={event => setConfirmation(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100" />
                </label>
                {message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}
                <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-60">
                  <Save className="h-4 w-4" /> {loading ? 'Salvando…' : 'Salvar nova senha'}
                </button>
              </form>
            ) : (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {message || 'Link de recuperação inválido.'}
                <Link to="/forgot-password" className="mt-3 block font-semibold underline">Solicitar outro link</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
