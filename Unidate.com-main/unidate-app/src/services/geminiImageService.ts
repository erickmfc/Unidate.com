const GEMINI_API_KEYS = [
  'AIzaSyDdymzukUt6h9-QsrPgHjwPmQCfneNAUGA',
  'AIzaSyDRfqv4mH5N5MvbrWogMOWJzN1IOL7vq8g',
  'AIzaSyBp1wEr4C2qDE78okeGaaaH8GW7YCtWpXc'
];

let currentApiKeyIndex = 0;

const getNextApiKey = (): string => {
  const key = GEMINI_API_KEYS[currentApiKeyIndex];
  currentApiKeyIndex = (currentApiKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
};

export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  base64?: string;
  theme: string;
}

export class GeminiImageService {
  
  static async generateImage(prompt: string, theme: string, sectionType: string): Promise<GeneratedImage> {
    try {
      const specificPrompt = await this.createThemeSpecificPrompt(theme, prompt, sectionType);
      
      const visualDescription = await this.generateVisualDescription(theme, sectionType);
      
      return await this.generateThemeSpecificImage(theme, visualDescription, sectionType, specificPrompt);
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      return this.generateSimpleThemeImage(theme, sectionType);
    }
  }

  
  private static async createThemeSpecificPrompt(
    theme: string, 
    originalPrompt: string, 
    sectionType: string
  ): Promise<string> {
    const sectionContext = {
      'hero': 'imagem épica e impactante que representa visualmente',
      'context': 'imagem histórica e contextual que mostra',
      'methodology': 'imagem técnica ou de conquistas relacionada a',
      'analysis': 'imagem contemplativa e analítica sobre',
      'conclusion': 'imagem filosófica e reflexiva representando'
    };

    const context = sectionContext[sectionType as keyof typeof sectionContext] || 'imagem representando';

    const realInfoPrompt = `Pesquise na internet informações REAIS e ESPECÍFICAS sobre "${theme}".
    
Se "${theme}" é uma pessoa:
- Características físicas REAIS
- Roupas, uniformes, objetos característicos REAIS
- Ambiente histórico REAL
- Elementos visuais específicos relacionados

Se "${theme}" é um conceito:
- Símbolos, objetos, representações visuais REAIS
- Elementos visuais específicos relacionados
- Contexto visual REAL

Forneça elementos visuais ESPECÍFICOS e REAIS sobre "${theme}" para criar uma imagem precisa.`;

    let realVisualInfo = '';
    try {
      const searchApiKey = getNextApiKey();
      const searchResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${searchApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: realInfoPrompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500
            },
            tools: [{
              googleSearch: {}
            }]
          })
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        realVisualInfo = searchData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('✅ Informações visuais reais buscadas sobre', theme);
      }
    } catch (error) {
      console.error('Erro ao buscar informações visuais:', error);
    }

    const promptGeneration = `Você é um especialista em descrições visuais detalhadas.

${realVisualInfo ? `INFORMAÇÕES REAIS SOBRE "${theme}" ENCONTRADAS NA INTERNET:
${realVisualInfo}

USE ESTAS INFORMAÇÕES REAIS para criar a descrição visual.` : ''}

Crie uma descrição visual ESPECÍFICA e DETALHADA para uma imagem sobre "${theme}".

A imagem deve ser: ${context} "${theme}".

REGRAS OBRIGATÓRIAS:
1. Seja ESPECÍFICO sobre "${theme}" - mencione elementos, pessoas, objetos ou conceitos REAIS relacionados
2. Se "${theme}" é uma pessoa: descreva características físicas REAIS, roupas da época REAIS, ambiente histórico REAL
3. Se "${theme}" é um conceito: descreva símbolos, metáforas visuais, representações concretas REAIS
4. Inclua estilo visual: sépia, vintage, acadêmico, dramático, preto e branco
5. Descreva composição, iluminação, cores específicas
6. Mencione elementos visuais concretos e REAIS relacionados a "${theme}"
7. Seja detalhado (mínimo 100 palavras)
8. Em português brasileiro
9. Use APENAS elementos visuais REAIS sobre "${theme}"

Exemplo se tema for "Pelé":
"Retrato histórico de Edson Arantes do Nascimento (Pelé) em sua juventude, usando o uniforme clássico da seleção brasileira dos anos 1970, com a camisa amarela número 10. Fundo desfocado mostrando um estádio de futebol lotado. Iluminação dramática destacando seu rosto expressivo. Estilo fotografia vintage em sépia, com textura de filme antigo. Elementos visuais: bola de futebol clássica, troféu da Copa do Mundo, bandeira do Brasil. Atmosfera épica e nostálgica."

Responda APENAS com a descrição visual detalhada, sem explicações.`;

    try {
      const apiKey = getNextApiKey();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptGeneration }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 500
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const generated = data.candidates?.[0]?.content?.parts?.[0]?.text || originalPrompt;
        return generated.trim().replace(/"/g, '').replace(/\n/g, ' ');
      }
    } catch (error) {
      console.error('Erro ao criar prompt específico:', error);
    }

    return originalPrompt;
  }

  
  private static async generateVisualDescription(theme: string, sectionType: string): Promise<{
    mainElements: string[];
    colors: string[];
    style: string;
    composition: string;
    symbols: string[];
  }> {
    const descriptionPrompt = `Analise o tema "${theme}" e crie uma descrição visual detalhada.

Para uma seção do tipo "${sectionType}", descreva:

1. ELEMENTOS VISUAIS PRINCIPAIS (3-5 elementos específicos relacionados a "${theme}"):
   - Se "${theme}" é pessoa: características físicas, roupas, objetos relacionados
   - Se "${theme}" é conceito: símbolos, metáforas, representações visuais
   - Se "${theme}" é lugar: arquitetura, ambiente, características geográficas

2. PALETA DE CORES (3 cores em hex) que representam "${theme}"

3. ESTILO VISUAL: vintage, acadêmico, dramático, clássico, moderno

4. COMPOSIÇÃO: como os elementos devem ser dispostos

5. SÍMBOLOS (2-3 símbolos específicos de "${theme}")

Responda APENAS em JSON:
{
  "mainElements": ["elemento1", "elemento2"],
  "colors": ["#cor1", "#cor2", "#cor3"],
  "style": "estilo",
  "composition": "descrição da composição",
  "symbols": ["símbolo1", "símbolo2"]
}`;

    try {
      const apiKey = getNextApiKey();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: descriptionPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            mainElements: parsed.mainElements || [],
            colors: parsed.colors || ['#1a1a1a', '#d4af37', '#c9a961'],
            style: parsed.style || 'classic',
            composition: parsed.composition || 'centered',
            symbols: parsed.symbols || []
          };
        }
      }
    } catch (error) {
      console.error('Erro ao gerar descrição visual:', error);
    }

    return this.getDefaultVisualDescription(theme, sectionType);
  }

  
  private static async generateThemeSpecificImage(
    theme: string,
    visualDescription: any,
    sectionType: string,
    specificPrompt: string
  ): Promise<GeneratedImage> {
    const [bgColor, textColor, accentColor] = visualDescription.colors;
    
    const elements = this.createThemeElements(visualDescription.mainElements, visualDescription.symbols, textColor, accentColor);
    
    const pattern = this.createStylePattern(visualDescription.style, accentColor);
    
    const composition = this.createComposition(visualDescription.composition, elements);
    
    const svg = `
      <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="50%" style="stop-color:#000000;stop-opacity:1" />
            <stop offset="100%" style="stop-color:${bgColor};stop-opacity:1" />
          </linearGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%">
            <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.4" />
            <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0" />
          </radialGradient>
          ${pattern}
        </defs>
        
        
        <rect width="1200" height="800" fill="url(#bgGrad)"/>
        <rect width="1200" height="800" fill="url(#stylePattern)"/>
        <ellipse cx="600" cy="400" rx="500" ry="400" fill="url(#glowGrad)"/>
        
        
        ${composition}
        
        
        <text x="600" y="650" font-family="Georgia, serif" font-size="48" fill="${textColor}" text-anchor="middle" font-weight="bold" opacity="0.95">
          ${theme.toUpperCase()}
        </text>
        <line x1="400" y1="680" x2="800" y2="680" stroke="${accentColor}" stroke-width="3" opacity="0.6"/>
        <text x="600" y="710" font-family="Arial, sans-serif" font-size="20" fill="${accentColor}" text-anchor="middle" opacity="0.8">
          ${this.getSectionLabel(sectionType)}
        </text>
      </svg>
    `.trim();
    
    return {
      imageUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
      prompt: specificPrompt,
      theme: theme,
      base64: btoa(svg)
    };
  }

  
  private static createThemeElements(
    mainElements: string[],
    symbols: string[],
    textColor: string,
    accentColor: string
  ): string {
    let elements = '';
    
    mainElements.forEach((element, index) => {
      const x = 200 + (index * 200);
      const y = 200 + (index % 2) * 150;
      
      const elementLower = element.toLowerCase();
      
      if (elementLower.includes('livro') || elementLower.includes('biblioteca') || elementLower.includes('texto')) {
        elements += `
          <rect x="${x}" y="${y}" width="120" height="160" fill="none" stroke="${textColor}" stroke-width="4" opacity="0.6" rx="3"/>
          <line x1="${x + 20}" y1="${y + 30}" x2="${x + 100}" y2="${y + 30}" stroke="${textColor}" stroke-width="2" opacity="0.5"/>
          <line x1="${x + 20}" y1="${y + 60}" x2="${x + 100}" y2="${y + 60}" stroke="${textColor}" stroke-width="2" opacity="0.5"/>
          <line x1="${x + 20}" y1="${y + 90}" x2="${x + 100}" y2="${y + 90}" stroke="${textColor}" stroke-width="2" opacity="0.5"/>
        `;
      } else if (elementLower.includes('pessoa') || elementLower.includes('retrato') || elementLower.includes('figura') || elementLower.includes('rosto')) {
        elements += `
          <circle cx="${x + 60}" cy="${y + 60}" r="50" fill="none" stroke="${textColor}" stroke-width="4" opacity="0.6"/>
          <ellipse cx="${x + 60}" cy="${y + 140}" rx="40" ry="30" fill="none" stroke="${textColor}" stroke-width="3" opacity="0.6"/>
        `;
      } else if (elementLower.includes('círculo') || elementLower.includes('globo') || elementLower.includes('mundo') || elementLower.includes('planeta')) {
        elements += `
          <circle cx="${x + 60}" cy="${y + 80}" r="60" fill="none" stroke="${textColor}" stroke-width="5" opacity="0.6"/>
          <circle cx="${x + 60}" cy="${y + 80}" r="40" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.4"/>
        `;
      } else if (elementLower.includes('estrela') || elementLower.includes('astro')) {
        elements += `
          <polygon points="${x + 60},${y + 40} ${x + 75},${y + 80} ${x + 45},${y + 80}" fill="none" stroke="${textColor}" stroke-width="4" opacity="0.6"/>
          <polygon points="${x + 60},${y + 120} ${x + 75},${y + 80} ${x + 45},${y + 80}" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.5"/>
        `;
      } else if (elementLower.includes('futebol') || elementLower.includes('bola') || elementLower.includes('esporte')) {
        elements += `
          <circle cx="${x + 60}" cy="${y + 80}" r="50" fill="none" stroke="${textColor}" stroke-width="4" opacity="0.6"/>
          <polygon points="${x + 60},${y + 30} ${x + 80},${y + 50} ${x + 60},${y + 70} ${x + 40},${y + 50}" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.5"/>
        `;
      } else {
        elements += `
          <rect x="${x}" y="${y}" width="120" height="120" fill="none" stroke="${textColor}" stroke-width="4" opacity="0.6" rx="10"/>
          <circle cx="${x + 60}" cy="${y + 60}" r="30" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.5"/>
        `;
      }
    });
    
    symbols.forEach((symbol, index) => {
      const x = 900 + (index % 2) * 150;
      const y = 300 + Math.floor(index / 2) * 100;
      
      const symbolLower = symbol.toLowerCase();
      if (symbolLower.includes('coroa') || symbolLower.includes('troféu') || symbolLower.includes('copa')) {
        elements += `
          <path d="M ${x} ${y} L ${x + 20} ${y - 30} L ${x + 40} ${y} Z" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.7"/>
          <rect x="${x + 10}" y="${y}" width="20" height="20" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.7"/>
        `;
      } else if (symbolLower.includes('folha') || symbolLower.includes('ramo')) {
        elements += `
          <path d="M ${x + 30} ${y} Q ${x} ${y - 20} ${x + 10} ${y - 40} Q ${x + 20} ${y - 20} ${x + 30} ${y}" fill="none" stroke="${textColor}" stroke-width="3" opacity="0.6"/>
        `;
      } else if (symbolLower.includes('estrela') || symbolLower.includes('brilho')) {
        elements += `
          <polygon points="${x + 30},${y - 20} ${x + 40},${y + 10} ${x + 20},${y + 10}" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.7"/>
          <polygon points="${x + 30},${y + 20} ${x + 40},${y - 10} ${x + 20},${y - 10}" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.7"/>
        `;
      }
    });
    
    return elements;
  }

  
  private static createStylePattern(style: string, accentColor: string): string {
    if (style === 'vintage' || style === 'antigo' || style === 'histórico') {
      return `
        <pattern id="stylePattern" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="40" r="3" fill="${accentColor}" opacity="0.15"/>
          <path d="M 0 40 L 80 40 M 40 0 L 40 80" stroke="${accentColor}" stroke-width="0.5" opacity="0.1"/>
        </pattern>
      `;
    } else if (style === 'acadêmico' || style === 'academic' || style === 'clássico') {
      return `
        <pattern id="stylePattern" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="none" stroke="${accentColor}" stroke-width="0.5" opacity="0.1"/>
          <line x1="0" y1="30" x2="60" y2="30" stroke="${accentColor}" stroke-width="0.5" opacity="0.08"/>
          <line x1="30" y1="0" x2="30" y2="60" stroke="${accentColor}" stroke-width="0.5" opacity="0.08"/>
        </pattern>
      `;
    } else {
      return `
        <pattern id="stylePattern" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="${accentColor}" stroke-width="0.5" opacity="0.12"/>
        </pattern>
      `;
    }
  }

  
  private static createComposition(composition: string, elements: string): string {
    return `
      <g transform="translate(0, 0)">
        ${elements}
      </g>
    `;
  }

  
  private static getDefaultVisualDescription(theme: string, sectionType: string): {
    mainElements: string[];
    colors: string[];
    style: string;
    composition: string;
    symbols: string[];
  } {
    const themeLower = theme.toLowerCase();
    
    const isPerson = themeLower.includes('rei') || themeLower.includes('pelé') || 
                     themeLower.includes('presidente') || themeLower.includes('artista') ||
                     themeLower.includes('escritor') || themeLower.includes('cientista') ||
                     themeLower.includes('froid') || themeLower.includes('freud');
    
    const isConcept = themeLower.includes('filosofia') || themeLower.includes('ética') ||
                      themeLower.includes('sabedoria') || themeLower.includes('conhecimento') ||
                      themeLower.includes('estoicismo') || themeLower.includes('virtude');
    
    const isScience = themeLower.includes('física') || themeLower.includes('química') ||
                      themeLower.includes('matemática') || themeLower.includes('biologia');
    
    if (isPerson) {
      return {
        mainElements: [`Retrato de ${theme}`, 'Contexto histórico', 'Elementos da época'],
        colors: ['#2c1810', '#d4af37', '#c9a961'],
        style: 'vintage',
        composition: 'centered portrait',
        symbols: ['Legado', 'História']
      };
    } else if (isConcept) {
      return {
        mainElements: ['Símbolos filosóficos', 'Representação conceitual', 'Elementos abstratos'],
        colors: ['#1a1a1a', '#d4af37', '#ffd700'],
        style: 'acadêmico',
        composition: 'symbolic',
        symbols: ['Sabedoria', 'Conhecimento']
      };
    } else if (isScience) {
      return {
        mainElements: ['Diagramas científicos', 'Elementos técnicos', 'Representação visual'],
        colors: ['#0f0f0f', '#4a90e2', '#2ecc71'],
        style: 'modern',
        composition: 'technical',
        symbols: ['Ciência', 'Descoberta']
      };
    }
    
    return {
      mainElements: [`Representação de ${theme}`, 'Elementos temáticos', 'Símbolos relacionados'],
      colors: ['#1a1a1a', '#d4af37', '#c9a961'],
      style: 'classic',
      composition: 'centered',
      symbols: ['Tema', 'Exploração']
    };
  }

  
  private static getSectionLabel(sectionType: string): string {
    const labels: Record<string, string> = {
      'hero': 'Introdução',
      'context': 'Contexto Histórico',
      'methodology': 'Metodologia e Resultados',
      'analysis': 'Análise Crítica',
      'conclusion': 'Conclusão e Reflexão'
    };
    return labels[sectionType] || 'Exploração';
  }

  
  private static generateSimpleThemeImage(theme: string, sectionType: string): GeneratedImage {
    const shortTheme = theme.substring(0, 40);
    const svg = `
      <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="800" fill="#1a1a1a"/>
        <text x="600" y="380" font-family="Georgia, serif" font-size="56" fill="#d4af37" text-anchor="middle" font-weight="bold">${shortTheme.toUpperCase()}</text>
        <line x1="400" y1="420" x2="800" y2="420" stroke="#d4af37" stroke-width="3" opacity="0.6"/>
        <text x="600" y="460" font-family="Arial, sans-serif" font-size="24" fill="#c9a961" text-anchor="middle" opacity="0.8">${this.getSectionLabel(sectionType)}</text>
      </svg>
    `.trim();
    
    return {
      imageUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
      prompt: `Imagem sobre ${theme}`,
      theme: theme,
      base64: btoa(svg)
    };
  }

  
  static async generateMultipleImages(
    prompts: string[], 
    theme: string,
    sectionTypes: string[]
  ): Promise<GeneratedImage[]> {
    const promises = prompts.map((prompt, index) => 
      this.generateImage(prompt, theme, sectionTypes[index] || 'hero')
    );
    return Promise.all(promises);
  }
}
