import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  Users, 
  Newspaper, 
  GraduationCap, 
  ArrowRight,
  Star,
  MessageCircle
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Heart,
      title: 'Descoberta',
      description: 'Conheça pessoas incríveis do seu campus com base em interesses, curso e personalidade.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Newspaper,
      title: 'UniVerso',
      description: 'Mantenha-se atualizado com o que acontece no campus através do nosso feed público.',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Grupos',
      description: 'Participe de comunidades que compartilham seus hobbies e interesses acadêmicos.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Estudantes Conectados' },
    { number: '50+', label: 'Universidades' },
    { number: '1M+', label: 'Matches Realizados' },
    { number: '99%', label: 'Satisfação' }
  ];

  const testimonials = [
    {
      name: 'Ana Silva',
      course: 'Engenharia de Software',
      university: 'USP',
      text: 'O UniDate me ajudou a conhecer pessoas incríveis da minha universidade. Agora tenho uma rede de amigos e colegas de estudo!',
      rating: 5
    },
    {
      name: 'Carlos Santos',
      course: 'Medicina',
      university: 'UNICAMP',
      text: 'A funcionalidade de grupos é fantástica! Encontrei um grupo de estudos que mudou completamente minha experiência acadêmica.',
      rating: 5
    },
    {
      name: 'Mariana Costa',
      course: 'Psicologia',
      university: 'UFRJ',
      text: 'O feed UniVerso me mantém sempre informada sobre eventos e novidades do campus. É como ter um Instagram só da universidade!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200 to-accent-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary-200 to-primary-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Conecte-se com sua{' '}
                  <span className="gradient-text">comunidade universitária</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  UniDate é a plataforma social exclusiva para estudantes universitários. 
                  Descubra pessoas, acompanhe o que acontece no campus e participe de grupos 
                  que combinam com seus interesses.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-primary flex items-center justify-center space-x-2">
                    <span>Ir para Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary flex items-center justify-center space-x-2">
                      <span>Começar Agora</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link to="/login" className="btn-secondary flex items-center justify-center space-x-2">
                      <span>Fazer Login</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold gradient-text">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone Mockup */}
                <div className="w-80 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
                    {/* App Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="p-6 space-y-4">
                      {/* Profile Card */}
                      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full"></div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Ana Silva</h3>
                            <p className="text-sm text-gray-600">Engenharia de Software</p>
                            <div className="flex space-x-1 mt-1">
                              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">#Fotografia</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-center space-x-4">
                        <button className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-500 text-xl">✕</span>
                        </button>
                        <button className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Heart className="h-6 w-6 text-green-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Três Pilares, Uma Experiência
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              UniDate combina descoberta, informação e comunidade em uma única plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card group hover:scale-105 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos usuários dizem
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de estudantes que transformaram sua vida universitária
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.course} - {testimonial.university}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Made by Students Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Feito por Estudantes, para Estudantes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              O UniDate nasceu da nossa própria experiência universitária. Sabemos exatamente 
              como é difícil fazer conexões genuínas no campus, por isso criamos a solução perfeita.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nossa História</h3>
              <p className="text-gray-600">
                Somos estudantes de Engenharia de Software que vivenciaram a dificuldade 
                de se conectar com pessoas da nossa própria universidade.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nossa Missão</h3>
              <p className="text-gray-600">
                Conectar estudantes universitários de forma genuína, criando uma comunidade 
                onde amizades, estudos e relacionamentos florescem naturalmente.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-accent-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nossa Visão</h3>
              <p className="text-gray-600">
                Ser a plataforma de referência para conexões universitárias no Brasil, 
                transformando a experiência acadêmica de milhões de estudantes.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-gradient-to-r from-gray-50 to-primary-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Conheça Nossa Equipe</h3>
              <p className="text-gray-600">
                Estudantes apaixonados por tecnologia e conectividade
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <h4 className="font-semibold text-gray-900">Matheus</h4>
                <p className="text-sm text-gray-600">Desenvolvedor Full-Stack</p>
                <p className="text-xs text-gray-500">Engenharia de Software</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h4 className="font-semibold text-gray-900">Ana</h4>
                <p className="text-sm text-gray-600">UI/UX Designer</p>
                <p className="text-xs text-gray-500">Design Digital</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <h4 className="font-semibold text-gray-900">Carlos</h4>
                <p className="text-sm text-gray-600">Product Manager</p>
                <p className="text-xs text-gray-500">Administração</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <h4 className="font-semibold text-gray-900">Sophia</h4>
                <p className="text-sm text-gray-600">Marketing Digital</p>
                <p className="text-xs text-gray-500">Comunicação Social</p>
              </div>
            </div>
          </div>

          {/* Development Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">6</div>
              <div className="text-sm text-gray-600">Meses de Desenvolvimento</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-sm text-gray-600">Linhas de Código</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">Horas de Testes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Feito com ❤️</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-accent-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para transformar sua vida universitária?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se a milhares de estudantes que já descobriram o poder das conexões universitárias
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="inline-flex items-center space-x-2 bg-white text-primary-600 font-semibold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors duration-200">
              <span>Criar Conta Gratuita</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
