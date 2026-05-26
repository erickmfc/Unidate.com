import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Tag, 
  Settings, 
  Plus,
  Heart,
  Share2,
  MoreHorizontal,
  Shield,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GroupsService, Group as FirebaseGroup } from '../services/groupsService';
import { useUniDateToast } from '../components/UI/Toast';
import Navbar from '../components/Layout/Navbar';
import GroupChat from '../components/Groups/GroupChat';
import GroupEditorsModal from '../components/Groups/GroupEditorsModal';
import EventsList from '../components/Groups/EventsList';
import GroupTabs from '../components/Groups/GroupTabs';

interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  editors: string[];
  maxMembers?: number;
  category: string;
  university: string;
  isJoined: boolean;
  lastActivity: any;
  image?: string;
  tags: string[];
  createdBy: string;
  isOwner: boolean;
  isEditor: boolean;
  isPublic: boolean;
  upcomingEvents?: {
    title: string;
    date: string;
    attendees: number;
  }[];
  createdAt: any;
  updatedAt: any;
}

const GroupDetails: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditorsModal, setShowEditorsModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadGroupDetails();
    }
  }, [groupId, currentUser]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      
      const groups = await GroupsService.getGroups(100);
      const foundGroup = groups.find(g => g.id === groupId);
      
      if (foundGroup) {
        const isUserMember = currentUser ? foundGroup.members.includes(currentUser.uid) : false;
        const isUserOwner = currentUser ? foundGroup.createdBy === currentUser.uid : false;
        const isUserEditor = currentUser ? (foundGroup.editors?.includes(currentUser.uid) || false) : false;
        
        setGroup({
          ...foundGroup,
          isJoined: isUserMember,
          isOwner: isUserOwner,
          isEditor: isUserEditor
        });
      } else {
        console.error('Grupo não encontrado');
        navigate('/groups');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do grupo:', error);
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!currentUser || !group) return;

    try {
      const isJoining = !group.isJoined;
      await GroupsService.toggleGroupMembership(group.id, currentUser.uid, isJoining);
      
      await loadGroupDetails();
      
      if (isJoining) {
        showSuccess(`Você entrou no grupo "${group.name}"! 🎉`);
      } else {
        showSuccess(`Você saiu do grupo "${group.name}"`);
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar membro do grupo:', error);
      console.error('❌ Detalhes do erro:', {
        groupId: group.id,
        userId: currentUser.uid,
        isJoining: !group.isJoined,
        error: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Erro ao atualizar grupo. Tente novamente.';
      
      if (error.message.includes('Firebase não inicializado')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message.includes('Grupo não encontrado')) {
        errorMessage = 'Grupo não encontrado. Ele pode ter sido removido.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Você não tem permissão para realizar esta ação.';
      }
      
      showError(errorMessage);
    }
  };

  const handleEditorsUpdated = (editors: string[]) => {
    if (group) {
      setGroup(prev => prev ? { ...prev, editors } : null);
    }
  };

  const handleChangeGroupImage = async (imageUrl: string) => {
    if (!currentUser || !groupId) return;

    try {
      await GroupsService.updateGroupImage(groupId, currentUser.uid, imageUrl);
      showSuccess('Foto do grupo atualizada com sucesso! 📸');
      
      loadGroupDetails();
    } catch (error) {
      console.error('Erro ao atualizar foto do grupo:', error);
      showError('Erro ao atualizar foto do grupo. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Grupo não encontrado</h2>
            <p className="text-gray-600 mb-4">O grupo que você está procurando não existe.</p>
            <button
              onClick={() => navigate('/groups')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Voltar aos Grupos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate('/groups')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-600">{group.description}</p>
            </div>
          </div>

          {}
          <div className="w-full h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
            {group.image ? (
              <img 
                src={group.image} 
                alt={group.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Users className="h-20 w-20 text-white" />
            )}
          </div>

          {}
          <div className="grid lg:grid-cols-3 gap-6">
            {}
            <div className="lg:col-span-2 space-y-6">
              {}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Grupo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Membros</p>
                      <p className="font-semibold text-gray-900">
                        {group.members.length}{group.maxMembers ? `/${group.maxMembers}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Universidade</p>
                      <p className="font-semibold text-gray-900">{group.university}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Categoria</p>
                      <p className="font-semibold text-gray-900">{group.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Última Atividade</p>
                      <p className="font-semibold text-gray-900">
                        {group.lastActivity?.toDate?.() ? 
                          group.lastActivity.toDate().toLocaleDateString() : 
                          'Recente'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {}
              {group.tags.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <EventsList
                  groupId={group.id}
                  groupName={group.name}
                  canCreateEvents={group.isOwner || group.isEditor}
                />
              </div>

              {}
              <GroupTabs
                groupId={group.id}
                isMember={group.isJoined}
                isEditor={group.isEditor || group.isOwner}
              />
            </div>

            {}
            <div className="space-y-6">
              {}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-3">
                  <button
                    onClick={handleJoinGroup}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      group.isJoined
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {group.isJoined ? 'Sair do Grupo' : 'Entrar no Grupo'}
                  </button>

                  {(group.isOwner || group.isEditor) && (
                    <button
                      onClick={() => setShowEditorsModal(true)}
                      className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Gerenciar Editores</span>
                    </button>
                  )}

                  <button 
                    onClick={() => setShowChat(true)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat do Grupo</span>
                  </button>
                </div>
              </div>

              {}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tipo</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      group.isPublic 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {group.isPublic ? 'Público' : 'Privado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Seu Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      group.isOwner 
                        ? 'bg-purple-100 text-purple-800' 
                        : group.isEditor 
                        ? 'bg-blue-100 text-blue-800'
                        : group.isJoined
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {group.isOwner ? 'Dono' : group.isEditor ? 'Editor' : group.isJoined ? 'Membro' : 'Não Membro'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      {group && (
        <GroupEditorsModal
          isOpen={showEditorsModal}
          onClose={() => setShowEditorsModal(false)}
          groupId={group.id}
          groupName={group.name}
          currentEditors={group.editors}
          onEditorsUpdated={handleEditorsUpdated}
        />
      )}

      {}
      {showChat && group && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <GroupChat
              groupId={group.id}
              groupName={group.name}
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
