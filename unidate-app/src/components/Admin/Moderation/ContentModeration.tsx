import React, { useState, useEffect } from 'react';
import { 
  Flag, 
  User, 
  Clock, 
  Eye, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  UserX,
  MessageSquare,
  Image,
  Hash,
  Filter,
  Search,
  MoreVertical,
  Shield,
  Ban,
  Mail
} from 'lucide-react';

interface Report {
  id: string;
  type: 'post' | 'comment' | 'profile' | 'group';
  content: {
    text?: string;
    imageUrl?: string;
    author: string;
    authorId: string;
    createdAt: Date;
  };
  report: {
    reason: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'violence' | 'other';
    description: string;
    reporterId: string;
    reporterName: string;
    reportedAt: Date;
  };
  status: 'pending' | 'reviewed' | 'resolved';
  priority: 'low' | 'medium' | 'high';
}

const ContentModeration: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [filterReason, setFilterReason] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Simular carregamento de denúncias
  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados simulados
      const mockReports: Report[] = [
        {
          id: '1',
          type: 'post',
          content: {
            text: 'Alguém tem as respostas da prova de cálculo? Preciso urgentemente!',
            author: 'joao123',
            authorId: 'user1',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          report: {
            reason: 'spam',
            description: 'Post pedindo respostas de prova, violando as regras acadêmicas',
            reporterId: 'user2',
            reporterName: 'maria456',
            reportedAt: new Date(Date.now() - 30 * 60 * 1000)
          },
          status: 'pending',
          priority: 'high'
        },
        {
          id: '2',
          type: 'post',
          content: {
            text: 'Que dia lindo para estudar! #estudando #foco #universidade',
            imageUrl: '/api/placeholder/300/200',
            author: 'ana789',
            authorId: 'user3',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          report: {
            reason: 'inappropriate',
            description: 'Conteúdo inapropriado na imagem',
            reporterId: 'user4',
            reporterName: 'pedro321',
            reportedAt: new Date(Date.now() - 15 * 60 * 1000)
          },
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '3',
          type: 'comment',
          content: {
            text: 'Você é muito burra, não deveria estar na universidade',
            author: 'carlos555',
            authorId: 'user5',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
          },
          report: {
            reason: 'harassment',
            description: 'Comentário ofensivo e desrespeitoso',
            reporterId: 'user6',
            reporterName: 'sofia888',
            reportedAt: new Date(Date.now() - 10 * 60 * 1000)
          },
          status: 'pending',
          priority: 'high'
        }
      ];

      setReports(mockReports);
      setFilteredReports(mockReports);
      setLoading(false);
    };

    loadReports();
  }, []);

  // Filtrar denúncias
  useEffect(() => {
    let filtered = reports;

    if (filterReason !== 'all') {
      filtered = filtered.filter(report => report.report.reason === filterReason);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(report => report.priority === filterPriority);
    }

    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.content.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.content.text?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [reports, filterReason, filterPriority, searchTerm]);

  const getReasonLabel = (reason: Report['report']['reason']) => {
    const labels = {
      spam: 'Spam',
      harassment: 'Assédio',
      inappropriate: 'Inapropriado',
      fake: 'Fake/Impostor',
      violence: 'Violência',
      other: 'Outro'
    };
    return labels[reason];
  };

  const getReasonColor = (reason: Report['report']['reason']) => {
    const colors = {
      spam: 'bg-yellow-100 text-yellow-800',
      harassment: 'bg-red-100 text-red-800',
      inappropriate: 'bg-orange-100 text-orange-800',
      fake: 'bg-purple-100 text-purple-800',
      violence: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[reason];
  };

  const getPriorityColor = (priority: Report['priority']) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority];
  };

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'profile':
        return <User className="h-4 w-4" />;
      case 'group':
        return <Hash className="h-4 w-4" />;
      default:
        return <Flag className="h-4 w-4" />;
    }
  };

  const handleReportAction = async (reportId: string, action: 'ignore' | 'remove' | 'warn' | 'suspend') => {
    // Simular ação de moderação
    console.log(`Ação ${action} aplicada ao report ${reportId}`);
    
    // Atualizar status do report
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: 'resolved' as const }
        : report
    ));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderação de Conteúdo</h1>
          <p className="text-gray-600">{filteredReports.length} denúncias pendentes</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Atualizado em tempo real</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por autor, denunciante ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Reason Filter */}
          <div className="sm:w-48">
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos os motivos</option>
              <option value="spam">Spam</option>
              <option value="harassment">Assédio</option>
              <option value="inappropriate">Inapropriado</option>
              <option value="fake">Fake/Impostor</option>
              <option value="violence">Violência</option>
              <option value="other">Outro</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="sm:w-48">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todas as prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedReport(report);
              setShowReportDetail(true);
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getTypeIcon(report.type)}
                <span className="text-sm font-medium text-gray-900 capitalize">{report.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                  {report.priority === 'high' ? 'Alta' : report.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </div>
            </div>

            {/* Content Preview */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Autor:</strong> {report.content.author}
              </div>
              {report.content.text && (
                <div className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 mb-3">
                  {report.content.text.length > 100 
                    ? `${report.content.text.substring(0, 100)}...` 
                    : report.content.text
                  }
                </div>
              )}
              {report.content.imageUrl && (
                <div className="mb-3">
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Report Info */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(report.report.reason)}`}>
                  {getReasonLabel(report.report.reason)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(report.report.reportedAt)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Denunciado por:</strong> {report.report.reporterName}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {report.report.description}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReportAction(report.id, 'ignore');
                  }}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Ignorar</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReportAction(report.id, 'remove');
                  }}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Remover</span>
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReport(report);
                  setShowReportDetail(true);
                }}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Ver detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma denúncia encontrada</h3>
          <p className="text-gray-500">
            {reports.length === 0 
              ? 'Não há denúncias pendentes no momento.' 
              : 'Tente ajustar os filtros para ver mais resultados.'
            }
          </p>
        </div>
      )}

      {/* Report Detail Modal */}
      {showReportDetail && selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowReportDetail(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Detalhes da Denúncia</h3>
                  <button
                    onClick={() => setShowReportDetail(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Content */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Conteúdo Denunciado</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{selectedReport.content.author}</span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(selectedReport.content.createdAt)}
                        </span>
                      </div>
                      {selectedReport.content.text && (
                        <p className="text-sm text-gray-800 mb-3">{selectedReport.content.text}</p>
                      )}
                      {selectedReport.content.imageUrl && (
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Image className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Report Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Detalhes da Denúncia</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Motivo:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(selectedReport.report.reason)}`}>
                          {getReasonLabel(selectedReport.report.reason)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Denunciado por:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedReport.report.reporterName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Data da denúncia:</span>
                        <span className="text-sm text-gray-900">{formatTimeAgo(selectedReport.report.reportedAt)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Descrição:</span>
                        <p className="text-sm text-gray-900 mt-1">{selectedReport.report.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleReportAction(selectedReport.id, 'ignore');
                      setShowReportDetail(false);
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:w-auto sm:text-sm"
                  >
                    Ignorar
                  </button>
                  <button
                    onClick={() => {
                      handleReportAction(selectedReport.id, 'remove');
                      setShowReportDetail(false);
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
                  >
                    Remover Conteúdo
                  </button>
                  <button
                    onClick={() => {
                      handleReportAction(selectedReport.id, 'warn');
                      setShowReportDetail(false);
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:w-auto sm:text-sm"
                  >
                    Advertir Autor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentModeration;
