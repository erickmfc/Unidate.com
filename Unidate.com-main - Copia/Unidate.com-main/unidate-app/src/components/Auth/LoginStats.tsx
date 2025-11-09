import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Users, Star } from 'lucide-react';

interface LoginStatsProps {
  className?: string;
}

const LoginStats: React.FC<LoginStatsProps> = ({ className = '' }) => {
  // Estado para armazenar as estatísticas
  const [stats, setStats] = useState({
    matches: 0,
    mensagens: 0,
    grupos: 0,
    avaliacao: 0
  });

  // Em um ambiente real, este componente buscaria dados do Firebase
  // Por enquanto, vamos usar os valores fixos da imagem de referência
  useEffect(() => {
    // Definir os valores iniciais conforme a imagem de referência
    setStats({
      matches: 12,
      mensagens: 24,
      grupos: 5,
      avaliacao: 4.8
    });
    
    // Em uma implementação real, aqui teríamos um listener do Firebase
    // para atualizar os valores em tempo real
  }, []);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">Estatísticas</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Matches */}
        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 bg-pink-100 rounded-full">
            <Heart className="h-4 w-4 text-pink-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Matches</div>
            <div className="text-lg font-semibold text-gray-900">{stats.matches}</div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Mensagens</div>
            <div className="text-lg font-semibold text-gray-900">{stats.mensagens}</div>
          </div>
        </div>

        {/* Grupos */}
        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
            <Users className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Grupos</div>
            <div className="text-lg font-semibold text-gray-900">{stats.grupos}</div>
          </div>
        </div>

        {/* Avaliação */}
        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
            <Star className="h-4 w-4 text-yellow-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Avaliação</div>
            <div className="text-lg font-semibold text-gray-900">{stats.avaliacao.toFixed(1)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginStats;