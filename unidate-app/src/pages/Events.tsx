import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Filter,
  Search,
  Star,
  Heart,
  Share2,
  CheckCircle,
  X,
  AlertCircle,
  MessageCircle,
  User,
  Crown,
  Zap,
  Eye,
  EyeOff,
  Settings,
  Edit,
  Trash2,
  Send,
  ThumbsUp,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  organizerType: 'user' | 'group' | 'official';
  organizerId: string;
  attendees: number;
  maxAttendees?: number;
  category: string;
  image: string;
  isLiked: boolean;
  isAttending: boolean;
  rsvpStatus: 'going' | 'maybe' | 'not_going' | null;
  isPublic: boolean;
  isOfficial: boolean;
  isPromoted: boolean;
  attendeesList: Attendee[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface Attendee {
  id: string;
  name: string;
  avatar: string;
  rsvpStatus: 'going' | 'maybe' | 'not_going';
  joinedAt: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'official' | 'community' | 'my-events'>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar eventos reais
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        // TODO: Implementar carregamento de eventos do Firebase
        // Por enquanto, deixar vazio para mostrar apenas eventos reais
        setEvents([]);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const tabs = [
    { id: 'upcoming', name: 'Próximos Eventos', icon: Calendar, description: 'Todos os eventos em ordem cronológica' },
    { id: 'official', name: 'Eventos Oficiais', icon: Crown, description: 'Eventos de entidades verificadas' },
    { id: 'community', name: 'Eventos da Galera', icon: Users, description: 'Festa, encontros e eventos dos alunos' },
    { id: 'my-events', name: 'Meus Eventos', icon: User, description: 'Eventos que você confirmou presença' }
  ];

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'social', name: 'Social' },
    { id: 'academic', name: 'Acadêmico' },
    { id: 'sports', name: 'Esportes' },
    { id: 'cultural', name: 'Cultural' }
  ];

  const handleLike = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, isLiked: !event.isLiked }
        : event
    ));
  };

  const handleRSVP = (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            rsvpStatus: status,
            isAttending: status === 'going',
            attendees: status === 'going' ? event.attendees + 1 : 
                      event.rsvpStatus === 'going' ? event.attendees - 1 : event.attendees
          }
        : event
    ));
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const getFilteredEvents = () => {
    let filtered = events;

    // Filter by tab
    switch (activeTab) {
      case 'official':
        filtered = filtered.filter(event => event.isOfficial);
        break;
      case 'community':
        filtered = filtered.filter(event => !event.isOfficial);
        break;
      case 'my-events':
        filtered = filtered.filter(event => event.rsvpStatus === 'going' || event.rsvpStatus === 'maybe');
        break;
      default: // upcoming
        // Show all events
        break;
    }

    // Filter by search and category
    return filtered.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
              <p className="text-gray-600">O Calendário Definitivo do Campus - Agenda social unificada</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as 'upcoming' | 'official' | 'community' | 'my-events');
                  setSelectedCategory('all');
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{tab.name}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Create Event Button */}
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Criar Evento</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              {/* Event Image */}
              <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-white opacity-50" />
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  {event.isPromoted && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>Destaque</span>
                    </span>
                  )}
                  {event.isOfficial && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                      <Crown className="h-3 w-3" />
                      <span>Oficial</span>
                    </span>
                  )}
                </div>
                <div className="absolute top-4 left-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(event.id);
                    }}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      event.isLiked 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${event.isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{event.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.category === 'social' ? 'bg-pink-100 text-pink-700' :
                    event.category === 'academic' ? 'bg-blue-100 text-blue-700' :
                    event.category === 'sports' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {categories.find(c => c.id === event.category)?.name}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                {/* Organizer Info */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {event.organizerType === 'official' ? 'O' : 
                       event.organizerType === 'group' ? 'G' : 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    Organizado por {event.organizer}
                  </span>
                </div>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''} participantes</span>
                  </div>
                </div>

                {/* RSVP Status */}
                {event.rsvpStatus && (
                  <div className="mb-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      event.rsvpStatus === 'going' ? 'bg-green-100 text-green-700' :
                      event.rsvpStatus === 'maybe' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <CheckCircle className="h-3 w-3" />
                      <span>
                        {event.rsvpStatus === 'going' ? 'Vou!' :
                         event.rsvpStatus === 'maybe' ? 'Talvez' : 'Não vou'}
                      </span>
                    </span>
                  </div>
                )}

                {/* Event Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRSVP(event.id, 'going');
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors duration-200 text-sm ${
                        event.rsvpStatus === 'going'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                      }`}
                    >
                      Vou!
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRSVP(event.id, 'maybe');
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors duration-200 text-sm ${
                        event.rsvpStatus === 'maybe'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
                      }`}
                    >
                      Talvez
                    </button>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle share
                    }}
                    className="p-2 text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-600 mb-6">Tente ajustar os filtros ou criar um novo evento.</p>
            <button className="btn-primary">
              Criar Primeiro Evento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
