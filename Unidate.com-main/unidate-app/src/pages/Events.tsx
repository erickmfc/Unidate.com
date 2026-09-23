import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Filter,
  Search,
  CheckCircle,
  X,
  Share2,
  Crown,
  User,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EventsService, Event } from '../services/eventsService';
import { logEventActivity } from '../services/activityLogService';
import { useUniDateToast } from '../components/UI/Toast';

const CATEGORY_STYLES: Record<string, { color: string; icon: string }> = {
  tech: { color: 'from-violet-500 to-purple-600', icon: '💻' },
  social: { color: 'from-pink-500 to-rose-500', icon: '🎉' },
  workshop: { color: 'from-blue-500 to-cyan-500', icon: '🎨' },
  cultural: { color: 'from-amber-500 to-orange-500', icon: '📚' },
  sports: { color: 'from-green-500 to-emerald-500', icon: '⚽' },
  academic: { color: 'from-indigo-500 to-blue-600', icon: '🎓' }
};

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'official' | 'community' | 'my-events'>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { userProfile, currentUser } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State para criar evento
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'social',
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await EventsService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      showError('Não foi possível carregar os eventos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const tabs = [
    { id: 'upcoming', name: 'Próximos Eventos', icon: Calendar, description: 'Todos os eventos em ordem cronológica' },
    { id: 'official', name: 'Eventos Oficiais', icon: Crown, description: 'Eventos de entidades verificadas' },
    { id: 'community', name: 'Eventos da Galera', icon: Users, description: 'Festa, encontros e eventos dos alunos' },
    { id: 'my-events', name: 'Confirmados', icon: User, description: 'Eventos que você confirmou presença' }
  ];

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'social', name: 'Social' },
    { id: 'academic', name: 'Acadêmico' },
    { id: 'sports', name: 'Esportes' },
    { id: 'cultural', name: 'Cultural' },
    { id: 'tech', name: 'Tech' }
  ];

  const handleRSVP = async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    try {
      const isAttending = status === 'going';
      const prevEvent = events.find(e => e.id === eventId);
      const isAttendingPrev = prevEvent?.rsvpStatus === 'going';
      
      const newAttendees = await EventsService.toggleRSVP(eventId, isAttendingPrev);
      const nextStatus = status === prevEvent?.rsvpStatus ? null : status;

      if (currentUser?.id) {
        const action = nextStatus === 'going'
          ? 'rsvp_going'
          : nextStatus === 'maybe'
            ? 'rsvp_maybe'
            : 'rsvp_cancelled';
        void logEventActivity(currentUser.id, eventId, action);
      }
      
      setEvents(events.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              rsvpStatus: nextStatus,
              isAttending: status === 'going' ? !isAttendingPrev : false,
              attendees: newAttendees
            }
          : event
      ));
      
      showSuccess(status === 'going' ? 'Presença confirmada!' : 'Interesse salvo!');
    } catch (e) {
      console.error(e);
      showError('Erro ao atualizar sua presença.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location) {
      showError('Por favor preencha os campos obrigatórios.');
      return;
    }

    try {
      const catStyle = CATEGORY_STYLES[formData.category] || { color: 'from-purple-500 to-pink-500', icon: '📅' };
      const eventDateTime = new Date(`${formData.date}T${formData.time || '12:00'}:00`).toISOString();
      
      const newEventData = {
        title: formData.title,
        description: formData.description,
        date: eventDateTime,
        location: formData.location,
        category: formData.category.charAt(0).toUpperCase() + formData.category.slice(1),
        attendees: 1,
        color: catStyle.color,
        icon: catStyle.icon,
        organizer: userProfile?.displayName || 'Usuário',
        organizerType: (userProfile?.isVerified ? 'official' : 'user') as any,
        isOfficial: userProfile?.isVerified || false,
        isPublic: true,
        rsvpStatus: 'going' as const,
        isAttending: true
      };

      const createdEvent = await EventsService.createEvent(newEventData);
      if (currentUser?.id) {
        void logEventActivity(currentUser.id, createdEvent.id, 'created');
      }
      showSuccess('Evento criado com sucesso!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: 'social',
      });
      loadEvents();
    } catch (error) {
      console.error(error);
      showError('Erro ao criar evento.');
    }
  };

  const getFilteredEvents = () => {
    let filtered = events;

    // Filter by tab
    if (activeTab === 'official') {
      filtered = filtered.filter(event => event.isOfficial || event.organizerType === 'official');
    } else if (activeTab === 'community') {
      filtered = filtered.filter(event => !event.isOfficial && event.organizerType !== 'official');
    } else if (activeTab === 'my-events') {
      filtered = filtered.filter(event => event.rsvpStatus === 'going' || event.isAttending);
    }

    // Filter by category selection
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search query
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) || 
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Eventos do Campus</h1>
            <p className="text-slate-500 mt-1">Fique por dentro das festas, hackathons e encontros acadêmicos</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-indigo-100 transition-all duration-300 transform hover:scale-102"
          >
            <Plus className="h-5 w-5" />
            <span>Criar Evento</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 mb-8 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-3 px-6 py-3.5 rounded-2xl transition-all duration-300 text-sm font-semibold ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                  <div className="text-left">
                    <div>{tab.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar eventos por título, local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm text-slate-700"
              />
            </div>

            {/* Categories filters */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eventDate = new Date(event.date);
              const daysDiff = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              
              return (
                <div 
                  key={event.id}
                  className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Event Banner Color block */}
                    <div className={`bg-gradient-to-r ${event.color || 'from-indigo-500 to-purple-600'} p-5 text-white relative h-28 flex flex-col justify-between`}>
                      <span className="text-3xl filter drop-shadow-sm">{event.icon || '📅'}</span>
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider">
                          {event.category}
                        </span>
                        
                        {/* Days left badge */}
                        <span className="text-xs font-semibold bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                          {daysDiff <= 0 ? 'Hoje' : daysDiff === 1 ? 'Amanhã' : `${daysDiff} dias`}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-extrabold text-slate-800 text-lg leading-snug group-hover:text-indigo-600 transition-colors duration-200">
                        {event.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-3">
                        {event.description}
                      </p>

                      <div className="mt-4 pt-4 border-t border-slate-50 space-y-2.5 text-xs text-slate-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{eventDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>{eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span>{event.attendees} participantes</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <div className="flex space-x-2 w-full">
                      <button
                        onClick={() => handleRSVP(event.id, 'going')}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                          event.rsvpStatus === 'going'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {event.rsvpStatus === 'going' ? 'Confirmado! ✓' : 'Eu vou! 🎉'}
                      </button>
                      
                      <button
                        onClick={() => handleRSVP(event.id, 'maybe')}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                          event.rsvpStatus === 'maybe'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {event.rsvpStatus === 'maybe' ? 'Talvez ✓' : 'Interesse'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Nenhum evento encontrado</h3>
            <p className="text-slate-400 text-xs mt-1 mb-6">Tente ajustar seus filtros de busca ou categoria.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-sm"
            >
              Criar Novo Evento
            </button>
          </div>
        )}

        {/* Criar Evento Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 transform transition-all animate-scaleUp">
              {/* Header */}
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">Criar Novo Evento</h3>
                  <p className="text-xs text-slate-400">Reúna a galera organizando algo legal</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Título do Evento *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Integração Medicina UFRJ 2026"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do evento, atrações, regras..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Horário *</label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Local do Evento *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Arena UFRJ ou Lab de Inovação"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700"
                  >
                    <option value="social">Social / Festa</option>
                    <option value="academic">Acadêmico / Aula</option>
                    <option value="sports">Esportes</option>
                    <option value="cultural">Cultural / Sarau</option>
                    <option value="tech">Tech / Hackathon</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-50 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 px-4 border border-slate-100 text-slate-500 rounded-xl hover:bg-slate-50 font-bold text-sm transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                  >
                    Criar Evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
