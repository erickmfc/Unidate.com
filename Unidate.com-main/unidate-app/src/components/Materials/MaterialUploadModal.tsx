import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Book, 
  Video, 
  Link as LinkIcon,
  FileCheck,
  FileImage,
  Plus,
  AlertCircle
} from 'lucide-react';
import { 
  MaterialUploadData, 
  MATERIAL_TYPES, 
  SUBJECTS, 
  MATERIAL_CATEGORIES, 
  DIFFICULTY_LEVELS,
  MATERIAL_TYPE_LABELS,
  SUBJECT_LABELS,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS
} from '../../types/materials';

interface MaterialUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialUploadData) => Promise<void>;
  isLoading?: boolean;
}

const MaterialUploadModal: React.FC<MaterialUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<MaterialUploadData>({
    title: '',
    description: '',
    type: 'resumo',
    subject: 'matematica',
    category: 'resumos',
    difficulty: 'iniciante',
    tags: [],
    university: '',
    course: '',
    language: 'pt-BR'
  });
  
  const [newTag, setNewTag] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof MaterialUploadData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExternalUrl(''); // Limpar URL externa se arquivo for selecionado
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (formData.type === 'link' && !externalUrl.trim()) {
      newErrors.externalUrl = 'URL é obrigatória para links';
    }

    if (formData.type !== 'link' && !selectedFile) {
      newErrors.file = 'Arquivo é obrigatório';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'Pelo menos uma tag é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        file: selectedFile || undefined,
        externalUrl: externalUrl || undefined
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'resumo',
        subject: 'matematica',
        category: 'resumos',
        difficulty: 'iniciante',
        tags: [],
        university: '',
        course: '',
        language: 'pt-BR'
      });
      setSelectedFile(null);
      setExternalUrl('');
      setNewTag('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Erro ao enviar material:', error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Upload className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Compartilhar Material</h2>
              <p className="text-sm text-gray-600">Ajude outros estudantes compartilhando seus materiais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Material */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Material
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(MATERIAL_TYPES).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleInputChange('type', value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getMaterialIcon(value)}
                    <span className="text-sm font-medium">
                      {MATERIAL_TYPE_LABELS[value].split(' ').slice(1).join(' ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ex: Resumo de Cálculo I - Derivadas e Integrais"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Descreva o conteúdo do material, tópicos abordados, etc."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Matéria e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matéria
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.entries(SUBJECTS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {SUBJECT_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.entries(MATERIAL_CATEGORIES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dificuldade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nível de Dificuldade
            </label>
            <div className="flex space-x-3">
              {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleInputChange('difficulty', value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.difficulty === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {DIFFICULTY_LABELS[value]}
                </button>
              ))}
            </div>
          </div>

          {/* Upload de Arquivo ou URL */}
          {formData.type === 'link' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Recurso *
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.externalUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://exemplo.com/recurso"
              />
              {errors.externalUrl && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.externalUrl}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">Clique para selecionar um arquivo</p>
                    <p className="text-xs text-gray-500">PDF, DOC, TXT, EPUB, MP4, AVI</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.epub,.mp4,.avi,.jpg,.jpeg,.png"
                className="hidden"
              />
              {errors.file && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.file}
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Adicionar tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.tags}
              </p>
            )}
          </div>

          {/* Universidade e Curso */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Universidade
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => handleInputChange('university', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: USP, UNICAMP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso
              </label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => handleInputChange('course', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Engenharia, Medicina"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Compartilhar Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialUploadModal;
