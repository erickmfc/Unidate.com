import React, { useState } from 'react';
import { 
  Image, 
  BarChart3, 
  Eye, 
  Smile, 
  Send,
  X,
  Plus
} from 'lucide-react';

interface PostComposerProps {
  onSubmit: (post: any) => void;
  onClose?: () => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ onSubmit, onClose }) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'tevi' | 'poll'>('text');
  const [showTeViTemplate, setShowTeViTemplate] = useState(false);
  const [teViData, setTeViData] = useState({
    location: '',
    clothing: '',
    activity: ''
  });
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', '']
  });

  const handleTeViSubmit = () => {
    const teViPost = {
      type: 'tevi',
      content: `Eu te vi em ${teViData.location}, você estava vestindo ${teViData.clothing} e ${teViData.activity}. Se for você, me manda um oi! 👋`,
      location: teViData.location,
      clothing: teViData.clothing,
      activity: teViData.activity,
      timestamp: new Date().toISOString()
    };
    onSubmit(teViPost);
    setShowTeViTemplate(false);
    setTeViData({ location: '', clothing: '', activity: '' });
  };

  const handlePollSubmit = () => {
    if (!pollData.question.trim() || pollData.options.some(opt => !opt.trim())) return;
    
    const post = {
      type: 'poll',
      content: pollData.question.trim(),
      pollData: {
        question: pollData.question.trim(),
        options: pollData.options.filter(opt => opt.trim()),
        votes: new Array(pollData.options.filter(opt => opt.trim()).length).fill(0)
      },
      timestamp: new Date().toISOString()
    };
    onSubmit(post);
    setPollData({ question: '', options: ['', ''] });
  };

  const handleRegularSubmit = () => {
    if (!content.trim()) return;
    
    const post = {
      type: postType,
      content: content.trim(),
      timestamp: new Date().toISOString()
    };
    onSubmit(post);
    setContent('');
  };

  const addPollOption = () => {
    if (pollData.options.length < 4) {
      setPollData({ ...pollData, options: [...pollData.options, ''] });
    }
  };

  const removePollOption = (index: number) => {
    if (pollData.options.length > 2) {
      const newOptions = pollData.options.filter((_, i) => i !== index);
      setPollData({ ...pollData, options: newOptions });
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData({ ...pollData, options: newOptions });
  };

  const handleHashtagClick = (hashtag: string) => {
    setContent(prev => prev + ` #${hashtag}`);
  };

  const popularHashtags = [
    'CALCULO1', 'FESTADODIREITO', 'BIBLIOTECACHEIA', 'BANDEJAO', 
    'PROVAFINAL', 'GRUPOESTUDO', 'FESTAIMPROVISADA', 'CORREDORBARULHENTO'
  ];

  if (showTeViTemplate) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Eye className="h-5 w-5 text-primary-500" />
            <span>#TeVi - Conectando no Campus</span>
          </h3>
          <button
            onClick={() => setShowTeViTemplate(false)}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Vi alguém interessante no campus? Use o #TeVi para tentar se conectar!
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Onde você viu essa pessoa?
            </label>
            <input
              type="text"
              placeholder="Ex: Biblioteca, corredor do 3º andar, bandejão..."
              value={teViData.location}
              onChange={(e) => setTeViData({ ...teViData, location: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Como ela estava vestida?
            </label>
            <input
              type="text"
              placeholder="Ex: camiseta azul, moletom do curso de medicina..."
              value={teViData.clothing}
              onChange={(e) => setTeViData({ ...teViData, clothing: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O que ela estava fazendo?
            </label>
            <input
              type="text"
              placeholder="Ex: estudando cálculo, conversando com amigos..."
              value={teViData.activity}
              onChange={(e) => setTeViData({ ...teViData, activity: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleTeViSubmit}
              disabled={!teViData.location || !teViData.clothing || !teViData.activity}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>Postar #TeVi</span>
            </button>
            <button
              onClick={() => setShowTeViTemplate(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (postType === 'poll') {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary-500" />
            <span>Criar Enquete</span>
          </h3>
          <button
            onClick={() => setPostType('text')}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pergunta da enquete
            </label>
            <input
              type="text"
              placeholder="Ex: Qual é o melhor lugar para estudar no campus?"
              value={pollData.question}
              onChange={(e) => setPollData({ ...pollData, question: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opções (mínimo 2, máximo 4)
            </label>
            <div className="space-y-2">
              {pollData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`Opção ${index + 1}`}
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    className="flex-1 input-field"
                  />
                  {pollData.options.length > 2 && (
                    <button
                      onClick={() => removePollOption(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {pollData.options.length < 4 && (
              <button
                onClick={addPollOption}
                className="mt-2 flex items-center space-x-1 text-primary-500 hover:text-primary-600 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar opção</span>
              </button>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setPostType('text')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePollSubmit}
              disabled={!pollData.question.trim() || pollData.options.some(opt => !opt.trim())}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Enquete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">V</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">O que está rolando no campus?</h3>
          <p className="text-sm text-gray-600">Compartilhe com a galera da sua faculdade</p>
        </div>
      </div>

      {/* Post Type Selector */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setPostType('text')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            postType === 'text' 
              ? 'bg-primary-100 text-primary-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Texto
        </button>
        <button
          onClick={() => setShowTeViTemplate(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 hover:from-pink-200 hover:to-purple-200 transition-all duration-200 flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>#TeVi</span>
        </button>
        <button
          onClick={() => setPostType('poll')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            postType === 'poll' 
              ? 'bg-primary-100 text-primary-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-1" />
          Enquete
        </button>
      </div>

      {/* Content Input */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="O que está acontecendo no campus? Use #hashtags para conectar com a galera!"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 resize-none"
          rows={4}
        />
      </div>

      {/* Popular Hashtags */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Hashtags populares:</p>
        <div className="flex flex-wrap gap-2">
          {popularHashtags.map((hashtag) => (
            <button
              key={hashtag}
              onClick={() => handleHashtagClick(hashtag)}
              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors duration-200"
            >
              #{hashtag}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-500 transition-colors duration-200">
            <Image className="h-5 w-5" />
            <span>Foto</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-500 transition-colors duration-200">
            <Smile className="h-5 w-5" />
            <span>Emoji</span>
          </button>
        </div>

        <button
          onClick={handleRegularSubmit}
          disabled={!content.trim()}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          <span>Postar</span>
        </button>
      </div>
    </div>
  );
};

export default PostComposer;

