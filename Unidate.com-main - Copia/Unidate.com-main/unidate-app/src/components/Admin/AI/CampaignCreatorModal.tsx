import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Target, 
  Calendar,
  Users,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';

interface CampaignCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: any) => void;
  availablePersonas: any[];
}

const CampaignCreatorModal: React.FC<CampaignCreatorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availablePersonas
}) => {
  const [formData, setFormData] = useState({
    name: '',
    centralTopic: '',
    participatingPersonas: [] as string[],
    startDate: '',
    endDate: '',
    status: 'active' as 'active' | 'paused'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da campanha é obrigatório';
    }

    if (!formData.centralTopic.trim()) {
      newErrors.centralTopic = 'Tópico central é obrigatório';
    }

    if (formData.participatingPersonas.length === 0) {
      newErrors.participatingPersonas = 'Selecione pelo menos uma Persona';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Data de fim é obrigatória';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'Data de fim deve ser posterior à data de início';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const campaign = {
        ...formData,
        id: Date.now().toString(),
        postsGenerated: 0,
        createdAt: new Date().toISOString()
      };
      onSave(campaign);
      onClose();
      // Reset form
      setFormData({
        name: '',
        centralTopic: '',
        participatingPersonas: [],
        startDate: '',
        endDate: '',
        status: 'active'
      });
      setErrors({});
    }
  };

  const togglePersona = (personaId: string) => {
    setFormData(prev => ({
      ...prev,
      participatingPersonas: prev.participatingPersonas.includes(personaId)
        ? prev.participatingPersonas.filter(id => id !== personaId)
        : [...prev.participatingPersonas, personaId]
    }));
  };

  const getDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Criar Nova Campanha</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Nome da Campanha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Campanha
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ex: Aquecimento para as Férias"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Tópico Central */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tópico Central
            </label>
            <textarea
              rows={4}
              value={formData.centralTopic}
              onChange={(e) => setFormData(prev => ({ ...prev, centralTopic: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.centralTopic ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ex: Planos para as férias, dicas de viagem barata, como relaxar depois das provas"
            />
            {errors.centralTopic && <p className="text-red-500 text-sm mt-1">{errors.centralTopic}</p>}
            <p className="text-sm text-gray-500 mt-1">
              Descreva o tema central que as Personas devem abordar em seus posts durante a campanha.
            </p>
          </div>

          {/* Personas Participantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personas Participantes
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availablePersonas.map((persona) => (
                <div
                  key={persona.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    formData.participatingPersonas.includes(persona.id)
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => togglePersona(persona.id)}
                >
                  <input
                    type="checkbox"
                    checked={formData.participatingPersonas.includes(persona.id)}
                    onChange={() => togglePersona(persona.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {persona.name} ({persona.nickname})
                    </p>
                    <p className="text-xs text-gray-500">
                      {persona.course} - {persona.period}° período
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    persona.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {persona.status === 'active' ? 'Ativo' : 'Pausado'}
                  </span>
                </div>
              ))}
            </div>
            {errors.participatingPersonas && (
              <p className="text-red-500 text-sm mt-1">{errors.participatingPersonas}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Selecione as Personas que participarão desta campanha.
            </p>
          </div>

          {/* Duração */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Resumo da Campanha */}
          {formData.name && formData.centralTopic && formData.participatingPersonas.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Resumo da Campanha</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Nome:</strong> {formData.name}</p>
                <p><strong>Duração:</strong> {getDuration()} dias</p>
                <p><strong>Personas:</strong> {formData.participatingPersonas.length} selecionada(s)</p>
                <p><strong>Tópico:</strong> {formData.centralTopic}</p>
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Inicial
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Ativa (Iniciar imediatamente)</option>
              <option value="paused">Pausada (Aguardar ativação manual)</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Criar Campanha</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreatorModal;
