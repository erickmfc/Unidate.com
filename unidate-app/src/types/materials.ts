export type MaterialType = 'resumo' | 'livro' | 'video' | 'link' | 'exercicio' | 'prova';

export type MaterialFormat = 'pdf' | 'doc' | 'txt' | 'epub' | 'mp4' | 'avi' | 'url' | 'jpg' | 'png';

export type Subject = 
  | 'matematica' 
  | 'fisica' 
  | 'quimica' 
  | 'programacao' 
  | 'humanas' 
  | 'biologia' 
  | 'engenharia' 
  | 'medicina' 
  | 'direito' 
  | 'economia' 
  | 'outros';

export type DifficultyLevel = 'iniciante' | 'intermediario' | 'avancado';

export type MaterialCategory = 
  | 'resumos' 
  | 'exercicios' 
  | 'provas_antigas' 
  | 'tutoriais' 
  | 'ferramentas' 
  | 'livros' 
  | 'videos' 
  | 'links';

export interface MaterialRating {
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface MaterialDownload {
  userId: string;
  downloadedAt: Date;
}

export interface EducationalMaterial {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  format: MaterialFormat;
  subject: Subject;
  category: MaterialCategory;
  difficulty: DifficultyLevel;
  tags: string[];
  
  fileUrl?: string;
  fileSize?: number;
  fileName?: string;
  
  externalUrl?: string;
  
  authorId: string;
  authorName: string;
  university?: string;
  course?: string;
  
  ratings: MaterialRating[];
  averageRating: number;
  totalRatings: number;
  
  downloads: MaterialDownload[];
  totalDownloads: number;
  views: number;
  shares: number;
  
  isApproved: boolean;
  isPublic: boolean;
  reportedCount: number;
  
  createdAt: Date;
  updatedAt: Date;
  
  thumbnailUrl?: string;
  previewText?: string;
  language: string;
}

export interface MaterialFilter {
  type?: MaterialType[];
  subject?: Subject[];
  category?: MaterialCategory[];
  difficulty?: DifficultyLevel[];
  tags?: string[];
  minRating?: number;
  university?: string;
  course?: string;
  searchQuery?: string;
}

export interface MaterialUploadData {
  title: string;
  description: string;
  type: MaterialType;
  subject: Subject;
  category: MaterialCategory;
  difficulty: DifficultyLevel;
  tags: string[];
  university?: string;
  course?: string;
  file?: File;
  externalUrl?: string;
  language: string;
}

export interface MaterialStats {
  totalMaterials: number;
  materialsByType: Record<MaterialType, number>;
  materialsBySubject: Record<Subject, number>;
  materialsByDifficulty: Record<DifficultyLevel, number>;
  averageRating: number;
  totalDownloads: number;
  totalViews: number;
}

export const MATERIAL_TYPES = {
  RESUMO: 'resumo' as MaterialType,
  LIVRO: 'livro' as MaterialType,
  VIDEO: 'video' as MaterialType,
  LINK: 'link' as MaterialType,
  EXERCICIO: 'exercicio' as MaterialType,
  PROVA: 'prova' as MaterialType,
} as const;

export const MATERIAL_FORMATS = {
  PDF: 'pdf' as MaterialFormat,
  DOC: 'doc' as MaterialFormat,
  TXT: 'txt' as MaterialFormat,
  EPUB: 'epub' as MaterialFormat,
  MP4: 'mp4' as MaterialFormat,
  AVI: 'avi' as MaterialFormat,
  URL: 'url' as MaterialFormat,
  JPG: 'jpg' as MaterialFormat,
  PNG: 'png' as MaterialFormat,
} as const;

export const SUBJECTS = {
  MATEMATICA: 'matematica' as Subject,
  FISICA: 'fisica' as Subject,
  QUIMICA: 'quimica' as Subject,
  PROGRAMACAO: 'programacao' as Subject,
  HUMANAS: 'humanas' as Subject,
  BIOLOGIA: 'biologia' as Subject,
  ENGENHARIA: 'engenharia' as Subject,
  MEDICINA: 'medicina' as Subject,
  DIREITO: 'direito' as Subject,
  ECONOMIA: 'economia' as Subject,
  OUTROS: 'outros' as Subject,
} as const;

export const DIFFICULTY_LEVELS = {
  INICIANTE: 'iniciante' as DifficultyLevel,
  INTERMEDIARIO: 'intermediario' as DifficultyLevel,
  AVANCADO: 'avancado' as DifficultyLevel,
} as const;

export const MATERIAL_CATEGORIES = {
  RESUMOS: 'resumos' as MaterialCategory,
  EXERCICIOS: 'exercicios' as MaterialCategory,
  PROVAS_ANTIGAS: 'provas_antigas' as MaterialCategory,
  TUTORIAIS: 'tutoriais' as MaterialCategory,
  FERRAMENTAS: 'ferramentas' as MaterialCategory,
  LIVROS: 'livros' as MaterialCategory,
  VIDEOS: 'videos' as MaterialCategory,
  LINKS: 'links' as MaterialCategory,
} as const;

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  resumo: '📝 Resumos e Anotações',
  livro: '📖 Livros e E-books',
  video: '🎥 Vídeos Educativos',
  link: '🔗 Links e Recursos Online',
  exercicio: '📋 Exercícios',
  prova: '📄 Provas Antigas',
};

export const SUBJECT_LABELS: Record<Subject, string> = {
  matematica: 'Matemática',
  fisica: 'Física',
  quimica: 'Química',
  programacao: 'Programação',
  humanas: 'Humanas',
  biologia: 'Biologia',
  engenharia: 'Engenharia',
  medicina: 'Medicina',
  direito: 'Direito',
  economia: 'Economia',
  outros: 'Outros',
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  iniciante: 'text-green-600 bg-green-100',
  intermediario: 'text-yellow-600 bg-yellow-100',
  avancado: 'text-red-600 bg-red-100',
};

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  resumos: 'Resumos',
  exercicios: 'Exercícios',
  provas_antigas: 'Provas Antigas',
  tutoriais: 'Tutoriais',
  ferramentas: 'Ferramentas',
  livros: 'Livros',
  videos: 'Vídeos',
  links: 'Links',
};