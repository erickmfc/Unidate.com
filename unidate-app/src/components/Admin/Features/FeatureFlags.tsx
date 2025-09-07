import React, { useState, useEffect } from 'react';
import { 
  ToggleLeft, 
  ToggleRight, 
  Settings, 
  Calendar, 
  Users, 
  MessageSquare, 
  Star,
  Shield,
  Zap,
  Globe,
  BookOpen,
  Trophy,
  Bell,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  category: 'engagement' | 'academic' | 'social' | 'premium' | 'moderation';
  isEnabled: boolean;
  isVisible: boolean;
  targetAudience: 'all' | 'specific' | 'beta';
  startDate?: Date;
  endDate?: Date;
  usage: {
    totalUsers: number;
    activeUsers: number;
    engagement: number;
  };
  dependencies: string[];
  risks: 'low' | 'medium' | 'high';
}

const FeatureFlags: React.FC = () => {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories = [
    { id: 'all', name: 'Todas', icon: Settings },
    { id: 'engagement', name: 'Engajamento', icon: Zap },
    { id: 'academic', name: 'Acadêmico', icon: BookOpen },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'premium', name: 'Premium', icon: Star },
    { id: 'moderation', name: 'Moderação', icon: Shield }
  ];

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setLoading(true);
        
        // Verificar se há dados salvos no localStorage
        const savedFeatures = localStorage.getItem('feature-flags');
        if (savedFeatures) {
          setFeatures(JSON.parse(savedFeatures));
          setLoading(false);
          return;
        }
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados - em produção viriam do Firebase
        const mockFeatures: FeatureFlag[] = [
          {
            id: 'battle-courses',
            name: 'Batalha de Cursos',
            description: 'Gincana competitiva entre cursos com enquetes e rankings',
            category: 'engagement',
            isEnabled: false,
            isVisible: false,
            targetAudience: 'all',
            usage: { totalUsers: 0, activeUsers: 0, engagement: 0 },
            dependencies: ['events', 'polls'],
            risks: 'low'
          },
          {
            id: 'year-end-events',
            name: 'Eventos de Fim de Ano',
            description: 'Calendário especial com eventos de formatura e festas',
            category: 'engagement',
            isEnabled: false,
            isVisible: false,
            targetAudience: 'all',
            usage: { totalUsers: 0, activeUsers: 0, engagement: 0 },
            dependencies: ['events'],
            risks: 'low'
          },
          {
            id: 'focus-mode',
            name: 'Modo Foco',
            description: 'Modo de estudo que bloqueia notificações e distrações',
            category: 'academic',
            isEnabled: false,
            isVisible: false,
            targetAudience: 'all',
            usage: { totalUsers: 0, activeUsers: 0, engagement: 0 },
            dependencies: [],
            risks: 'low'
          },
          {
            id: 'classifieds',
            name: 'UniClassificados',
            description: 'Mercado de compra e venda entre estudantes',
            category: 'social',
            isEnabled: false,
            isVisible: false,
            targetAudience: 'all',
            usage: { totalUsers: 0, activeUsers: 0, engagement: 0 },
            dependencies: ['messaging'],
            risks: 'medium'
          },
          {
            id: 'premium-features',
            name: 'Recursos Premium',
            description: 'Funcionalidades exclusivas para usuários premium',
            category: 'premium',
            isEnabled: false,
            isVisible: false,
            targetAudience: 'specific',
            usage: { totalUsers: 0, activeUsers: 0, engagement: 0 },
            dependencies: ['payment'],
            risks: 'high'
          },
          {
            id: 'ai-moderation',
            name: 'Moderação por IA',
            description: 'Sistema automático de detecção de conteúdo inadequado',
            category: 'moderation',
            isEnabled: false,
            isVisible: false,
            targetAudience: 'all',
            usage: { totalUsers: 0, activeUsers: 0, engagement: 0 },
            dependencies: ['ml-api'],
            risks: 'medium'
          },
          {
            id: 'live-streaming',
            name: 'Transmissões ao Vivo',
            description: 'Aulas e eventos transmitidos em tempo real',
            category: 'academic',
            isEnabled: false,
            isVisible: false,
            targetAudience: 'all',
            usage: { totalUsers: 0, activeUsers: 0, engagement: 0 },
            dependencies: ['video-streaming'],
            risks: 'high'
          },
          {
            id: 'study-groups',
            name: 'Grupos de Estudo',
            description: 'Ferramentas avançadas para organização de grupos de estudo',
            category: 'academic',
            isEnabled: false,
            isVisible: false,
            targetAudience: 'all',
            usage: { totalUsers: 0, activeUsers: 0, engagement: 0 },
            dependencies: ['groups', 'calendar'],
            risks: 'low'
          }
        ];

        setFeatures(mockFeatures);
      } catch (error) {
        console.error('Erro ao carregar funcionalidades:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeatures();
  }, []);

  const filteredFeatures = features.filter(feature => {
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFeature = (featureId: string) => {
    const updatedFeatures = features.map(feature => 
      feature.id === featureId 
        ? { ...feature, isEnabled: !feature.isEnabled, isVisible: !feature.isEnabled }
        : feature
    );
    setFeatures(updatedFeatures);
    
    // Persistir no localStorage
    localStorage.setItem('feature-flags', JSON.stringify(updatedFeatures));
    
    // Feedback visual
    const feature = features.find(f => f.id === featureId);
    if (feature) {
      alert(`Funcionalidade "${feature.name}" ${!feature.isEnabled ? 'ativada' : 'desativada'} com sucesso!`);
    }
  };

  const toggleVisibility = (featureId: string) => {
    setFeatures(features.map(feature => 
      feature.id === featureId 
        ? { ...feature, isVisible: !feature.isVisible }
        : feature
    ));
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Settings;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'engagement': return 'bg-purple-100 text-purple-800';
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      case 'moderation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const enabledCount = features.filter(f => f.isEnabled).length;
  const visibleCount = features.filter(f => f.isVisible).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Funcionalidades</h1>
          <p className="text-gray-600 mt-1">Gerencie quais funcionalidades estão ativas na plataforma</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showAdvanced ? <EyeOff className="h-4 w-4 inline mr-2" /> : <Eye className="h-4 w-4 inline mr-2" />}
            {showAdvanced ? 'Ocultar' : 'Mostrar'} Avançado
          </button>
          
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Save className="h-4 w-4 inline mr-2" />
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Funcionalidades</p>
              <p className="text-2xl font-bold text-gray-900">{features.length}</p>
            </div>
            <Settings className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ativadas</p>
              <p className="text-2xl font-bold text-green-600">{enabledCount}</p>
            </div>
            <ToggleRight className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Visíveis</p>
              <p className="text-2xl font-bold text-blue-600">{visibleCount}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Ativação</p>
              <p className="text-2xl font-bold text-purple-600">
                {features.length > 0 ? Math.round((enabledCount / features.length) * 100) : 0}%
              </p>
            </div>
            <Zap className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Buscar funcionalidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lista de Funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feature) => {
          const CategoryIcon = getCategoryIcon(feature.category);
          return (
            <div key={feature.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <CategoryIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(feature.category)}`}>
                      {feature.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 ${getRiskColor(feature.risks)}`}>
                    {getRiskIcon(feature.risks)}
                    <span className="text-xs font-medium">{feature.risks}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Ativar Funcionalidade</span>
                  <button
                    onClick={() => toggleFeature(feature.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      feature.isEnabled ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        feature.isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {showAdvanced && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Visível para Usuários</span>
                      <button
                        onClick={() => toggleVisibility(feature.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          feature.isVisible ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            feature.isVisible ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 space-y-1">
                        <p><strong>Público-alvo:</strong> {feature.targetAudience}</p>
                        <p><strong>Dependências:</strong> {feature.dependencies.length} funcionalidades</p>
                        <p><strong>Uso:</strong> {feature.usage.activeUsers}/{feature.usage.totalUsers} usuários</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma funcionalidade encontrada</h3>
          <p className="text-gray-500">Não há funcionalidades que correspondam aos filtros selecionados.</p>
        </div>
      )}
    </div>
  );
};

export default FeatureFlags;
