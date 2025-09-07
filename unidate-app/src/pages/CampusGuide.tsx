import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Globe, 
  Search,
  Filter,
  Heart,
  Share2,
  Navigation,
  Coffee,
  Utensils,
  BookOpen,
  Dumbbell,
  Car,
  Plus,
  X,
  Check,
  AlertCircle,
  Wifi,
  Zap,
  Volume2,
  VolumeX,
  Users,
  DollarSign,
  Camera,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Place {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  address: string;
  phone?: string;
  website?: string;
  hours: string;
  rating: number;
  priceRange: string;
  image: string;
  isFavorite: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  // Para lugares de comida
  signatureDish?: string;
  signatureDishVotes?: number;
  // Para lugares de estudo
  noiseLevel?: 'silent' | 'low' | 'medium' | 'high';
  outletAvailability?: 'rare' | 'common' | 'abundant';
  wifiQuality?: number;
  bestFor?: string[];
  // Para serviços
  paymentMethods?: string[];
  // Sistema de avaliações
  reviews?: Review[];
  userRating?: number;
  userReview?: string;
  // Sistema de votos em atributos
  attributeVotes?: { [key: string]: number };
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

const CampusGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'eat' | 'study' | 'services'>('eat');
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const { currentUser } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar lugares reais
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setLoading(true);
        // TODO: Implementar carregamento de lugares reais do Firebase
        // Por enquanto, deixar vazio para mostrar apenas lugares reais
        setPlaces([]);
      } catch (error) {
        console.error('Erro ao carregar lugares:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlaces();
  }, []);

  const tabs = [
    { id: 'eat', name: 'Onde Comer', icon: Utensils, description: 'O Guia Gastronômico' },
    { id: 'study', name: 'Onde Estudar', icon: BookOpen, description: 'Locais de estudo' },
    { id: 'services', name: 'Serviços Essenciais', icon: Car, description: 'Quebra-galho do campus' }
  ];

  const getTabCategories = (tab: string) => {
    switch (tab) {
      case 'eat':
        return [
          { id: 'all', name: 'Todos', icon: Utensils },
          { id: 'café', name: 'Cafés', icon: Coffee },
          { id: 'refeição', name: 'Refeições', icon: Utensils },
          { id: 'lanche', name: 'Lanches', icon: Utensils }
        ];
      case 'study':
        return [
          { id: 'all', name: 'Todos', icon: BookOpen },
          { id: 'biblioteca', name: 'Bibliotecas', icon: BookOpen },
          { id: 'sala', name: 'Salas de Estudo', icon: BookOpen },
          { id: 'laboratório', name: 'Laboratórios', icon: BookOpen }
        ];
      case 'services':
        return [
          { id: 'all', name: 'Todos', icon: Car },
          { id: 'reprografia', name: 'Xerox/Impressão', icon: Car },
          { id: 'estacionamento', name: 'Estacionamento', icon: Car },
          { id: 'banco', name: 'Caixas Eletrônicos', icon: Car }
        ];
      default:
        return [];
    }
  };

  const handleFavorite = (placeId: string) => {
    setPlaces(places.map(place => 
      place.id === placeId 
        ? { ...place, isFavorite: !place.isFavorite }
        : place
    ));
  };

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || place.subcategory === selectedCategory;
    const matchesTab = place.category === activeTab;
    return matchesSearch && matchesCategory && matchesTab;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setShowPlaceModal(true);
  };

  const handleVoteAttribute = (placeId: string, attribute: string) => {
    setPlaces(places.map(place => 
      place.id === placeId 
        ? { 
            ...place, 
            attributeVotes: {
              ...place.attributeVotes,
              [attribute]: (place.attributeVotes?.[attribute] || 0) + 1
            }
          }
        : place
    ));
  };

  const getNoiseLevelIcon = (level: string) => {
    switch (level) {
      case 'silent': return <VolumeX className="h-4 w-4 text-green-500" />;
      case 'low': return <Volume2 className="h-4 w-4 text-yellow-500" />;
      case 'medium': return <Volume2 className="h-4 w-4 text-orange-500" />;
      case 'high': return <Volume2 className="h-4 w-4 text-red-500" />;
      default: return <Volume2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOutletIcon = (availability: string) => {
    switch (availability) {
      case 'rare': return <Zap className="h-4 w-4 text-red-500" />;
      case 'common': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'abundant': return <Zap className="h-4 w-4 text-green-500" />;
      default: return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Carregando lugares...</p>
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-16 w-16 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Nenhum lugar cadastrado ainda
          </h2>
          <p className="text-gray-600 mb-6">
            Seja o primeiro a adicionar lugares do campus! Ajude outros estudantes a descobrirem os melhores locais.
          </p>
          <button className="btn-primary">
            Adicionar Primeiro Lugar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Guia do Campus</h1>
              <p className="text-gray-600">O Waze da Vida Universitária - Conhecimento colaborativo do campus</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as 'eat' | 'study' | 'services');
                  setSelectedCategory('all');
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{tab.name}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar lugares..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {getTabCategories(activeTab).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Add Place Button */}
            <button 
              onClick={() => setShowAddPlaceModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Ponto</span>
            </button>
          </div>
        </div>

        {/* Places Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <div 
              key={place.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handlePlaceClick(place)}
            >
              {/* Place Image */}
              <div className="h-48 bg-gradient-to-br from-green-500 to-blue-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="h-16 w-16 text-white opacity-50" />
                </div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(place.id);
                    }}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      place.isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${place.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    place.subcategory === 'café' ? 'bg-orange-100 text-orange-700' :
                    place.subcategory === 'refeição' ? 'bg-red-100 text-red-700' :
                    place.subcategory === 'biblioteca' ? 'bg-blue-100 text-blue-700' :
                    place.subcategory === 'sala' ? 'bg-purple-100 text-purple-700' :
                    place.subcategory === 'reprografia' ? 'bg-gray-100 text-gray-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {getTabCategories(activeTab).find(c => c.id === place.subcategory)?.name || place.subcategory}
                  </span>
                </div>
              </div>

              {/* Place Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{place.name}</h3>
                  <div className="flex items-center space-x-1">
                    {renderStars(place.rating)}
                    <span className="text-sm text-gray-600 ml-1">({place.rating})</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{place.description}</p>

                {/* Signature Dish (for food places) */}
                {activeTab === 'eat' && place.signatureDish && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-900">O Carro-Chefe</p>
                        <p className="text-orange-700 font-semibold">{place.signatureDish}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-orange-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-sm">{place.signatureDishVotes}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Study Place Info */}
                {activeTab === 'study' && (
                  <div className="space-y-2 mb-4">
                    {place.noiseLevel && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {getNoiseLevelIcon(place.noiseLevel)}
                        <span>Nível de ruído: {place.noiseLevel === 'silent' ? 'Silêncio total' : 
                          place.noiseLevel === 'low' ? 'Conversas baixas' :
                          place.noiseLevel === 'medium' ? 'Moderado' : 'Barulhento'}</span>
                      </div>
                    )}
                    {place.outletAvailability && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {getOutletIcon(place.outletAvailability)}
                        <span>Tomadas: {place.outletAvailability === 'rare' ? 'Raro' :
                          place.outletAvailability === 'common' ? 'Comum' : 'Abundante'}</span>
                      </div>
                    )}
                    {place.wifiQuality && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Wifi className="h-4 w-4" />
                        <span>Wi-Fi: {place.wifiQuality}/5</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Place Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{place.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{place.hours}</span>
                  </div>
                  {place.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{place.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium text-green-600">{place.priceRange}</span>
                  </div>
                </div>

                {/* Best For Tags (for study places) */}
                {activeTab === 'study' && place.bestFor && place.bestFor.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {place.bestFor.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Methods (for services) */}
                {activeTab === 'services' && place.paymentMethods && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Formas de pagamento:</p>
                    <div className="flex flex-wrap gap-1">
                      {place.paymentMethods.map((method, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Place Actions */}
                <div className="flex items-center justify-between">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle navigation
                    }}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Como Chegar</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle share
                    }}
                    className="p-2 text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors duration-200"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPlaces.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum lugar encontrado</h3>
            <p className="text-gray-600 mb-6">Tente ajustar os filtros de busca.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusGuide;
