import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical,
  ArrowLeft,
  Users,
  MessageCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUniDateToast } from '../UI/Toast';
import { GroupChatService, GroupMessage } from '../../services/groupChatService';
import { UserStatusService } from '../../services/userStatusService';

interface GroupChatProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId, groupName, onClose }) => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [canAccessChat, setCanAccessChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!groupId || !currentUser) return;

    const checkAccess = async () => {
      try {
        const hasAccess = await UserStatusService.canUserAccessGroupChat(currentUser.uid, groupId);
        setCanAccessChat(hasAccess);
        
        if (hasAccess) {
          await UserStatusService.setUserOnline(currentUser.uid, groupId);
          
          const unsubscribe = GroupChatService.subscribeToGroupMessages(
            groupId,
            (newMessages) => {
              setMessages(newMessages);
              setLoading(false);
              
              setTimeout(() => {
                scrollToBottom();
              }, 100);
            }
          );

          return unsubscribe;
        } else {
          setLoading(false);
          showError('Você precisa fazer parte do grupo para acessar o chat');
          return () => {};
        }
      } catch (error) {
        console.error('Erro ao verificar acesso ao chat:', error);
        setLoading(false);
        showError('Erro ao verificar acesso ao chat');
        return () => {};
      }
    };

    let unsubscribe: (() => void) | undefined;
    checkAccess().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (currentUser) {
        UserStatusService.setUserOffline(currentUser.uid);
      }
    };
  }, [groupId, currentUser, showError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || sending) return;

    setSending(true);
    try {
      await GroupChatService.sendMessage(
        groupId,
        currentUser.uid,
        currentUser.displayName || 'Usuário',
        newMessage.trim()
      );
      
      setNewMessage('');
      scrollToBottom();
      showSuccess('Mensagem enviada! 💬');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showError('Ops! Não conseguimos enviar sua mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Agora há pouco';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const isOwnMessage = (message: GroupMessage) => {
    return message.userId === currentUser?.uid;
  };

  const isSystemMessage = (message: GroupMessage) => {
    return message.type === 'system';
  };

  const isConsecutiveMessage = (currentMessage: GroupMessage, previousMessage: GroupMessage | null) => {
    if (!previousMessage) return false;
    return (
      currentMessage.userId === previousMessage.userId &&
      !isSystemMessage(currentMessage) &&
      !isSystemMessage(previousMessage)
    );
  };

  if (!canAccessChat && !loading) {
    return (
      <div className="flex flex-col h-full bg-white">
        {}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{groupName}</h2>
              <p className="text-sm text-gray-500">Chat do grupo</p>
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Acesso Restrito
            </h3>
            <p className="text-gray-600 mb-4">
              Você precisa fazer parte do grupo para acessar o chat.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{groupName}</h2>
            <p className="text-sm text-gray-500">Chat do grupo</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Users className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma mensagem ainda</h3>
            <p className="text-sm text-center">
              Seja o primeiro a enviar uma mensagem neste grupo!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const showAvatar = !isConsecutiveMessage(message, previousMessage);
            const isOwn = isOwnMessage(message);
            const isSystem = isSystemMessage(message);

            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                  showAvatar ? 'mb-4' : 'mb-1'
                }`}
              >
                <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {}
                  {showAvatar && (
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center ${isOwn ? 'ml-2' : 'mr-2'}`}>
                      <span className="text-white text-xs font-semibold">
                        {message.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    {showAvatar && (
                      <div className={`text-xs text-gray-500 mb-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {message.userName}
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    
                    <div className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
              disabled={sending}
            />
          </div>
          
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Smile className="h-5 w-5 text-gray-600" />
          </button>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;
