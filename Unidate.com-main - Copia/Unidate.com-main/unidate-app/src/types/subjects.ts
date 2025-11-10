// Estrutura hierárquica de lições
export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: LessonContent;
  order: number;
  isCompleted: boolean;
  completedAt?: Date;
  progress: number; // 0-100
  estimatedTime: number; // minutos
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  tags: string[];
  multimedia: MultimediaContent;
  exercises?: Exercise[];
  expertId?: string; // ID do especialista responsável
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonContent {
  text: string;
  sections: ContentSection[];
  summary?: string;
}

export interface ContentSection {
  id: string;
  type: 'text' | 'video' | 'audio' | 'image' | 'code' | 'formula';
  content: string;
  order: number;
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'essay' | 'code';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  progress: number;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
  modules: Module[];
  totalProgress: number;
  expertIds: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

// Conteúdo multimídia
export interface MultimediaContent {
  videos?: VideoContent[];
  audios?: AudioContent[];
  images?: ImageContent[];
  animations?: AnimationContent[];
}

export interface VideoContent {
  id: string;
  url: string;
  thumbnail?: string;
  duration: number;
  title: string;
  description?: string;
}

export interface AudioContent {
  id: string;
  url: string;
  duration: number;
  title: string;
  description?: string;
}

export interface ImageContent {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface AnimationContent {
  id: string;
  type: 'gif' | 'svg' | 'interactive';
  url: string;
  title: string;
}

// Especialistas/Professores
export interface Expert {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  credentials: string[];
  specialties: string[]; // matérias
  subjects: string[]; // IDs das matérias
  rating: number;
  totalRatings: number;
  isFavorite: boolean;
  contactMethods: ContactMethod[];
  availability: Availability;
  mentorshipSessions: MentorshipSession[];
  createdAt: Date;
}

export interface ContactMethod {
  type: 'email' | 'chat' | 'video' | 'phone';
  value: string;
  isPublic: boolean;
}

export interface Availability {
  timezone: string;
  schedule: TimeSlot[];
  isAvailable: boolean;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface MentorshipSession {
  id: string;
  studentId: string;
  scheduledAt: Date;
  duration: number; // minutos
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

// Sistema de contribuições
export interface Contribution {
  id: string;
  subjectId: string;
  lessonId?: string;
  contributorId: string;
  contributorName: string;
  contributorAvatar?: string;
  type: 'content' | 'suggestion' | 'improvement' | 'exercise';
  content: any;
  status: 'pending' | 'approved' | 'rejected' | 'reviewing';
  votes: ContributionVote[];
  totalVotes: number;
  upvotes: number;
  downvotes: number;
  reviews: ContributionReview[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContributionVote {
  userId: string;
  vote: 'up' | 'down';
  createdAt: Date;
}

export interface ContributionReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  rating: number;
  createdAt: Date;
}

// Anotações pessoais
export interface PersonalNote {
  id: string;
  userId: string;
  subjectId: string;
  lessonId: string;
  content: string;
  position: NotePosition; // onde foi anotado
  highlights: Highlight[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NotePosition {
  sectionId: string;
  paragraphIndex: number;
  characterStart: number;
  characterEnd: number;
}

export interface Highlight {
  id: string;
  text: string;
  color: string;
  note?: string;
  position: NotePosition;
}

// Feed de atividades
export interface ActivityFeed {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'layout_shared' | 'material_added' | 'lesson_completed' | 'contribution_approved' | 'expert_available';
  subjectId?: string;
  lessonId?: string;
  content: any;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
}

// Busca inteligente
export interface SearchResult {
  type: 'lesson' | 'module' | 'subject' | 'expert' | 'contribution';
  id: string;
  title: string;
  description: string;
  relevance: number;
  highlights: string[];
  metadata?: any;
}

export interface SearchFilters {
  type?: string[];
  subjectId?: string;
  difficulty?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Progresso do usuário
export interface UserProgress {
  userId: string;
  subjectId: string;
  totalProgress: number;
  completedLessons: string[];
  currentLesson?: string;
  timeSpent: number; // minutos
  lastAccessed: Date;
  notesCount: number;
  contributionsCount: number;
  updatedAt: Date;
}

