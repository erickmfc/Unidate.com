import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import UniDateLogo from '../../components/UI/UniDateLogo';
import { Shield, Eye, EyeOff, AlertCircle, Key } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const { loginAdmin, verifyTwoFactor, adminSession } = useAdminAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!showTwoFactor) {
        // Primeiro login
        await loginAdmin(formData.email, formData.password);
        
        if (adminSession?.requiresTwoFactor) {
          setShowTwoFactor(true);
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        // Verificação 2FA
        const isValid = await verifyTwoFactor(formData.twoFactorCode);
        if (isValid) {
          navigate('/admin/dashboard');
        } else {
          setError('Código 2FA inválido');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <UniDateLogo size="lg" showText={true} className="justify-center mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Painel de Administração
          </h2>
          <p className="text-gray-300">
            Acesso restrito à equipe UniDate
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-300 text-sm font-medium">Área Restrita</span>
          </div>
          <p className="text-red-200 text-sm mt-2">
            Esta área é exclusiva para administradores autorizados. 
            Todas as ações são monitoradas e registradas.
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail de Administrador
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-200"
                  placeholder="admin@unidate.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            {!showTwoFactor && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Senha de Administrador
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-200 pr-12"
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 2FA Field */}
            {showTwoFactor && (
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-300 mb-2">
                  Código de Verificação 2FA
                </label>
                <div className="relative">
                  <input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-200 text-center text-2xl tracking-widest"
                    placeholder="123456"
                    value={formData.twoFactorCode}
                    onChange={handleChange}
                  />
                  <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Digite o código de 6 dígitos do seu aplicativo autenticador
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Acessar Painel</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-4">
          <h4 className="text-gray-300 font-medium mb-2">Credenciais de Demonstração:</h4>
          <div className="text-sm text-gray-400 space-y-1">
            <p><strong>E-mail:</strong> admin@unidate.com</p>
            <p><strong>Senha:</strong> admin123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            © 2024 UniDate • Sistema de Administração
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

