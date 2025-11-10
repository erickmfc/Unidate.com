import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MaterialsService } from '../services/materialsService';
import { EducationalMaterial, MaterialRating } from '../types/materials';
import MaterialCard from '../components/Materials/MaterialCard';
import RatingSystem from '../components/Materials/RatingSystem';
import MaterialMetrics from '../components/Materials/MaterialMetrics';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  Share2, 
  BookOpen, 
  Calendar,
  User,
  Tag,
  ExternalLink,
  FileText,
  Book,
  Video,
  Link as LinkIcon,
  FileCheck,
  FileImage,
  AlertCircle
} from 'lucide-react';

const MaterialDetails: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [material, setMaterial] = useState<EducationalMaterial | null>(null);
  const [relatedMaterials, setRelatedMaterials] = useState<EducationalMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<MaterialRating | null>(null);

  useEffect(() => {
    if (materialId) {
      loadMaterial();
    }
  }, [materialId]);

  const loadMaterial = async () => {
    if (!materialId) return;

    try {
      setLoading(true);
      setError(null);

      const materialData = await MaterialsService.getMaterialById(materialId);
      
      if (!materialData) {
        setError('Material não encontrado');
        return;
      }

      setMaterial(materialData);

      // Encontrar avaliação do usuário atual
      if (currentUser) {
        const rating = materialData.ratings.find(r => r.userId === currentUser.uid);
        setUserRating(rating || null);
      }

      // Incrementar visualizações
      await MaterialsService.incrementViews(materialId);

      // Carregar materiais relacionados
      await loadRelatedMaterials(materialData);
    } catch (error) {
      console.error('Erro ao carregar material:', error);
      setError('Erro ao carregar material');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedMaterials = async (currentMaterial: EducationalMaterial) => {
    try {
      // Buscar materiais da mesma matéria e categoria
      const { materials } = await MaterialsService.getMaterials({
        subject: [currentMaterial.subject],
        category: [currentMaterial.category]
      }, 4);

      // Filtrar o material atual e pegar os primeiros 3
      const related = materials
        .filter(m => m.id !== currentMaterial.id)
        .slice(0, 3);

      setRelatedMaterials(related);
    } catch (error) {
      console.error('Erro ao carregar materiais relacionados:', error);
    }
  };

  const handleDownload = async () => {
    if (!material || !currentUser) return;

    try {
      await MaterialsService.addDownload(material.id, currentUser.uid);
      
      // Atualizar estatísticas locais
      setMaterial(prev => prev ? {
        ...prev,
        totalDownloads: prev.totalDownloads + 1
      } : null);

      // Se for um arquivo, iniciar download
      if (material.fileUrl) {
        const link = document.createElement('a');
        link.href = material.fileUrl;
        link.download = material.fileName || 'material';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Erro ao fazer download:', error);
    }
  };

  const handleRate = async (rating: number, comment?: string) => {
    if (!material || !currentUser) return;

    try {
      await MaterialsService.addRating(material.id, currentUser.uid, rating, comment);
      
      // Recarregar material para obter avaliações atualizadas
      await loadMaterial();
    } catch (error) {
      console.error('Erro ao avaliar material:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: material?.title,
          text: material?.description,
          url: window.location.href,
        });
        
        // Registrar compartilhamento
        if (material && currentUser) {
          await MaterialsService.addShare(material.id, currentUser.uid);
        }
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar URL para clipboard
      navigator.clipboard.writeText(window.location.href);
      
      // Registrar compartilhamento
      if (material && currentUser) {
        await MaterialsService.addShare(material.id, currentUser.uid);
      }
      // Aqui você poderia mostrar um toast de sucesso
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'resumo':
        return <FileText className="h-6 w-6" />;
      case 'livro':
        return <Book className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'link':
        return <LinkIcon className="h-6 w-6" />;
      case 'exercicio':
        return <FileCheck className="h-6 w-6" />;
      case 'prova':
        return <FileImage className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Material não encontrado'}
          </h2>
          <p className="text-gray-600 mb-6">
            O material que você está procurando não existe ou foi removido.
          </p>
          <Link
            to="/materials"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Voltar aos Materiais
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/materials" className="hover:text-indigo-600">
            Materiais
          </Link>
          <span>/</span>
          <span className="text-gray-900">{material.title}</span>
        </div>

        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header do Material */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    {getMaterialIcon(material.type)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {material.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Por {material.authorName}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(material.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Descrição */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                {material.description}
              </p>

              {/* Tags */}
              {material.tags && material.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {material.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Informações do Arquivo */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Informações do Material</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <span className="ml-2 font-medium">{material.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Matéria:</span>
                    <span className="ml-2 font-medium">{material.subject}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Categoria:</span>
                    <span className="ml-2 font-medium">{material.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dificuldade:</span>
                    <span className="ml-2 font-medium">{material.difficulty}</span>
                  </div>
                  {material.fileSize && (
                    <div>
                      <span className="text-gray-600">Tamanho:</span>
                      <span className="ml-2 font-medium">{formatFileSize(material.fileSize)}</span>
                    </div>
                  )}
                  {material.university && (
                    <div>
                      <span className="text-gray-600">Universidade:</span>
                      <span className="ml-2 font-medium">{material.university}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3">
                {material.fileUrl && (
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download</span>
                  </button>
                )}
                
                {material.externalUrl && (
                  <a
                    href={material.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Abrir Link</span>
                  </a>
                )}
              </div>
            </div>

            {/* Sistema de Avaliação */}
            <RatingSystem
              materialId={material.id}
              currentRating={userRating || undefined}
              averageRating={material.averageRating}
              totalRatings={material.totalRatings}
              onRate={handleRate}
            />

            {/* Métricas do Material */}
            <MaterialMetrics
              material={material}
              showDetails={true}
              showTrends={false}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Downloads</span>
                  <span className="font-semibold text-gray-900">{material.totalDownloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Visualizações</span>
                  <span className="font-semibold text-gray-900">{material.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avaliações</span>
                  <span className="font-semibold text-gray-900">{material.totalRatings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avaliação Média</span>
                  <span className="font-semibold text-gray-900">
                    {material.averageRating > 0 ? material.averageRating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Materiais Relacionados */}
            {relatedMaterials.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Materiais Relacionados</h3>
                <div className="space-y-4">
                  {relatedMaterials.map((relatedMaterial) => (
                    <MaterialCard
                      key={relatedMaterial.id}
                      material={relatedMaterial}
                      showAuthor={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetails;
