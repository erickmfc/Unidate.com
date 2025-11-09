import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { BotProfile } from '../../../services/aiBotProfilesService';
import { AIBotProfilesService } from '../../../services/aiBotProfilesService';

interface BotProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Partial<BotProfile>) => Promise<void>;
  profile?: BotProfile | null;
}

const BotProfileModal: React.FC<BotProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profile
}) => {
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    course: '',
    university: '',
    period: 1,
    avatar: '',
    bio: '',
    writingStyle: 'casual e descontraído',
    personality: 'descontraído',
    interests: [] as string[],
    postingFrequency: {
      enabled: false,
      intervalMinutes: 60
    },
    status: 'draft' as 'active' | 'paused' | 'draft'
  });

  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        handle: profile.handle,
        course: profile.course,
        university: profile.university,
        period: profile.period,
        avatar: profile.avatar,
        bio: profile.bio,
        writingStyle: profile.writingStyle,
        personality: profile.personality,
        interests: profile.interests,
        postingFrequency: profile.postingFrequency,
        status: profile.status
      });
    } else {
      // Reset form
      setFormData({
        name: '',
        handle: '',
        course: '',
        university: '',
        period: 1,
        avatar: '',
        bio: '',
        writingStyle: 'casual e descontraído',
        personality: 'descontraído',
        interests: [],
        postingFrequency: {
          enabled: false,
          intervalMinutes: 60
        },
        status: 'draft'
      });
    }
  }, [profile, isOpen]);

  const handleAddInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()]
      });
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  const handleGenerateAvatar = () => {
    if (formData.name && formData.course) {
      const avatar = AIBotProfilesService.generateAvatar(formData.name, formData.course);
      setFormData({ ...formData, avatar });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile ? 'Editar Perfil' : 'Novo Perfil de Bot'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (!profile && !formData.handle) {
                      setFormData(prev => ({
                        ...prev,
                        handle: `@${e.target.value.toLowerCase().replace(/\s+/g, '')}`
                      }));
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Handle *
                </label>
                <input
                  type="text"
                  required
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="@joaosilva"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Curso *
                </label>
                <input
                  type="text"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Engenharia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Universidade *
                </label>
                <input
                  type="text"
                  required
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: UFMG"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 h-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Breve descrição do perfil..."
                maxLength={200}
              />
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar URL
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="URL da imagem ou deixe vazio para gerar"
                />
                <button
                  type="button"
                  onClick={handleGenerateAvatar}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Gerar
                </button>
              </div>
              {formData.avatar && (
                <img
                  src={formData.avatar}
                  alt="Preview"
                  className="mt-2 w-16 h-16 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = AIBotProfilesService.generateAvatar(formData.name, formData.course);
                  }}
                />
              )}
            </div>

            {/* Personalidade e Estilo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Personalidade *
                </label>
                <select
                  required
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="sarcástico">Sarcástico</option>
                  <option value="motivacional">Motivacional</option>
                  <option value="descontraído">Descontraído</option>
                  <option value="reflexivo">Reflexivo</option>
                  <option value="engraçado">Engraçado</option>
                  <option value="sério">Sério</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estilo de Escrita *
                </label>
                <input
                  type="text"
                  required
                  value={formData.writingStyle}
                  onChange={(e) => setFormData({ ...formData, writingStyle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: casual e descontraído"
                />
              </div>
            </div>

            {/* Interesses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interesses
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Adicionar interesse..."
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Frequência de Postagem */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Postagem Automática
                </label>
                <input
                  type="checkbox"
                  checked={formData.postingFrequency.enabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    postingFrequency: {
                      ...formData.postingFrequency,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </div>

              {formData.postingFrequency.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Intervalo (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={formData.postingFrequency.intervalMinutes}
                    onChange={(e) => setFormData({
                      ...formData,
                      postingFrequency: {
                        ...formData.postingFrequency,
                        intervalMinutes: Number(e.target.value)
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="draft">Rascunho</option>
                <option value="paused">Pausado</option>
                <option value="active">Ativo</option>
              </select>
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {profile ? 'Salvar Alterações' : 'Criar Perfil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BotProfileModal;

