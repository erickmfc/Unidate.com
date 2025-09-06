import React, { useState } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { SurvivalKitItem } from '../../types/profile';

interface SurvivalKitCardProps {
  items: SurvivalKitItem[];
  onUpdate: (items: SurvivalKitItem[]) => void;
  isEditable?: boolean;
}

const SurvivalKitCard: React.FC<SurvivalKitCardProps> = ({
  items,
  onUpdate,
  isEditable = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newItem, setNewItem] = useState({ emoji: '', name: '', description: '' });

  const commonEmojis = ['☕', '🎧', '📚', '💻', '🍕', '🥤', '🍫', '📱', '🔋', '💊', '🧠', '💪', '😴', '🎵', '📝', '✏️'];

  const addItem = () => {
    if (newItem.emoji && newItem.name && items.length < 5) {
      const item: SurvivalKitItem = {
        id: Date.now().toString(),
        emoji: newItem.emoji,
        name: newItem.name,
        description: newItem.description
      };
      onUpdate([...items, item]);
      setNewItem({ emoji: '', name: '', description: '' });
    }
  };

  const removeItem = (id: string) => {
    onUpdate(items.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Kit de Sobrevivência</h3>
        {isEditable && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
              {item.description && (
                <p className="text-xs text-gray-500 truncate">{item.description}</p>
              )}
            </div>
            {isEditable && isEditing && (
              <button
                onClick={() => removeItem(item.id)}
                className="p-1 text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {isEditable && isEditing && items.length < 5 && (
        <div className="border-t pt-4">
          <div className="flex space-x-2 mb-3">
            <select
              value={newItem.emoji}
              onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Escolha um emoji</option>
              {commonEmojis.map(emoji => (
                <option key={emoji} value={emoji}>{emoji}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nome do item"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
          />
          <button
            onClick={addItem}
            disabled={!newItem.emoji || !newItem.name}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Item</span>
          </button>
        </div>
      )}

      {items.length === 0 && !isEditing && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Nenhum item adicionado ainda</p>
          {isEditable && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 text-purple-500 hover:text-purple-600 text-sm font-medium"
            >
              Adicionar itens
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SurvivalKitCard;
