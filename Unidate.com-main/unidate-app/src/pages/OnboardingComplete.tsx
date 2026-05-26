import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { ProfilePhotoService } from '../services/profilePhotoService';
import { useUniDateToast } from '../components/UI/Toast';
import { 
  Camera, 
  Smile, 
  Users, 
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Upload,
  X
} from 'lucide-react';

const OnboardingComplete: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    photoURL: '',
    bio: '',
    interests: [] as string[],
    nickname: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setUploadingPhoto(true);
      setError('');

      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione uma imagem válida');
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('A imagem deve ter no máximo 5MB');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          photoURL: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);

      showSuccess('Foto selecionada! Ela será salva ao finalizar o perfil.');
    } catch (error: any) {
      setError(error.message || 'Erro ao selecionar foto');
      showError(error.message || 'Erro ao selecionar foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleComplete = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError('');

    try {
      let photoURL = profileData.photoURL;

      if (selectedFile) {
        try {
          photoURL = await ProfilePhotoService.uploadProfilePhoto(selectedFile, currentUser.uid);
          showSuccess('Foto de perfil salva com sucesso! 📸');
        } catch (uploadError: any) {
          console.error('Erro ao fazer upload da foto:', uploadError);
          showError('Erro ao salvar foto. Continuando sem foto...');
        }
      }

      await updateUserProfile(currentUser.uid, {
        photoURL: photoURL || undefined,
        bio: profileData.bio,
        interests: profileData.interests,
        displayName: profileData.nickname || currentUser.displayName || 'Usuário',
        onboardingCompleted: true,
        isVerified: true
      });

      showSuccess('Perfil criado com sucesso! 🎉');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      setError('Erro ao salvar perfil. Tente novamente.');
      showError('Erro ao salvar perfil. Tente novamente.');
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
                
                <label className={`absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200 ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="h-5 w-5 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
            </div>

            {profileData.photoURL && (
              <div className="text-center">
                <p className="text-sm text-green-600 font-medium">✓ Foto selecionada com sucesso!</p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Como quer ser chamado?</h2>
              <p className="text-gray-600">Escolha um apelido ou use seu nome mesmo</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apelido / Nome de exibição
              </label>
              <input
                type="text"
                value={profileData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="Ex: João, Jão, Joãozinho..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seus interesses</h2>
              <p className="text-gray-600">Selecione pelo menos 3 coisas que você curte</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    profileData.interests.includes(interest)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            {profileData.interests.length > 0 && (
              <p className="text-sm text-purple-600 font-medium text-center">
                {profileData.interests.length} interesse(s) selecionado(s)
              </p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Fale um pouco sobre você</h2>
              <p className="text-gray-600">Uma bio curta para se apresentar</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografia
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Ex: Estudante de Engenharia apaixonado por tecnologia e café..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {profileData.bio.length}/200
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Smile className="h-5 w-5 text-purple-500" />
                Resumo do seu perfil
              </h3>
              {profileData.photoURL && (
                <p className="text-sm text-green-600">✓ Foto de perfil adicionada</p>
              )}
              {profileData.nickname && (
                <p className="text-sm text-green-600">✓ Nome: {profileData.nickname}</p>
              )}
              {profileData.interests.length > 0 && (
                <p className="text-sm text-green-600">✓ {profileData.interests.length} interesses selecionados</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finalize seu Perfil
          </h1>
          <p className="text-gray-600">
            Últimos passos para começar sua jornada
          </p>
        </div>

        {}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>

        {}
        <div className="flex justify-center space-x-2 mb-6">
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

        {}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStep()}

          {}
          {error && (
            <div className="mt-6 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <X className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {}
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

        {}
        {currentStep < 4 && (
          <div className="text-center mt-4">
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
