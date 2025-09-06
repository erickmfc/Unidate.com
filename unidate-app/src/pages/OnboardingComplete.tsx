import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { 
  Camera, 
  Smile, 
  Heart, 
  Users, 
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Upload,
  X
} from 'lucide-react';
import UniDateLogo from '../components/UI/UniDateLogo';

const OnboardingComplete: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    photoURL: '',
    bio: '',
    interests: [] as string[],
    nickname: ''
  });
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const interestOptions = [
    'Música', 'Cinema', 'Esportes', 'Leitura', 'Arte', 'Tecnologia',
    'Viagem', 'Culinária', 'Fotografia', 'Dança', 'Teatro', 'Gaming',
    'Futebol', 'Basquete', 'Vôlei', 'Natação', 'Corrida', 'Yoga',
    'Programação', 'Design', 'Marketing', 'Empreendedorismo', 'Investimentos',
    'Moda', 'Beleza', 'Fitness', 'Meditação', 'Natureza', 'Animais'
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleInterestToggle = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simular upload de foto
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          photoURL: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError('');

    try {
      await updateUserProfile(currentUser.uid, {
        ...profileData,
        onboardingCompleted: true,
        isVerified: true
      });

      // Redirecionar para o dashboard
      navigate('/dashboard');
    } catch (error: any) {
      setError('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Adicione uma foto</h2>
              <p className="text-gray-600">Mostre sua melhor cara (ou a que sobrou depois da aula de cálculo)</p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profileData.photoURL ? (
                    <img 
                      src={profileData.photoURL} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-purple-400" />
                  )}
                </div>
                
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                  <Upload className="h-5 w-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Pular por enquanto
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Como a galera vai te chamar?</h2>
              <p className="text-gray-600">Escolha um apelido para o UniDate</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apelido
              </label>
              <div className="relative">
                <Smile className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={profileData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: João, Jão, JS..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Este será seu nome no UniDate
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio (opcional)
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Conte um pouco sobre você..."
                maxLength={150}
              />
              <p className="text-xs text-gray-500 mt-1">
                {profileData.bio.length}/150 caracteres
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seus interesses</h2>
              <p className="text-gray-600">Selecione até 5 interesses para conectar com pessoas similares</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  disabled={!profileData.interests.includes(interest) && profileData.interests.length >= 5}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    profileData.interests.includes(interest)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                {profileData.interests.length}/5 selecionados
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tudo pronto! 🎉</h2>
              <p className="text-gray-600">Você está pronto para começar sua jornada no UniDate</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-medium text-green-900">Conta verificada</h3>
                  <p className="text-sm text-green-700">E-mail confirmado</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <Users className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-medium text-blue-900">Pronto para conectar</h3>
                  <p className="text-sm text-blue-700">Descubra pessoas incríveis do seu campus</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <MessageSquare className="h-6 w-6 text-purple-500" />
                <div>
                  <h3 className="font-medium text-purple-900">UniVerso ativo</h3>
                  <p className="text-sm text-purple-700">Participe do feed da sua universidade</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
              <div className="text-center">
                <h4 className="font-medium text-purple-900 mb-2">Bem-vindo ao UniDate!</h4>
                <p className="text-sm text-purple-700">
                  Sua faculdade, conectada. Suas histórias, compartilhadas. 
                  Suas conexões, reais.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <UniDateLogo size="xl" showText={true} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finalize seu Perfil
          </h1>
          <p className="text-gray-600">
            Últimos passos para começar sua jornada
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStep()}

          {/* Error Message */}
          {error && (
            <div className="mt-6 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <X className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Voltar</span>
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(prev + 1, 4))}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                <span>Continuar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Finalizando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Começar no UniDate</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Skip Option */}
        {currentStep < 4 && (
          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Pular configuração por enquanto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingComplete;
