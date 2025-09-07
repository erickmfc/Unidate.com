import React from 'react';
import { 
  Heart, 
  Users, 
  Shield, 
  Globe, 
  Lightbulb,
  CheckCircle,
  Star
} from 'lucide-react';

const About: React.FC = () => {
  const teamMembers = [
    {
      name: 'Matheus Silva',
      role: 'Desenvolvedor Full-Stack',
      course: 'Engenharia de Software',
      university: 'USP',
      avatar: '/api/placeholder/150/150',
      description: 'Apaixonado por tecnologia e conectividade. Responsável pela arquitetura e desenvolvimento do UniDate.'
    },
    {
      name: 'Ana Costa',
      role: 'UX/UI Designer',
      course: 'Design Digital',
      university: 'UNICAMP',
      avatar: '/api/placeholder/150/150',
      description: 'Especialista em experiência do usuário e design de interfaces. Criou toda a identidade visual do UniDate.'
    },
    {
      name: 'Carlos Santos',
      role: 'Product Manager',
      course: 'Administração',
      university: 'FGV',
      avatar: '/api/placeholder/150/150',
      description: 'Focado em estratégia de produto e experiência do usuário. Define a direção e visão do UniDate.'
    },
    {
      name: 'Sophia Lima',
      role: 'Marketing & Growth',
      course: 'Comunicação Social',
      university: 'PUC',
      avatar: '/api/placeholder/150/150',
      description: 'Responsável por marketing digital e crescimento da plataforma. Conecta o UniDate com os estudantes.'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Autenticidade',
      description: 'Acreditamos em conexões reais e genuínas, sem filtros ou máscaras.'
    },
    {
      icon: Users,
      title: 'Comunidade',
      description: 'Construímos um espaço onde todos os estudantes se sentem acolhidos e pertencentes.'
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Protegemos a privacidade e segurança de todos os usuários da plataforma.'
    },
    {
      icon: Globe,
      title: 'Inclusão',
      description: 'UniDate é para todos os estudantes, independente de curso, período ou background.'
    }
  ];

  const milestones = [
    {
      year: '2024',
      title: 'Nascimento da Ideia',
      description: 'A ideia do UniDate nasceu da nossa própria experiência universitária e da necessidade de conectar estudantes.'
    },
    {
      year: '2024',
      title: 'Desenvolvimento MVP',
      description: 'Desenvolvemos o produto mínimo viável com as funcionalidades essenciais para validar nossa proposta.'
    },
    {
      year: '2025',
      title: 'Beta Fechado',
      description: 'Lançamos o beta fechado com um grupo seleto de estudantes para testar e refinar a plataforma.'
    },
    {
      year: '2025',
      title: 'Lançamento Público',
      description: 'UniDate está disponível para todos os estudantes universitários do Brasil!'
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
              Sobre o <span className="gradient-text">UniDate</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Somos uma plataforma social criada por estudantes, para estudantes. 
              Nossa missão é transformar a experiência universitária conectando pessoas, 
              facilitando descobertas e criando memórias inesquecíveis.
            </p>
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600">4</div>
                <div className="text-gray-600">Fundadores</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">1000+</div>
                <div className="text-gray-600">Estudantes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">50+</div>
                <div className="text-gray-600">Universidades</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossa História</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              O UniDate nasceu da nossa própria experiência universitária. Sabemos como é difícil 
              fazer conexões genuínas no campus, por isso criamos a solução perfeita.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">O Problema que Vivemos</h3>
              <p className="text-gray-600 mb-6">
                Durante nossa jornada universitária, percebemos que, apesar de estarmos rodeados de pessoas, 
                muitas vezes nos sentíamos sozinhos. A vida acadêmica pode ser fragmentada e as conexões 
                genuínas são difíceis de fazer.
              </p>
              <p className="text-gray-600 mb-6">
                Grupos de WhatsApp dispersos, redes sociais genéricas e a coragem que às vezes nos falta 
                para dizer um simples "oi" - esses eram os desafios que enfrentávamos diariamente.
              </p>
              <div className="flex items-center space-x-2 text-indigo-600">
                <Lightbulb className="h-5 w-5" />
                <span className="font-semibold">E então tivemos uma ideia...</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-pink-100 rounded-3xl p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🎓</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">A Praça Digital do Campus</h4>
                <p className="text-gray-600">
                  Um lugar onde estudantes podem se conectar, descobrir pessoas interessantes, 
                  compartilhar experiências e criar memórias que durarão para sempre.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossa Missão</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transformar conexões perdidas em histórias vividas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa Equipe */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossa Equipe</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estudantes apaixonados por tecnologia e conectividade, trabalhando para 
              revolucionar a experiência universitária.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-indigo-600 font-semibold mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm mb-2">{member.course} - {member.university}</p>
                <p className="text-gray-500 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossa Jornada</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Da ideia inicial ao lançamento, cada passo foi pensado com carinho e dedicação.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-indigo-500 to-pink-500"></div>
            
            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="text-2xl font-bold text-indigo-600 mb-2">{milestone.year}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                
                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Faça Parte da Nossa História
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
              <CheckCircle className="h-5 w-5" />
            </a>
            <a
              href="/features"
              className="border-2 border-white text-white font-semibold py-3 px-8 rounded-xl hover:bg-white hover:text-indigo-600 transition-colors duration-200 inline-flex items-center justify-center space-x-2"
            >
              <span>Ver Recursos</span>
              <Star className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

