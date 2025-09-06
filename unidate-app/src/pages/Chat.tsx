import React, { useState } from 'react';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Smile, 
  Paperclip, 
  Send,
  MessageCircle,
  Check,
  CheckCheck
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
  type: 'text' | 'image' | 'event';
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  avatar: string;
  messages: Message[];
}

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      name: 'Ana Silva',
      lastMessage: 'Oi! Como foi a prova de ontem?',
      timestamp: '2 min',
      unreadCount: 2,
      isOnline: true,
      avatar: '/api/placeholder/40/40',
      messages: [
        {
          id: '1',
          text: 'Oi! Como foi a prova de ontem?',
          timestamp: '14:30',
          isOwn: false,
          isRead: true,
          type: 'text'
        },
        {
          id: '2',
          text: 'Foi bem! Consegui resolver a maioria das questões. E você?',
          timestamp: '14:32',
          isOwn: true,
          isRead: true,
          type: 'text'
        },
        {
          id: '3',
          text: 'Também foi ok, mas a última questão me pegou 😅',
          timestamp: '14:35',
          isOwn: false,
          isRead: true,
          type: 'text'
        },
        {
          id: '4',
          text: 'Quer estudar juntos para a próxima?',
          timestamp: '14:36',
          isOwn: false,
          isRead: false,
          type: 'text'
        }
      ]
    },
    {
      id: '2',
      name: 'Carlos Santos',
      lastMessage: 'Obrigado pela ajuda com o projeto!',
      timestamp: '1 hora',
      unreadCount: 0,
      isOnline: false,
      avatar: '/api/placeholder/40/40',
      messages: [
        {
          id: '1',
          text: 'Obrigado pela ajuda com o projeto!',
          timestamp: '13:45',
          isOwn: false,
          isRead: true,
          type: 'text'
        },
        {
          id: '2',
          text: 'De nada! Foi um prazer ajudar. Se precisar de mais alguma coisa, é só chamar!',
          timestamp: '13:47',
          isOwn: true,
          isRead: true,
          type: 'text'
        }
      ]
    },
    {
      id: '3',
      name: 'Grupo de Estudos - Engenharia',
      lastMessage: 'Mariana: Próxima reunião será na sexta às 16h',
      timestamp: '3 horas',
      unreadCount: 5,
      isOnline: false,
      avatar: '/api/placeholder/40/40',
      messages: [
        {
          id: '1',
          text: 'Próxima reunião será na sexta às 16h',
          timestamp: '11:30',
          isOwn: false,
          isRead: false,
          type: 'text'
        }
      ]
    }
  ]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentChat = chats.find(chat => chat.id === selectedChat);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      isRead: false,
      type: 'text'
    };

    setChats(chats.map(chat => 
      chat.id === selectedChat 
        ? { 
            ...chat, 
            messages: [...chat.messages, message],
            lastMessage: newMessage,
            timestamp: 'Agora'
          }
        : chat
    ));

    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return timestamp;
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return messageTime.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <div className="card h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Conversas</h1>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                      selectedChat === chat.id ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {chat.name.charAt(0)}
                          </span>
                        </div>
                        {chat.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                          <span className="text-sm text-gray-500">{chat.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                          {chat.unreadCount > 0 && (
                            <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {currentChat ? (
              <div className="card h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {currentChat.name.charAt(0)}
                        </span>
                      </div>
                      {currentChat.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{currentChat.name}</h3>
                      <p className="text-sm text-gray-500">
                        {currentChat.isOnline ? 'Online' : 'Visto recentemente'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <Video className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.isOwn
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-1 ${
                          message.isOwn ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{message.timestamp}</span>
                          {message.isOwn && (
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
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <Paperclip className="h-5 w-5 text-gray-600" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite uma mensagem..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                      />
                    </div>
                    
                    <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <Smile className="h-5 w-5 text-gray-600" />
                    </button>
                    
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="card h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-gray-600">
                    Escolha uma conversa da lista para começar a conversar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
