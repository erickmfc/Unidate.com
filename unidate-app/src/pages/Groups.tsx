import React, { useState, useEffect } from 'react';
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
  List,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GroupsService, Group as FirebaseGroup } from '../services/groupsService';

// Interface local para o componente (com members como number e lastActivity como string)
interface Group {
  id: string;
  name: string;
  description: string;
  members: number; // Number para o componente
  maxMembers?: number;
  category: string;
  university: string;
  isJoined: boolean;
  lastActivity: string; // String para o componente
  image?: string;
  tags: string[];
  createdBy: string;
  isOwner: boolean;
  isPublic: boolean;
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    tagInput: ''
  });
  const { currentUser, userProfile } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar grupos reais do Firebase
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);
        
        const firebaseGroups = await GroupsService.getGroups(50);
        
        // Converter grupos do Firebase para o formato esperado pelo componente
        const convertedGroups: Group[] = firebaseGroups.map((group: FirebaseGroup) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          members: group.members.length, // Converter array para número
          maxMembers: group.maxMembers,
          category: group.category,
          university: group.university,
          isJoined: group.members.includes(currentUser?.uid || ''),
          lastActivity: group.lastActivity?.toDate?.() ? group.lastActivity.toDate().toISOString() : new Date().toISOString(),
          image: group.image,
          tags: group.tags,
          createdBy: group.createdBy,
          isOwner: group.createdBy === currentUser?.uid,
          isPublic: group.isPublic,
          upcomingEvents: group.upcomingEvents
        }));
        
        setGroups(convertedGroups);
        console.log(`✅ ${convertedGroups.length} grupos carregados do Firebase`);
      } catch (error) {
        console.error('❌ Erro ao carregar grupos:', error);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadGroups();
    }
  }, [currentUser]);

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

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser) {
      alert('Usuário não autenticado');
      return;
    }

    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      const isJoining = !group.isJoined;
      
      // Atualizar no Firebase
      await GroupsService.toggleGroupMembership(groupId, currentUser.uid, isJoining);
      
      // Atualizar estado local
      setGroups(groups.map(g => 
        g.id === groupId 
          ? { 
              ...g, 
              isJoined: !g.isJoined, 
              members: g.isJoined ? g.members - 1 : g.members + 1 
            }
          : g
      ));
      
      console.log(`✅ Usuário ${isJoining ? 'entrou' : 'saiu'} do grupo`);
    } catch (error) {
      console.error('❌ Erro ao atualizar membro do grupo:', error);
      alert('Erro ao atualizar grupo. Tente novamente.');
    }
  };

  const [hasCreatedGroup, setHasCreatedGroup] = useState(false);

  // Verificar se usuário já criou um grupo
  useEffect(() => {
    const checkUserGroups = async () => {
      if (currentUser) {
        const hasCreated = await GroupsService.hasUserCreatedGroup(currentUser.uid);
        setHasCreatedGroup(hasCreated);
      }
    };
    checkUserGroups();
  }, [currentUser]);

  const handleCreateGroup = () => {
    if (hasCreatedGroup) {
      alert('Você já criou um grupo. Cada usuário pode criar apenas um grupo.');
      return;
    }
    setShowCreateModal(true);
  };

  const handleSubmitGroup = async () => {
    if (!currentUser || !userProfile) {
      alert('Usuário não autenticado');
      return;
    }

    if (!newGroup.name.trim() || !newGroup.description.trim() || !newGroup.category) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const groupToSave = {
        name: newGroup.name.trim(),
        description: newGroup.description.trim(),
        category: newGroup.category,
        university: userProfile.university || 'Universidade não informada',
        tags: newGroup.tags,
        createdBy: currentUser.uid,
        isPublic: true,
        maxMembers: 100
      };

      const groupId = await GroupsService.createGroup(groupToSave);
      
      // Atualizar estado local
      const newGroupLocal: Group = {
        id: groupId,
        name: groupToSave.name,
        description: groupToSave.description,
        members: 1, // Criador é automaticamente membro
        maxMembers: groupToSave.maxMembers,
        category: groupToSave.category,
        university: groupToSave.university,
        isJoined: true,
        lastActivity: new Date().toISOString(),
        tags: groupToSave.tags,
        createdBy: groupToSave.createdBy,
        isOwner: true,
        isPublic: groupToSave.isPublic
      };

      setGroups([newGroupLocal, ...groups]);
      setHasCreatedGroup(true);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', category: '', tags: [], tagInput: '' });
      
      console.log('✅ Grupo criado no Firebase:', groupId);
      alert('Grupo criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar grupo:', error);
      alert('Erro ao criar grupo. Tente novamente.');
    }
  };

  // Função handleSubmitGroup já implementada acima

  const addTag = () => {
    if (newGroup.tagInput.trim() && !newGroup.tags.includes(newGroup.tagInput.trim())) {
      setNewGroup({
        ...newGroup,
        tags: [...newGroup.tags, newGroup.tagInput.trim()],
        tagInput: ''
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewGroup({
      ...newGroup,
      tags: newGroup.tags.filter(tag => tag !== tagToRemove)
    });
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
              <button 
                onClick={handleCreateGroup}
                className={`btn-primary flex items-center space-x-2 ${
                  hasCreatedGroup ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={hasCreatedGroup}
                title={hasCreatedGroup ? 'Você já criou um grupo' : 'Criar novo grupo'}
              >
                <Plus className="h-4 w-4" />
                <span>{hasCreatedGroup ? 'Grupo Criado' : 'Criar Grupo'}</span>
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
            <button 
              onClick={handleCreateGroup}
              className="btn-primary"
              disabled={hasCreatedGroup}
            >
              Criar Primeiro Grupo
            </button>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Criar Novo Grupo</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Group Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Grupo *
                    </label>
                    <input
                      type="text"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      className="input-field"
                      placeholder="Ex: Estudantes de Engenharia"
                      maxLength={50}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição *
                    </label>
                    <textarea
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      className="input-field h-24 resize-none"
                      placeholder="Descreva o propósito e objetivos do grupo..."
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {newGroup.description.length}/200 caracteres
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={newGroup.category}
                      onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.filter(cat => cat.id !== 'all').map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newGroup.tagInput}
                        onChange={(e) => setNewGroup({ ...newGroup, tagInput: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="input-field flex-1"
                        placeholder="Adicionar tag..."
                      />
                      <button
                        onClick={addTag}
                        className="btn-secondary px-3"
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newGroup.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm"
                        >
                          <span>#{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-primary-500 hover:text-primary-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Importante:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Cada usuário pode criar apenas um grupo</li>
                          <li>• Todos os grupos são públicos por enquanto</li>
                          <li>• Grupos privados estarão disponíveis em breve</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="btn-ghost flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitGroup}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Criar Grupo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
