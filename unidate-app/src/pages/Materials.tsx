import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MaterialsService } from '../services/materialsService';
import { 
  EducationalMaterial, 
  MaterialFilter, 
  MaterialUploadData,
  MaterialStats
} from '../types/materials';
import MaterialCard from '../components/Materials/MaterialCard';
import MaterialFilters from '../components/Materials/MaterialFilters';
import MaterialUploadModal from '../components/Materials/MaterialUploadModal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  Plus, 
  BookOpen, 
  TrendingUp, 
  Search,
  Filter,
  Grid,
  List,
  Download,
  Eye,
  Star
} from 'lucide-react';

const Materials: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [materials, setMaterials] = useState<EducationalMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<EducationalMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState<MaterialStats | null>(null);
  const [filters, setFilters] = useState<MaterialFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  // Carregar materiais iniciais
  const loadMaterials = useCallback(async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setLastDoc(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const { materials: newMaterials, lastDoc: newLastDoc } = await MaterialsService.getMaterials(
        filters,
        20,
        reset ? undefined : lastDoc
      );

      if (reset) {
        setMaterials(newMaterials);
      } else {
        setMaterials(prev => [...prev, ...newMaterials]);
      }

      setLastDoc(newLastDoc);
      setHasMore(newMaterials.length === 20);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, lastDoc]);

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    try {
      const materialStats = await MaterialsService.getMaterialStats();
      setStats(materialStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  // Filtrar materiais localmente
  const filterMaterials = useCallback(() => {
    let filtered = [...materials];

    // Filtro por texto de busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(query) ||
        material.description.toLowerCase().includes(query) ||
        material.tags.some(tag => tag.toLowerCase().includes(query)) ||
        material.authorName.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  }, [materials, searchQuery]);

  // Efeitos
  useEffect(() => {
    loadMaterials(true);
    loadStats();
  }, [loadMaterials, loadStats]);

  useEffect(() => {
    filterMaterials();
  }, [filterMaterials]);

  // Handlers
  const handleFiltersChange = (newFilters: MaterialFilter) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleUploadMaterial = async (data: MaterialUploadData) => {
    if (!currentUser || !userProfile) {
      throw new Error('Usuário não autenticado');
    }

    setUploadLoading(true);
    try {
      await MaterialsService.createMaterial(data, currentUser.uid, userProfile.displayName || 'Usuário');
      // Recarregar materiais após upload
      await loadMaterials(true);
      await loadStats();
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownload = async (materialId: string) => {
    if (!currentUser) return;
    
    try {
      await MaterialsService.addDownload(materialId, currentUser.uid);
      // Atualizar estatísticas locais
      setMaterials(prev => prev.map(material => 
        material.id === materialId 
          ? { ...material, totalDownloads: material.totalDownloads + 1 }
          : material
      ));
    } catch (error) {
      console.error('Erro ao registrar download:', error);
    }
  };

  const handleView = async (materialId: string) => {
    try {
      await MaterialsService.incrementViews(materialId);
      // Atualizar estatísticas locais
      setMaterials(prev => prev.map(material => 
        material.id === materialId 
          ? { ...material, views: material.views + 1 }
          : material
      ));
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  };

  const loadMoreMaterials = () => {
    if (!loadingMore && hasMore) {
      loadMaterials(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <span>Materiais Educacionais</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Compartilhe e descubra materiais de estudo de qualidade
              </p>
            </div>
            
            {currentUser && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Compartilhar Material</span>
              </button>
            )}
          </div>

          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-600">Total</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalMaterials}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Downloads</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalDownloads.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Visualizações</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalViews.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-600">Avaliação Média</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar com Filtros */}
          <div className="lg:w-80 flex-shrink-0">
            <MaterialFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
            />
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            {/* Controles */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 'is' : ''} encontrado{filteredMaterials.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Lista de Materiais */}
            {filteredMaterials.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum material encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Tente ajustar os filtros ou buscar por outros termos
                </p>
                {currentUser && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Seja o primeiro a compartilhar!
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredMaterials.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      onDownload={handleDownload}
                      onView={handleView}
                    />
                  ))}
                </div>

                {/* Botão Carregar Mais */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMoreMaterials}
                      disabled={loadingMore}
                      className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span>Carregando...</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4" />
                          <span>Carregar Mais</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Upload */}
      <MaterialUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadMaterial}
        isLoading={uploadLoading}
      />
    </div>
  );
};

export default Materials;
