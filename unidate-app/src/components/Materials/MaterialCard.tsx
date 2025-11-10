import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  Eye, 
  Star, 
  FileText, 
  Book, 
  Video, 
  Link as LinkIcon,
  FileCheck,
  FileImage,
  Calendar,
  User,
  Tag,
  Heart,
  Share2
} from 'lucide-react';
import QuickAction from '../UI/QuickAction';
import StatusIndicator from '../UI/StatusIndicator';
import { EducationalMaterial, MATERIAL_TYPE_LABELS, SUBJECT_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../../types/materials';

interface MaterialCardProps {
  material: EducationalMaterial;
  onDownload?: (materialId: string) => void;
  onView?: (materialId: string) => void;
  onLike?: (materialId: string) => void;
  onShare?: (materialId: string) => void;
  showAuthor?: boolean;
  isLiked?: boolean;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ 
  material, 
  onDownload, 
  onView, 
  onLike,
  onShare,
  showAuthor = true,
  isLiked = false
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');

  const handleDownload = async () => {
    if (onDownload) {
      setIsDownloading(true);
      setDownloadStatus('downloading');
      try {
        await onDownload(material.id);
        setDownloadStatus('success');
        setTimeout(() => setDownloadStatus('idle'), 2000);
      } catch (error) {
        setDownloadStatus('error');
        setTimeout(() => setDownloadStatus('idle'), 3000);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleLike = () => {
    if (onLike) {
      onLike(material.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(material.id);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'resumo':
        return <FileText className="h-5 w-5" />;
      case 'livro':
        return <Book className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      case 'exercicio':
        return <FileCheck className="h-5 w-5" />;
      case 'prova':
        return <FileImage className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group">
      {/* Header com tipo e dificuldade */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="text-indigo-600">
              {getMaterialIcon(material.type)}
            </div>
            <span className="text-sm font-medium text-gray-600">
              {MATERIAL_TYPE_LABELS[material.type]}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[material.difficulty]}`}>
            {DIFFICULTY_LABELS[material.difficulty]}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {material.title}
        </h3>

        {/* Descrição */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {material.description}
        </p>

        {/* Tags */}
        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {material.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
            {material.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{material.tags.length - 3} mais
              </span>
            )}
          </div>
        )}
      </div>

      {/* Informações do material */}
      <div className="p-4">
        {/* Matéria e universidade */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span className="font-medium">{SUBJECT_LABELS[material.subject]}</span>
          {material.university && (
            <span className="text-gray-500">{material.university}</span>
          )}
        </div>

        {/* Estatísticas */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            {/* Avaliação */}
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {renderStars(material.averageRating)}
              </div>
              <span className="ml-1">
                {material.averageRating > 0 ? material.averageRating.toFixed(1) : 'N/A'}
              </span>
              {material.totalRatings > 0 && (
                <span className="text-gray-400">({material.totalRatings})</span>
              )}
            </div>

            {/* Downloads */}
            <div className="flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>{material.totalDownloads}</span>
            </div>

            {/* Visualizações */}
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{material.views}</span>
            </div>
          </div>

          {/* Data */}
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(material.createdAt)}</span>
          </div>
        </div>

        {/* Autor */}
        {showAuthor && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <User className="h-4 w-4" />
            <span>Por {material.authorName}</span>
          </div>
        )}

        {/* Informações do arquivo */}
        {material.fileSize && (
          <div className="text-xs text-gray-500 mb-4">
            Tamanho: {formatFileSize(material.fileSize)}
          </div>
        )}

        {/* Status do Download */}
        {downloadStatus !== 'idle' && (
          <div className="mb-3">
            <StatusIndicator
              status={downloadStatus === 'downloading' ? 'loading' : downloadStatus === 'success' ? 'success' : 'error'}
              message={
                downloadStatus === 'downloading' ? 'Baixando...' :
                downloadStatus === 'success' ? 'Download concluído!' :
                'Erro no download'
              }
              size="sm"
            />
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex space-x-2">
          <Link
            to={`/materials/${material.id}`}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors text-center"
            onClick={() => onView?.(material.id)}
          >
            Ver Detalhes
          </Link>
          
          {material.fileUrl && onDownload && (
            <QuickAction
              onAction={handleDownload}
              icon={<Download className="h-4 w-4" />}
              label="Baixar"
              variant="success"
              size="sm"
              disabled={isDownloading}
            />
          )}
          
          {material.externalUrl && (
            <a
              href={material.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center space-x-1"
            >
              <LinkIcon className="h-4 w-4" />
              <span>Abrir</span>
            </a>
          )}
        </div>

        {/* Ações secundárias */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            {onLike && (
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>Curtir</span>
              </button>
            )}
            
            {onShare && (
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Compartilhar</span>
              </button>
            )}
          </div>
          
          <div className="text-xs text-gray-400">
            {material.totalDownloads} downloads
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
