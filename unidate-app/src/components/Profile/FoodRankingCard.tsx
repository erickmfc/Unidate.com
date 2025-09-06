import React, { useState } from 'react';
import { Star, Plus, Trash2, Edit3, MapPin } from 'lucide-react';
import { FoodRating } from '../../types/profile';

interface FoodRankingCardProps {
  ratings: FoodRating[];
  onUpdate: (ratings: FoodRating[]) => void;
  isEditable?: boolean;
}

const FoodRankingCard: React.FC<FoodRankingCardProps> = ({
  ratings,
  onUpdate,
  isEditable = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newRating, setNewRating] = useState({ name: '', location: '', rating: 5, comment: '' });

  const addRating = () => {
    if (newRating.name && newRating.location) {
      const rating: FoodRating = {
        id: Date.now().toString(),
        name: newRating.name,
        location: newRating.location,
        rating: newRating.rating,
        comment: newRating.comment
      };
      onUpdate([...ratings, rating]);
      setNewRating({ name: '', location: '', rating: 5, comment: '' });
    }
  };

  const removeRating = (id: string) => {
    onUpdate(ratings.filter(rating => rating.id !== id));
  };

  const updateRating = (id: string, newRatingValue: number) => {
    onUpdate(ratings.map(rating => 
      rating.id === id ? { ...rating, rating: newRatingValue } : rating
    ));
  };

  const renderStars = (rating: number, isInteractive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => isInteractive && onRatingChange?.(star)}
            disabled={!isInteractive}
            className={`${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Ranking de Comida</h3>
        {isEditable && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {ratings
          .sort((a, b) => b.rating - a.rating)
          .map((rating) => (
            <div key={rating.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-800">{rating.name}</h4>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{rating.location}</span>
                  </div>
                </div>
                {isEditable && isEditing ? (
                  renderStars(rating.rating, true, (newRatingValue) => updateRating(rating.id, newRatingValue))
                ) : (
                  renderStars(rating.rating)
                )}
                {rating.comment && (
                  <p className="text-xs text-gray-600 mt-1">{rating.comment}</p>
                )}
              </div>
              {isEditable && isEditing && (
                <button
                  onClick={() => removeRating(rating.id)}
                  className="p-1 text-red-400 hover:text-red-600 transition-colors ml-2"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
      </div>

      {isEditable && isEditing && (
        <div className="border-t pt-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome do lanche/restaurante"
              value={newRating.name}
              onChange={(e) => setNewRating({ ...newRating, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Local (ex: Cantina, Restaurante X)"
              value={newRating.location}
              onChange={(e) => setNewRating({ ...newRating, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avaliação:</label>
              {renderStars(newRating.rating, true, (rating) => setNewRating({ ...newRating, rating }))}
            </div>
            <input
              type="text"
              placeholder="Comentário (opcional)"
              value={newRating.comment}
              onChange={(e) => setNewRating({ ...newRating, comment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={addRating}
            disabled={!newRating.name || !newRating.location}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-3"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Avaliação</span>
          </button>
        </div>
      )}

      {ratings.length === 0 && !isEditing && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Nenhuma avaliação adicionada ainda</p>
          {isEditable && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 text-purple-500 hover:text-purple-600 text-sm font-medium"
            >
              Adicionar avaliações
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodRankingCard;
