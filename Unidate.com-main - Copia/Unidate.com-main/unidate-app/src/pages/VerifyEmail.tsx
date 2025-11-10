import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { 
  Mail, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle,
  Clock
} from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';

  useEffect(() => {
    // Verificar se o e-mail foi verificado
    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      if (user && user.emailVerified) {
        navigate('/onboarding-complete');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      if (auth!.currentUser) {
        await sendEmailVerification(auth!.currentUser);
        setSuccess('E-mail de verificação reenviado!');
        setCountdown(60); // 60 segundos de cooldown
      }
    } catch (error: any) {
      setError('Erro ao reenviar e-mail. Tente novamente.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setError('');

    try {
      if (auth!.currentUser) {
        await auth!.currentUser.reload();
        if (auth!.currentUser.emailVerified) {
          navigate('/onboarding-complete');
        } else {
          setError('E-mail ainda não foi verificado. Verifique sua caixa de entrada.');
        }
      }
    } catch (error: any) {
      setError('Erro ao verificar status. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verifique seu E-mail
          </h1>
          <p className="text-gray-600">
            Enviamos um link de verificação para:
          </p>
          <p className="text-purple-600 font-medium mt-1">{email}</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-10 w-10 text-purple-600" />
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Quase lá! 🎉
              </h2>
              <div className="text-left space-y-3 text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">1</span>
                  </div>
                  <p className="text-sm">Verifique sua caixa de entrada (e a pasta de spam)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">2</span>
                  </div>
                  <p className="text-sm">Clique no link de verificação no e-mail</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">3</span>
                  </div>
                  <p className="text-sm">Volte aqui e clique em "Verificar"</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-900">Por que verificar?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    A verificação garante que você é realmente um estudante da universidade e 
                    protege a comunidade UniDate.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckVerification}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Já verifiquei meu e-mail</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResendEmail}
                disabled={resendLoading || countdown > 0}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Reenviando...</span>
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Clock className="h-5 w-5" />
                    <span>Reenviar em {countdown}s</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    <span>Reenviar e-mail</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Não recebeu o e-mail? Verifique sua pasta de spam ou{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              tente novamente
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
