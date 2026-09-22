import { supabase } from '../supabaseClient';

type TimestampLike = { toDate: () => Date; seconds: number; nanoseconds: number };
const asTimestamp = (value?: string | null): TimestampLike => { const date = value ? new Date(value) : new Date(); return { toDate: () => date, seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 }; };

export interface GroupEvent {
  id: string; groupId: string; title: string; description: string; date: TimestampLike; location: string;
  maxAttendees?: number; attendees: string[]; createdBy: string; createdAt: TimestampLike; updatedAt: TimestampLike;
  isPublic: boolean; tags: string[]; image?: string; isAttending?: boolean; attendeesCount?: number; canEdit?: boolean;
}

const mapEvent = (row: any, userId?: string): GroupEvent => {
  const attendees = (row.attendees || []).map((entry: any) => entry.user_id || entry);
  return { id: row.id, groupId: row.group_id, title: row.title, description: row.description || '', date: asTimestamp(row.date), location: row.location || '', maxAttendees: row.max_attendees || undefined, attendees, createdBy: row.created_by, createdAt: asTimestamp(row.created_at), updatedAt: asTimestamp(row.updated_at), isPublic: row.is_public !== false, tags: row.tags || [], image: row.image || undefined, attendeesCount: attendees.length, isAttending: userId ? attendees.includes(userId) : false, canEdit: userId ? row.created_by === userId : false };
};

const withAttendees = async (events: any[]): Promise<any[]> => {
  if (!events.length) return [];
  const { data: attendees, error } = await supabase.from('group_event_attendees').select('event_id, user_id').in('event_id', events.map((event) => event.id));
  if (error) throw error;
  return events.map((event) => ({ ...event, attendees: (attendees || []).filter((entry) => entry.event_id === event.id) }));
};

export class GroupEventsService {
  static async createEvent(eventData: Omit<GroupEvent, 'id' | 'attendees' | 'createdAt' | 'updatedAt' | 'isAttending' | 'attendeesCount' | 'canEdit'> & { date: Date }): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');
    const { data, error } = await supabase.from('group_events').insert({ group_id: eventData.groupId, title: eventData.title, description: eventData.description, date: eventData.date.toISOString(), location: eventData.location, max_attendees: eventData.maxAttendees || null, created_by: user.id, is_public: eventData.isPublic !== false, tags: eventData.tags || [], image: eventData.image || null }).select('id').single();
    if (error || !data) throw error || new Error('Não foi possível criar o evento');
    await supabase.from('group_event_attendees').insert({ event_id: data.id, user_id: user.id });
    return data.id;
  }

  static async getGroupEvents(groupId: string, userId?: string): Promise<GroupEvent[]> {
    const { data, error } = await supabase.from('group_events').select('*').eq('group_id', groupId).order('date', { ascending: true });
    if (error) throw error;
    return (await withAttendees(data || [])).map((event) => mapEvent(event, userId));
  }

  static async toggleEventAttendance(eventId: string, userId: string, isAttending: boolean): Promise<void> {
    if (isAttending) {
      const { data: event } = await supabase.from('group_events').select('max_attendees').eq('id', eventId).single();
      const { count } = await supabase.from('group_event_attendees').select('*', { count: 'exact', head: true }).eq('event_id', eventId);
      if (event?.max_attendees && (count || 0) >= event.max_attendees) throw new Error('Evento lotado');
      const { error } = await supabase.from('group_event_attendees').upsert({ event_id: eventId, user_id: userId });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('group_event_attendees').delete().eq('event_id', eventId).eq('user_id', userId);
      if (error) throw error;
    }
  }

  static async updateEvent(eventId: string, eventData: Partial<GroupEvent> & { date?: Date }, userId: string): Promise<void> {
    const update: any = {};
    if (eventData.title !== undefined) update.title = eventData.title;
    if (eventData.description !== undefined) update.description = eventData.description;
    if (eventData.date) update.date = eventData.date.toISOString();
    if (eventData.location !== undefined) update.location = eventData.location;
    if (eventData.maxAttendees !== undefined) update.max_attendees = eventData.maxAttendees;
    if (eventData.isPublic !== undefined) update.is_public = eventData.isPublic;
    if (eventData.tags !== undefined) update.tags = eventData.tags;
    if (eventData.image !== undefined) update.image = eventData.image;
    const { error } = await supabase.from('group_events').update(update).eq('id', eventId).eq('created_by', userId);
    if (error) throw error;
  }

  static async deleteEvent(eventId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('group_events').delete().eq('id', eventId).eq('created_by', userId);
    if (error) throw error;
  }

  static async getUpcomingEvents(groupId: string, limitCount = 5): Promise<GroupEvent[]> {
    const { data, error } = await supabase.from('group_events').select('*').eq('group_id', groupId).gte('date', new Date().toISOString()).order('date', { ascending: true }).limit(limitCount);
    if (error) throw error;
    return (await withAttendees(data || [])).map((event) => mapEvent(event));
  }

  static async getEventsByTag(groupId: string, tag: string): Promise<GroupEvent[]> {
    const { data, error } = await supabase.from('group_events').select('*').eq('group_id', groupId).contains('tags', [tag]).order('date', { ascending: true });
    if (error) throw error;
    return (await withAttendees(data || [])).map((event) => mapEvent(event));
  }
}
