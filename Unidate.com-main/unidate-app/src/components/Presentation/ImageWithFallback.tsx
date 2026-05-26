import React, { useState, useEffect } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSources?: string[];
  prompt?: string;
  theme?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSources = [],
  prompt,
  theme
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const allSources = [src, ...fallbackSources];

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    setAttempts(0);
  }, [src]);

  const handleError = () => {
    const nextAttempt = attempts + 1;
    setAttempts(nextAttempt);

    if (nextAttempt < allSources.length) {
      setCurrentSrc(allSources[nextAttempt]);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
      setCurrentSrc(generateSVGPlaceholder(prompt || alt, theme));
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const generateSVGPlaceholder = (text: string, themeName?: string): string => {
    const colors = [
      { bg: '#1a1a1a', text: '#d4af37', accent: '#c9a961' },
      { bg: '#2c1810', text: '#c9a961', accent: '#b8860b' },
      { bg: '#1e1e1e', text: '#b8860b', accent: '#ffd700' },
      { bg: '#0f0f0f', text: '#ffd700', accent: '#daa520' },
      { bg: '#2d2410', text: '#daa520', accent: '#d4af37' }
    ];
    
    const colorIndex = Math.abs((text + (themeName || '')).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)) % colors.length;
    
    const color = colors[colorIndex];
    const shortText = text.substring(0, 30).replace(/[^a-zA-Z0-9\s]/g, '');
    
    const svg = `
      <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
          </linearGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${color.accent}" stroke-width="0.5" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="1200" height="800" fill="url(#grad)"/>
        <rect width="1200" height="800" fill="url(#grid)"/>
        <text x="600" y="380" font-family="serif" font-size="48" fill="${color.text}" text-anchor="middle" font-weight="bold">${shortText}</text>
        <text x="600" y="440" font-family="sans-serif" font-size="24" fill="${color.accent}" text-anchor="middle" opacity="0.7">${themeName || 'Pesquisa Acadêmica'}</text>
      </svg>
    `.trim();
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
          <Loader2 className="h-8 w-8 text-yellow-400 animate-spin" />
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/80">
          <ImageOff className="h-12 w-12 text-gray-500 mb-2" />
          <p className="text-gray-400 text-sm text-center px-4">{alt}</p>
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
};

export default ImageWithFallback;
