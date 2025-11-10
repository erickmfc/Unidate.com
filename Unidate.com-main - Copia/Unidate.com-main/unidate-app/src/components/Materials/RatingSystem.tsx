import React, { useState } from 'react';
import { Star, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { MaterialRating } from '../../types/materials';

interface RatingSystemProps {
  materialId: string;
  currentRating?: MaterialRating;
  averageRating: number;
  totalRatings: number;
  onRate: (rating: number, comment?: string) => Promise<void>;
  onLike?: () => void;
  onDislike?: () => void;
  isLiked?: boolean;
  isDisliked?: boolean;
  className?: string;
}

const RatingSystem: React.FC<RatingSystemProps> = ({
  materialId,
  currentRating,
  averageRating,
  totalRatings,
  onRate,
  onLike,
  onDislike,
  isLiked = false,
  isDisliked = false,
  className = ''
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState(currentRating?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = async (rating: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onRate(rating, comment || undefined);
      setShowCommentForm(false);
    } catch (error) {
      console.error('Erro ao avaliar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRating && comment.trim()) {
      await handleStarClick(currentRating.rating);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    const stars = [];
    const displayRating = interactive ? hoveredRating || rating : rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive || isSubmitting}
          onClick={() => interactive && handleStarClick(i)}
          onMouseEnter={() => interactive && setHoveredRating(i)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          className={`transition-colors ${
            interactive 
              ? 'hover:scale-110 cursor-pointer' 
              : 'cursor-default'
          } ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Star
            className={`h-6 w-6 ${
              i <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      );
    }

    return stars;
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Muito ruim';
      case 2:
        return 'Ruim';
      case 3:
        return 'Regular';
      case 4:
        return 'Bom';
      case 5:
        return 'Excelente';
      default:
        return 'Sem avaliação';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    if (rating >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Avaliações</h3>
        <div className="flex items-center space-x-2">
          {onLike && (
            <button
              onClick={onLike}
              className={`p-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
          )}
          {onDislike && (
            <button
              onClick={onDislike}
              className={`p-2 rounded-lg transition-colors ${
                isDisliked 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Rating Display */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
          </div>
          <div className="flex items-center justify-center space-x-1">
            {renderStars(averageRating)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {totalRatings} avaliação{totalRatings !== 1 ? 'ões' : ''}
          </div>
        </div>

        {/* Rating Breakdown */}
        {totalRatings > 0 && (
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = Math.floor(Math.random() * totalRatings); // Simulado - deveria vir do backend
              const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-gray-600 w-2">{star}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Rating */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {currentRating ? 'Sua Avaliação' : 'Avalie este material'}
        </h4>

        {currentRating ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(currentRating.rating)}
              </div>
              <span className={`text-sm font-medium ${getRatingColor(currentRating.rating)}`}>
                {getRatingText(currentRating.rating)}
              </span>
            </div>

            {currentRating.comment && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{currentRating.comment}</p>
              </div>
            )}

            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>
                {showCommentForm ? 'Cancelar' : currentRating.comment ? 'Editar comentário' : 'Adicionar comentário'}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {renderStars(0, true)}
              <span className="text-sm text-gray-600">
                {hoveredRating > 0 ? getRatingText(hoveredRating) : 'Clique para avaliar'}
              </span>
            </div>

            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Adicionar comentário (opcional)</span>
            </button>
          </div>
        )}

        {/* Comment Form */}
        {showCommentForm && (
          <form onSubmit={handleCommentSubmit} className="mt-4 space-y-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Compartilhe sua experiência com este material..."
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCommentForm(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recent Reviews */}
      {totalRatings > 0 && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Avaliações Recentes</h4>
          <div className="space-y-4">
            {/* Simulado - deveria vir do backend */}
            {[5, 4, 3].map((rating, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {['A', 'B', 'C'][index]}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      Usuário {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(rating)}
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  {rating === 5 && "Material excelente! Muito útil para os estudos."}
                  {rating === 4 && "Bom material, ajudou bastante na compreensão."}
                  {rating === 3 && "Material regular, poderia ter mais exemplos."}
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(Date.now() - index * 86400000).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingSystem;
