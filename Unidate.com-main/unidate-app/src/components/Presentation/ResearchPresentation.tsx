import React, { useState, useEffect } from 'react';
import { ResearchPresentation, PresentationSection } from '../../types/presentation';
import { PresentationService } from '../../services/presentationService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, 
  Eye, 
  Share2, 
  Edit, 
  BookOpen,
  Brain,
  Quote,
  ChevronDown,
  Sparkles,
  Download,
  Printer
} from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  theme?: string;
  fallbackSources?: string[];
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc,
  theme = '',
  fallbackSources: propFallbackSources
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc || '');
  const [errorCount, setErrorCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc || '');
    setErrorCount(0);
    setHasError(false);
  }, [src, fallbackSrc]);

  const defaultFallbacks = [
    fallbackSrc,
    `https://picsum.photos/seed/${encodeURIComponent(theme || 'default')}${Date.now()}/1200/800`,
    `https://via.placeholder.com/1200x800/1a1a1a/d4af37?text=${encodeURIComponent(alt.substring(0, 30))}`,
    `https://source.unsplash.com/1200x800/?${encodeURIComponent(theme || 'academic')},vintage&sig=${Date.now()}`
  ].filter(Boolean) as string[];
  
  const fallbackSources = propFallbackSources && propFallbackSources.length > 0 
    ? [...propFallbackSources, ...defaultFallbacks]
    : defaultFallbacks;

  const handleError = () => {
    if (errorCount < fallbackSources.length - 1) {
      const nextSrc = fallbackSources[errorCount + 1];
      if (nextSrc) {
        console.log(`🔄 Tentando fallback ${errorCount + 1}:`, nextSrc);
        setImgSrc(nextSrc);
        setErrorCount(errorCount + 1);
      }
    } else {
      console.log('⚠️ Todas as fontes de imagem falharam, usando gradiente');
      setHasError(true);
      setImgSrc('');
    }
  };

  if (hasError || !imgSrc) {
    return (
      <div 
        className={`${className} bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center`}
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b0e 50%, #1a1a1a 100%)'
        }}
      >
        <div className="text-center p-8">
          <div className="text-yellow-400 text-4xl mb-4">📚</div>
          <p className="text-yellow-400/70 font-serif text-sm">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      onLoad={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.opacity = '1';
        console.log('✅ Imagem carregada com sucesso:', imgSrc);
      }}
    />
  );
};

interface ResearchPresentationProps {
  presentation: ResearchPresentation;
  isEditable?: boolean;
  onEdit?: (sectionId: string) => void;
}

const ResearchPresentationComponent: React.FC<ResearchPresentationProps> = ({
  presentation,
  isEditable = false,
  onEdit
}) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(presentation.metadata.likes);

  useEffect(() => {
    if (currentUser && presentation.metadata.likedBy) {
      setIsLiked(presentation.metadata.likedBy.includes(currentUser.uid));
    }
  }, [currentUser, presentation.metadata.likedBy]);

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      const newLikedState = await PresentationService.toggleLike(presentation.id, currentUser.uid);
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Erro ao alternar like:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: presentation.title,
          text: presentation.subtitle,
          url: window.location.href
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const renderSection = (section: PresentationSection) => {
    const visualElement = section.visualElements[0];

    switch (section.type) {
      case 'hero':
        return (
          <section key={section.id} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {}
            {visualElement && (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: visualElement.imageUrl 
                    ? `url(${visualElement.imageUrl})` 
                    : 'linear-gradient(135deg, #1a1a1a 0%, #2d1b0e 100%)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90"></div>
                {}
                <ImageWithFallback
                  src={visualElement.imageUrl || ''}
                  alt={visualElement.caption || presentation.theme}
                  className="absolute inset-0 w-full h-full object-cover"
                  fallbackSrc={`https://via.placeholder.com/1920x1080/1a1a1a/d4af37?text=${encodeURIComponent(presentation.theme.substring(0, 40))}`}
                  theme={presentation.theme}
                />
              </div>
            )}

            {}
            <div className="relative z-10 container mx-auto px-4 py-20 text-center">
              <div className="max-w-5xl mx-auto space-y-8 presentation-section">
                <p className="text-yellow-400 font-serif uppercase tracking-[0.3em] text-sm">
                  {presentation.subtitle}
                </p>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif text-white leading-tight animate-fade-in">
                  {section.title}
                </h1>
                
                <div className="space-y-6 text-white/80 font-serif text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
                  {section.content.paragraphs.map((para, idx) => (
                    <p key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.2}s` }}>
                      {para}
                    </p>
                  ))}
                </div>
                
                {section.content.quotes && section.content.quotes.length > 0 && (
                  <div className="mt-12 bg-white/5 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-500/30 max-w-3xl mx-auto">
                    <Quote className="h-10 w-10 text-yellow-400 mx-auto mb-4" />
                    <p className="text-yellow-200 font-serif italic text-xl md:text-2xl leading-relaxed">
                      "{section.content.quotes[0]}"
                    </p>
                  </div>
                )}

                {section.content.keyPoints && section.content.keyPoints.length > 0 && (
                  <div className="grid md:grid-cols-3 gap-4 mt-16 max-w-4xl mx-auto">
                    {section.content.keyPoints.map((point, idx) => (
                      <div 
                        key={idx} 
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105"
                      >
                        <Sparkles className="h-6 w-6 text-yellow-400 mb-3" />
                        <p className="text-white/90 font-serif text-base">{point}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ChevronDown className="h-10 w-10 text-yellow-400" />
            </div>
          </section>
        );

      case 'context':
      case 'methodology':
      case 'analysis':
        return (
          <section key={section.id} className="min-h-screen py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
            <div className="container mx-auto px-4">
              <div className={`grid ${section.layout === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-12 items-center max-w-7xl mx-auto`}>
                {}
                {visualElement && (
                  <div className={`${section.layout === 'split' && visualElement.position === 'left' ? 'order-1' : 'lg:order-2'}`}>
                    <div className="relative group">
                      <div 
                        className={`relative aspect-square rounded-2xl overflow-hidden ${
                          visualElement.style.border ? 'ring-4 ring-yellow-500/30' : ''
                        } ${visualElement.style.frame ? 'p-6 bg-gradient-to-br from-gray-800 to-gray-900' : ''} transition-transform duration-300 group-hover:scale-[1.02]`}
                      >
                        <ImageWithFallback
                          src={visualElement.imageUrl || ''}
                          alt={visualElement.caption || section.title}
                          className={`w-full h-full object-cover rounded-xl transition-opacity duration-300 ${
                            visualElement.style.filter === 'sepia' ? 'sepia contrast-125 brightness-90' :
                            visualElement.style.filter === 'black-white' ? 'grayscale contrast-110' :
                            visualElement.style.filter === 'dramatic' ? 'contrast-125 brightness-95' :
                            ''
                          }`}
                          fallbackSrc={
                            visualElement.fallbackSources?.[0] || 
                            `https://via.placeholder.com/1200x800/1a1a1a/d4af37?text=${encodeURIComponent(section.title.substring(0, 30))}`
                          }
                          theme={presentation.theme}
                          fallbackSources={visualElement.fallbackSources}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      {visualElement.caption && (
                        <p className="text-white/50 text-sm mt-4 font-serif italic text-center">
                          {visualElement.caption}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {}
                <div className={`${section.layout === 'split' && visualElement?.position === 'left' ? 'lg:order-2' : 'order-1'} space-y-8`}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-1 w-12 bg-yellow-400 rounded-full"></div>
                      <p className="text-yellow-400 font-serif uppercase tracking-widest text-sm">
                        Seção {section.order}
                      </p>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white leading-tight">
                      {section.title}
                    </h2>
                    
                    {section.subtitle && (
                      <p className="text-white/70 font-serif text-xl">
                        {section.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-6 text-white/80 font-serif leading-relaxed">
                    {section.content.paragraphs.map((para, idx) => (
                      <p key={idx} className="text-lg md:text-xl">
                        {para}
                      </p>
                    ))}
                  </div>

                  {section.content.keyPoints && section.content.keyPoints.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <h3 className="text-xl font-serif font-bold text-yellow-400 mb-4">Pontos-Chave:</h3>
                      {section.content.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start space-x-4 group">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                            <Sparkles className="h-4 w-4 text-yellow-400" />
                          </div>
                          <p className="text-white/90 font-serif text-base flex-1 pt-1">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.content.quotes && section.content.quotes.length > 0 && (
                    <div className="mt-8 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl p-6 border-l-4 border-yellow-500 backdrop-blur-sm">
                      <Quote className="h-6 w-6 text-yellow-400 mb-3" />
                      <p className="text-yellow-200 font-serif italic text-lg md:text-xl leading-relaxed">
                        "{section.content.quotes[0]}"
                      </p>
                    </div>
                  )}

                  {isEditable && onEdit && (
                    <button
                      onClick={() => onEdit(section.id)}
                      className="mt-8 flex items-center space-x-2 px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-xl transition-all duration-300 border border-yellow-500/30 hover:border-yellow-500/50 hover:scale-105"
                    >
                      <Edit className="h-5 w-5" />
                      <span className="font-serif font-semibold">Editar Seção</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case 'conclusion':
        return (
          <section key={section.id} className="min-h-screen py-20 bg-gradient-to-b from-gray-900 via-amber-900/20 to-black relative overflow-hidden">
            {}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-5xl mx-auto text-center space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="h-1 w-12 bg-yellow-400 rounded-full"></div>
                    <p className="text-yellow-400 font-serif uppercase tracking-[0.3em] text-sm">
                      Conclusão
                    </p>
                    <div className="h-1 w-12 bg-yellow-400 rounded-full"></div>
                  </div>
                  
                  <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold font-serif text-white leading-tight">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-8 text-white/80 font-serif text-lg md:text-xl leading-relaxed">
                  {section.content.paragraphs.map((para, idx) => (
                    <p key={idx} className="max-w-3xl mx-auto">
                      {para}
                    </p>
                  ))}
                </div>

                {}
                {section.content.philosophicalThought && (
                  <div className="mt-16 bg-gradient-to-br from-yellow-500/20 via-amber-600/20 to-orange-600/20 rounded-3xl p-12 border-2 border-yellow-500/40 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                      <Brain className="h-14 w-14 text-yellow-400 mx-auto mb-8 animate-pulse" />
                      <Quote className="h-10 w-10 text-yellow-300 mx-auto mb-6" />
                      <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-yellow-100 leading-relaxed mb-8">
                        "{section.content.philosophicalThought}"
                      </p>
                      <p className="text-yellow-400/70 font-serif text-base">
                        — Reflexão sobre {presentation.theme}
                      </p>
                    </div>
                  </div>
                )}

                {}
                {section.content.keyPoints && section.content.keyPoints.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-6 mt-16">
                    {section.content.keyPoints.map((point, idx) => (
                      <div 
                        key={idx} 
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105"
                      >
                        <Sparkles className="h-7 w-7 text-yellow-400 mb-4" />
                        <p className="text-white/90 font-serif text-lg leading-relaxed">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {}
                <div className="flex items-center justify-center flex-wrap gap-4 mt-16 pt-8 border-t border-white/10">
                  <button
                    onClick={handleLike}
                    className={`group flex items-center space-x-3 px-8 py-4 rounded-xl transition-all duration-300 ${
                      isLiked 
                        ? 'bg-gradient-to-r from-red-500/30 to-pink-500/30 text-red-300 border-2 border-red-500/50 scale-105' 
                        : 'bg-white/10 text-white/70 border-2 border-white/20 hover:border-white/40 hover:bg-white/15'
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${isLiked ? 'fill-current animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                    <span className="font-serif font-semibold">{likesCount} {likesCount === 1 ? 'Curtida' : 'Curtidas'}</span>
                  </button>
                  
                  <button 
                    onClick={handleShare}
                    className="flex items-center space-x-3 px-8 py-4 bg-white/10 text-white/70 border-2 border-white/20 hover:border-white/40 hover:bg-white/15 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <Share2 className="h-6 w-6" />
                    <span className="font-serif font-semibold">Compartilhar</span>
                  </button>
                  
                  <button className="flex items-center space-x-3 px-8 py-4 bg-white/10 text-white/70 border-2 border-white/20 hover:border-white/40 hover:bg-white/15 rounded-xl transition-all duration-300 hover:scale-105">
                    <BookOpen className="h-6 w-6" />
                    <span className="font-serif font-semibold">Salvar</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {}
      <div className="fixed top-20 right-4 z-50 flex flex-col items-end space-y-2">
        <button
          onClick={handleLike}
          className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
            isLiked 
              ? 'bg-red-500/30 text-red-300 border-2 border-red-500/50 scale-110' 
              : 'bg-black/50 text-white/70 border-2 border-white/20 hover:border-white/40'
          }`}
          title={isLiked ? 'Remover curtida' : 'Curtir apresentação'}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        
        <div className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border-2 border-white/20 text-white/70 text-sm font-serif flex items-center space-x-2">
          <Eye className="h-4 w-4" />
          <span>{presentation.metadata.views}</span>
        </div>
      </div>

      {}
      {presentation.sections
        .sort((a, b) => a.order - b.order)
        .map(section => renderSection(section))}

      {}
      <footer className="bg-gradient-to-b from-black to-gray-900 border-t border-yellow-500/20 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <p className="text-yellow-400 font-serif text-lg font-bold">
                UniDate Experts
              </p>
            </div>
            
            <p className="text-white/50 font-serif text-sm">
              Apresentação gerada sobre <span className="text-yellow-400 font-semibold">{presentation.theme}</span>
            </p>
            
            <p className="text-white/30 font-serif text-xs">
              © 2024 UniDate. Apresentações geradas com inteligência artificial Gemini.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
          animation-fill-mode: both;
        }

        .presentation-section {
          animation: fade-in-up 1s ease-out;
        }

        html {
          scroll-behavior: smooth;
        }

        
        .sepia {
          filter: sepia(100%) contrast(125%) brightness(90%);
        }
      `}</style>
    </div>
  );
};

export default ResearchPresentationComponent;
