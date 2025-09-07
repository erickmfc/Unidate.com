import React, { useState } from 'react';
import { 
  X, 
  Save, 
  User, 
  MessageSquare, 
  Settings, 
  BookOpen, 
  Star,
  Calendar,
  Plus,
  Trash2
} from 'lucide-react';

interface PersonaConfigModalProps {
  persona: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (persona: any) => void;
}

const PersonaConfigModal: React.FC<PersonaConfigModalProps> = ({
  persona,
  isOpen,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'posts' | 'interactions'>('profile');
  const [formData, setFormData] = useState(persona || {
    name: '',
    nickname: '',
    course: '',
    period: 1,
    bio: '',
    postingFrequency: { postsPerDay: 1, intervalHours: 24 },
    contentDirective: '',
    interactionDirective: '',
    enablePrivateChat: true,
    enableComments: true,
    engagementLevel: 'neutral',
    temporaryTopics: [],
    widgets: {
      bookshelf: [],
      astralMap: { sun: '', hell: '' },
      survivalKit: []
    }
  });

  const [newTopic, setNewTopic] = useState('');
  const [newTopicValidUntil, setNewTopicValidUntil] = useState('');
  const [newBook, setNewBook] = useState('');
  const [newSurvivalItem, setNewSurvivalItem] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const addTemporaryTopic = () => {
    if (newTopic && newTopicValidUntil) {
      setFormData((prev: any) => ({
        ...prev,
        temporaryTopics: [...prev.temporaryTopics, {
          topic: newTopic,
          validUntil: newTopicValidUntil
        }]
      }));
      setNewTopic('');
      setNewTopicValidUntil('');
    }
  };

  const removeTemporaryTopic = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      temporaryTopics: prev.temporaryTopics.filter((_: any, i: number) => i !== index)
    }));
  };

  const addBook = () => {
    if (newBook) {
      setFormData((prev: any) => ({
        ...prev,
        widgets: {
          ...prev.widgets,
          bookshelf: [...prev.widgets.bookshelf, newBook]
        }
      }));
      setNewBook('');
    }
  };

  const removeBook = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        bookshelf: prev.widgets.bookshelf.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const addSurvivalItem = () => {
    if (newSurvivalItem) {
      setFormData((prev: any) => ({
        ...prev,
        widgets: {
          ...prev.widgets,
          survivalKit: [...prev.widgets.survivalKit, newSurvivalItem]
        }
      }));
      setNewSurvivalItem('');
    }
  };

  const removeSurvivalItem = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        survivalKit: prev.widgets.survivalKit.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Configurar Persona: {formData.name || 'Nova Persona'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Perfil e Identidade', icon: User },
              { id: 'posts', label: 'Comportamento no UniVerso', icon: MessageSquare },
              { id: 'interactions', label: 'Comportamento em Interações', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Aba: Perfil e Identidade */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apelido
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, nickname: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Curso
                  </label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, course: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.period}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, period: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografia
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descreva a personalidade e características da Persona..."
                />
              </div>

              {/* Widgets */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Widgets do Perfil</h3>
                
                {/* Minha Estante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minha Estante (Livros)
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newBook}
                      onChange={(e) => setNewBook(e.target.value)}
                      placeholder="Nome do livro"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={addBook}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.widgets.bookshelf.map((book: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        {book}
                        <button
                          onClick={() => removeBook(index)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Kit de Sobrevivência */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kit de Sobrevivência Universitária
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newSurvivalItem}
                      onChange={(e) => setNewSurvivalItem(e.target.value)}
                      placeholder="Item do kit"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={addSurvivalItem}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.widgets.survivalKit.map((item: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        {item}
                        <button
                          onClick={() => removeSurvivalItem(index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mapa Astral do Campus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seu Sol em... (Matéria que ama)
                    </label>
                    <input
                      type="text"
                      value={formData.widgets.astralMap.sun}
                      onChange={(e) => setFormData((prev: any) => ({
                        ...prev,
                        widgets: {
                          ...prev.widgets,
                          astralMap: { ...prev.widgets.astralMap, sun: e.target.value }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seu Inferno Astral em... (Matéria que odeia)
                    </label>
                    <input
                      type="text"
                      value={formData.widgets.astralMap.hell}
                      onChange={(e) => setFormData((prev: any) => ({
                        ...prev,
                        widgets: {
                          ...prev.widgets,
                          astralMap: { ...prev.widgets.astralMap, hell: e.target.value }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba: Comportamento no UniVerso */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status de Postagem
                  </label>
                  <select
                    value={formData.status || 'active'}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="active">Ativo</option>
                    <option value="paused">Pausado</option>
                    <option value="draft">Rascunho</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequência de Postagem
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.postingFrequency.postsPerDay}
                      onChange={(e) => setFormData((prev: any) => ({
                        ...prev,
                        postingFrequency: {
                          ...prev.postingFrequency,
                          postsPerDay: parseInt(e.target.value)
                        }
                      }))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="flex items-center text-gray-500">vezes a cada</span>
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={formData.postingFrequency.intervalHours}
                      onChange={(e) => setFormData((prev: any) => ({
                        ...prev,
                        postingFrequency: {
                          ...prev.postingFrequency,
                          intervalHours: parseInt(e.target.value)
                        }
                      }))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="flex items-center text-gray-500">horas</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diretiva de Conteúdo (O Cérebro)
                </label>
                <textarea
                  rows={6}
                  value={formData.contentDirective}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, contentDirective: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Você é a 'Carla', aluna de Jornalismo. Seus posts são observações inteligentes e críticas sobre o cotidiano da faculdade. Use um tom sarcástico, mas amigável..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Esta diretiva define a personalidade e o estilo de posts da Persona.
                </p>
              </div>

              {/* Tópicos Temporários */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tópicos Temporários
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Ex: Falar positivamente sobre a semana de calouros"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={newTopicValidUntil}
                      onChange={(e) => setNewTopicValidUntil(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={addTemporaryTopic}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {formData.temporaryTopics.map((topic: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{topic.topic}</p>
                        <p className="text-xs text-gray-500">Válido até: {new Date(topic.validUntil).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => removeTemporaryTopic(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Aba: Comportamento em Interações */}
          {activeTab === 'interactions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enablePrivateChat"
                    checked={formData.enablePrivateChat}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, enablePrivateChat: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="enablePrivateChat" className="text-sm font-medium text-gray-700">
                    Habilitar Conversa Privada (Bate-papo)
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enableComments"
                    checked={formData.enableComments}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, enableComments: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="enableComments" className="text-sm font-medium text-gray-700">
                    Habilitar Resposta a Comentários
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diretiva de Interação (A Personalidade Social)
                </label>
                <textarea
                  rows={6}
                  value={formData.interactionDirective}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, interactionDirective: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Seu objetivo é ser um conector. Responda a perguntas, mas sempre termine sugerindo um grupo real, uma funcionalidade do site ou marcando outro usuário..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Esta diretiva define como a Persona interage em chats e comentários.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Interesse (Slider de Personalidade)
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={['distant', 'neutral', 'engaged', 'interested'].indexOf(formData.engagementLevel)}
                    onChange={(e) => {
                      const levels = ['distant', 'neutral', 'engaged', 'interested'];
                      setFormData((prev: any) => ({ ...prev, engagementLevel: levels[parseInt(e.target.value)] }));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Distante</span>
                    <span>Neutro</span>
                    <span>Engajado</span>
                    <span>Interessado</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Nível atual:</strong> {
                        formData.engagementLevel === 'distant' ? 'Distante - Respostas curtas e objetivas' :
                        formData.engagementLevel === 'neutral' ? 'Neutro - Configuração padrão' :
                        formData.engagementLevel === 'engaged' ? 'Engajado - Respostas elaboradas com emojis' :
                        'Interessado - Demonstra curiosidade e elogia interesses'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonaConfigModal;
