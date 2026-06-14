import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Users,
  Sparkles,
  MapPin,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  Star,
  UserPlus,
  Search,
  Filter,
  ChevronRight,
  Zap,
  Music,
  Code,
  Palette,
  Coffee,
  Gamepad2,
  Camera,
  Trophy,
  Globe,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EventsService } from '../services/eventsService';
import { supabase } from '../supabaseClient';
import { useUniDateToast } from '../components/UI/Toast';

interface DiscoverUser {
  id: string;
  displayName: string;
  photoURL: string;
  university: string;
  course: string;
  year: number;
  bio: string;
  interests: string[];
  isVerified: boolean;
}

interface DiscoverEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  category: string;
  attendees: number;
  color: string;
  icon: string;
}

const INTEREST_ICONS: Record<string, React.ReactNode> = {
  música: <Music className="h-3 w-3" />,
  programação: <Code className="h-3 w-3" />,
  arte: <Palette className="h-3 w-3" />,
  café: <Coffee className="h-3 w-3" />,
  games: <Gamepad2 className="h-3 w-3" />,
  fotografia: <Camera className="h-3 w-3" />,
  esportes: <Trophy className="h-3 w-3" />,
  idiomas: <Globe className="h-3 w-3" />,
};

const MOCK_EVENTS: DiscoverEvent[] = [
  {
    id: '1',
    title: 'Hackathon UniDate 2025',
    description: 'Compete com estudantes e crie projetos incríveis em 24h',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    location: 'Auditório Principal',
    category: 'Tech',
    attendees: 128,
    color: 'from-violet-500 to-purple-600',
    icon: '💻',
  },
  {
    id: '2',
    title: 'Festa de Boas-Vindas Calouros',
    description: 'Venha conhecer seus novos colegas e fazer amigos',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    location: 'Quadra Central',
    category: 'Social',
    attendees: 350,
    color: 'from-pink-500 to-rose-500',
    icon: '🎉',
  },
  {
    id: '3',
    title: 'Workshop de Design UI/UX',
    description: 'Aprenda princípios de design com profissionais do mercado',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    location: 'Lab de Informática',
    category: 'Workshop',
    attendees: 45,
    color: 'from-blue-500 to-cyan-500',
    icon: '🎨',
  },
  {
    id: '4',
    title: 'Sarau Literário',
    description: 'Poesia, prosa e muito sentimento num encontro cultural',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    location: 'Biblioteca Central',
    category: 'Cultura',
    attendees: 60,
    color: 'from-amber-500 to-orange-500',
    icon: '📚',
  },
  {
    id: '5',
    title: 'Torneio de Futsal',
    description: 'Forme seu time e compete pelo campeonato da universidade',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    location: 'Ginásio Esportivo',
    category: 'Esportes',
    attendees: 200,
    color: 'from-green-500 to-emerald-500',
    icon: '⚽',
  },
];

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-pink-500 to-rose-500',
  'from-blue-500 to-cyan-500',
  'from-amber-500 to-orange-500',
  'from-green-500 to-emerald-500',
  'from-indigo-500 to-blue-600',
  'from-red-500 to-pink-600',
  'from-teal-500 to-cyan-600',
];

const UserCard: React.FC<{
  user: DiscoverUser;
  index: number;
  onConnect: (userId: string) => void;
  connected: boolean;
}> = ({ user, index, onConnect, connected }) => {
  const [hovered, setHovered] = useState(false);
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div
      className={`
        relative bg-white rounded-3xl overflow-hidden border border-gray-100
        transition-all duration-500 cursor-pointer group
        ${hovered ? 'shadow-2xl shadow-purple-100 -translate-y-2 border-purple-200' : 'shadow-md hover:shadow-xl'}
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Card top gradient */}
      <div className={`h-24 bg-gradient-to-br ${avatarColor} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-2 right-4 w-16 h-16 rounded-full bg-white opacity-20"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white opacity-10"></div>
        </div>
        {user.isVerified && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-2 py-0.5 flex items-center space-x-1">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-amber-600">Verificado</span>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2">
        <div className={`w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br ${avatarColor} flex items-center justify-center`}>
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">
              {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
      </div>

      {/* Card content */}
      <div className="pt-14 px-5 pb-5 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-0.5 truncate">{user.displayName}</h3>

        {user.course && (
          <p className="text-sm text-purple-600 font-medium mb-1 truncate">{user.course}</p>
        )}

        {user.university && (
          <div className="flex items-center justify-center space-x-1 text-gray-500 text-xs mb-3">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{user.university}</span>
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{user.bio}</p>
        )}

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mb-4">
            {user.interests.slice(0, 3).map((interest, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
              >
                {INTEREST_ICONS[interest.toLowerCase()] || <Sparkles className="h-3 w-3" />}
                <span>#{interest}</span>
              </span>
            ))}
            {user.interests.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                +{user.interests.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Year badge */}
        {user.year && (
          <div className="flex items-center justify-center space-x-1 mb-4">
            <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Ingresso {user.year}</span>
          </div>
        )}

        {/* Connect button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConnect(user.id);
          }}
          className={`
            w-full py-2.5 rounded-2xl font-semibold text-sm transition-all duration-300
            flex items-center justify-center space-x-2
            ${connected
              ? 'bg-green-50 text-green-600 border-2 border-green-200 cursor-default'
              : `bg-gradient-to-r ${avatarColor} text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95`
            }
          `}
        >
          {connected ? (
            <>
              <Heart className="h-4 w-4 fill-green-500" />
              <span>Conectado!</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Conectar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const EventCard: React.FC<{ event: any; index: number }> = ({ event, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const eventDate = new Date(event.date);
  const daysDiff = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl transition-all duration-400 cursor-pointer
        ${isHovered ? 'shadow-xl -translate-x-1 scale-[1.01]' : 'shadow-sm'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: `slideInRight 0.5s ease forwards ${index * 0.1}s`,
        opacity: 0,
      }}
    >
      <div className={`bg-gradient-to-r ${event.color} p-4 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-lg">{event.icon}</span>
              <span className="text-xs font-semibold bg-white bg-opacity-25 rounded-full px-2 py-0.5">
                {event.category}
              </span>
            </div>
            <h4 className="font-bold text-sm leading-tight mb-1 truncate">{event.title}</h4>
            <p className="text-xs opacity-85 line-clamp-2 leading-relaxed mb-2">{event.description}</p>

            <div className="flex items-center justify-between text-xs opacity-90">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-20">{event.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{event.attendees}</span>
              </div>
            </div>
          </div>

          {/* Date bubble */}
          <div className="ml-3 flex-shrink-0 bg-white bg-opacity-20 rounded-xl p-2 text-center min-w-12">
            <div className="text-xl font-black leading-none">{eventDate.getDate()}</div>
            <div className="text-xs font-medium opacity-90">
              {eventDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}
            </div>
            <div className="text-xs bg-white bg-opacity-30 rounded-lg px-1 mt-1 font-bold">
              {daysDiff === 0 ? 'Hoje' : daysDiff === 1 ? 'Amanhã' : `${daysDiff}d`}
            </div>
          </div>
        </div>
      </div>

      {/* Animated bottom bar */}
      <div
        className={`h-0.5 bg-gradient-to-r ${event.color} transition-all duration-500 ${isHovered ? 'w-full' : 'w-0'}`}
      />
    </div>
  );
};

const Discover: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const evs = await EventsService.getEvents();
        setEvents(evs);
      } catch (err) {
        console.error('Erro ao buscar eventos:', err);
      }
    };
    fetchEvents();
  }, []);

  const CATEGORIES = ['Todos', 'Mesma Uni', 'Mesmo Curso', 'Interesses'];

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, photo_url, university, course, year, bio, interests, is_verified')
        .neq('id', currentUser?.uid || '')
        .limit(50);

      if (error) throw error;

      const mapped: DiscoverUser[] = (data || []).map((p: any) => ({
        id: p.id,
        displayName: p.display_name || 'Usuário',
        photoURL: p.photo_url || '',
        university: p.university || '',
        course: p.course || '',
        year: p.year || 0,
        bio: p.bio || '',
        interests: p.interests || [],
        isVerified: p.is_verified || false,
      }));

      setUsers(mapped);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleConnect = async (targetUserId: string) => {
    if (!currentUser?.uid) {
      showError('Você precisa estar logado!');
      return;
    }
    try {
      await supabase.from('matches').upsert({
        user1_id: currentUser.uid,
        user2_id: targetUserId,
        created_at: new Date().toISOString(),
      });
      setConnected((prev) => new Set(Array.from(prev).concat(targetUserId)));
      showSuccess('Conexão enviada! 🎉');
    } catch (err) {
      console.error('Erro ao conectar:', err);
      showError('Não foi possível conectar agora.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.university.toLowerCase().includes(searchQuery.toLowerCase());

    const currentProfile = null; // We don't filter by current user's profile for now

    if (activeCategory === 'Mesmo Curso' && filterCourse) {
      return matchesSearch && u.course.toLowerCase().includes(filterCourse.toLowerCase());
    }

    return matchesSearch;
  });

  const visibleUsers = filteredUsers.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        .card-animate {
          animation: slideInUp 0.5s ease forwards;
          opacity: 0;
        }
        .shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8" style={{ animation: 'slideInUp 0.4s ease forwards' }}>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Descobrir Pessoas
            </h1>
          </div>
          <p className="text-gray-500 text-lg ml-14">
            Conecte-se com estudantes incríveis da sua universidade
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column — Users */}
          <div className="flex-1 min-w-0">
            {/* Search + Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6" style={{ animation: 'slideInUp 0.5s ease forwards' }}>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, curso ou universidade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 shadow-sm"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar por curso..."
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full sm:w-52 pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide" style={{ animation: 'slideInUp 0.55s ease forwards' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200 scale-105'
                      : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-purple-200 hover:text-purple-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? 'Carregando...' : (
                  <>
                    <span className="font-bold text-purple-600">{filteredUsers.length}</span> estudantes encontrados
                  </>
                )}
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Atualizado agora</span>
              </div>
            </div>

            {/* User cards grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100">
                    <div className="h-24 shimmer" />
                    <div className="pt-14 px-5 pb-5 text-center">
                      <div className="h-5 w-32 mx-auto rounded-full shimmer mb-2" />
                      <div className="h-4 w-24 mx-auto rounded-full shimmer mb-4" />
                      <div className="flex justify-center gap-2 mb-4">
                        {[1, 2].map((j) => (
                          <div key={j} className="h-5 w-16 rounded-full shimmer" />
                        ))}
                      </div>
                      <div className="h-10 w-full rounded-2xl shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-12 w-12 text-purple-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum estudante encontrado</h3>
                <p className="text-gray-400 text-sm">
                  {searchQuery ? 'Tente outro termo de busca' : 'Seja o primeiro da sua turma!'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {visibleUsers.map((user, i) => (
                    <div
                      key={user.id}
                      className="card-animate"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <UserCard
                        user={user}
                        index={i}
                        onConnect={handleConnect}
                        connected={connected.has(user.id)}
                      />
                    </div>
                  ))}
                </div>

                {visibleCount < filteredUsers.length && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      className="inline-flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95"
                    >
                      <span>Ver mais pessoas</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column — Events */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-24">
              {/* Events header */}
              <div
                className="flex items-center justify-between mb-5"
                style={{ animation: 'slideInRight 0.4s ease forwards' }}
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">Próximos Eventos</h2>
                </div>
                <span className="flex items-center space-x-1 text-xs text-purple-600 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span>Ao Vivo</span>
                </span>
              </div>

              {/* Live pulse banner */}
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 mb-5 text-white relative overflow-hidden"
                style={{ animation: 'slideInRight 0.45s ease forwards', opacity: 0 }}
              >
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white" style={{ transform: 'translate(50%, -50%)' }} />
                </div>
                <div className="relative">
                  <div className="flex items-center space-x-2 mb-1">
                    <Zap className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm font-bold">Acontecendo esta semana!</span>
                  </div>
                  <p className="text-xs opacity-85">
                    {events.length} eventos esperando por você. Não perca!
                  </p>
                </div>
              </div>

              {/* Event list */}
              <div className="space-y-3">
                {events.map((event, i) => (
                  <EventCard key={event.id} event={event} index={i} />
                ))}
              </div>

              {/* Bottom CTA */}
              <div
                className="mt-5 p-4 bg-white rounded-2xl shadow-sm border border-purple-100 text-center"
                style={{ animation: `slideInRight 0.8s ease forwards`, opacity: 0 }}
              >
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Crie seu próprio evento!</p>
                <p className="text-xs text-gray-500 mb-3">
                  Reúna sua galera e organize algo incrível
                </p>
                <button className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                  Criar Evento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
