import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  GraduationCap,
  ArrowRight,
  Heart,
  Users,
  MessageSquare
} from 'lucide-react';
import UniDateLogo from '../UI/UniDateLogo';

const RegisterForm: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <UniDateLogo size="xl" showText={true} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Junte-se ao UniDate!
          </h2>
          <p className="text-gray-600">
            Sua faculdade, conectada. Suas histórias, compartilhadas.
          </p>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Descubra pessoas incríveis</h3>
              <p className="text-sm text-gray-600">Conecte-se com estudantes do seu campus</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">UniVerso Feed</h3>
              <p className="text-sm text-gray-600">A voz do seu campus em tempo real</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Grupos & Comunidades</h3>
              <p className="text-sm text-gray-600">Encontre pessoas com interesses similares</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Pronto para começar?
              </h3>
              <p className="text-gray-600">
                Crie sua conta em poucos passos e comece a conectar-se com sua comunidade universitária.
              </p>
            </div>

            <Link
              to="/onboarding"
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              <UserPlus className="h-5 w-5" />
              <span>Criar Conta</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
