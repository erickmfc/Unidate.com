import React from 'react';
import { 
  Heart, 
  Users, 
  MessageCircle, 
  Newspaper,
  Shield, 
  Smartphone,
  Zap,
  Globe,
  Lock,
  Star,
  CheckCircle,
  ArrowRight,
  Eye,
  BarChart3,
  Hash,
  UserPlus,
  GraduationCap,
  Sparkles
} from 'lucide-react';

const Features: React.FC = () => {
  const mainFeatures = [
    {
      icon: Heart,
      title: 'Descoberta Inteligente',
      subtitle: 'Sistema de Swipe',
      description: 'Descubra pessoas incríveis do seu campus com nosso sistema de swipe intuitivo. Baseado em interesses, curso e compatibilidade.',
      features: [
        'Algoritmo de compatibilidade',
        'Filtros por curso e período',
        'Sistema de likes e matches',
        'Perfis verificados'
      ],
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Newspaper,
      title: 'UniVerso Feed',
      subtitle: 'A Voz do Campus',
      description: 'Timeline pública onde todos os estudantes da sua universidade compartilham momentos, eventos e experiências.',
      features: [
        'Posts de texto, imagem e enquetes',
        'Sistema de hashtags (#CALCULO1, #FESTADODIREITO)',
        'Função especial #TeVi',
        'Interações em tempo real'
      ],
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Users,
      title: 'Grupos & Comunidades',
      subtitle: 'Conecte-se por Interesses',
      description: 'Crie ou participe de grupos baseados em interesses, matérias, hobbies ou qualquer tema que una os estudantes.',
      features: [
        'Grupos públicos e privados',
        'Chat em tempo real',
        'Eventos e encontros',
        'Moderação automática'
      ],
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: MessageCircle,
      title: 'Chat Privado',
      subtitle: 'Conversas Seguras',
      description: 'Sistema de chat 1-para-1 habilitado apenas entre usuários que deram match, garantindo conversas mais significativas.',
      features: [
        'Chat em tempo real',
        'Compartilhamento de mídia',
        'Status de leitura',
        'Histórico de conversas'
      ],
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const specialFeatures = [
    {
      icon: Eye,
      title: '#TeVi - A Função Única',
      description: 'Template especial para quando você vê alguém interessante no campus: "Eu te vi em [Local], você estava vestindo [Roupa] e [Fazendo algo]. Se for você, me manda um oi!"',
      highlight: true
    },
    {
      icon: Shield,
      title: 'Verificação Institucional',
      description: 'Apenas estudantes podem se cadastrar, garantindo um ambiente seguro e exclusivo.',
      highlight: false
    },
    {
      icon: BarChart3,
      title: 'Enquetes Interativas',
      description: 'Crie enquetes sobre qualquer tema: "Qual a melhor comida do bandejão?", "Melhor lugar para estudar?", etc.',
      highlight: false
    },
    {
      icon: Hash,
      title: 'Hashtags do Campus',
      description: 'Sistema de hashtags específicas do seu campus: #CALCULO1, #FESTADODIREITO, #BIBLIOTECACHEIA, #BANDEJAO',
      highlight: false
    }
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: 'Privacidade Total',
      description: 'Seus dados são protegidos com criptografia de ponta e nunca compartilhados com terceiros.'
    },
    {
      icon: Shield,
      title: 'Moderação Inteligente',
      description: 'IA e moderadores humanos trabalham juntos para manter o ambiente seguro e respeitoso.'
    },
    {
      icon: UserPlus,
      title: 'Verificação de Identidade',
      description: 'Todos os usuários são verificados através de e-mail, garantindo autenticidade.'
    },
    {
      icon: Globe,
      title: 'Controle de Privacidade',
      description: 'Você decide quem pode ver seu perfil e como interagir com você na plataforma.'
    }
  ];

  const platformFeatures = [
    {
      icon: Smartphone,
      title: 'Multiplataforma',
      description: 'Acesse o UniDate no seu celular, tablet ou computador. Interface responsiva e otimizada para todos os dispositivos.'
    },
    {
      icon: Zap,
      title: 'Tempo Real',
      description: 'Chats, notificações e atualizações em tempo real. Nunca perca uma conexão ou oportunidade.'
    },
    {
      icon: Star,
      title: 'Interface Intuitiva',
      description: 'Design moderno e fácil de usar. Criado pensando na experiência do usuário universitário.'
    },
    {
      icon: GraduationCap,
      title: 'Focado no Campus',
      description: 'Todas as funcionalidades foram pensadas especificamente para a vida universitária brasileira.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Recursos do <span className="gradient-text">UniDate</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Descubra todas as funcionalidades que fazem do UniDate a plataforma social 
              mais completa para estudantes universitários.
            </p>
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600">4</div>
                <div className="text-gray-600">Pilares Principais</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">10+</div>
                <div className="text-gray-600">Recursos Únicos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">100%</div>
                <div className="text-gray-600">Gratuito</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossos Pilares</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quatro funcionalidades principais que transformam a experiência universitária
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {mainFeatures.map((feature, index) => (
              <div key={index} className={`${feature.bgColor} rounded-3xl p-8 hover:shadow-xl transition-shadow duration-300`}>
                <div className="flex items-start space-x-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 font-semibold">{feature.subtitle}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 text-lg">{feature.description}</p>
                
                <div className="space-y-3">
                  {feature.features.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Recursos Únicos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Funcionalidades exclusivas que você só encontra no UniDate
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {specialFeatures.map((feature, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-lg border-2 p-6 hover:shadow-xl transition-shadow duration-300 ${
                feature.highlight ? 'border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50' : 'border-gray-200'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    feature.highlight 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  }`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                    {feature.highlight && (
                      <div className="mt-3 flex items-center space-x-2 text-pink-600">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-semibold">Recurso Exclusivo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Segurança & Privacidade</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sua segurança e privacidade são nossas prioridades
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Experiência da Plataforma</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnologia de ponta para uma experiência excepcional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Três passos simples para começar sua jornada no UniDate
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cadastre-se</h3>
              <p className="text-gray-600 mb-4">
                Use seu e-mail para criar sua conta e verificar sua identidade de estudante.
              </p>
              <div className="flex items-center justify-center space-x-2 text-indigo-600">
                <UserPlus className="h-5 w-5" />
                <span className="font-semibold">Verificação Instantânea</span>
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete seu Perfil</h3>
              <p className="text-gray-600 mb-4">
                Adicione fotos, interesses e informações sobre você para que outros estudantes possam te conhecer.
              </p>
              <div className="flex items-center justify-center space-x-2 text-pink-600">
                <Heart className="h-5 w-5" />
                <span className="font-semibold">Perfil Personalizado</span>
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Conecte-se</h3>
              <p className="text-gray-600 mb-4">
                Comece a descobrir pessoas, participar do feed e criar conexões que durarão para sempre.
              </p>
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Users className="h-5 w-5" />
                <span className="font-semibold">Conexões Reais</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Junte-se a milhares de estudantes que já descobriram o poder das conexões genuínas no UniDate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors duration-200 inline-flex items-center justify-center space-x-2"
            >
              <span>Começar Agora</span>
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="/about"
              className="border-2 border-white text-white font-semibold py-3 px-8 rounded-xl hover:bg-white hover:text-indigo-600 transition-colors duration-200 inline-flex items-center justify-center space-x-2"
            >
              <span>Conhecer a Equipe</span>
              <Star className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;

