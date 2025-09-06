import React from 'react';
import { Edit3, X, Plus } from 'lucide-react';

interface ProfileCardProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  isEditable?: boolean;
  className?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  title,
  children,
  onEdit,
  onDelete,
  onAdd,
  isEditable = false,
  className = ''
}) => {
  return (
    <div className={`card group hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {isEditable && (
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onAdd && (
              <button
                onClick={onAdd}
                className="p-1 text-primary-600 hover:bg-primary-100 rounded"
                title="Adicionar item"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                title="Editar"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                title="Remover card"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default ProfileCard;

