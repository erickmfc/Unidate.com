import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { resetPassword } from '../../firebase/auth';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMessage('');
    try {
      await resetPassword(email);
      setStatus('success');
      setMessage('Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.message || 'Não foi possível enviar o e-mail de recuperação.');
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
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Recuperar senha</h1>
          <p className="mt-2 text-gray-600">Informe seu e-mail institucional para receber um link seguro.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-gray-700" htmlFor="recovery-email">
            E-mail institucional
            <input
              id="recovery-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
              placeholder="voce@universidade.edu.br"
            />
          </label>
          {message && (
            <p className={`rounded-xl border px-4 py-3 text-sm ${status === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {message}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-60">
            <Send className="h-4 w-4" />
            {loading ? 'Enviando...' : 'Enviar instruções'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
