import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  Eye,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Award,
  Target,
  Zap,
  Shield,
  Database,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2
} from 'lucide-react';

interface ReportData {
  id: string;
  title: string;
  description: string;
  type: 'users' | 'engagement' | 'traffic' | 'content' | 'system' | 'security';
  category: 'summary' | 'detailed' | 'comparative' | 'trend';
  data: any;
  generatedAt: Date;
  period: string;
  status: 'ready' | 'generating' | 'error';
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  icon: React.ComponentType<any>;
  isCustomizable: boolean;
  exportFormats: string[];
}

const AdvancedReports: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState<{[key: string]: any}>({});
  const [showFilters, setShowFilters] = useState(false);
  const [generating, setGenerating] = useState(false);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'user-summary',
      name: 'Resumo de Usuários',
      description: 'Visão geral dos usuários cadastrados e atividade',
      type: 'users',
      category: 'summary',
      icon: Users,
      isCustomizable: true,
      exportFormats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'engagement-detailed',
      name: 'Engajamento Detalhado',
      description: 'Análise profunda do engajamento dos usuários',
      type: 'engagement',
      category: 'detailed',
      icon: Heart,
      isCustomizable: true,
      exportFormats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'traffic-trends',
      name: 'Tendências de Tráfego',
      description: 'Análise de tráfego e comportamento dos usuários',
      type: 'traffic',
      category: 'trend',
      icon: TrendingUp,
      isCustomizable: true,
      exportFormats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'content-analysis',
      name: 'Análise de Conteúdo',
      description: 'Relatório sobre posts, comentários e interações',
      type: 'content',
      category: 'detailed',
      icon: MessageSquare,
      isCustomizable: true,
      exportFormats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'system-performance',
      name: 'Performance do Sistema',
      description: 'Métricas de performance e saúde do sistema',
      type: 'system',
      category: 'summary',
      icon: Zap,
      isCustomizable: false,
      exportFormats: ['pdf', 'excel']
    },
    {
      id: 'security-audit',
      name: 'Auditoria de Segurança',
      description: 'Relatório de segurança e atividades suspeitas',
      type: 'security',
      category: 'detailed',
      icon: Shield,
      isCustomizable: false,
      exportFormats: ['pdf']
    }
  ];

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados - em produção viriam do Firebase
        setReports([]);
        setTemplates(reportTemplates);
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const generateReport = async (templateId: string) => {
    try {
      setGenerating(true);
      
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const template = templates.find(t => t.id === templateId);
      if (!template) return;
      
      const newReport: ReportData = {
        id: `report-${Date.now()}`,
        title: template.name,
        description: template.description,
        type: template.type as any,
        category: template.category as any,
        data: {}, // Dados simulados
        generatedAt: new Date(),
        period: `${dateRange.start} - ${dateRange.end}`,
        status: 'ready'
      };
      
      setReports(prev => [newReport, ...prev]);
      
      // Feedback visual
      alert(`Relatório "${template.name}" gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = (reportId: string, format: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    // Simular exportação
    console.log(`Exportando relatório ${reportId} em formato ${format}`);
    
    // Aqui você implementaria a lógica real de exportação
    const filename = `${report.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${format}`;
    
    // Simular download
    const link = document.createElement('a');
    link.href = '#'; // URL do arquivo gerado
    link.download = filename;
    link.click();
    
    // Feedback visual
    alert(`Exportando relatório "${report.title}" em formato ${format.toUpperCase()}...`);
  };

  const deleteReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    if (window.confirm(`Tem certeza que deseja deletar o relatório "${report.title}"?`)) {
      setReports(reports.filter(r => r.id !== reportId));
      alert('Relatório deletado com sucesso!');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'users': return <Users className="h-5 w-5" />;
      case 'engagement': return <Heart className="h-5 w-5" />;
      case 'traffic': return <Globe className="h-5 w-5" />;
      case 'content': return <MessageSquare className="h-5 w-5" />;
      case 'system': return <Zap className="h-5 w-5" />;
      case 'security': return <Shield className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'users': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'engagement': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'traffic': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'content': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'system': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'security': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios Avançados</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gere e exporte relatórios detalhados da plataforma
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configurações do Relatório
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período Inicial
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período Final
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Relatório
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos os tipos</option>
                <option value="users">Usuários</option>
                <option value="engagement">Engajamento</option>
                <option value="traffic">Tráfego</option>
                <option value="content">Conteúdo</option>
                <option value="system">Sistema</option>
                <option value="security">Segurança</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Templates de Relatórios */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Templates de Relatórios
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(template.type)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                        {template.type}
                      </span>
                    </div>
                  </div>
                  
                  {template.isCustomizable && (
                    <Settings className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {template.exportFormats.map((format) => (
                      <span
                        key={format}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                      >
                        {format.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => generateReport(template.id)}
                    disabled={generating}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {generating ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      'Gerar'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relatórios Gerados */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Relatórios Gerados
        </h2>
        
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum relatório gerado
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Selecione um template acima para gerar seu primeiro relatório.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>
                      {getTypeIcon(report.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {report.title}
                        </h3>
                        {getStatusIcon(report.status)}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {report.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Período: {report.period}</span>
                        <span>Gerado em: {formatDate(report.generatedAt)}</span>
                        <span className={`capitalize ${getTypeColor(report.type)}`}>
                          {report.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {report.status === 'ready' && (
                      <>
                        <button
                          onClick={() => exportReport(report.id, 'pdf')}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>PDF</span>
                        </button>
                        
                        <button
                          onClick={() => exportReport(report.id, 'excel')}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>Excel</span>
                        </button>
                        
                        <button
                          onClick={() => exportReport(report.id, 'csv')}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>CSV</span>
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="p-2 text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedReports;
