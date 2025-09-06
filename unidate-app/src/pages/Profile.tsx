import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Camera, 
  Edit3, 
  Save, 
  X, 
  MapPin, 
  Calendar,
  GraduationCap,
  Heart,
  MessageCircle,
  Users,
  Star
} from 'lucide-react';

const Profile: React.FC = () => {
  const { userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    interests: userProfile?.interests || [],
    university: userProfile?.university || '',
    course: userProfile?.course || '',
    year: userProfile?.year || new Date().getFullYear(),
  });
  const [newInterest, setNewInterest] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest),
    });
  };

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar as alterações
    console.log('Salvando perfil:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      displayName: userProfile?.displayName || '',
      bio: userProfile?.bio || '',
      interests: userProfile?.interests || [],
      university: userProfile?.university || '',
      course: userProfile?.course || '',
      year: userProfile?.year || new Date().getFullYear(),
    });
    setIsEditing(false);
  };

  const profileStats = [
    { label: 'Matches', value: '12', icon: Heart },
    { label: 'Mensagens', value: '24', icon: MessageCircle },
    { label: 'Grupos', value: '5', icon: Users },
    { label: 'Avaliação', value: '4.8', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {userProfile?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-primary-500 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userProfile?.displayName || 'Usuário'}
                  </h1>
                )}
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  {isEditing ? (
                    <X className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Edit3 className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <GraduationCap className="h-4 w-4" />
                  <span>{userProfile?.course || 'Curso não informado'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{userProfile?.university || 'Universidade não informada'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Ingresso em {userProfile?.year || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre Mim</h2>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Conte um pouco sobre você..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 resize-none"
                  rows={4}
                />
              ) : (
                <p className="text-gray-600">
                  {userProfile?.bio || 'Nenhuma biografia adicionada ainda.'}
                </p>
              )}
            </div>

            {/* Interests Section */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Interesses</h2>
              
              {isEditing && (
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Adicionar interesse..."
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                  />
                  <button
                    onClick={handleAddInterest}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                  >
                    Adicionar
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    <span>#{interest}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveInterest(interest)}
                        className="hover:text-primary-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
                {formData.interests.length === 0 && (
                  <p className="text-gray-500 italic">Nenhum interesse adicionado ainda.</p>
                )}
              </div>
            </div>

            {/* Academic Info */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Acadêmicas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Universidade
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-600">{userProfile?.university || 'Não informado'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Curso
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-600">{userProfile?.course || 'Não informado'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ano de Ingresso
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="2020"
                      max={new Date().getFullYear()}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-600">{userProfile?.year || 'Não informado'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Estatísticas</h3>
              <div className="space-y-4">
                {profileStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <stat.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-gray-600">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <span>Ver Matches</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                    <span>Mensagens</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <span>Meus Grupos</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
