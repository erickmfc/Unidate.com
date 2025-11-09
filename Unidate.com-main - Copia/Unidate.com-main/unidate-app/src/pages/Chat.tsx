import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Smile, 
  Paperclip, 
  Send,
  Home,
  MessageCircle,
  Users,
  Clock,
  Calendar,
  FileText,
  Bell,
  Settings,
  ChevronDown,
  Star,
  Tag,
  File,
  User,
  LogOut,
  Check,
  CheckCheck,
  X,
  Sparkles,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChatService, ChatMessage, Chat } from '../services/chatService';
import { UserProfileService, UserProfile } from '../services/userProfileService';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import UserAvatar from '../components/UI/UserAvatar';

interface ChatContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isOnline: boolean;
  status?: string;
  workHours?: string;
  role?: string;
  tags?: string[];
  rating?: number;
  sharedDocuments?: Array<{ name: string; type: string; size: string }>;
}

interface ChatConversation {
  id: string;
  contactId: string;
  contact: ChatContact;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logoutUser } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const unsubscribeMessagesRef = useRef<(() => void) | null>(null);

  // Dados mockados para demonstração
  const mockContacts: ChatContact[] = [
    {
      id: '1',
      name: 'Aris Christofi',
      email: 'aris@example.com',
      phone: '+55 11 99999-9999',
      isOnline: true,
      status: 'Online',
      workHours: '9:00 AM - 6:00 PM',
      role: 'Admin',
      tags: ['Desenvolvimento', 'Design'],
      rating: 5,
      sharedDocuments: [
        { name: 'Style Sheet.Zip', type: 'zip', size: '2.4 MB' }
      ]
    },
    {
      id: '2',
      name: 'Julian Mendez',
      email: 'julian@example.com',
      phone: '+55 11 88888-8888',
      isOnline: false,
      status: 'Offline',
      workHours: '8:00 AM - 5:00 PM',
      role: 'Developer',
      tags: ['Frontend'],
      rating: 4
    }
  ];

  const mockConversations: ChatConversation[] = [
    {
      id: '1',
      contactId: '1',
      contact: mockContacts[0],
      lastMessage: 'Obrigado pela ajuda!',
      timestamp: '10:30 AM',
      unreadCount: 0,
      messages: []
    },
    {
      id: '2',
      contactId: '2',
      contact: mockContacts[1],
      lastMessage: 'Vou enviar o arquivo agora',
      timestamp: '9:15 AM',
      unreadCount: 2,
      messages: []
    }
  ];

  // Carregar conversas reais do Firebase
  useEffect(() => {
    const loadConversations = async () => {
      if (!currentUser?.uid) return;

      try {
        setLoading(true);
        const chats = await ChatService.getUserChats(currentUser.uid);
        
        // Converter chats para ChatConversation
        const conversationsList = await Promise.all(
          chats.map(async (chat): Promise<ChatConversation | null> => {
            // Encontrar o outro participante
            const otherParticipantId = chat.participants.find(id => id !== currentUser.uid);
            if (!otherParticipantId) return null;

            // Buscar perfil do outro participante
            const contactProfile = await UserProfileService.getUserProfile(otherParticipantId);
            if (!contactProfile) return null;

            // Formatar timestamp
            const lastMessageTime = chat.lastMessageTime as Timestamp;
            const timestamp = lastMessageTime?.toDate() 
              ? lastMessageTime.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : 'Agora';

            const contact: ChatContact = {
              id: otherParticipantId,
              name: contactProfile.name,
              email: contactProfile.email,
              avatar: contactProfile.avatar,
              isOnline: false, // TODO: Integrar com UserStatusService
              status: 'Online',
              workHours: '',
              role: '',
              tags: [],
              rating: 0
            };

            return {
              id: chat.id,
              contactId: otherParticipantId,
              contact,
              lastMessage: chat.lastMessage || 'Nenhuma mensagem',
              timestamp,
              unreadCount: chat.unreadCount[currentUser.uid] || 0,
              messages: []
            };
          })
        );

        // Filtrar nulls e ordenar por timestamp
        const validConversations = conversationsList.filter((c): c is ChatConversation => c !== null);
        setConversations(validConversations);
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
        // Se houver erro, manter lista vazia
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [currentUser?.uid]);

  // Carregar mensagens reais quando uma conversa é selecionada
  useEffect(() => {
    if (!selectedChat || !currentUser?.uid) return;

    // Limpar subscription anterior
    if (unsubscribeMessagesRef.current) {
      unsubscribeMessagesRef.current();
      unsubscribeMessagesRef.current = null;
    }

    // Carregar mensagens iniciais
    const loadMessages = async () => {
      try {
        const messages = await ChatService.getChatMessages(selectedChat, 50);
        setCurrentMessages(messages);
        
        // Marcar mensagens como lidas
        await ChatService.markMessagesAsRead(selectedChat, currentUser.uid);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    };

    loadMessages();

    // Escutar novas mensagens em tempo real
    const unsubscribe = ChatService.subscribeToChatMessages(
      selectedChat,
      (messages) => {
        setCurrentMessages(messages);
        // Marcar como lidas quando receber
        if (currentUser?.uid) {
          ChatService.markMessagesAsRead(selectedChat, currentUser.uid);
        }
      },
      50
    );

    unsubscribeMessagesRef.current = unsubscribe;

    return () => {
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
      }
    };
  }, [selectedChat, currentUser?.uid]);

  useEffect(() => {
    // Scroll para última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const filteredConversations = conversations.filter(conv =>
    conv.contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.id === selectedChat);
  const currentContact = currentConversation?.contact;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !currentUser) return;

    try {
      // Enviar mensagem real via ChatService
      await ChatService.sendMessage(
        selectedChat,
        currentUser.uid,
        userProfile?.displayName || 'Você',
        newMessage,
        'text'
      );

      setNewMessage('');

      // Atualizar última mensagem na lista
      setConversations(conversations.map(chat =>
        chat.id === selectedChat
          ? { ...chat, lastMessage: newMessage, timestamp: 'Agora' }
          : chat
      ));
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  // Buscar usuários pelo nome com debounce
  useEffect(() => {
    if (!userSearchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearchingUsers(true);
        const users = await UserProfileService.searchUsers(userSearchTerm);
        // Filtrar o próprio usuário
        const filteredUsers = users.filter(user => user.uid !== currentUser?.uid);
        setSearchResults(filteredUsers);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setSearchResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [userSearchTerm, currentUser?.uid]);

  // Buscar quem te segue
  const loadFollowers = async () => {
    if (!currentUser?.uid || !db) return;

    try {
      setLoadingFollowers(true);
      // Buscar friendships onde o usuário atual é user2Id (quem te segue)
      const followersQuery = query(
        collection(db, 'friendships'),
        where('user2Id', '==', currentUser.uid),
        where('status', '==', 'accepted')
      );

      const snapshot = await getDocs(followersQuery);
      const followerIds: string[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        followerIds.push(data.user1Id);
      });

      // Buscar perfis dos seguidores
      const followerProfiles = await Promise.all(
        followerIds.map(id => UserProfileService.getUserProfile(id))
      );

      const validFollowers = followerProfiles.filter(f => f !== null) as UserProfile[];
      setFollowers(validFollowers);
    } catch (error) {
      console.error('Erro ao carregar seguidores:', error);
      setFollowers([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Iniciar nova conversa com um usuário
  const handleStartChat = async (userId: string) => {
    if (!currentUser?.uid) return;

    try {
      // Criar ou obter chat
      const chatId = await ChatService.getOrCreateChat(currentUser.uid, userId);
      
      // Buscar perfil do contato
      const contactProfile = await UserProfileService.getUserProfile(userId);
      if (contactProfile) {
        const contact: ChatContact = {
          id: userId,
          name: contactProfile.name,
          email: contactProfile.email,
          avatar: contactProfile.avatar,
          isOnline: false,
          status: 'Online',
          workHours: '',
          role: '',
          tags: [],
          rating: 0
        };

        // Adicionar à lista de conversas se não existir
        const existingChat = conversations.find(c => c.contactId === userId);
        if (!existingChat) {
          const newConversation: ChatConversation = {
            id: chatId,
            contactId: userId,
            contact,
            lastMessage: '',
            timestamp: 'Agora',
            unreadCount: 0,
            messages: []
          };
          setConversations([newConversation, ...conversations]);
        }
      }
      
      // Selecionar o chat
      setSelectedChat(chatId);
      setShowNewChatModal(false);
      setUserSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  };

  const formatTime = (timestamp: any): string => {
    if (!timestamp) return '';
    let date: Date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date();
    }
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex relative overflow-hidden">
      {/* Animação de fundo chamativa */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Ondas animadas */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Partículas flutuantes */}
        <div className="absolute top-20 right-1/4 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
          <MessageCircle className="h-6 w-6 text-pink-400/30" />
        </div>
        <div className="absolute top-40 left-1/3 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          <Sparkles className="h-5 w-5 text-purple-400/30" />
        </div>
        <div className="absolute bottom-32 right-1/3 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1.5s' }}>
          <Zap className="h-5 w-5 text-blue-400/30" />
        </div>
        <div className="absolute top-60 left-1/2 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '0.8s' }}>
          <MessageCircle className="h-4 w-4 text-pink-400/20" />
        </div>
      </div>

      {/* 1. Barra Lateral Esquerda (Navegação) */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-6 relative z-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Menu"
        >
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </button>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="text-pink-500 font-bold text-xl hover:scale-110 transition-transform cursor-pointer"
          title="Home"
        >
          w
        </button>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Home"
        >
          <Home className="h-5 w-5 text-gray-400" />
        </button>
        
        <button 
          onClick={() => navigate('/chat')}
          className="p-2 bg-pink-500 rounded-lg transition-all relative animate-pulse hover:scale-110"
          title="Chats"
        >
          <MessageCircle className="h-5 w-5 text-white animate-bounce" style={{ animationDuration: '1.5s' }} />
          <div className="absolute -right-1 -top-1 w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
          <div className="absolute -right-1 -top-1 w-3 h-3 bg-pink-400 rounded-full"></div>
          {/* Brilho pulsante */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 opacity-50 animate-pulse"></div>
        </button>
        
        <button 
          onClick={() => navigate('/groups')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Grupos"
        >
          <Users className="h-5 w-5 text-gray-400" />
        </button>
        
        <button 
          onClick={() => navigate('/feed')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Histórico/Atividade"
        >
          <Clock className="h-5 w-5 text-gray-400" />
        </button>
        
        <button 
          onClick={() => navigate('/events')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Calendário"
        >
          <Calendar className="h-5 w-5 text-gray-400" />
        </button>
        
        <button 
          onClick={() => navigate('/materials')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Arquivos/Materiais"
        >
          <FileText className="h-5 w-5 text-gray-400" />
        </button>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors relative"
          title="Notificações"
        >
          <Bell className="h-5 w-5 text-gray-400" />
        </button>
        
        <button 
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Configurações"
        >
          <Settings className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* 2. Painel Central-Esquerdo (Lista de Conversas) */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col relative z-10">
        {/* Cabeçalho com animação */}
        <div className="p-4 border-b border-gray-700 relative overflow-hidden">
          {/* Efeito de brilho animado no cabeçalho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent animate-shimmer"></div>
          
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <div className="relative">
              <MessageCircle className="h-6 w-6 text-pink-400 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-pink-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            <h2 className="text-white font-bold text-lg relative">
              Conversation
              <span className="absolute -top-1 -right-6 text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded-full animate-bounce">
                💬
              </span>
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Q Search here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setShowRecentDropdown(!showRecentDropdown)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <span>Recent Chats</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={() => {
              setShowNewChatModal(true);
              setShowFollowers(false);
            }}
            className="px-3 py-1 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600 transition-colors"
          >
            New Chat
          </button>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedChat(conversation.id)}
              className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
                selectedChat === conversation.id
                  ? 'bg-pink-500/20 border-l-4 border-pink-500'
                  : 'hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <UserAvatar
                    photoURL={conversation.contact.avatar}
                    displayName={conversation.contact.name}
                    size="md"
                    showGraduationCap={true}
                  />
                  {conversation.contact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold truncate">{conversation.contact.name}</h3>
                    <span className="text-xs text-gray-400">{conversation.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Painel Central-Direito (Janela de Chat) */}
      <div className="flex-1 bg-gray-900 flex flex-col">
        {currentConversation ? (
          <>
            {/* Cabeçalho do Chat com animação */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800 relative overflow-hidden">
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent animate-shimmer"></div>
              
              <div className="flex items-center space-x-3 relative z-10">
                <div className="relative">
                  <UserAvatar
                    photoURL={currentContact?.avatar}
                    displayName={currentContact?.name}
                    size="md"
                    showGraduationCap={true}
                  />
                  {currentContact?.isOnline && (
                    <>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full animate-ping opacity-75"></div>
                    </>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{currentContact?.name}</h3>
                    <span className="text-lg animate-bounce" style={{ animationDuration: '2s' }}>💬</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-sm text-green-400">{currentContact?.status || 'Online'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 relative z-10">
                <button 
                  onClick={() => {
                    // TODO: Implementar chamada de vídeo
                    console.log('Iniciar chamada de vídeo com', currentContact?.name);
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-all hover:scale-110 relative group"
                  title="Chamada de vídeo"
                >
                  <Video className="h-5 w-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
                  <div className="absolute inset-0 rounded-lg bg-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                </button>
                <button 
                  onClick={() => {
                    // TODO: Implementar chamada de áudio
                    console.log('Iniciar chamada de áudio com', currentContact?.name);
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-all hover:scale-110 relative group"
                  title="Chamada de áudio"
                >
                  <Phone className="h-5 w-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
                  <div className="absolute inset-0 rounded-lg bg-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                </button>
              </div>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((message) => {
                const isOwn = message.senderId === currentUser?.uid;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                  >
                    {!isOwn && (
                      <UserAvatar
                        photoURL={message.senderAvatar}
                        displayName={message.senderName}
                        size="sm"
                        showGraduationCap={true}
                      />
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 ${
                        isOwn ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                        {isOwn && (
                          <div>
                            {message.isRead ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {isOwn && (
                      <UserAvatar
                        photoURL={userProfile?.photoURL}
                        displayName={userProfile?.displayName}
                        size="sm"
                        showGraduationCap={true}
                      />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Barra de Entrada */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <button 
                  type="button" 
                  onClick={() => {
                    // TODO: Implementar seletor de emoji
                    console.log('Abrir seletor de emoji');
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Emoji"
                >
                  <Smile className="h-5 w-5 text-gray-400" />
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    // TODO: Implementar upload de arquivo
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*,application/pdf,.doc,.docx';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        console.log('Arquivo selecionado:', file.name);
                        // TODO: Enviar arquivo
                      }
                    };
                    input.click();
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Anexar arquivo"
                >
                  <Paperclip className="h-5 w-5 text-gray-400" />
                </button>
                
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message here"
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative group hover:scale-110"
                >
                  <Send className="h-5 w-5 group-hover:animate-bounce" />
                  {newMessage.trim() && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 opacity-50 animate-pulse"></div>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="text-center relative">
              {/* Ícone animado */}
              <div className="relative mx-auto mb-6 w-24 h-24">
                <div className="absolute inset-0 flex items-center justify-center">
                  <MessageCircle className="h-20 w-20 text-pink-500/30 animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MessageCircle className="h-16 w-16 text-pink-400/50 animate-bounce" style={{ animationDuration: '2s' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MessageCircle className="h-12 w-12 text-pink-500 animate-pulse" />
                </div>
                {/* Partículas ao redor */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <Sparkles className="h-4 w-4 text-pink-400/50 animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
                </div>
                <div className="absolute bottom-0 right-0">
                  <Zap className="h-4 w-4 text-purple-400/50 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
                </div>
                <div className="absolute bottom-0 left-0">
                  <Sparkles className="h-4 w-4 text-blue-400/50 animate-bounce" style={{ animationDuration: '1.8s', animationDelay: '0.9s' }} />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2 relative">
                Selecione uma conversa
                <span className="absolute -top-1 -right-8 text-lg animate-bounce" style={{ animationDuration: '1.5s' }}>💬</span>
              </h3>
              <p className="text-gray-400">
                Escolha uma conversa da lista para começar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Painel Direito (Informações do Contato) */}
      {currentContact && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Cabeçalho Superior */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Q Search here"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Notificações"
              >
                <Bell className="h-5 w-5 text-gray-400" />
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Configurações"
              >
                <Settings className="h-5 w-5 text-gray-400" />
              </button>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <UserAvatar
                    photoURL={userProfile?.photoURL}
                    displayName={userProfile?.displayName}
                    size="sm"
                    showGraduationCap={true}
                  />
                  <span className="text-white text-sm">{userProfile?.displayName || 'Usuário'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-2 z-50">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/dashboard');
                      }}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2 border-gray-600" />
                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        await logoutUser();
                        navigate('/');
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-600 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Perfil do Contato */}
          <div className="p-6 border-b border-gray-700 text-center">
            <UserAvatar
              photoURL={currentContact.avatar}
              displayName={currentContact.name}
              size="xl"
              showGraduationCap={true}
            />
            <h3 className="text-white font-bold text-lg mt-4">{currentContact.name}</h3>
            {currentContact.role && (
              <span className="inline-block mt-2 px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">
                {currentContact.role}
              </span>
            )}
          </div>

          {/* Informações Pessoais */}
          <div className="p-4 border-b border-gray-700 space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-white text-sm">{currentContact.email}</p>
            </div>
            {currentContact.phone && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Phone</p>
                <p className="text-white text-sm">{currentContact.phone}</p>
              </div>
            )}
            {currentContact.workHours && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Work Hours</p>
                <p className="text-white text-sm">{currentContact.workHours}</p>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="p-4 space-y-3">
            <button 
              onClick={() => {
                // TODO: Implementar adicionar tag ao contato
                const tag = prompt('Digite uma tag para este contato:');
                if (tag && tag.trim()) {
                  console.log('Adicionar tag:', tag, 'para', currentContact?.name);
                  // TODO: Salvar tag no Firebase
                }
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-white text-sm">Add Tag</span>
            </button>
            
            <button 
              onClick={() => {
                // TODO: Implementar avaliação do chat
                const rating = prompt('Avalie esta conversa (1-5 estrelas):');
                if (rating && !isNaN(Number(rating)) && Number(rating) >= 1 && Number(rating) <= 5) {
                  console.log('Avaliação:', rating, 'estrelas para', currentContact?.name);
                  // TODO: Salvar avaliação no Firebase
                }
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Star className="h-4 w-4 text-gray-400" />
              <span className="text-white text-sm">Chat Rating</span>
            </button>
            
            <button 
              onClick={() => {
                // Navegar para o perfil do usuário
                if (currentContact?.id) {
                  navigate(`/user/${currentContact.id}`);
                }
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-white text-sm">View Pages</span>
            </button>
            
            {currentContact.sharedDocuments && currentContact.sharedDocuments.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Shared Document</p>
                <div className="space-y-2">
                  {currentContact.sharedDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center space-x-2 p-2 bg-gray-700 rounded-lg">
                      <File className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-white text-sm">{doc.name}</p>
                        <p className="text-gray-400 text-xs">{doc.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Nova Conversa / Busca de Usuários */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Cabeçalho */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Nova Conversa</h2>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setUserSearchTerm('');
                  setSearchResults([]);
                  setShowFollowers(false);
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Abas */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => {
                  setShowFollowers(false);
                  setUserSearchTerm('');
                  setSearchResults([]);
                }}
                className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                  !showFollowers
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Buscar Usuários
              </button>
              <button
                onClick={() => {
                  setShowFollowers(true);
                  loadFollowers();
                  setUserSearchTerm('');
                  setSearchResults([]);
                }}
                className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                  showFollowers
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Quem Te Segue
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6">
              {!showFollowers ? (
                // Busca de Usuários
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nome..."
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  {searchingUsers && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                      <p className="text-gray-400 mt-2">Buscando...</p>
                    </div>
                  )}

                  {!searchingUsers && userSearchTerm && searchResults.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Nenhum usuário encontrado</p>
                    </div>
                  )}

                  {!searchingUsers && searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <button
                          key={user.uid}
                          onClick={() => handleStartChat(user.uid)}
                          className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-3 transition-colors"
                        >
                          <UserAvatar
                            photoURL={user.avatar}
                            displayName={user.name}
                            size="md"
                            showGraduationCap={true}
                          />
                          <div className="flex-1 text-left">
                            <h3 className="text-white font-semibold">{user.name}</h3>
                            <p className="text-gray-400 text-sm">{user.course} - {user.university}</p>
                          </div>
                          <MessageCircle className="h-5 w-5 text-pink-500" />
                        </button>
                      ))}
                    </div>
                  )}

                  {!userSearchTerm && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Digite um nome para buscar usuários</p>
                    </div>
                  )}
                </div>
              ) : (
                // Quem Te Segue
                <div className="space-y-4">
                  {loadingFollowers ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                      <p className="text-gray-400 mt-2">Carregando...</p>
                    </div>
                  ) : followers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Ninguém te segue ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {followers.map((follower) => (
                        <button
                          key={follower.uid}
                          onClick={() => handleStartChat(follower.uid)}
                          className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-3 transition-colors"
                        >
                          <UserAvatar
                            photoURL={follower.avatar}
                            displayName={follower.name}
                            size="md"
                            showGraduationCap={true}
                          />
                          <div className="flex-1 text-left">
                            <h3 className="text-white font-semibold">{follower.name}</h3>
                            <p className="text-gray-400 text-sm">{follower.course} - {follower.university}</p>
                          </div>
                          <MessageCircle className="h-5 w-5 text-pink-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
