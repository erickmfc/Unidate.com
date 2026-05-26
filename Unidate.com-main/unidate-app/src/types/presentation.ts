export interface ResearchPresentation {
  id: string;
  theme: string;
  title: string;
  subtitle: string;
  createdAt: Date;
  updatedAt: Date;
  sections: PresentationSection[];
  metadata: {
    authorId?: string;
    authorName?: string;
    isPublic: boolean;
    isEditable: boolean;
    views: number;
    likes: number;
    likedBy: string[];
  };
}

export type SectionType = 
  | 'hero' 
  | 'context' 
  | 'methodology' 
  | 'results' 
  | 'analysis' 
  | 'discussion' 
  | 'examples' 
  | 'conclusion';

export interface PresentationSection {
  id: string;
  type: SectionType;
  order: number;
  title: string;
  subtitle?: string;
  content: SectionContent;
  visualElements: VisualElement[];
  layout: 'full-width' | 'split' | 'grid' | 'centered' | 'card';
  hasImage: boolean;
}

export interface SectionContent {
  mainText: string;
  paragraphs: string[];
  quotes?: string[];
  keyPoints?: string[];
  philosophicalThought?: string;
}

export interface VisualElement {
  id: string;
  type: 'hero-image' | 'context-image' | 'diagram' | 'detail-image' | 'icon';
  imageUrl?: string;
  imagePrompt?: string;
  fallbackSources?: string[];
  position: 'left' | 'right' | 'center' | 'background';
  size: 'small' | 'medium' | 'large' | 'full';
  caption?: string;
  style: {
    filter: 'sepia' | 'black-white' | 'vintage' | 'dramatic' | 'none';
    border: boolean;
    frame: boolean;
  };
}

export interface PresentationTemplate {
  id: string;
  name: string;
  category: string;
  colorScheme: {
    base: string[];
    accents: string[];
    text: string[];
  };
  fontStyle: {
    title: 'serif' | 'sans-serif' | 'display';
    body: 'serif' | 'sans-serif';
  };
}
