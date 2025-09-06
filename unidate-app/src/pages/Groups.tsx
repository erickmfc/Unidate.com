import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  MessageCircle, 
  Calendar,
  MapPin,
  Star,
  Filter,
  Grid,
  List
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers?: number;
  category: string;
  university: string;
  isJoined: boolean;
  lastActivity: string;
  image?: string;
  tags: string[];
  upcomingEvents?: {
    title: string;
    date: string;
    attendees: number;
  }[];
}

const Groups: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Estudantes de Engenharia',
      description: 'Grupo para estudantes de engenharia compartilharem experiências, dúvidas e oportunidades.',
      members: 156,
      maxMembers: 200,
      category: 'Acadêmico',
      university: 'USP',
      isJoined: true,
      lastActivity: '2 horas atrás',
      tags: ['Engenharia', 'Estudos', 'Projetos'],
      upcomingEvents: [
        {
          title: 'Workshop de Programação',
          date: 'Sexta, 14:00',
          attendees: 12
        }
      ]
    },
    {
      id: '2',
      name: 'Fotografia no Campus',
      description: 'Apaixonados por fotografia se reúnem para capturar os melhores momentos da vida universitária.',
      members: 89,
      category: 'Hobby',
      university: 'UNICAMP',
      isJoined: false,
      lastActivity: '1 dia atrás',
      tags: ['Fotografia', 'Arte', 'Criatividade']
    },
    {
      id: '3',
      name: 'Grupo de Estudos - Medicina',
      description: 'Estudantes de medicina organizando grupos de estudo para as principais disciplinas.',
      members: 234,
      maxMembers: 300,
      category: 'Acadêmico',
      university: 'UFRJ',
      isJoined: true,
      lastActivity: '30 min atrás',
      tags: ['Medicina', 'Estudos', 'Anatomia'],
      upcomingEvents: [
        {
          title: 'Revisão de Anatomia',
          date: 'Amanhã, 16:00',
          attendees: 25
        }
      ]
    },
    {
      id: '4',
      name: 'Esportes Universitários',
      description: 'Grupo para praticar esportes e manter uma vida saudável durante a universidade.',
      members: 67,
      category: 'Esporte',
      university: 'UFMG',
      isJoined: false,
      lastActivity: '3 horas atrás',
      tags: ['Esportes', 'Saúde', 'Fitness']
    },
    {
      id: '5',
      name: 'Cinema e Discussão',
      description: 'Assistimos filmes juntos e discutimos sobre cinema, arte e cultura.',
      members: 45,
      category: 'Cultura',
      university: 'UNESP',
      isJoined: false,
      lastActivity: '5 horas atrás',
      tags: ['Cinema', 'Cultura', 'Arte']
    }
  ]);

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'Acadêmico', name: 'Acadêmico' },
    { id: 'Hobby', name: 'Hobby' },
    { id: 'Esporte', name: 'Esporte' },
    { id: 'Cultura', name: 'Cultura' },
    { id: 'Social', name: 'Social' }
  ];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinGroup = (groupId: string) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: !group.isJoined, members: group.isJoined ? group.members - 1 : group.members + 1 }
        : group
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grupos</h1>
          <p className="text-gray-600">Conecte-se com pessoas que compartilham seus interesses</p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar grupos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Create Group Button */}
              <button className="btn-primary flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Criar Grupo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Groups Grid/List */}
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
          {filteredGroups.map((group) => (
            <div key={group.id} className={`card group hover:shadow-lg transition-all duration-300 ${
              viewMode === 'list' ? 'flex flex-row' : ''
            }`}>
              {viewMode === 'list' ? (
                <>
                  {/* List View */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                        <p className="text-gray-600 mb-3">{group.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{group.members} membros</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{group.university}</span>
                          </div>
                          <span>• {group.lastActivity}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          group.isJoined
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-primary-500 text-white hover:bg-primary-600'
                        }`}
                      >
                        {group.isJoined ? 'Sair' : 'Entrar'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Grid View */}
                  <div className="relative">
                    {/* Group Image/Icon */}
                    <div className="w-full h-48 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl mb-4 flex items-center justify-center">
                      <Users className="h-16 w-16 text-white" />
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-700">{group.category}</span>
                    </div>

                    {/* Join Button */}
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                        group.isJoined
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                    >
                      {group.isJoined ? 'Sair' : 'Entrar'}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>

                    {/* Group Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{group.members}{group.maxMembers ? `/${group.maxMembers}` : ''}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{group.university}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{group.lastActivity}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {group.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Upcoming Events */}
                    {group.upcomingEvents && group.upcomingEvents.length > 0 && (
                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-primary-600" />
                          <span className="text-sm font-medium text-primary-900">Próximo Evento</span>
                        </div>
                        <div className="text-sm text-primary-700">
                          <div className="font-medium">{group.upcomingEvents[0].title}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span>{group.upcomingEvents[0].date}</span>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{group.upcomingEvents[0].attendees}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum grupo encontrado</h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar seus filtros ou criar um novo grupo.
            </p>
            <button className="btn-primary">
              Criar Primeiro Grupo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
