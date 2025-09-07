import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, isInstitutionalEmail } from '../../firebase/auth';
import { universities } from '../../data/universities';
import { personalityQuestions, getRandomQuestions } from '../../data/personalityQuestions';
import { 
  User, 
  Mail, 
  Hash, 
  GraduationCap, 
  Calendar,
  Lock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Camera,
  Smile,
  Search
} from 'lucide-react';

interface OnboardingData {
  displayName: string;
  email: string;
  registrationNumber: string;
  university: string;
  course: string;
  year: number;
  period: number;
  password: string;
  confirmPassword: string;
  photoURL?: string;
  personalityAnswers: Record<string, any>;
}

const ExpandedOnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [universitySearch, setUniversitySearch] = useState('');
  const [selectedQuestions] = useState(getRandomQuestions(5));
  const navigate = useNavigate();

  const [formData, setFormData] = useState<OnboardingData>({
    displayName: '',
    email: '',
    registrationNumber: '',
    university: '',
    course: '',
    year: 1,
    period: 1,
    password: '',
    confirmPassword: '',
    personalityAnswers: {}
  });

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(universitySearch.toLowerCase()) ||
    uni.acronym.toLowerCase().includes(universitySearch.toLowerCase())
  );

  const handleChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handlePersonalityAnswer = (questionId: string, answer: any) => {
    setFormData(prev => ({
      ...prev,
      personalityAnswers: {
        ...prev.personalityAnswers,
        [questionId]: answer
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.displayName.trim()) {
          setError('Nome é obrigatório');
          return false;
        }
        if (!formData.email.trim()) {
          setError('E-mail é obrigatório');
          return false;
        }
        if (!isInstitutionalEmail(formData.email)) {
          setError('Por favor, insira um e-mail válido');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.registrationNumber.trim()) {
          setError('Número de matrícula é obrigatório');
          return false;
        }
        if (!formData.university) {
          setError('Universidade é obrigatória');
          return false;
        }
        if (!formData.course.trim()) {
          setError('Curso é obrigatório');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.password) {
          setError('Senha é obrigatória');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Senha deve ter pelo menos 6 caracteres');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Senhas não coincidem');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    setError('');

    try {
      await registerUser(
        formData.email,
        formData.password,
        formData.displayName,
        formData.registrationNumber,
        formData.university,
        formData.course,
        formData.year,
        formData.period
      );
      
      navigate('/verify-email', { 
        state: { email: formData.email } 
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Vamos nos conhecer!</h2>
        <p className="text-gray-600">Primeiro, me conte algumas informações básicas</p>
      </div>

      {/* Foto de Perfil */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            {formData.photoURL ? (
              <img 
                src={formData.photoURL} 
                alt="Foto de perfil" 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          Nome Completo
        </label>
        <input
          type="text"
          value={formData.displayName}
          onChange={(e) => handleChange('displayName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Como você gostaria de ser chamado?"
        />
      </div>

      {/* E-mail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4 inline mr-2" />
          E-mail
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="seu@email.com"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Informações Acadêmicas</h2>
        <p className="text-gray-600">Conte-nos sobre sua vida universitária</p>
      </div>

      {/* Matrícula */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Hash className="w-4 h-4 inline mr-2" />
          Número de Matrícula
        </label>
        <input
          type="text"
          value={formData.registrationNumber}
          onChange={(e) => handleChange('registrationNumber', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Ex: 2023123456"
        />
      </div>

      {/* Universidade */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <GraduationCap className="w-4 h-4 inline mr-2" />
          Universidade
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={universitySearch}
            onChange={(e) => setUniversitySearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Buscar universidade..."
          />
        </div>
        {universitySearch && (
          <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredUniversities.slice(0, 10).map((uni) => (
              <button
                key={uni.id}
                onClick={() => {
                  handleChange('university', uni.name);
                  setUniversitySearch('');
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-800">{uni.name}</div>
                <div className="text-sm text-gray-500">{uni.city} - {uni.state}</div>
              </button>
            ))}
          </div>
        )}
        {formData.university && (
          <div className="mt-2 p-3 bg-purple-50 rounded-lg">
            <div className="text-sm font-medium text-purple-800">Selecionada:</div>
            <div className="text-sm text-purple-600">{formData.university}</div>
          </div>
        )}
      </div>

      {/* Curso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <GraduationCap className="w-4 h-4 inline mr-2" />
          Curso
        </label>
        <input
          type="text"
          value={formData.course}
          onChange={(e) => handleChange('course', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Ex: Engenharia de Software, Medicina, Direito..."
        />
      </div>

      {/* Ano e Período */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Ano
          </label>
          <select
            value={formData.year}
            onChange={(e) => handleChange('year', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(year => (
              <option key={year} value={year}>{year}º ano</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Período
          </label>
          <select
            value={formData.period}
            onChange={(e) => handleChange('period', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
              <option key={period} value={period}>{period}º período</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Segurança da Conta</h2>
        <p className="text-gray-600">Crie uma senha segura para sua conta</p>
      </div>

      {/* Senha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Lock className="w-4 h-4 inline mr-2" />
          Senha
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Confirmar Senha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Lock className="w-4 h-4 inline mr-2" />
          Confirmar Senha
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Digite a senha novamente"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Personalidade</h2>
        <p className="text-gray-600">Responda algumas perguntas para personalizar seu perfil</p>
      </div>

      {selectedQuestions.map((question, index) => (
        <div key={question.id} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <Smile className="w-4 h-4 inline mr-2" />
            {question.question}
          </label>
          
          {question.type === 'single' && question.options && (
            <div className="grid grid-cols-1 gap-2">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handlePersonalityAnswer(question.id, option)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    formData.personalityAnswers[question.id] === option
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          
          {question.type === 'text' && (
            <input
              type="text"
              value={formData.personalityAnswers[question.id] || ''}
              onChange={(e) => handlePersonalityAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Passo {currentStep} de 4</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStep()}

          {/* Error Message */}
          {error && (
            <div className="mt-6 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Criar Conta</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandedOnboardingFlow;
