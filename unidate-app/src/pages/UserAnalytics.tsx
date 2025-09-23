import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserMetrics from '../components/Materials/UserMetrics';
import BadgesSystem from '../components/Materials/BadgesSystem';
import AnalyticsDashboard from '../components/Materials/AnalyticsDashboard';
import { 
  BarChart3, 
  Trophy, 
  TrendingUp, 
  User,
  BookOpen,
  Award
} from 'lucide-react';

const UserAnalytics: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'analytics'>('overview');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você precisa estar logado para ver suas métricas.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'overview' as const,
      name: 'Visão Geral',
      icon: BarChart3,
      description: 'Suas métricas principais'
    },
    {
      id: 'badges' as const,
      name: 'Conquistas',
      icon: Trophy,
      description: 'Badges e conquistas'
    },
    {
      id: 'analytics' as const,
      name: 'Analytics',
      icon: TrendingUp,
      description: 'Análise detalhada'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Minhas Métricas</h1>
              <p className="text-gray-600 mt-1">
                Acompanhe seu progresso e conquistas na plataforma
              </p>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserMetrics 
                userId={currentUser.uid}
                showBadges={true}
                showDetails={true}
              />
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Resumo Rápido</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-blue-900">Status</div>
                          <div className="text-xs text-blue-700">Contribuidor Ativo</div>
                        </div>
                        <div className="text-2xl">📚</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-green-900">Próxima Meta</div>
                          <div className="text-xs text-green-700">10 materiais compartilhados</div>
                        </div>
                        <div className="text-2xl">🎯</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-yellow-900">Dica</div>
                          <div className="text-xs text-yellow-700">Compartilhe mais para ganhar badges!</div>
                        </div>
                        <div className="text-2xl">💡</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Conquistas Recentes</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">🎯</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Primeiro Passo</div>
                        <div className="text-xs text-gray-600">Compartilhou seu primeiro material</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">⭐</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Estrela da Qualidade</div>
                        <div className="text-xs text-gray-600">Média de avaliação acima de 4.0</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <BadgesSystem 
              userId={currentUser.uid}
              showAllBadges={true}
              showProgress={true}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard 
              userId={currentUser.uid}
              isAdmin={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
