import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  Shield,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GroupsService, Group as FirebaseGroup } from '../services/groupsService';
import GroupEditorsModal from '../components/Groups/GroupEditorsModal';
import { useUniDateToast } from '../components/UI/Toast';

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
  createdBy: string;
  isOwner: boolean;
  isEditor: boolean;
  editors?: string[];
  isPublic: boolean;
  upcomingEvents?: {
    title: string;
    date: string;
    attendees: number;
  }[];
}

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditorsModal, setShowEditorsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    tagInput: ''
  });
  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError, showInfo, showGroupJoined } = useUniDateToast();
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
          isEditor: group.editors?.includes(currentUser?.uid || '') || false,
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
      showError('Você precisa estar logado para fazer parte de grupos');
      return;
    }

    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      const isJoining = !group.isJoined;
      
      // Atualizar no Firebase
      await GroupsService.toggleGroupMembership(groupId, currentUser.uid, isJoining);
      
      // Atualizar estado local imediatamente para melhor UX
      setGroups(prevGroups => 
        prevGroups.map(g => 
          g.id === groupId 
            ? { 
                ...g, 
                isJoined: isJoining,
                members: isJoining ? g.members + 1 : Math.max(0, g.members - 1)
              }
            : g
        )
      );
      
      console.log(`✅ Usuário ${isJoining ? 'entrou' : 'saiu'} do grupo`);
      
      // Mostrar notificação moderna
      if (isJoining) {
        showGroupJoined(group.name);
        // Navegar para o grupo após um pequeno delay para mostrar a notificação
        setTimeout(() => {
          navigate(`/groups/${groupId}`);
        }, 1000);
      } else {
        showSuccess(`Você saiu do grupo "${group.name}"`);
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar membro do grupo:', error);
      const group = groups.find(g => g.id === groupId);
      console.error('❌ Detalhes do erro:', {
        groupId,
        userId: currentUser.uid,
        isJoining: group ? !group.isJoined : false,
        error: error.message,
        stack: error.stack
      });
      
      // Mostrar erro mais amigável
      let errorMessage = 'Ops! Não conseguimos atualizar o grupo. Tente novamente.';
      
      if (error.message.includes('Firebase não inicializado')) {
        errorMessage = 'Problema de conexão. Verifique sua internet.';
      } else if (error.message.includes('Grupo não encontrado')) {
        errorMessage = 'Este grupo não existe mais.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Você não tem permissão para esta ação.';
      }
      
      showError(errorMessage);
    }
  };

  const handleManageEditors = (group: Group) => {
    setSelectedGroup(group);
    setShowEditorsModal(true);
  };

  const handleEditorsUpdated = (editors: string[]) => {
    if (selectedGroup) {
      setSelectedGroup(prev => prev ? { ...prev, editors } : null);
      
      setGroups(prev => prev.map(group => 
        group.id === selectedGroup.id 
          ? { ...group, editors }
          : group
      ));
    }
  };

  const [hasCreatedGroup, setHasCreatedGroup] = useState(false);

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
      showError('Você precisa estar logado para criar grupos');
      return;
    }

    if (!newGroup.name.trim() || !newGroup.description.trim() || !newGroup.category) {
      showError('Por favor, preencha todos os campos obrigatórios');
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
        members: [currentUser.uid],
        editors: [currentUser.uid],
        maxMembers: 100,
        lastActivity: new Date(),
        upcomingEvents: []
      };

      const groupId = await GroupsService.createGroup(groupToSave);
      
      // Atualizar estado local
      const newGroupLocal: Group = {
        id: groupId,
        name: groupToSave.name,
        description: groupToSave.description,
        members: 1,
        maxMembers: groupToSave.maxMembers,
        category: groupToSave.category,
        university: groupToSave.university,
        isJoined: true,
        lastActivity: new Date().toISOString(),
        tags: groupToSave.tags,
        createdBy: groupToSave.createdBy,
        isOwner: true,
        isEditor: true,
        editors: [currentUser.uid],
        isPublic: groupToSave.isPublic,
        upcomingEvents: []
      };

      setGroups([newGroupLocal, ...groups]);
      setHasCreatedGroup(true);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', category: '', tags: [], tagInput: '' });
      
      console.log('✅ Grupo criado no Firebase:', groupId);
      
      // Mostrar notificação de sucesso
      showSuccess(`Grupo "${groupToSave.name}" criado com sucesso! 🎉`);
      
      // Navegar automaticamente para o grupo criado após 1.5 segundos
      setTimeout(() => {
        navigate(`/groups/${groupId}`);
      }, 1500);

    } catch (error) {
      console.error('❌ Erro ao criar grupo:', error);
      showError('Ops! Não conseguimos criar o grupo. Tente novamente.');
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grupos</h1>
          <p className="text-gray-600">Conecte-se com pessoas que compartilham seus interesses</p>
        </div>

        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
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

            <div className="flex items-center space-x-4">
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

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Debug:</strong> {groups.length} grupo{groups.length !== 1 ? 's' : ''} carregados, {filteredGroups.length} filtrado{filteredGroups.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Usuário:</strong> {currentUser?.uid ? 'Logado' : 'Não logado'}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Loading:</strong> {loading ? 'Sim' : 'Não'}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando grupos...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo encontrado</h3>
            <p className="text-gray-600 mb-4">
              {groups.length === 0 
                ? 'Não há grupos disponíveis no momento.' 
                : 'Tente ajustar os filtros de busca.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Criar Primeiro Grupo
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {filteredGroups.map((group) => (
            <div 
              key={group.id} 
              className={`card group hover:shadow-lg transition-all duration-300 cursor-pointer ${
                viewMode === 'list' ? 'flex flex-row' : ''
              }`}
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              {viewMode === 'list' ? (
                <>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 
                          className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors"
                        >
                          {group.name}
                        </h3>
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
                      <div className="flex items-center space-x-2">
                        {(group.isOwner || group.isEditor) && (
                          <button
                            onClick={() => handleManageEditors(group)}
                            className="px-3 py-2 rounded-lg font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-200"
                            title="Gerenciar Editores"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                            group.isJoined
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          {group.isJoined ? (
                            <>
                              <X className="h-4 w-4" />
                              <span>Sair</span>
                            </>
                          ) : (
                            <>
                              <Users className="h-4 w-4" />
                              <span>Fazer Parte</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <span>Clique para ver mais</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl mb-4 flex items-center justify-center">
                      <Users className="h-16 w-16 text-white" />
                    </div>

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-700">{group.category}</span>
                    </div>

                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                        group.isJoined
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {group.isJoined ? (
                        <>
                          <X className="h-3 w-3" />
                          <span>Sair</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-3 w-3" />
                          <span>Entrar</span>
                        </>
                      )}
                    </button>

                    {(group.isOwner || group.isEditor) && (
                      <button
                        onClick={() => handleManageEditors(group)}
                        className="absolute top-4 right-20 px-3 py-1 rounded-full text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-200"
                        title="Gerenciar Editores"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 
                      className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors"
                    >
                      {group.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>

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
                    
                    <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <span>Clique para ver mais</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        )}

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

        {selectedGroup && (
          <GroupEditorsModal
            isOpen={showEditorsModal}
            onClose={() => {
              setShowEditorsModal(false);
              setSelectedGroup(null);
            }}
            groupId={selectedGroup.id}
            groupName={selectedGroup.name}
            currentEditors={selectedGroup.editors || []}
            onEditorsUpdated={handleEditorsUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default Groups;
