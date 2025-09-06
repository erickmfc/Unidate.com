import React, { useState } from 'react';
import { Heart, X, Edit3 } from 'lucide-react';
import { SubjectPair } from '../../types/profile';

interface SubjectsCardProps {
  subjects: SubjectPair;
  onUpdate: (subjects: SubjectPair) => void;
  isEditable?: boolean;
}

const SubjectsCard: React.FC<SubjectsCardProps> = ({
  subjects,
  onUpdate,
  isEditable = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editSubjects, setEditSubjects] = useState(subjects);

  const handleSave = () => {
    onUpdate(editSubjects);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditSubjects(subjects);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Matérias (Amor e Ódio)</h3>
        {isEditable && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Heart className="w-4 h-4 inline mr-1 text-red-500" />
              Matéria que você ama:
            </label>
            <input
              type="text"
              value={editSubjects.love}
              onChange={(e) => setEditSubjects({ ...editSubjects, love: e.target.value })}
              placeholder="Ex: Programação, História, Matemática..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <X className="w-4 h-4 inline mr-1 text-gray-500" />
              Matéria que você odeia:
            </label>
            <input
              type="text"
              value={editSubjects.hate}
              onChange={(e) => setEditSubjects({ ...editSubjects, hate: e.target.value })}
              placeholder="Ex: Física, Química, Português..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Salvar
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.love && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">Amo</p>
                <p className="text-sm text-gray-600">{subjects.love}</p>
              </div>
            </div>
          )}
          
          {subjects.hate && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">Odeio</p>
                <p className="text-sm text-gray-600">{subjects.hate}</p>
              </div>
            </div>
          )}

          {!subjects.love && !subjects.hate && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Nenhuma matéria adicionada ainda</p>
              {isEditable && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-purple-500 hover:text-purple-600 text-sm font-medium"
                >
                  Adicionar matérias
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectsCard;
