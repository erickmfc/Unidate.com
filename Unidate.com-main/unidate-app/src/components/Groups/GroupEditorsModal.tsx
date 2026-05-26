import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Crown, Shield, Users } from 'lucide-react';
import { GroupsService } from '../../services/groupsService';
import { useAuth } from '../../contexts/AuthContext';

interface GroupEditorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  currentEditors: string[];
  onEditorsUpdated: (editors: string[]) => void;
}

interface EditorInfo {
  uid: string;
  name: string;
  email: string;
  isOwner: boolean;
}

const GroupEditorsModal: React.FC<GroupEditorsModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  currentEditors,
  onEditorsUpdated
}) => {
  const { currentUser } = useAuth();
  const [editors, setEditors] = useState<EditorInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState<EditorInfo[]>([]);

  useEffect(() => {
    if (isOpen && currentEditors.length > 0) {
      loadEditorsInfo();
    }
  }, [isOpen, currentEditors]);

  const loadEditorsInfo = async () => {
    setLoading(true);
    try {
      const editorsInfo: EditorInfo[] = currentEditors.map((uid, index) => ({
        uid,
        name: `Editor ${index + 1}`,
        email: `editor${index + 1}@exemplo.com`,
        isOwner: uid === currentUser?.uid
      }));
      
      setEditors(editorsInfo);
    } catch (error) {
      console.error('Erro ao carregar informações dos editores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEditor = async (userId: string) => {
    if (userId === currentUser?.uid) {
      alert('Você não pode remover a si mesmo como editor!');
      return;
    }

    try {
      await GroupsService.removeEditor(groupId, userId);
      const updatedEditors = currentEditors.filter(uid => uid !== userId);
      onEditorsUpdated(updatedEditors);
    } catch (error) {
      console.error('Erro ao remover editor:', error);
      alert('Erro ao remover editor. Tente novamente.');
    }
  };

  const handleAddEditor = async (userId: string) => {
    try {
      await GroupsService.addEditor(groupId, userId);
      const updatedEditors = [...currentEditors, userId];
      onEditorsUpdated(updatedEditors);
      setSearchTerm('');
    } catch (error) {
      console.error('Erro ao adicionar editor:', error);
      alert('Erro ao adicionar editor. Tente novamente.');
    }
  };

  const searchUsers = async (term: string) => {
    if (term.length < 2) {
      setSuggestedUsers([]);
      return;
    }

    try {
      const suggestions: EditorInfo[] = [
        {
          uid: 'user1',
          name: 'João Silva',
          email: 'joao@exemplo.com',
          isOwner: false
        },
        {
          uid: 'user2',
          name: 'Maria Santos',
          email: 'maria@exemplo.com',
          isOwner: false
        }
      ].filter(user => 
        user.name.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
      );

      setSuggestedUsers(suggestions);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Editores do Grupo
              </h2>
              <p className="text-sm text-gray-500">{groupName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {}
        <div className="p-6 space-y-6">
          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicionar Editor
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchUsers(e.target.value);
                }}
                placeholder="Buscar por nome ou email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <UserPlus className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {}
            {suggestedUsers.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
                {suggestedUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAddEditor(user.uid)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <UserPlus className="h-4 w-4 text-purple-600" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Editores Atuais ({editors.length})
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando editores...</p>
              </div>
            ) : editors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum editor encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {editors.map((editor) => (
                  <div
                    key={editor.uid}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        {editor.isOwner ? (
                          <Crown className="h-5 w-5 text-white" />
                        ) : (
                          <Shield className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{editor.name}</p>
                          {editor.isOwner && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Dono
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{editor.email}</p>
                      </div>
                    </div>
                    
                    {!editor.isOwner && (
                      <button
                        onClick={() => handleRemoveEditor(editor.uid)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover editor"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupEditorsModal;
