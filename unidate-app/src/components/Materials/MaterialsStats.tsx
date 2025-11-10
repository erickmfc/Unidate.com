import React, { useState, useEffect } from 'react';
import { MaterialsService } from '../../services/materialsService';
import { MaterialStats } from '../../types/materials';
import { 
  BookOpen, 
  Download, 
  Eye, 
  Star, 
  TrendingUp,
  FileText,
  Book,
  Video,
  Link as LinkIcon,
  FileCheck,
  FileImage
} from 'lucide-react';

interface MaterialsStatsProps {
  className?: string;
  showDetails?: boolean;
}

const MaterialsStats: React.FC<MaterialsStatsProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const [stats, setStats] = useState<MaterialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const materialStats = await MaterialsService.getMaterialStats();
      setStats(materialStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resumo':
        return <FileText className="h-4 w-4" />;
      case 'livro':
        return <Book className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      case 'exercicio':
        return <FileCheck className="h-4 w-4" />;
      case 'prova':
        return <FileImage className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      matematica: 'bg-blue-100 text-blue-800',
      fisica: 'bg-purple-100 text-purple-800',
      quimica: 'bg-green-100 text-green-800',
      programacao: 'bg-orange-100 text-orange-800',
      humanas: 'bg-pink-100 text-pink-800',
      biologia: 'bg-emerald-100 text-emerald-800',
      engenharia: 'bg-gray-100 text-gray-800',
      medicina: 'bg-red-100 text-red-800',
      direito: 'bg-indigo-100 text-indigo-800',
      economia: 'bg-yellow-100 text-yellow-800',
      outros: 'bg-slate-100 text-slate-800',
    };
    return colors[subject] || colors.outros;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <BookOpen className="h-8 w-8 mx-auto mb-2" />
          <p>Erro ao carregar estatísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <BookOpen className="h-6 w-6 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Estatísticas dos Materiais</h3>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalMaterials}</div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="h-5 w-5" />
            <span className="text-sm font-medium">Downloads</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-5 w-5" />
            <span className="text-sm font-medium">Visualizações</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="h-5 w-5" />
            <span className="text-sm font-medium">Avaliação</span>
          </div>
          <div className="text-2xl font-bold">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Distribuição por Tipo */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Por Tipo de Material</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(stats.materialsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(type)}
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type === 'resumo' ? 'Resumos' :
                       type === 'livro' ? 'Livros' :
                       type === 'video' ? 'Vídeos' :
                       type === 'link' ? 'Links' :
                       type === 'exercicio' ? 'Exercícios' :
                       type === 'prova' ? 'Provas' : type}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição por Matéria */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Por Matéria</h4>
            <div className="space-y-2">
              {Object.entries(stats.materialsBySubject)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([subject, count]) => (
                <div key={subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(subject)}`}>
                    {subject === 'matematica' ? 'Matemática' :
                     subject === 'fisica' ? 'Física' :
                     subject === 'quimica' ? 'Química' :
                     subject === 'programacao' ? 'Programação' :
                     subject === 'humanas' ? 'Humanas' :
                     subject === 'biologia' ? 'Biologia' :
                     subject === 'engenharia' ? 'Engenharia' :
                     subject === 'medicina' ? 'Medicina' :
                     subject === 'direito' ? 'Direito' :
                     subject === 'economia' ? 'Economia' :
                     subject === 'outros' ? 'Outros' : subject}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição por Dificuldade */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Por Nível de Dificuldade</h4>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(stats.materialsByDifficulty).map(([difficulty, count]) => (
                <div key={difficulty} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                    difficulty === 'iniciante' ? 'bg-green-100 text-green-800' :
                    difficulty === 'intermediario' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {difficulty === 'iniciante' ? 'Iniciante' :
                     difficulty === 'intermediario' ? 'Intermediário' :
                     'Avançado'}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MaterialsStats;
