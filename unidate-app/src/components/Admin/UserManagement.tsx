import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Bell, 
  UserX, 
  UserCheck,
  Mail,
  Calendar,
  MapPin,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  course: string;
  university: string;
  status: 'active' | 'suspended' | 'banned' | 'pending';
  lastActivity: string;
  joinDate: string;
  reports: number;
  isVerified: boolean;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const users: User[] = [
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana.silva@usp.br',
      course: 'Engenharia de Software',
      university: 'USP',
      status: 'active',
      lastActivity: '2 horas atrás',
      joinDate: '15/03/2024',
      reports: 0,
      isVerified: true
    },
    {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos.santos@unicamp.br',
      course: 'Medicina',
      university: 'UNICAMP',
      status: 'suspended',
      lastActivity: '1 dia atrás',
      joinDate: '10/02/2024',
      reports: 3,
      isVerified: true
    },
    {
      id: '3',
      name: 'Mariana Costa',
      email: 'mariana.costa@ufrj.br',
      course: 'Psicologia',
      university: 'UFRJ',
      status: 'active',
      lastActivity: '30 min atrás',
      joinDate: '20/01/2024',
      reports: 1,
      isVerified: false
    },
    {
      id: '4',
      name: 'João Oliveira',
      email: 'joao.oliveira@ufmg.br',
      course: 'Direito',
      university: 'UFMG',
      status: 'banned',
      lastActivity: '1 semana atrás',
      joinDate: '05/12/2023',
      reports: 8,
      isVerified: true
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-yellow-100 text-yellow-700',
      banned: 'bg-red-100 text-red-700',
      pending: 'bg-gray-100 text-gray-700'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'Ativo',
      suspended: 'Suspenso',
      banned: 'Banido',
      pending: 'Pendente'
    };
    return texts[status as keyof typeof texts] || 'Desconhecido';
  };

  const handleUserAction = (userId: string, action: string) => {
    console.log(`Ação ${action} no usuário ${userId}`);
    // Implementar lógica de ação
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h2>
          <p className="text-gray-600">Gerencie usuários, status e permissões</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <Mail className="h-4 w-4 mr-2" />
            Enviar E-mail
          </button>
          <button className="btn-primary">
            <UserCheck className="h-4 w-4 mr-2" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="suspended">Suspensos</option>
              <option value="banned">Banidos</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredUsers.length} usuários encontrados
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Usuário</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Curso/Universidade</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Última Atividade</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Relatórios</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        {user.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Shield className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-gray-900">{user.course}</p>
                      <p className="text-sm text-gray-500">{user.university}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{user.lastActivity}</td>
                  <td className="py-4 px-4">
                    {user.reports > 0 ? (
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 font-medium">{user.reports}</span>
                      </div>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'warn')}
                        className="p-1 text-yellow-600 hover:bg-yellow-100 rounded transition-colors duration-200"
                        title="Advertir"
                      >
                        <Bell className="h-4 w-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="p-1 text-orange-600 hover:bg-orange-100 rounded transition-colors duration-200"
                          title="Suspender"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors duration-200"
                          title="Ativar"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Detalhes do Usuário</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <UserX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">
                    {selectedUser.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadge(selectedUser.status)}`}>
                    {getStatusText(selectedUser.status)}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                  <p className="text-gray-900">{selectedUser.course}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Universidade</label>
                  <p className="text-gray-900">{selectedUser.university}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Cadastro</label>
                  <p className="text-gray-900">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Última Atividade</label>
                  <p className="text-gray-900">{selectedUser.lastActivity}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button className="btn-primary">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar E-mail
                </button>
                <button className="btn-secondary">
                  <Bell className="h-4 w-4 mr-2" />
                  Advertir
                </button>
                {selectedUser.status === 'active' ? (
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200">
                    <UserX className="h-4 w-4 mr-2 inline" />
                    Suspender
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200">
                    <UserCheck className="h-4 w-4 mr-2 inline" />
                    Ativar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

