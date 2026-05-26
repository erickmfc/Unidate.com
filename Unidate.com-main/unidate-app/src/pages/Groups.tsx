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
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Flame
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

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);
        
        const firebaseGroups = await GroupsService.getGroups(50);
        
        const convertedGroups = await Promise.all(
          firebaseGroups.map(async (group: FirebaseGroup): Promise<Group | null> => ({
            id: group.id,
            name: group.name,
            description: group.description,
            members: group.members.length,
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
          }))
        );
        
        const validGroups = convertedGroups.filter((g): g is Group => g !== null);
        setGroups(validGroups);
        console.log(`✅ ${validGroups.length} grupos carregados do Firebase`);
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
    { id: 'all', name: 'Todos', color: 'from-purple-500 to-pink-500' },
    { id: 'Acadêmico', name: 'Acadêmico', color: 'from-cyan-500 to-blue-500' },
    { id: 'Hobby', name: 'Hobby', color: 'from-green-500 to-emerald-500' },
    { id: 'Esporte', name: 'Esporte', color: 'from-orange-500 to-red-500' },
    { id: 'Cultura', name: 'Cultura', color: 'from-purple-500 to-indigo-500' },
    { id: 'Social', name: 'Social', color: 'from-pink-500 to-rose-500' }
  ];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (a.members !== b.members) return b.members - a.members;
    return 0;
  });

  const handleJoinGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showError('Você precisa estar logado para fazer parte de grupos');
      return;
    }

    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      const isJoining = !group.isJoined;
      
      await GroupsService.toggleGroupMembership(groupId, currentUser.uid, isJoining);
      
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
      
      if (isJoining) {
        showGroupJoined(group.name);
        setTimeout(() => {
          navigate(`/groups/${groupId}`);
        }, 1000);
      } else {
        showSuccess(`Você saiu do grupo "${group.name}"`);
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar membro do grupo:', error);
      showError('Ops! Não conseguimos atualizar o grupo. Tente novamente.');
    }
  };

  const handleManageEditors = (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
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
      
      showSuccess(`Grupo "${groupToSave.name}" criado com sucesso! 🎉`);
      
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

  const isPopular = (index: number) => index < 3 && sortedGroups[index].members >= 5;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-1 h-1 bg-purple-500 rounded-full animate-pulse opacity-50" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-cyan-500 rounded-full animate-pulse opacity-50" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-pink-500 rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-60 right-1/3 w-1 h-1 bg-green-500 rounded-full animate-pulse opacity-50" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-blue-500 rounded-full animate-pulse opacity-50" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {}
        <div className="relative min-h-[40vh] flex items-center justify-center overflow-hidden border-b border-gray-800">
          {}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 border-2 border-purple-500/30 rounded-full animate-pulse"></div>
            <div className="absolute w-80 h-80 border-2 border-cyan-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute w-64 h-64 border-2 border-pink-500/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-10 text-center px-4 py-20">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 uppercase tracking-tight">
              GRUPOS DO CAMPUS
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Conecte-se com sua comunidade universitária
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={handleCreateGroup}
                disabled={hasCreatedGroup}
                className={`px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center gap-2 ${
                  hasCreatedGroup 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:scale-105'
                }`}
              >
                <Plus className="h-5 w-5" />
                <span>{hasCreatedGroup ? 'Grupo Criado' : 'Criar Grupo'}</span>
              </button>
              <button
                onClick={() => {
                  document.getElementById('groups-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 flex items-center gap-2"
              >
                <span>Explorar</span>
                <ArrowRight className="h-5 w-5 animate-pulse" />
              </button>
            </div>
          </div>
        </div>

        {}
        <div id="groups-section" className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Buscar grupos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              {}
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg shadow-purple-500/50`
                        : 'bg-gray-900 border border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
              <p className="text-gray-400">Carregando grupos...</p>
            </div>
          ) : sortedGroups.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-20 w-20 text-gray-700 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">Nenhum grupo encontrado</h3>
              <p className="text-gray-400 mb-6">
                {groups.length === 0 
                  ? 'Não há grupos disponíveis no momento.' 
                  : 'Tente ajustar os filtros de busca.'}
              </p>
              <button
                onClick={handleCreateGroup}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-emerald-400 transition-all shadow-lg shadow-cyan-500/50 hover:scale-105"
              >
                Criar Primeiro Grupo
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {sortedGroups.map((group, index) => {
                const popular = isPopular(index);
                const categoryColor = categories.find(c => c.id === group.category)?.color || 'from-purple-500 to-pink-500';
                
                return (
                  <div
                    key={group.id}
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className={`relative group cursor-pointer transition-all duration-300 p-[2px] rounded-xl bg-gradient-to-r ${categoryColor} ${
                      popular ? 'lg:col-span-1 lg:row-span-1' : ''
                    } ${popular ? 'animate-pulse' : 'opacity-70 group-hover:opacity-100'}`}
                  >
                    {}
                    <div className="relative bg-gray-900 rounded-xl p-6 h-full flex flex-col transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/20 group-hover:-translate-y-1">
                      {}
                      <div className="absolute top-4 left-4 z-10">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${categoryColor} shadow-lg`}>
                          {group.category}
                        </span>
                      </div>

                      {}
                      {popular && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            Popular
                          </span>
                        </div>
                      )}

                      {}
                      <div className={`relative mb-4 rounded-lg overflow-hidden ${
                        popular ? 'h-56' : 'h-48'
                      }`}>
                        <div className={`w-full h-full bg-gradient-to-br ${categoryColor} flex items-center justify-center`}>
                          <Users className="h-16 w-16 text-white/50" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      </div>

                      {}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {group.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {group.description}
                        </p>

                        {}
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-cyan-400" />
                            <span className="font-semibold text-cyan-400">{group.members}</span>
                            {group.maxMembers && <span className="text-gray-500">/{group.maxMembers}</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-purple-400" />
                            <span className="text-gray-400">{group.university}</span>
                          </div>
                        </div>

                        {}
                        {group.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {group.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {}
                        <button
                          onClick={(e) => handleJoinGroup(group.id, e)}
                          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                            group.isJoined
                              ? 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                              : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-400 hover:to-emerald-400 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:scale-105'
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
                              <span>Entrar no Grupo</span>
                            </>
                          )}
                        </button>

                        {}
                        {(group.isOwner || group.isEditor) && (
                          <button
                            onClick={(e) => handleManageEditors(group, e)}
                            className="mt-2 w-full py-2 rounded-lg font-medium bg-purple-900/50 text-purple-400 border border-purple-700 hover:bg-purple-900/70 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <Shield className="h-4 w-4" />
                            <span>Gerenciar Editores</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Criar Novo Grupo</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Grupo *
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="Ex: Estudantes de Engenharia"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all h-24 resize-none"
                    placeholder="Descreva o propósito e objetivos do grupo..."
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newGroup.description.length}/200 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={newGroup.category}
                    onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newGroup.tagInput}
                      onChange={(e) => setNewGroup({ ...newGroup, tagInput: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      placeholder="Adicionar tag..."
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors"
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newGroup.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 bg-cyan-900/50 text-cyan-400 px-2 py-1 rounded-full text-sm border border-cyan-700"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-cyan-500 hover:text-cyan-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-300">
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
                  className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitGroup}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg hover:from-cyan-400 hover:to-emerald-400 transition-all shadow-lg shadow-cyan-500/50 flex items-center justify-center gap-2"
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
  );
};

export default Groups;
