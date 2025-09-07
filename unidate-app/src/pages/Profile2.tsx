import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Music, 
  Settings, 
  Plus, 
  Heart, 
  Star, 
  MapPin, 
  BookOpen, 
  Trophy, 
  MessageSquare,
  Palette,
  Type,
  Sticker,
  Grid3X3,
  Eye,
  Edit3,
  Save,
  X
} from 'lucide-react';

// Tipos para o sistema de widgets
interface Widget {
  id: string;
  type: 'estante' | 'conquistas' | 'mural' | 'mapa-astral' | 'ranking' | 'kit-sobrevivencia' | 'tier-list' | 'timeline';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: any;
  isVisible: boolean;
}

interface ProfileTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  background: string;
  font: string;
}

const Profile2: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ProfileTheme | null>(null);
  const [showWidgetCatalog, setShowWidgetCatalog] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'focus' | 'offline'>('online');
  const [currentMusic, setCurrentMusic] = useState<{title: string, artist: string, preview: string} | null>(null);

  // Temas disponíveis
  const themes: ProfileTheme[] = [
    {
      id: 'default',
      name: 'Clássico',
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      font: 'Inter'
    },
    {
      id: 'sunset',
      name: 'Pôr do Sol',
      primaryColor: '#F59E0B',
      secondaryColor: '#EF4444',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      font: 'Poppins'
    },
    {
      id: 'ocean',
      name: 'Oceano',
      primaryColor: '#06B6D4',
      secondaryColor: '#3B82F6',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      font: 'Roboto'
    },
    {
      id: 'forest',
      name: 'Floresta',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      font: 'Nunito'
    }
  ];

  // Widgets disponíveis no catálogo
  const defaultWidgets: Widget[] = [
    {
      id: 'estante',
      type: 'estante',
      title: 'Minha Estante',
      position: { x: 0, y: 0 },
      size: { width: 2, height: 2 },
      data: { items: [] },
      isVisible: true
    },
    {
      id: 'conquistas',
      type: 'conquistas',
      title: 'Conquistas',
      position: { x: 2, y: 0 },
      size: { width: 2, height: 1 },
      data: { badges: [] },
      isVisible: true
    },
    {
      id: 'mural',
      type: 'mural',
      title: 'Mural de Recados',
      position: { x: 0, y: 2 },
      size: { width: 2, height: 2 },
      data: { messages: [] },
      isVisible: true
    },
    {
      id: 'mapa-astral',
      type: 'mapa-astral',
      title: 'Mapa Astral do Campus',
      position: { x: 2, y: 1 },
      size: { width: 2, height: 1 },
      data: { sun: '', hell: '', moon: '' },
      isVisible: true
    },
    {
      id: 'ranking',
      type: 'ranking',
      title: 'Ranking do Rolê',
      position: { x: 0, y: 4 },
      size: { width: 2, height: 1 },
      data: { top3: [] },
      isVisible: true
    },
    {
      id: 'kit-sobrevivencia',
      type: 'kit-sobrevivencia',
      title: 'Kit de Sobrevivência',
      position: { x: 2, y: 2 },
      size: { width: 2, height: 1 },
      data: { items: [] },
      isVisible: true
    },
    {
      id: 'tier-list',
      type: 'tier-list',
      title: 'Tier List de Matérias',
      position: { x: 0, y: 5 },
      size: { width: 2, height: 2 },
      data: { tiers: { S: [], A: [], B: [], C: [], D: [] } },
      isVisible: true
    },
    {
      id: 'timeline',
      type: 'timeline',
      title: 'Linha do Tempo',
      position: { x: 2, y: 3 },
      size: { width: 2, height: 2 },
      data: { events: [] },
      isVisible: true
    }
  ];

  useEffect(() => {
    // Carregar widgets do usuário
    setWidgets(defaultWidgets);
    setSelectedTheme(themes[0]);
    
    // Simular música atual
    setCurrentMusic({
      title: "Bohemian Rhapsody",
      artist: "Queen",
      preview: "https://example.com/preview.mp3"
    });
  }, []);

  const getStatusIcon = () => {
    switch (userStatus) {
      case 'online': return '🟢';
      case 'away': return '🟠';
      case 'focus': return '📚';
      case 'offline': return '⚪';
      default: return '⚪';
    }
  };

  const getStatusText = () => {
    switch (userStatus) {
      case 'online': return 'Online';
      case 'away': return 'Ausente';
      case 'focus': return 'Modo Foco';
      case 'offline': return 'Offline';
      default: return 'Offline';
    }
  };

  const renderWidget = (widget: Widget) => {
    if (!widget.isVisible) return null;

    const widgetStyle = {
      gridColumn: `span ${widget.size.width}`,
      gridRow: `span ${widget.size.height}`,
    };

    switch (widget.type) {
      case 'estante':
        return (
          <div key={widget.id} className="widget estante-widget" style={widgetStyle}>
            <div className="widget-header">
              <BookOpen className="h-5 w-5" />
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-content">
              <div className="estante-grid">
                {widget.data.items.length === 0 ? (
                  <div className="empty-state">
                    <p>Adicione itens à sua estante</p>
                    <button className="btn-secondary">+ Adicionar</button>
                  </div>
                ) : (
                  widget.data.items.map((item: any, index: number) => (
                    <div key={index} className="estante-item">
                      <div className="item-icon">📚</div>
                      <span className="item-name">{item.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'conquistas':
        return (
          <div key={widget.id} className="widget conquistas-widget" style={widgetStyle}>
            <div className="widget-header">
              <Trophy className="h-5 w-5" />
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-content">
              {widget.data.badges.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhuma conquista ainda</p>
                </div>
              ) : (
                <div className="badges-grid">
                  {widget.data.badges.map((badge: any, index: number) => (
                    <div key={index} className="badge-item">
                      <div className="badge-icon">🏆</div>
                      <span className="badge-name">{badge.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'mural':
        return (
          <div key={widget.id} className="widget mural-widget" style={widgetStyle}>
            <div className="widget-header">
              <MessageSquare className="h-5 w-5" />
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-content">
              {widget.data.messages.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum recado ainda</p>
                  <button className="btn-secondary">Deixar primeiro recado</button>
                </div>
              ) : (
                <div className="messages-list">
                  {widget.data.messages.map((message: any, index: number) => (
                    <div key={index} className="message-item">
                      <div className="message-author">{message.author}</div>
                      <div className="message-text">{message.text}</div>
                      <div className="message-date">{message.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'mapa-astral':
        return (
          <div key={widget.id} className="widget mapa-astral-widget" style={widgetStyle}>
            <div className="widget-header">
              <Star className="h-5 w-5" />
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-content">
              <div className="astral-info">
                <div className="astral-item">
                  <span className="astral-label">☀️ Seu Sol em:</span>
                  <span className="astral-value">{widget.data.sun || 'Não definido'}</span>
                </div>
                <div className="astral-item">
                  <span className="astral-label">🔥 Seu Inferno em:</span>
                  <span className="astral-value">{widget.data.hell || 'Não definido'}</span>
                </div>
                <div className="astral-item">
                  <span className="astral-label">🌙 Sua Lua em:</span>
                  <span className="astral-value">{widget.data.moon || 'Não definido'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ranking':
        return (
          <div key={widget.id} className="widget ranking-widget" style={widgetStyle}>
            <div className="widget-header">
              <MapPin className="h-5 w-5" />
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-content">
              <div className="ranking-podium">
                {widget.data.top3.length === 0 ? (
                  <div className="empty-state">
                    <p>Complete o Guia do Campus</p>
                  </div>
                ) : (
                  widget.data.top3.map((place: any, index: number) => (
                    <div key={index} className={`podium-item rank-${index + 1}`}>
                      <div className="rank-number">{index + 1}º</div>
                      <div className="place-name">{place.name}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'kit-sobrevivencia':
        return (
          <div key={widget.id} className="widget kit-widget" style={widgetStyle}>
            <div className="widget-header">
              <Heart className="h-5 w-5" />
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-content">
              <div className="kit-items">
                {widget.data.items.length === 0 ? (
                  <div className="empty-state">
                    <p>Monte seu kit de sobrevivência</p>
                    <button className="btn-secondary">+ Adicionar item</button>
                  </div>
                ) : (
                  widget.data.items.map((item: any, index: number) => (
                    <div key={index} className="kit-item">
                      <div className="item-emoji">{item.emoji}</div>
                      <span className="item-name">{item.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'tier-list':
        return (
          <div key={widget.id} className="widget tier-list-widget" style={widgetStyle}>
            <div className="widget-header">
              <Grid3X3 className="h-5 w-5" />
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-content">
              <div className="tier-list">
                {Object.entries(widget.data.tiers).map(([tier, subjects]: [string, any]) => (
                  <div key={tier} className={`tier-row tier-${tier.toLowerCase()}`}>
                    <div className="tier-label">{tier}</div>
                    <div className="tier-subjects">
                      {subjects.length === 0 ? (
                        <span className="empty-tier">Vazio</span>
                      ) : (
                        subjects.map((subject: string, index: number) => (
                          <span key={index} className="subject-tag">{subject}</span>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div key={widget.id} className="widget timeline-widget" style={widgetStyle}>
            <div className="widget-header">
              <Star className="h-5 w-5" />
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-content">
              {widget.data.events.length === 0 ? (
                <div className="empty-state">
                  <p>Seus momentos aparecerão aqui</p>
                </div>
              ) : (
                <div className="timeline">
                  {widget.data.events.map((event: any, index: number) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-date">{event.date}</div>
                      <div className="timeline-content">{event.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Dinâmico */}
      <div 
        className="profile-header"
        style={{ 
          background: selectedTheme?.background || themes[0].background 
        }}
      >
        <div className="header-content">
          <div className="profile-info">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {userProfile?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="status-indicator">
                <span className="status-icon">{getStatusIcon()}</span>
                <span className="status-text">{getStatusText()}</span>
              </div>
            </div>
            
            <div className="profile-details">
              <h1 className="profile-name">
                {userProfile?.displayName || 'Usuário'}
              </h1>
              <p className="profile-course">
                {userProfile?.course || 'Curso não informado'} • {userProfile?.university || 'Universidade'}
              </p>
              
              {currentMusic && (
                <div className="music-widget">
                  <Music className="h-4 w-4" />
                  <span className="music-text">
                    Ouvindo: {currentMusic.title} - {currentMusic.artist}
                  </span>
                  <button className="play-preview">▶️</button>
                </div>
              )}
            </div>
          </div>

          <div className="header-actions">
            {isEditing ? (
              <>
                <button 
                  className="btn-primary"
                  onClick={() => setIsEditing(false)}
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowWidgetCatalog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Widgets
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowCustomization(true)}
                >
                  <Palette className="h-4 w-4" />
                  Personalizar
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4" />
                  Editar Perfil
                </button>
                <button className="btn-secondary">
                  <Heart className="h-4 w-4" />
                  Curtir
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Widgets */}
      <div className="profile-content">
        <div 
          className="widgets-grid"
          style={{
            '--primary-color': selectedTheme?.primaryColor || themes[0].primaryColor,
            '--secondary-color': selectedTheme?.secondaryColor || themes[0].secondaryColor,
            '--font-family': selectedTheme?.font || themes[0].font
          } as React.CSSProperties}
        >
          {widgets.map(renderWidget)}
        </div>
      </div>

      {/* Catálogo de Widgets */}
      {showWidgetCatalog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Catálogo de Widgets</h2>
              <button 
                className="close-btn"
                onClick={() => setShowWidgetCatalog(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="widgets-catalog">
              {defaultWidgets.map((widget) => (
                <div key={widget.id} className="catalog-item">
                  <div className="catalog-preview">
                    {renderWidget(widget)}
                  </div>
                  <div className="catalog-info">
                    <h3>{widget.title}</h3>
                    <p>Widget de {widget.type}</p>
                    <button className="btn-primary">Adicionar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customização */}
      {showCustomization && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Personalizar Perfil</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCustomization(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="customization-panel">
              <div className="theme-section">
                <h3>Temas</h3>
                <div className="themes-grid">
                  {themes.map((theme) => (
                    <div 
                      key={theme.id}
                      className={`theme-option ${selectedTheme?.id === theme.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTheme(theme)}
                    >
                      <div 
                        className="theme-preview"
                        style={{ background: theme.background }}
                      ></div>
                      <span>{theme.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile2;
