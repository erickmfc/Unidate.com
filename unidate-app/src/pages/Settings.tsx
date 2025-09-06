import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  HelpCircle,
  LogOut,
  Save,
  Eye,
  EyeOff,
  Camera,
  Trash2
} from 'lucide-react';

const Settings: React.FC = () => {
  const { userProfile, logoutUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    email: userProfile?.email || '',
    university: userProfile?.university || '',
    course: userProfile?.course || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newMatches: true,
    messages: true,
    groupUpdates: true,
    eventReminders: true,
    emailNotifications: false,
    pushNotifications: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    showLastSeen: true,
    allowMessagesFromStrangers: false,
    showInDiscover: true,
    showInGroups: true,
  });

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'privacy', name: 'Privacidade', icon: Globe },
    { id: 'appearance', name: 'Aparência', icon: Palette },
    { id: 'help', name: 'Ajuda', icon: HelpCircle },
  ];

  const handleProfileSave = () => {
    console.log('Salvando perfil:', profileData);
    // Implementar lógica de salvamento
  };

  const handlePasswordChange = () => {
    console.log('Alterando senha:', passwordData);
    // Implementar lógica de alteração de senha
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      console.log('Excluindo conta...');
      // Implementar lógica de exclusão de conta
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Perfil</h3>
        
        {/* Profile Picture */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {userProfile?.displayName?.charAt(0) || 'U'}
              </span>
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <Camera className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Foto do Perfil</h4>
            <p className="text-sm text-gray-600">Clique para alterar</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="input-field bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">E-mail não pode ser alterado</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Universidade
            </label>
            <input
              type="text"
              value={profileData.university}
              onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curso
            </label>
            <input
              type="text"
              value={profileData.course}
              onChange={(e) => setProfileData({ ...profileData, course: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Biografia
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            placeholder="Conte um pouco sobre você..."
            className="input-field"
            rows={4}
          />
        </div>

        <button onClick={handleProfileSave} className="btn-primary flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <button onClick={handlePasswordChange} className="btn-primary">
            Alterar Senha
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Zona de Perigo</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Excluir Conta</h4>
          <p className="text-sm text-red-700 mb-4">
            Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Excluir Conta</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Notificação</h3>
      
      <div className="space-y-4">
        {Object.entries(notificationSettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <p className="text-sm text-gray-600">
                {key === 'newMatches' && 'Receber notificações quando você tiver novos matches'}
                {key === 'messages' && 'Receber notificações de novas mensagens'}
                {key === 'groupUpdates' && 'Receber notificações de atualizações em grupos'}
                {key === 'eventReminders' && 'Receber lembretes de eventos'}
                {key === 'emailNotifications' && 'Receber notificações por e-mail'}
                {key === 'pushNotifications' && 'Receber notificações push no dispositivo'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Privacidade</h3>
      
      <div className="space-y-4">
        {Object.entries(privacySettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <p className="text-sm text-gray-600">
                {key === 'showOnlineStatus' && 'Mostrar quando você está online'}
                {key === 'showLastSeen' && 'Mostrar quando você foi visto pela última vez'}
                {key === 'allowMessagesFromStrangers' && 'Permitir mensagens de pessoas que você não conhece'}
                {key === 'showInDiscover' && 'Aparecer na seção de descoberta'}
                {key === 'showInGroups' && 'Aparecer em grupos públicos'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setPrivacySettings({ ...privacySettings, [key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Aparência</h3>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Tema</h4>
        <div className="grid grid-cols-3 gap-4">
          <button className="p-4 border-2 border-primary-500 rounded-lg bg-white">
            <div className="w-full h-8 bg-white border border-gray-200 rounded mb-2"></div>
            <span className="text-sm font-medium">Claro</span>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300">
            <div className="w-full h-8 bg-gray-800 rounded mb-2"></div>
            <span className="text-sm font-medium">Escuro</span>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300">
            <div className="w-full h-8 bg-gradient-to-r from-white to-gray-800 rounded mb-2"></div>
            <span className="text-sm font-medium">Automático</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderHelpTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Central de Ajuda</h3>
      
      <div className="space-y-4">
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-2">Como funciona o UniDate?</h4>
          <p className="text-gray-600 text-sm">
            O UniDate é uma plataforma social exclusiva para estudantes universitários...
          </p>
        </div>
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-2">Como fazer match com alguém?</h4>
          <p className="text-gray-600 text-sm">
            Use a seção de descoberta para ver perfis de outros estudantes...
          </p>
        </div>
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-2">Como criar um grupo?</h4>
          <p className="text-gray-600 text-sm">
            Vá para a seção de grupos e clique em "Criar Grupo"...
          </p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'security': return renderSecurityTab();
      case 'notifications': return renderNotificationsTab();
      case 'privacy': return renderPrivacyTab();
      case 'appearance': return renderAppearanceTab();
      case 'help': return renderHelpTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-200 mt-6 pt-6">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
