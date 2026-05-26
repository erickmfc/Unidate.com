import React, { useState } from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  Megaphone, 
  Link as LinkIcon,
  Calendar,
  BarChart3,
  FileText
} from 'lucide-react';
import GroupFeed from './GroupFeed';

interface GroupTabsProps {
  groupId: string;
  isMember: boolean;
  isEditor: boolean;
}

const GroupTabs: React.FC<GroupTabsProps> = ({ groupId, isMember, isEditor }) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'posts' | 'announcements' | 'resources' | 'calendar' | 'stats'>('materials');

  const tabs = [
    { id: 'materials' as const, label: 'Materiais', icon: BookOpen },
    { id: 'posts' as const, label: 'Feed', icon: MessageSquare },
    { id: 'announcements' as const, label: 'Anúncios', icon: Megaphone },
    { id: 'resources' as const, label: 'Recursos', icon: LinkIcon },
    { id: 'calendar' as const, label: 'Calendário', icon: Calendar },
    { id: 'stats' as const, label: 'Estatísticas', icon: BarChart3 },
  ];

  const isFeedTab = activeTab === 'posts';

  return (
    <div className="mt-6">
      {}
      <div className={`mb-6 ${isFeedTab ? 'border-b border-purple-500/20' : 'border-b border-gray-200'}`}>
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? isFeedTab
                      ? 'border-purple-400 text-purple-300'
                      : 'border-purple-500 text-purple-600'
                    : isFeedTab
                    ? 'border-transparent text-purple-400/60 hover:text-purple-300 hover:border-purple-500/30'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {}
      <div className="mt-6">
        {activeTab === 'materials' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Biblioteca de Materiais</h3>
              {isMember && (
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Compartilhar Material</span>
                </button>
              )}
            </div>
            <p className="text-gray-600">Aqui você pode compartilhar e acessar materiais educacionais do grupo.</p>
            {}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="bg-gradient-to-br from-purple-950 via-blue-950 to-purple-950 rounded-3xl p-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] border border-purple-500/20">
            <GroupFeed groupId={groupId} isMember={isMember} />
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Anúncios</h3>
              {isEditor && (
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                  <Megaphone className="h-4 w-4" />
                  <span>Criar Anúncio</span>
                </button>
              )}
            </div>
            <p className="text-gray-600">Anúncios importantes dos editores do grupo.</p>
            {}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recursos Compartilhados</h3>
              {isMember && (
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4" />
                  <span>Adicionar Recurso</span>
                </button>
              )}
            </div>
            <p className="text-gray-600">Links úteis, documentos e ferramentas compartilhados pelo grupo.</p>
            {}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendário de Estudos</h3>
            <p className="text-gray-600">Planejamento de atividades e prazos do grupo.</p>
            {}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas do Grupo</h3>
            <p className="text-gray-600">Métricas e analytics do grupo.</p>
            {}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupTabs;
