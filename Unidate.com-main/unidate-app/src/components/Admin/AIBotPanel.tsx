import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, Bot, Settings, Sparkles } from 'lucide-react';
import { botScheduler } from '../../services/botSchedulerService';
import { useUniDateToast } from '../UI/Toast';

const AIBotPanel: React.FC = () => {
  const { showSuccess, showError } = useUniDateToast();
  const [isActive, setIsActive] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [lastPostTime, setLastPostTime] = useState<Date | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    const status = botScheduler.getScheduleStatus();
    setIsActive(status.isActive);
    setIntervalMinutes(status.intervalMinutes);
    setLastPostTime(status.lastPostTime);

    const interval = setInterval(() => {
      const currentStatus = botScheduler.getScheduleStatus();
      setIsActive(currentStatus.isActive);
      setLastPostTime(currentStatus.lastPostTime);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (intervalMinutes < 1) {
      showError('O intervalo deve ser de pelo menos 1 minuto');
      return;
    }

    botScheduler.startSchedule(intervalMinutes);
    setIsActive(true);
    showSuccess(`Bot iniciado! Posts a cada ${intervalMinutes} minutos`);
  };

  const handleStop = () => {
    botScheduler.stopSchedule();
    setIsActive(false);
    showSuccess('Bot parado');
  };

  const handleIntervalChange = (value: number) => {
    if (value < 1) {
      showError('O intervalo deve ser de pelo menos 1 minuto');
      return;
    }
    setIntervalMinutes(value);
    if (isActive) {
      botScheduler.updateInterval(value);
      showSuccess(`Intervalo atualizado para ${value} minutos`);
    }
  };

  const handleCreatePostNow = async () => {
    setIsCreatingPost(true);
    try {
      await botScheduler.createPostNow();
      setLastPostTime(new Date());
      showSuccess('Post criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar post:', error);
      showError('Erro ao criar post. Tente novamente.');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const formatInterval = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} dia${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Bot de Posts Automáticos</h3>
          <p className="text-sm text-gray-500">Gerencie posts automáticos no estilo Twitter</p>
        </div>
      </div>

      {}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
            isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
            {isActive ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        {lastPostTime && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
            <Clock className="h-4 w-4" />
            <span>Último post: {lastPostTime.toLocaleString('pt-BR')}</span>
          </div>
        )}
      </div>

      {}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Intervalo entre posts (minutos)
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            min="1"
            max="1440"
            value={intervalMinutes}
            onChange={(e) => handleIntervalChange(Number(e.target.value))}
            disabled={isActive}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
          />
          <div className="text-sm text-gray-500 min-w-[120px]">
            {formatInterval(intervalMinutes)}
          </div>
        </div>
      </div>

      {}
      <div className="flex items-center space-x-3 mb-4">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
          >
            <Play className="h-5 w-5" />
            <span>Iniciar Bot</span>
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all"
          >
            <Pause className="h-5 w-5" />
            <span>Parar Bot</span>
          </button>
        )}
        <button
          onClick={handleCreatePostNow}
          disabled={isCreatingPost}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingPost ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Criando...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Criar Post Agora</span>
            </>
          )}
        </button>
      </div>

      {}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Como funciona:</p>
            <ul className="space-y-1 text-xs">
              <li>• O bot gera posts automáticos usando IA (Gemini)</li>
              <li>• Posts são no estilo Twitter, sobre vida universitária</li>
              <li>• O intervalo define com que frequência os posts são criados</li>
              <li>• Posts aparecem no feed como posts normais</li>
              <li>• Use "Criar Post Agora" para testar o bot</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBotPanel;
