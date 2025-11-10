import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  limit,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface GroupEvent {
  id: string;
  groupId: string;
  title: string;
  description: string;
  date: Timestamp;
  location: string;
  maxAttendees?: number;
  attendees: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
  tags: string[];
  image?: string;
  isAttending?: boolean;
  attendeesCount?: number;
  canEdit?: boolean;
}

export class GroupEventsService {
  static async createEvent(eventData: Omit<GroupEvent, 'id' | 'attendees' | 'createdAt' | 'updatedAt' | 'isAttending' | 'attendeesCount' | 'canEdit'> & { date: Date }): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      console.log('📅 Criando evento:', eventData.title);

      const dateTimestamp = Timestamp.fromDate(eventData.date);

      const eventRef = await addDoc(collection(db, 'groupEvents'), {
        ...eventData,
        date: dateTimestamp,
        attendees: [eventData.createdBy],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Evento criado com sucesso:', eventRef.id);
      return eventRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      throw error;
    }
  }

  // Buscar eventos do grupo
  static async getGroupEvents(groupId: string, userId?: string): Promise<GroupEvent[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const eventsQuery = query(
        collection(db, 'groupEvents'),
        where('groupId', '==', groupId),
        orderBy('date', 'asc')
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      const events: GroupEvent[] = [];

      eventsSnapshot.forEach((doc) => {
        const data = doc.data();
        const event: GroupEvent = {
          id: doc.id,
          groupId: data.groupId,
          title: data.title,
          description: data.description,
          date: data.date,
          location: data.location,
          maxAttendees: data.maxAttendees,
          attendees: data.attendees || [],
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isPublic: data.isPublic !== false,
          tags: data.tags || [],
          image: data.image,
          attendeesCount: data.attendees?.length || 0,
          isAttending: userId ? data.attendees?.includes(userId) : false,
          canEdit: userId ? (data.createdBy === userId) : false
        };
        events.push(event);
      });

      return events;
    } catch (error) {
      console.error('❌ Erro ao buscar eventos do grupo:', error);
      return [];
    }
  }

  // Entrar/sair de um evento
  static async toggleEventAttendance(eventId: string, userId: string, isAttending: boolean): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const eventRef = doc(db, 'groupEvents', eventId);
      
      // Verificar se o evento existe
      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) {
        throw new Error('Evento não encontrado');
      }

      const eventData = eventDoc.data();
      
      // Verificar limite de participantes
      if (isAttending && eventData.maxAttendees && eventData.attendees.length >= eventData.maxAttendees) {
        throw new Error('Evento lotado');
      }

      if (isAttending) {
        await updateDoc(eventRef, {
          attendees: arrayUnion(userId),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Usuário ${userId} entrou no evento ${eventId}`);
      } else {
        await updateDoc(eventRef, {
          attendees: arrayRemove(userId),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Usuário ${userId} saiu do evento ${eventId}`);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar participação no evento:', error);
      throw error;
    }
  }

  // Atualizar evento
  static async updateEvent(eventId: string, eventData: Partial<GroupEvent> & { date?: Date }, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const eventRef = doc(db, 'groupEvents', eventId);
      
      // Verificar se o usuário pode editar o evento
      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) {
        throw new Error('Evento não encontrado');
      }

      const currentEventData = eventDoc.data();
      if (currentEventData.createdBy !== userId) {
        throw new Error('Você não tem permissão para editar este evento');
      }

      // Remover campos que não devem ser atualizados
      const { id, groupId, createdBy, createdAt, attendees, date, ...updateData } = eventData;

      const updateFields: any = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      // Se date foi fornecido, converter para Timestamp
      if (date) {
        updateFields.date = Timestamp.fromDate(date);
      }

      await updateDoc(eventRef, updateFields);

      console.log('✅ Evento atualizado com sucesso:', eventId);
    } catch (error) {
      console.error('❌ Erro ao atualizar evento:', error);
      throw error;
    }
  }

  // Deletar evento
  static async deleteEvent(eventId: string, userId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const eventRef = doc(db, 'groupEvents', eventId);
      
      // Verificar se o usuário pode deletar o evento
      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) {
        throw new Error('Evento não encontrado');
      }

      const eventData = eventDoc.data();
      if (eventData.createdBy !== userId) {
        throw new Error('Você não tem permissão para deletar este evento');
      }

      await deleteDoc(eventRef);
      console.log('✅ Evento deletado com sucesso:', eventId);
    } catch (error) {
      console.error('❌ Erro ao deletar evento:', error);
      throw error;
    }
  }

  // Buscar eventos próximos
  static async getUpcomingEvents(groupId: string, limitCount: number = 5): Promise<GroupEvent[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const now = new Date();
      const eventsQuery = query(
        collection(db, 'groupEvents'),
        where('groupId', '==', groupId),
        where('date', '>=', now),
        orderBy('date', 'asc'),
        limit(limitCount)
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      const events: GroupEvent[] = [];

      eventsSnapshot.forEach((doc) => {
        const data = doc.data();
        const event: GroupEvent = {
          id: doc.id,
          groupId: data.groupId,
          title: data.title,
          description: data.description,
          date: data.date,
          location: data.location,
          maxAttendees: data.maxAttendees,
          attendees: data.attendees || [],
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isPublic: data.isPublic !== false,
          tags: data.tags || [],
          image: data.image,
          attendeesCount: data.attendees?.length || 0,
          isAttending: false,
          canEdit: false
        };
        events.push(event);
      });

      return events;
    } catch (error) {
      console.error('❌ Erro ao buscar eventos próximos:', error);
      return [];
    }
  }

  // Buscar eventos por categoria/tag
  static async getEventsByTag(groupId: string, tag: string): Promise<GroupEvent[]> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const eventsQuery = query(
        collection(db, 'groupEvents'),
        where('groupId', '==', groupId),
        where('tags', 'array-contains', tag),
        orderBy('date', 'asc')
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      const events: GroupEvent[] = [];

      eventsSnapshot.forEach((doc) => {
        const data = doc.data();
        const event: GroupEvent = {
          id: doc.id,
          groupId: data.groupId,
          title: data.title,
          description: data.description,
          date: data.date,
          location: data.location,
          maxAttendees: data.maxAttendees,
          attendees: data.attendees || [],
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isPublic: data.isPublic !== false,
          tags: data.tags || [],
          image: data.image,
          attendeesCount: data.attendees?.length || 0,
          isAttending: false,
          canEdit: false
        };
        events.push(event);
      });

      return events;
    } catch (error) {
      console.error('❌ Erro ao buscar eventos por tag:', error);
      return [];
    }
  }
}
