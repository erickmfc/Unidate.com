import { supabase } from '../supabaseClient';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO String
  location: string;
  category: string;
  attendees: number;
  color: string;
  icon: string;
  organizer: string;
  organizerType: 'user' | 'group' | 'official';
  organizerId?: string;
  isLiked?: boolean;
  isAttending?: boolean;
  rsvpStatus?: 'going' | 'maybe' | 'not_going' | null;
  isPublic?: boolean;
  isOfficial?: boolean;
  isPromoted?: boolean;
  createdAt?: string;
}

const DEFAULT_MOCK_EVENTS = [
  {
    id: 'mock_event_1',
    title: 'Hackathon UniDate 2026',
    description: 'Compete com estudantes e crie projetos incríveis em 24h',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Auditório Principal',
    category: 'Tech',
    attendees: 128,
    color: 'from-violet-500 to-purple-600',
    icon: '💻',
    organizer: 'UniDate Oficial',
    organizerType: 'official' as const,
    isOfficial: true,
    isPublic: true,
    isPromoted: true
  },
  {
    id: 'mock_event_2',
    title: 'Festa de Boas-Vindas Calouros',
    description: 'Venha conhecer seus novos colegas e fazer amigos',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Quadra Central',
    category: 'Social',
    attendees: 350,
    color: 'from-pink-500 to-rose-500',
    icon: '🎉',
    organizer: 'DCE UniDate',
    organizerType: 'official' as const,
    isOfficial: true,
    isPublic: true,
    isPromoted: true
  },
  {
    id: 'mock_event_3',
    title: 'Workshop de Design UI/UX',
    description: 'Aprenda princípios de design com profissionais do mercado',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Lab de Informática',
    category: 'Workshop',
    attendees: 45,
    color: 'from-blue-500 to-cyan-500',
    icon: '🎨',
    organizer: 'Lab de Inovação',
    organizerType: 'official' as const,
    isOfficial: false,
    isPublic: true,
    isPromoted: false
  },
  {
    id: 'mock_event_4',
    title: 'Sarau Literário',
    description: 'Poesia, prosa e muito sentimento num encontro cultural',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Biblioteca Central',
    category: 'Cultura',
    attendees: 60,
    color: 'from-amber-500 to-orange-500',
    icon: '📚',
    organizer: 'Clube de Leitura',
    organizerType: 'user' as const,
    isOfficial: false,
    isPublic: true,
    isPromoted: false
  },
  {
    id: 'mock_event_5',
    title: 'Torneio de Futsal',
    description: 'Forme seu time e compete pelo campeonato da universidade',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Ginásio Esportivo',
    category: 'Esportes',
    attendees: 200,
    color: 'from-green-500 to-emerald-500',
    icon: '⚽',
    organizer: 'Atlética Geral',
    organizerType: 'official' as const,
    isOfficial: true,
    isPublic: true,
    isPromoted: false
  }
];

export class EventsService {
  private static getLocalEvents(): Event[] {
    try {
      const local = localStorage.getItem('unidate_local_events');
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      console.error('Erro ao ler eventos do localStorage:', e);
    }
    return DEFAULT_MOCK_EVENTS;
  }

  private static saveLocalEvents(events: Event[]) {
    try {
      localStorage.setItem('unidate_local_events', JSON.stringify(events));
    } catch (e) {
      console.error('Erro ao salvar eventos no localStorage:', e);
    }
  }

  static async getEvents(): Promise<Event[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase não inicializado');
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        // Se a tabela não existir (código PGRST205), usa o fallback local
        if (error.code === 'PGRST205') {
          console.log('ℹ️ Tabela events não encontrada no Supabase. Usando fallback local.');
          return this.getLocalEvents();
        }
        throw error;
      }

      if (!data || data.length === 0) {
        // Se a tabela estiver vazia, semeia ela no Supabase se puder
        console.log('🌱 Semeadura inicial de eventos no Supabase...');
        const user = (await supabase.auth.getUser()).data.user;
        const eventsToInsert = DEFAULT_MOCK_EVENTS.map(ev => {
          const { id, ...rest } = ev;
          return {
            ...rest,
            organizer_id: user?.id || null
          };
        });
        
        const { data: insertedData, error: insertError } = await supabase
          .from('events')
          .insert(eventsToInsert)
          .select();

        if (insertError) {
          console.error('Erro ao semear eventos no Supabase:', insertError);
          return this.getLocalEvents();
        }

        console.log('✅ Eventos semeados no Supabase:', insertedData);
        return (insertedData || []).map(this.mapDbToEvent);
      }

      return data.map(this.mapDbToEvent);
    } catch (error) {
      console.error('⚠️ Falha ao buscar eventos do Supabase, usando localStorage:', error);
      return this.getLocalEvents();
    }
  }

  static async createEvent(eventData: Omit<Event, 'id' | 'attendees' | 'createdAt'>): Promise<Event> {
    try {
      if (!supabase) throw new Error('Supabase não inicializado');

      const user = (await supabase.auth.getUser()).data.user;

      const dbEvent = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        category: eventData.category,
        attendees: 0,
        color: eventData.color || 'from-indigo-500 to-purple-600',
        icon: eventData.icon || '📅',
        organizer: eventData.organizer || user?.email?.split('@')[0] || 'Usuário',
        organizer_type: eventData.organizerType || 'user',
        organizer_id: user?.id || null
      };

      const { data, error } = await supabase
        .from('events')
        .insert(dbEvent)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST205') {
          console.log('ℹ️ Salvando evento localmente (tabela Supabase não existe).');
          const localEvents = this.getLocalEvents();
          const newEvent: Event = {
            ...eventData,
            id: `local_${Date.now()}`,
            organizerId: user?.id,
            attendees: 0
          };
          localEvents.push(newEvent);
          this.saveLocalEvents(localEvents);
          return newEvent;
        }
        throw error;
      }

      console.log('✅ Evento criado com sucesso no Supabase:', data);
      return this.mapDbToEvent(data);
    } catch (error) {
      console.error('Erro ao criar evento, tentando criar localmente:', error);
      const localEvents = this.getLocalEvents();
      const newEvent: Event = {
        ...eventData,
        id: `local_${Date.now()}`,
        attendees: 0
      };
      localEvents.push(newEvent);
      this.saveLocalEvents(localEvents);
      return newEvent;
    }
  }

  static async toggleRSVP(eventId: string, isAttending: boolean): Promise<number> {
    try {
      if (eventId.startsWith('local_') || !supabase) {
        // RSVP Local
        const localEvents = this.getLocalEvents();
        const index = localEvents.findIndex(ev => ev.id === eventId);
        if (index !== -1) {
          const ev = localEvents[index];
          ev.isAttending = !isAttending;
          ev.attendees = Math.max(0, ev.attendees + (ev.isAttending ? 1 : -1));
          this.saveLocalEvents(localEvents);
          return ev.attendees;
        }
        return 0;
      }

      // RSVP Supabase (no banco de dados, podemos atualizar o contador de attendees por simplicidade)
      const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('attendees')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;

      const newCount = Math.max(0, (event.attendees || 0) + (isAttending ? -1 : 1));

      const { error: updateError } = await supabase
        .from('events')
        .update({ attendees: newCount })
        .eq('id', eventId);

      if (updateError) throw updateError;

      return newCount;
    } catch (error) {
      console.error('Erro no RSVP do evento:', error);
      // Fallback local em caso de falha
      const localEvents = this.getLocalEvents();
      const index = localEvents.findIndex(ev => ev.id === eventId);
      if (index !== -1) {
        const ev = localEvents[index];
        ev.isAttending = !isAttending;
        ev.attendees = Math.max(0, ev.attendees + (ev.isAttending ? 1 : -1));
        this.saveLocalEvents(localEvents);
        return ev.attendees;
      }
      return 0;
    }
  }

  private static mapDbToEvent(db: any): Event {
    return {
      id: db.id,
      title: db.title,
      description: db.description,
      date: db.date,
      location: db.location,
      category: db.category,
      attendees: db.attendees || 0,
      color: db.color,
      icon: db.icon,
      organizer: db.organizer,
      organizerType: db.organizer_type as any,
      organizerId: db.organizer_id,
      isOfficial: db.organizer_type === 'official',
      isPublic: true,
      createdAt: db.created_at
    };
  }
}
