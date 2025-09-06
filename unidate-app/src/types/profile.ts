// Tipos para o sistema de perfil com cards modulares
export interface ProfileCard {
  id: string;
  type: 'survival_kit' | 'subjects' | 'food_ranking' | 'campus_spot' | 'music' | 'custom';
  title: string;
  data: any;
  position: number;
  isVisible: boolean;
}

export interface SurvivalKitItem {
  id: string;
  emoji: string;
  name: string;
  description?: string;
}

export interface SubjectPair {
  love: string;
  hate: string;
}

export interface FoodRating {
  id: string;
  name: string;
  rating: number; // 1-5 estrelas
  location: string;
  comment?: string;
}

export interface CampusSpot {
  id: string;
  name: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  image?: string;
}

export interface MusicInfo {
  currentSong?: string;
  artist?: string;
  genre?: string;
  spotifyUrl?: string;
}

export interface CustomCard {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'list';
  data: any;
}

// Tipos para o perfil expandido
export interface ExpandedUserProfile {
  // Dados básicos (card fixo)
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  registrationNumber: string;
  university: string;
  course: string;
  year: number;
  period: number;
  bio?: string;
  
  // Cards modulares
  cards: ProfileCard[];
  
  // Dados de personalidade
  personalityAnswers: Record<string, any>;
  
  // Configurações
  isVerified: boolean;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para criação de cards
export interface CreateCardData {
  type: ProfileCard['type'];
  title: string;
  data: any;
}

// Tipos para edição de cards
export interface EditCardData {
  id: string;
  title?: string;
  data?: any;
  isVisible?: boolean;
  position?: number;
}
