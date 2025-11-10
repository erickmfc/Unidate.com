import React, { useState } from 'react';
import { 
  Filter, 
  X, 
  Search, 
  BookOpen, 
  FileText, 
  Video, 
  Link as LinkIcon,
  FileCheck,
  FileImage,
  ChevronDown
} from 'lucide-react';
import { 
  MaterialFilter, 
  MATERIAL_TYPES, 
  SUBJECTS, 
  MATERIAL_CATEGORIES, 
  DIFFICULTY_LEVELS,
  MATERIAL_TYPE_LABELS,
  SUBJECT_LABELS,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS
} from '../../types/materials';

interface MaterialFiltersProps {
  filters: MaterialFilter;
  onFiltersChange: (filters: MaterialFilter) => void;
  onSearch: (query: string) => void;
  className?: string;
}

const MaterialFilters: React.FC<MaterialFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  const handleFilterChange = (key: keyof MaterialFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleArrayFilterChange = (key: keyof MaterialFilter, value: string, checked: boolean) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onFiltersChange({
      ...filters,
      [key]: newArray.length > 0 ? newArray : undefined
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setSearchQuery('');
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    );
  };

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'resumo':
        return <FileText className="h-4 w-4" />;
      case 'livro':
        return <BookOpen className="h-4 w-4" />;
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

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            {hasActiveFilters() && (
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                Ativo
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Limpar</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Barra de pesquisa */}
        <form onSubmit={handleSearch} className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar materiais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </form>
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Tipos de Material */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Tipo de Material</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(MATERIAL_TYPES).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.type || []).includes(value)}
                    onChange={(e) => handleArrayFilterChange('type', value, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center space-x-2">
                    {getFilterIcon(value)}
                    <span className="text-sm text-gray-700">
                      {MATERIAL_TYPE_LABELS[value].split(' ').slice(1).join(' ')}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Matérias */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Matéria</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SUBJECTS).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.subject || []).includes(value)}
                    onChange={(e) => handleArrayFilterChange('subject', value, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{SUBJECT_LABELS[value]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Categoria</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(MATERIAL_CATEGORIES).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.category || []).includes(value)}
                    onChange={(e) => handleArrayFilterChange('category', value, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{CATEGORY_LABELS[value]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nível de Dificuldade */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Dificuldade</h4>
            <div className="space-y-2">
              {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.difficulty || []).includes(value)}
                    onChange={(e) => handleArrayFilterChange('difficulty', value, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{DIFFICULTY_LABELS[value]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Avaliação Mínima */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Avaliação Mínima</h4>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="minRating"
                    checked={filters.minRating === rating}
                    onChange={() => handleFilterChange('minRating', rating)}
                    className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center space-x-1">
                    {[...Array(rating)].map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    ))}
                    <span className="text-sm text-gray-700">{rating}+ estrelas</span>
                  </div>
                </label>
              ))}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="minRating"
                  checked={!filters.minRating}
                  onChange={() => handleFilterChange('minRating', undefined)}
                  className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Qualquer avaliação</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Filtros ativos (resumo) */}
      {!isExpanded && hasActiveFilters() && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {filters.type && filters.type.length > 0 && (
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                {filters.type.length} tipo(s)
              </span>
            )}
            {filters.subject && filters.subject.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {filters.subject.length} matéria(s)
              </span>
            )}
            {filters.category && filters.category.length > 0 && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                {filters.category.length} categoria(s)
              </span>
            )}
            {filters.difficulty && filters.difficulty.length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                {filters.difficulty.length} dificuldade(s)
              </span>
            )}
            {filters.minRating && (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                {filters.minRating}+ estrelas
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialFilters;
