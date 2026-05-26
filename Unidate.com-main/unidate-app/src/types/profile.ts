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
  rating: number;
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

export interface ExpandedUserProfile {
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
  
  cards: ProfileCard[];
  
  personalityAnswers: Record<string, any>;
  
  isVerified: boolean;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCardData {
  type: ProfileCard['type'];
  title: string;
  data: any;
}

export interface EditCardData {
  id: string;
  title?: string;
  data?: any;
  isVisible?: boolean;
  position?: number;
}
