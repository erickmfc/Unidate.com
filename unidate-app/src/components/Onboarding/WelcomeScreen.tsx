import React from 'react';
import { Link } from 'react-router-dom';
import UniDateLogo from '../UI/UniDateLogo';
import { ArrowRight, Heart, Users, BookOpen } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  const features = [
    {
      icon: Heart,
      title: "Encontre sua galera",
      description: "Seja para estudar, sair ou só reclamar daquela matéria impossível"
    },
    {
      icon: Users,
      title: "Conecte-se de verdade",
      description: "Sem filtros perfeitos. Aqui a gente celebra o caos organizado da vida universitária"
    },
    {
      icon: BookOpen,
      title: "Sua faculdade, conectada",
      description: "O mural de avisos, o correio elegante e o ombro amigo, tudo em um lugar"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-12">
            <UniDateLogo size="xl" showText={true} className="mx-auto" />
          </div>

          {/* Main Message */}
          <div className="mb-12">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Sua faculdade,{' '}
              <span className="gradient-text">conectada</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A praça digital do seu campus. Um lugar para encontrar seu próximo parceiro de estudos, 
              seu futuro amor, a galera para o bar ou apenas alguém para reclamar daquela matéria impossível.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4"
            >
              <span>Criar Conta</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary flex items-center justify-center space-x-2 text-lg px-8 py-4"
            >
              <span>Entrar</span>
            </Link>
          </div>

          {/* Fun Message */}
          <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 max-w-2xl mx-auto">
            <p className="text-gray-700 italic">
              "Não somos mais um aplicativo de relacionamento. Somos o mural de avisos, 
              o correio elegante, o classificados e o ombro amigo, tudo em um só lugar."
            </p>
            <div className="mt-4 text-sm text-gray-500">
              — A equipe UniDate (que também já passou por isso)
            </div>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className="text-center py-8 px-4">
        <p className="text-gray-500 text-sm">
          Feito por estudantes, para estudantes • Transformando conexões perdidas em histórias vividas
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;

