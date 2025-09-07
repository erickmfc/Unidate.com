import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Copy, Check, ExternalLink } from 'lucide-react';

const AdminInstructions: React.FC = () => {
  const [showCredentials, setShowCredentials] = useState(false);
  const [copied, setCopied] = useState('');

  const credentials = {
    email: 'admin@unidate.com',
    password: 'admin123',
    twoFactor: '123456'
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl">
            <Shield className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🛡️ Painel de Administração
        </h1>
        <p className="text-gray-600">
          Instruções de acesso ao sistema administrativo do UniDate
        </p>
      </div>

      {/* URL de Acesso */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3 flex items-center">
          <ExternalLink className="h-5 w-5 mr-2" />
          URL de Acesso
        </h2>
        <div className="flex items-center space-x-3">
          <code className="flex-1 bg-white border border-blue-300 rounded-lg px-4 py-3 text-blue-800 font-mono">
            http://localhost:3000/admin
          </code>
          <button
            onClick={() => copyToClipboard('http://localhost:3000/admin', 'url')}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {copied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Credenciais */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-red-900 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Credenciais de Acesso
          </h2>
          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            {showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showCredentials ? 'Ocultar' : 'Mostrar'}</span>
          </button>
        </div>

        {showCredentials && (
          <div className="space-y-4">
            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium text-red-800 mb-2">
                E-mail de Administrador
              </label>
              <div className="flex items-center space-x-3">
                <code className="flex-1 bg-white border border-red-300 rounded-lg px-4 py-3 text-red-800 font-mono">
                  {credentials.email}
                </code>
                <button
                  onClick={() => copyToClipboard(credentials.email, 'email')}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {copied === 'email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-red-800 mb-2">
                Senha de Administrador
              </label>
              <div className="flex items-center space-x-3">
                <code className="flex-1 bg-white border border-red-300 rounded-lg px-4 py-3 text-red-800 font-mono">
                  {credentials.password}
                </code>
                <button
                  onClick={() => copyToClipboard(credentials.password, 'password')}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {copied === 'password' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 2FA */}
            <div>
              <label className="block text-sm font-medium text-red-800 mb-2">
                Código 2FA (se solicitado)
              </label>
              <div className="flex items-center space-x-3">
                <code className="flex-1 bg-white border border-red-300 rounded-lg px-4 py-3 text-red-800 font-mono">
                  {credentials.twoFactor}
                </code>
                <button
                  onClick={() => copyToClipboard(credentials.twoFactor, '2fa')}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {copied === '2fa' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Passo a Passo */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-green-900 mb-4">
          📋 Passo a Passo
        </h2>
        <ol className="space-y-3 text-green-800">
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span>Acesse <code className="bg-green-100 px-2 py-1 rounded">http://localhost:3000/admin</code></span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span>Digite o e-mail: <code className="bg-green-100 px-2 py-1 rounded">{credentials.email}</code></span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <span>Digite a senha: <code className="bg-green-100 px-2 py-1 rounded">{credentials.password}</code></span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <span>Se solicitado 2FA, use: <code className="bg-green-100 px-2 py-1 rounded">{credentials.twoFactor}</code></span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
            <span>Clique em "Acessar Painel"</span>
          </li>
        </ol>
      </div>

      {/* Funcionalidades */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-purple-900 mb-4">
          🚀 Funcionalidades Disponíveis
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-purple-800">📊 Dashboard</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Métricas em tempo real</li>
              <li>• Usuários online</li>
              <li>• Estatísticas de crescimento</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-purple-800">👥 Gerenciamento</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Moderar usuários</li>
              <li>• Gerenciar conteúdo</li>
              <li>• Configurar sistema</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Aviso de Segurança */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-yellow-600" />
          <span className="font-semibold text-yellow-800">⚠️ Aviso de Segurança</span>
        </div>
        <p className="text-yellow-700 text-sm mt-2">
          Este é um sistema de administração real. Use com responsabilidade e mantenha as credenciais seguras.
          Em produção, altere as credenciais padrão e configure autenticação 2FA adequada.
        </p>
      </div>
    </div>
  );
};

export default AdminInstructions;
