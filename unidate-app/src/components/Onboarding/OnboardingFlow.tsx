import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, isInstitutionalEmail } from '../../firebase/auth';
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
  EyeOff
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
}

const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    confirmPassword: ''
  });

  const universities = [
    'USP - Universidade de São Paulo',
    'UNICAMP - Universidade Estadual de Campinas',
    'UFMG - Universidade Federal de Minas Gerais',
    'UFRJ - Universidade Federal do Rio de Janeiro',
    'UFRGS - Universidade Federal do Rio Grande do Sul',
    'UFPR - Universidade Federal do Paraná',
    'UFSC - Universidade Federal de Santa Catarina',
    'UFBA - Universidade Federal da Bahia',
    'UFPE - Universidade Federal de Pernambuco',
    'UFC - Universidade Federal do Ceará',
    'UNB - Universidade de Brasília',
    'UFRN - Universidade Federal do Rio Grande do Norte',
    'UFS - Universidade Federal de Sergipe',
    'UFAM - Universidade Federal do Amazonas',
    'UFPA - Universidade Federal do Pará',
    'UFG - Universidade Federal de Goiás',
    'UFMS - Universidade Federal de Mato Grosso do Sul',
    'UFMT - Universidade Federal de Mato Grosso',
    'UFPB - Universidade Federal da Paraíba',
    'UFPI - Universidade Federal do Piauí',
    'PUC-SP - Pontifícia Universidade Católica de São Paulo',
    'PUC-Rio - Pontifícia Universidade Católica do Rio de Janeiro',
    'PUC-RS - Pontifícia Universidade Católica do Rio Grande do Sul',
    'PUC-MG - Pontifícia Universidade Católica de Minas Gerais',
    'PUC-PR - Pontifícia Universidade Católica do Paraná',
    'FGV - Fundação Getúlio Vargas',
    'FEA-USP - Faculdade de Economia, Administração e Contabilidade',
    'IME-USP - Instituto de Matemática e Estatística',
    'POLI-USP - Escola Politécnica da USP',
    'IFSP - Instituto Federal de São Paulo',
    'IFRJ - Instituto Federal do Rio de Janeiro',
    'IFMG - Instituto Federal de Minas Gerais',
    'IFRS - Instituto Federal do Rio Grande do Sul',
    'IFSC - Instituto Federal de Santa Catarina',
    'IFBA - Instituto Federal da Bahia',
    'IFPE - Instituto Federal de Pernambuco',
    'IFCE - Instituto Federal do Ceará',
    'IFAM - Instituto Federal do Amazonas',
    'IFPA - Instituto Federal do Pará',
    'IFPB - Instituto Federal da Paraíba',
    'IFPI - Instituto Federal do Piauí',
    'IFRN - Instituto Federal do Rio Grande do Norte',
    'IFS - Instituto Federal de Sergipe',
    'IFSM - Instituto Federal de Santa Maria',
    'IFV - Instituto Federal do Espírito Santo'
  ];

  const courses = [
    'Administração',
    'Arquitetura e Urbanismo',
    'Artes Visuais',
    'Biologia',
    'Biomedicina',
    'Ciência da Computação',
    'Ciências Contábeis',
    'Ciências Econômicas',
    'Comunicação Social',
    'Design',
    'Direito',
    'Educação Física',
    'Enfermagem',
    'Engenharia Civil',
    'Engenharia de Computação',
    'Engenharia de Produção',
    'Engenharia de Software',
    'Engenharia Elétrica',
    'Engenharia Mecânica',
    'Engenharia Química',
    'Farmácia',
    'Filosofia',
    'Física',
    'Fisioterapia',
    'Geografia',
    'História',
    'Jornalismo',
    'Letras',
    'Matemática',
    'Medicina',
    'Nutrição',
    'Odontologia',
    'Pedagogia',
    'Psicologia',
    'Publicidade e Propaganda',
    'Química',
    'Relações Internacionais',
    'Sistemas de Informação',
    'Sociologia',
    'Terapia Ocupacional',
    'Turismo',
    'Veterinária'
  ];

  const handleInputChange = (field: keyof OnboardingData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.displayName.trim()) {
          setError('Nome completo é obrigatório');
          return false;
        }
        if (formData.displayName.trim().split(' ').length < 2) {
          setError('Digite seu nome completo');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.email.trim()) {
          setError('E-mail é obrigatório');
          return false;
        }
        if (!isInstitutionalEmail(formData.email)) {
          setError('Insira um e-mail válido');
          return false;
        }
        if (!formData.registrationNumber.trim()) {
          setError('Número de matrícula é obrigatório');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.university) {
          setError('Selecione sua universidade');
          return false;
        }
        if (!formData.course) {
          setError('Selecione seu curso');
          return false;
        }
        return true;
      
      case 4:
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
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

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

      // Redirecionar para verificação de e-mail
      navigate('/verify-email', { 
        state: { email: formData.email } 
      });
    } catch (error: any) {
      setError(error.message);
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Como você gostaria de ser chamado?</h2>
              <p className="text-gray-600">Digite seu nome completo</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: João Silva Santos"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Dados de Acesso</h2>
              <p className="text-gray-600">E-mail e matrícula</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="seu.nome@email.com"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use seu e-mail pessoal ou institucional
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Matrícula
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: 2023123456"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Informações Acadêmicas</h2>
              <p className="text-gray-600">Sua universidade e curso</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Universidade
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Selecione sua universidade</option>
                  {universities.map((uni) => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Selecione seu curso</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((year) => (
                      <option key={year} value={year}>{year}º ano</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.period}
                    onChange={(e) => handleInputChange('period', parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                  >
                    {[1, 2].map((period) => (
                      <option key={period} value={period}>{period}º período</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Criar Senha</h2>
              <p className="text-gray-600">Escolha uma senha segura</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Digite a senha novamente"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Próximos passos:</h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Verificação do e-mail</li>
                    <li>• Configuração do perfil</li>
                    <li>• Primeiro acesso ao UniDate</li>
                  </ul>
                </div>
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
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao UniDate!
          </h1>
          <p className="text-gray-600">
            Vamos configurar sua conta em poucos passos
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
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                <span>Continuar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Criar Conta</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Já tem uma conta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
