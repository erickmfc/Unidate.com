import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Tag, Image, Clock } from 'lucide-react';
import { GroupEventsService, GroupEvent } from '../../services/groupEventsService';
import { useAuth } from '../../contexts/AuthContext';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  event?: GroupEvent | null; // Se fornecido, é edição; se null, é criação
  onEventSaved: (event?: GroupEvent) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  event,
  onEventSaved
}) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date ? new Date(event.date.toDate()).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    maxAttendees: event?.maxAttendees || '',
    tags: event?.tags?.join(', ') || '',
    isPublic: event?.isPublic !== false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório');
      }

      if (!formData.date) {
        throw new Error('Data é obrigatória');
      }

      if (!formData.location.trim()) {
        throw new Error('Local é obrigatório');
      }

      if (!currentUser) {
        throw new Error('Você precisa estar logado para criar eventos');
      }

      const eventData = {
        groupId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date),
        location: formData.location.trim(),
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees.toString()) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        isPublic: formData.isPublic,
        createdBy: event?.createdBy || currentUser.uid
      } as any;

      if (event) {
        // Editar evento existente
        await GroupEventsService.updateEvent(event.id, eventData, event.createdBy);
        console.log('✅ Evento atualizado com sucesso');
        // Passar o evento atualizado
        onEventSaved({ ...event, ...eventData } as GroupEvent);
      } else {
        // Criar novo evento
        const eventId = await GroupEventsService.createEvent(eventData);
        console.log('✅ Evento criado com sucesso:', eventId);
        // Criar um evento temporário para o callback (será recarregado pela lista)
        const newEvent: GroupEvent = {
          id: eventId,
          ...eventData,
          date: eventData.date as any,
          attendees: [currentUser.uid],
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
          attendeesCount: 1,
          isAttending: true,
          canEdit: true
        };
        onEventSaved(newEvent);
      }

      onClose();
    } catch (error: any) {
      console.error('❌ Erro ao salvar evento:', error);
      setError(error.message || 'Erro ao salvar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {event ? 'Editar Evento' : 'Criar Evento'}
            </h2>
            <p className="text-sm text-gray-600">{groupName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Evento *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
              placeholder="Ex: Reunião de Estudos de Cálculo"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
              placeholder="Descreva o evento..."
            />
          </div>

          {/* Data e Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data e Hora *
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
              required
            />
          </div>

          {/* Local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
              placeholder="Ex: Biblioteca Central, Sala 205"
              required
            />
          </div>

          {/* Máximo de Participantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máximo de Participantes (opcional)
            </label>
            <input
              type="number"
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
              placeholder="Ex: 20"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
              placeholder="Ex: estudos, cálculo, matemática"
            />
          </div>

          {/* Público/Privado */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Evento público (visível para todos os membros do grupo)
            </label>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  <span>{event ? 'Atualizar' : 'Criar'} Evento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
