import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  UserPlus
} from 'lucide-react';
import { GroupEventsService, GroupEvent } from '../../services/groupEventsService';
import { useAuth } from '../../contexts/AuthContext';
import EventModal from './EventModal';

interface EventsListProps {
  groupId: string;
  groupName: string;
  canCreateEvents: boolean;
}

const EventsList: React.FC<EventsListProps> = ({ 
  groupId, 
  groupName, 
  canCreateEvents 
}) => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GroupEvent | null>(null);

  useEffect(() => {
    loadEvents();
  }, [groupId, currentUser]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const groupEvents = await GroupEventsService.getGroupEvents(groupId, currentUser?.uid);
      setEvents(groupEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (eventId: string, isAttending: boolean) => {
    if (!currentUser) return;

    try {
      await GroupEventsService.toggleEventAttendance(eventId, currentUser.uid, isAttending);
      await loadEvents(); // Recarregar eventos
    } catch (error: any) {
      console.error('Erro ao atualizar participação:', error);
      alert(error.message || 'Erro ao atualizar participação no evento.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!currentUser) return;
    
    if (!window.confirm('Tem certeza que deseja deletar este evento?')) return;

    try {
      await GroupEventsService.deleteEvent(eventId, currentUser.uid);
      await loadEvents(); // Recarregar eventos
    } catch (error: any) {
      console.error('Erro ao deletar evento:', error);
      alert(error.message || 'Erro ao deletar evento.');
    }
  };

  const handleEventSaved = () => {
    loadEvents();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventPast = (timestamp: any) => {
    if (!timestamp) return false;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date < new Date();
  };

  const isEventFull = (event: GroupEvent) => {
    return event.maxAttendees && (event.attendeesCount || 0) >= event.maxAttendees;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Eventos do Grupo</h3>
          <p className="text-sm text-gray-600">
            {events.length} {events.length === 1 ? 'evento' : 'eventos'}
          </p>
        </div>
        
        {canCreateEvents && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Evento</span>
          </button>
        )}
      </div>

      {/* Lista de Eventos */}
      {events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento ainda</h4>
          <p className="text-gray-600 mb-4">
            {canCreateEvents 
              ? 'Seja o primeiro a criar um evento para este grupo!'
              : 'Ainda não há eventos agendados para este grupo.'
            }
          </p>
          {canCreateEvents && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Criar Primeiro Evento
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`bg-white border border-gray-200 rounded-lg p-6 ${
                isEventPast(event.date) ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Título e Status */}
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                    {isEventPast(event.date) && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Finalizado
                      </span>
                    )}
                    {isEventFull(event) && !isEventPast(event.date) && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                        Lotado
                      </span>
                    )}
                  </div>

                  {/* Descrição */}
                  {event.description && (
                    <p className="text-gray-600 mb-3">{event.description}</p>
                  )}

                  {/* Informações do Evento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.attendeesCount} participantes
                        {event.maxAttendees && ` / ${event.maxAttendees} máximo`}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex flex-col space-y-2 ml-4">
                  {event.canEdit && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar evento"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deletar evento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {!isEventPast(event.date) && (
                    <button
                      onClick={() => handleToggleAttendance(event.id, !event.isAttending)}
                      disabled={!!(isEventFull(event) && !event.isAttending)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                        event.isAttending
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : isEventFull(event)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {event.isAttending ? (
                        <>
                          <UserCheck className="h-3 w-3" />
                          <span>Participando</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3" />
                          <span>Participar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      {showCreateModal && (
        <EventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          groupId={groupId}
          groupName={groupName}
          onEventSaved={handleEventSaved}
        />
      )}

      {editingEvent && (
        <EventModal
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          groupId={groupId}
          groupName={groupName}
          event={editingEvent}
          onEventSaved={handleEventSaved}
        />
      )}
    </div>
  );
};

export default EventsList;
