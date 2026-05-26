import React, { useState } from 'react';
import { Edit3, Save } from 'lucide-react';

interface EditableContentBlockProps {
  title: string;
  content: string;
  onSave: (content: string) => void;
  isEditable?: boolean;
  maxLength?: number;
}

const EditableContentBlock: React.FC<EditableContentBlockProps> = ({
  title,
  content,
  onSave,
  isEditable = false,
  maxLength = 500,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleSave = () => {
    onSave(editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        {isEditable && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
            title="Editar conteúdo"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={maxLength}
            className="w-full bg-gray-800 text-white rounded-lg p-4 border border-gray-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 min-h-[120px] resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {editContent.length}/{maxLength}
            </span>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
};

export default EditableContentBlock;
