import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Target,
  Zap,
  BarChart3,
  Activity,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import PersonaConfigModal from './PersonaConfigModal';
import CampaignCreatorModal from './CampaignCreatorModal';

// Interfaces para o sistema de IA
interface AIPersona {
  id: string;
  name: string;
  nickname: string;
  course: string;
  period: number;
  avatar: string;
  bio: string;
  status: 'active' | 'paused' | 'draft';
  postsCount: number;
  interactionsCount: number;
  lastActivity: string;
  postingFrequency: {
    postsPerDay: number;
    intervalHours: number;
  };
  contentDirective: string;
  interactionDirective: string;
  enablePrivateChat: boolean;
  enableComments: boolean;
  engagementLevel: 'distant' | 'neutral' | 'engaged' | 'interested';
  temporaryTopics: Array<{
    topic: string;
    validUntil: string;
  }>;
  widgets: {
    bookshelf: string[];
    astralMap: any;
    survivalKit: string[];
  };
}

interface AICampaign {
  id: string;
  name: string;
  centralTopic: string;
  participatingPersonas: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed';
  postsGenerated: number;
}

interface AIMetrics {
  activePersonas: number;
  totalPersonas: number;
  postsToday: number;
  interactionsToday: number;
  systemStatus: 'active' | 'paused';
  operationMode: 'welcome' | 'maintenance' | 'special-event';
}

const AIControlPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'personas' | 'campaigns'>('dashboard');
  const [metrics, setMetrics] = useState<AIMetrics>({
    activePersonas: 3,
    totalPersonas: 5,
    postsToday: 12,
    interactionsToday: 45,
    systemStatus: 'active',
    operationMode: 'welcome'
  });
  const [personas, setPersonas] = useState<AIPersona[]>([]);
  const [campaigns, setCampaigns] = useState<AICampaign[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [showCreatePersona, setShowCreatePersona] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [editingPersona, setEditingPersona] = useState<AIPersona | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadPersonas();
    loadCampaigns();
  }, []);

  const loadPersonas = async () => {
    // Mock data - em produção viria do Firebase
    const mockPersonas: AIPersona[] = [
      {
        id: '1',
        name: 'Carla Silva',
        nickname: 'Carla',
        course: 'Jornalismo',
        period: 6,
        avatar: '/api/placeholder/40/40',
        bio: 'Observadora crítica do cotidiano universitário',
        status: 'active',
        postsCount: 24,
        interactionsCount: 156,
        lastActivity: '2 horas atrás',
        postingFrequency: { postsPerDay: 2, intervalHours: 12 },
        contentDirective: 'Você é a Carla, aluna de Jornalismo. Seus posts são observações inteligentes e críticas sobre o cotidiano da faculdade. Use um tom sarcástico, mas amigável.',
        interactionDirective: 'Seu objetivo é ser um conector. Responda a perguntas, mas sempre termine sugerindo um grupo real ou funcionalidade do site.',
        enablePrivateChat: true,
        enableComments: true,
        engagementLevel: 'engaged',
        temporaryTopics: [
          { topic: 'Falar positivamente sobre a semana de calouros', validUntil: '2025-09-15' }
        ],
        widgets: {
          bookshelf: ['1984', 'O Jornalista e o Assassino'],
          astralMap: { sun: 'Jornalismo', hell: 'Matemática' },
          survivalKit: ['Café', 'Notebook', 'Câmera']
        }
      },
      {
        id: '2',
        name: 'Pedro Santos',
        nickname: 'Pedro',
        course: 'Engenharia',
        period: 4,
        avatar: '/api/placeholder/40/40',
        bio: 'Engenheiro em formação, apaixonado por tecnologia',
        status: 'active',
        postsCount: 18,
        interactionsCount: 89,
        lastActivity: '1 hora atrás',
        postingFrequency: { postsPerDay: 1, intervalHours: 24 },
        contentDirective: 'Você é o Pedro, estudante de Engenharia. Foque em tecnologia, inovação e dicas de estudo. Seja prático e objetivo.',
        interactionDirective: 'Seja prestativo com dúvidas técnicas. Sempre ofereça ajuda com estudos e projetos.',
        enablePrivateChat: true,
        enableComments: true,
        engagementLevel: 'neutral',
        temporaryTopics: [],
        widgets: {
          bookshelf: ['Clean Code', 'The Pragmatic Programmer'],
          astralMap: { sun: 'Programação', hell: 'Cálculo' },
          survivalKit: ['Laptop', 'Café', 'Calculadora']
        }
      }
    ];
    setPersonas(mockPersonas);
  };

  const loadCampaigns = async () => {
    // Mock data
    const mockCampaigns: AICampaign[] = [
      {
        id: '1',
        name: 'Aquecimento para as Férias',
        centralTopic: 'Planos para as férias, dicas de viagem barata, como relaxar depois das provas',
        participatingPersonas: ['1', '2'],
        startDate: '2025-01-15',
        endDate: '2025-02-15',
        status: 'active',
        postsGenerated: 8
      }
    ];
    setCampaigns(mockCampaigns);
  };

  const toggleSystemStatus = () => {
    setMetrics(prev => ({
      ...prev,
      systemStatus: prev.systemStatus === 'active' ? 'paused' : 'active'
    }));
  };

  const pauseAllActivities = () => {
    alert('Todas as atividades pausadas por 1 hora');
  };

  const createQuickPost = () => {
    const topic = prompt('Digite o tópico para o post rápido:');
    if (topic) {
      alert(`Post criado sobre: "${topic}"`);
    }
  };

  const togglePersonaStatus = (personaId: string) => {
    setPersonas(prev => prev.map(persona => 
      persona.id === personaId 
        ? { ...persona, status: persona.status === 'active' ? 'paused' : 'active' }
        : persona
    ));
  };

  const deletePersona = (personaId: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta Persona?')) {
      setPersonas(prev => prev.filter(persona => persona.id !== personaId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEngagementLevel = (level: string) => {
    switch (level) {
      case 'distant': return 'Distante';
      case 'neutral': return 'Neutro';
      case 'engaged': return 'Engajado';
      case 'interested': return 'Interessado';
      default: return 'Neutro';
    }
  };

  const handleSavePersona = (personaData: any) => {
    if (editingPersona) {
      // Editar persona existente
      setPersonas(prev => prev.map(persona => 
        persona.id === editingPersona.id ? { ...persona, ...personaData } : persona
      ));
    } else {
      // Criar nova persona
      const newPersona: AIPersona = {
        ...personaData,
        id: Date.now().toString(),
        postsCount: 0,
        interactionsCount: 0,
        lastActivity: 'Agora',
        status: 'draft'
      };
      setPersonas(prev => [...prev, newPersona]);
    }
    setEditingPersona(null);
  };

  const handleSaveCampaign = (campaignData: any) => {
    setCampaigns(prev => [...prev, campaignData]);
  };

  const handleEditPersona = (persona: AIPersona) => {
    setEditingPersona(persona);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Controle de IA</h1>
            <p className="text-gray-600">Gerencie Personas de IA e campanhas de conteúdo</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreatePersona(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Persona</span>
          </button>
          <button
            onClick={() => setShowCreateCampaign(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Target className="h-4 w-4" />
            <span>Nova Campanha</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'personas', label: 'Personas', icon: Users },
            { id: 'campaigns', label: 'Campanhas', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Controles Globais */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Controles Globais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Interruptor Mestre */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Sistema de IA</label>
                <button
                  onClick={toggleSystemStatus}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    metrics.systemStatus === 'active'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {metrics.systemStatus === 'active' ? (
                    <>
                      <Play className="h-5 w-5 inline mr-2" />
                      ATIVADO
                    </>
                  ) : (
                    <>
                      <Pause className="h-5 w-5 inline mr-2" />
                      DESATIVADO
                    </>
                  )}
                </button>
              </div>

              {/* Modo de Operação */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Modo de Operação</label>
                <select
                  value={metrics.operationMode}
                  onChange={(e) => setMetrics(prev => ({ ...prev, operationMode: e.target.value as any }))}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="welcome">Boas-vindas</option>
                  <option value="maintenance">Manutenção de Atividade</option>
                  <option value="special-event">Evento Especial</option>
                </select>
              </div>

              {/* Ações Rápidas */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Ações Rápidas</label>
                <div className="space-y-2">
                  <button
                    onClick={pauseAllActivities}
                    className="w-full py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    <Clock className="h-4 w-4 inline mr-2" />
                    Pausar por 1h
                  </button>
                  <button
                    onClick={createQuickPost}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Zap className="h-4 w-4 inline mr-2" />
                    Post Rápido
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas em Tempo Real */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Personas Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.activePersonas} / {metrics.totalPersonas}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Posts Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.postsToday}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Interações Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.interactionsToday}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Engajamento</p>
                  <p className="text-2xl font-bold text-gray-900">+12%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personas Tab */}
      {activeTab === 'personas' && (
        <div className="space-y-6">
          {/* Ações em Massa */}
          {selectedPersonas.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-800">
                  {selectedPersonas.length} Persona(s) selecionada(s)
                </span>
                <div className="space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    Pausar Selecionadas
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                    Ativar Selecionadas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Personas */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Personas de IA</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar Personas..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">Todos os Status</option>
                    <option value="active">Ativo</option>
                    <option value="paused">Pausado</option>
                    <option value="draft">Rascunho</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPersonas(personas.map(p => p.id));
                          } else {
                            setSelectedPersonas([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Persona
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interações
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engajamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Atividade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {personas.map((persona) => (
                    <tr key={persona.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          checked={selectedPersonas.includes(persona.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPersonas([...selectedPersonas, persona.id]);
                            } else {
                              setSelectedPersonas(selectedPersonas.filter(id => id !== persona.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={persona.avatar}
                            alt={persona.name}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {persona.name} ({persona.nickname})
                            </div>
                            <div className="text-sm text-gray-500">
                              {persona.course} - {persona.period}° período
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(persona.status)}`}>
                          {persona.status === 'active' ? 'Ativo' : persona.status === 'paused' ? 'Pausado' : 'Rascunho'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {persona.postsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {persona.interactionsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getEngagementLevel(persona.engagementLevel)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {persona.lastActivity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => togglePersonaStatus(persona.id)}
                          className={`${
                            persona.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {persona.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => handleEditPersona(persona)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deletePersona(persona.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status === 'active' ? 'Ativa' : campaign.status === 'paused' ? 'Pausada' : 'Concluída'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{campaign.centralTopic}</p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Personas:</span>
                    <span>{campaign.participatingPersonas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Posts Gerados:</span>
                    <span>{campaign.postsGenerated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Período:</span>
                    <span>{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    Editar
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                    Ver Relatório
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modais */}
      <PersonaConfigModal
        persona={editingPersona}
        isOpen={!!editingPersona || showCreatePersona}
        onClose={() => {
          setEditingPersona(null);
          setShowCreatePersona(false);
        }}
        onSave={handleSavePersona}
      />

      <CampaignCreatorModal
        isOpen={showCreateCampaign}
        onClose={() => setShowCreateCampaign(false)}
        onSave={handleSaveCampaign}
        availablePersonas={personas}
      />
    </div>
  );
};

export default AIControlPanel;
