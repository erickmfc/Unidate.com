import React, { useState } from 'react';
import { Edit3, Save, X, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface EditableContentBlockProps {
  title?: string;
  content: string;
  onSave?: (content: string) => void;
  isEditable?: boolean;
  maxLength?: number;
  className?: string;
}

const EditableContentBlock: React.FC<EditableContentBlockProps> = ({
  title,
  content,
  onSave,
  isEditable = true,
  maxLength = 1000,
  className = ''
}) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    if (onSave) {
      onSave(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const canEdit = isEditable && currentUser;

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-serif text-yellow-400 flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>{title}</span>
          </h3>
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full bg-gray-900 text-white rounded-lg p-4 border border-gray-600 focus:border-yellow-400 focus:outline-none resize-none"
            rows={6}
            maxLength={maxLength}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {editedContent.length}/{maxLength} caracteres
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      )}
    </div>
  );
};

export default EditableContentBlock;

