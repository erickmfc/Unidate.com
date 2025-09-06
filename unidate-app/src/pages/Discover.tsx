import React, { useState, useEffect } from 'react';
import { Heart, X, MessageCircle, Star, MapPin, GraduationCap, Calendar } from 'lucide-react';

interface User {
  id: string;
  name: string;
  age: number;
  course: string;
  university: string;
  year: number;
  bio: string;
  interests: string[];
  photos: string[];
  distance: number;
}

const Discover: React.FC = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Mock data - em produção, isso viria de uma API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Ana Silva',
        age: 22,
        course: 'Engenharia de Software',
        university: 'USP',
        year: 2021,
        bio: 'Apaixonada por tecnologia e fotografia. Adoro viajar e conhecer novas culturas!',
        interests: ['Fotografia', 'Viagem', 'Tecnologia', 'Música'],
        photos: ['/api/placeholder/400/600'],
        distance: 2.5
      },
      {
        id: '2',
        name: 'Carlos Santos',
        age: 24,
        course: 'Medicina',
        university: 'UNICAMP',
        year: 2020,
        bio: 'Futuro médico, amante da natureza e esportes. Sempre disposto a ajudar!',
        interests: ['Esportes', 'Natureza', 'Medicina', 'Leitura'],
        photos: ['/api/placeholder/400/600'],
        distance: 1.8
      },
      {
        id: '3',
        name: 'Mariana Costa',
        age: 21,
        course: 'Psicologia',
        university: 'UFRJ',
        year: 2022,
        bio: 'Estudante de psicologia, apaixonada por arte e dança. Busco conexões genuínas!',
        interests: ['Arte', 'Dança', 'Psicologia', 'Cinema'],
        photos: ['/api/placeholder/400/600'],
        distance: 3.2
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    
    setTimeout(() => {
      setCurrentUserIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handleLike = () => {
    handleSwipe('right');
    // Aqui você implementaria a lógica para salvar o like
    console.log('Liked user:', users[currentUserIndex]);
  };

  const handlePass = () => {
    handleSwipe('left');
    // Aqui você implementaria a lógica para salvar o pass
    console.log('Passed user:', users[currentUserIndex]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Procurando pessoas incríveis...</p>
        </div>
      </div>
    );
  }

  if (currentUserIndex >= users.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-16 w-16 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Você viu todos por hoje!
          </h2>
          <p className="text-gray-600 mb-6">
            Volte amanhã para descobrir mais pessoas incríveis da sua universidade.
          </p>
          <button className="btn-primary">
            Ver Matches
          </button>
        </div>
      </div>
    );
  }

  const currentUser = users[currentUserIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Descobrir</h1>
          <p className="text-gray-600">
            {currentUserIndex + 1} de {users.length} perfis
          </p>
        </div>

        {/* Profile Card */}
        <div className="relative">
          <div 
            className={`card p-0 overflow-hidden transition-transform duration-300 ${
              swipeDirection === 'left' ? 'transform -translate-x-full rotate-12' :
              swipeDirection === 'right' ? 'transform translate-x-full -rotate-12' :
              'transform translate-x-0 rotate-0'
            }`}
          >
            {/* Photo */}
            <div className="relative h-96 bg-gradient-to-br from-primary-500 to-accent-500">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
              
              {/* Distance Badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser.distance} km
                  </span>
                </div>
              </div>

              {/* Age Badge */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.age} anos
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>{currentUser.course}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{currentUser.university} • {currentUser.year}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-600 mb-4">{currentUser.bio}</p>

              {/* Interests */}
              <div className="flex flex-wrap gap-2">
                {currentUser.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 mt-8">
          <button
            onClick={handlePass}
            className="w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 shadow-lg"
          >
            <X className="h-8 w-8 text-gray-600" />
          </button>
          
          <button
            onClick={handleLike}
            className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg"
          >
            <Heart className="h-8 w-8 text-white" />
          </button>
          
          <button className="w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 shadow-lg">
            <MessageCircle className="h-8 w-8 text-gray-600" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">8</div>
            <div className="text-sm text-gray-600">Likes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">24</div>
            <div className="text-sm text-gray-600">Visualizações</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
