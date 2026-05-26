import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { GeminiService } from './geminiService';
import { ResearchPresentation, PresentationSection } from '../types/presentation';

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

export class PresentationService {
  
  static async findExistingPresentation(theme: string): Promise<ResearchPresentation | null> {
    try {
      if (!db) return null;

      const normalizedTheme = theme.toLowerCase().trim();
      const presentationsRef = collection(db, 'presentations');
      const q = query(
        presentationsRef,
        where('themeNormalized', '==', normalizedTheme),
        where('metadata.isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const data = snapshot.docs[0].data();
      return this.firestoreToPresentation(snapshot.docs[0].id, data);
    } catch (error) {
      console.error('Erro ao buscar apresentação existente:', error);
      return null;
    }
  }

  
  static async getOrGeneratePresentation(
    theme: string, 
    userId?: string,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ResearchPresentation> {
    try {
      console.log(`🔍 Buscando apresentação existente para: ${theme}`);
      const existing = await this.findExistingPresentation(theme);
      
      if (existing) {
        console.log('✅ Apresentação encontrada em cache!');
        await this.incrementViews(existing.id);
        existing.metadata.views++;
        return existing;
      }

      console.log('🎨 Gerando nova apresentação...');
      
      if (onProgress) onProgress(10, 'Analisando tema...');
      
      const structure = await this.generateStructure(theme);
      
      if (onProgress) onProgress(30, 'Gerando conteúdo textual...');
      
      const imagePrompts = await this.generateImagePrompts(theme, structure);
      
      if (onProgress) onProgress(40, 'Preparando geração de imagens...');
      
      const sections = await this.createSections(structure, imagePrompts, theme, onProgress);
      
      if (onProgress) onProgress(90, 'Gerando pensamento filosófico...');
      
      const philosophicalThought = await GeminiService.generateUniquePhilosophicalThought(
        theme,
        `Criar um pensamento filosófico profundo como conclusão sobre ${theme}`
      );

      const conclusionSection = sections.find(s => s.type === 'conclusion');
      if (conclusionSection) {
        conclusionSection.content.philosophicalThought = philosophicalThought.content;
      }

      if (onProgress) onProgress(95, 'Salvando apresentação...');

      const presentation: ResearchPresentation = {
        id: `presentation-${Date.now()}`,
        theme: theme,
        title: structure.title,
        subtitle: structure.subtitle,
        createdAt: new Date(),
        updatedAt: new Date(),
        sections: sections,
        metadata: {
          authorId: userId,
          authorName: userId ? 'Gemini AI' : 'Sistema',
          isPublic: true,
          isEditable: true,
          views: 1,
          likes: 0,
          likedBy: []
        }
      };

      await this.savePresentation(presentation);

      console.log('✅ Apresentação gerada e salva com sucesso!');
      return presentation;
    } catch (error) {
      console.error('❌ Erro ao gerar apresentação:', error);
      throw error;
    }
  }

  
  private static async searchRealInformation(theme: string): Promise<string> {
    try {
      const apiKey = getNextApiKey();
      const searchPrompt = `Você tem acesso à internet. Pesquise informações REAIS, VERDADEIRAS e ATUAIS sobre "${theme}".

IMPORTANTE:
- Use informações da internet para obter dados REAIS sobre "${theme}"
- Se "${theme}" é uma pessoa: busque biografia, datas, conquistas, fatos históricos REAIS
- Se "${theme}" é um conceito: busque definições, origem, história, exemplos REAIS
- Inclua DATAS, NOMES, FATOS CONCRETOS e VERIFICÁVEIS
- NÃO invente informações - use apenas o que encontrar na internet

Forneça um resumo estruturado com:
1. Informações biográficas/históricas REAIS (se pessoa)
2. Definições e conceitos PRECISOS (se conceito)
3. Datas, lugares, eventos REAIS
4. Conquistas, realizações, fatos históricos REAIS
5. Contexto histórico REAL
6. Legado e impacto REAL

Seja ESPECÍFICO e use APENAS informações REAIS encontradas na internet sobre "${theme}".`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: searchPrompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2000
            },
            tools: [{
              googleSearch: {}
            }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const info = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('✅ Informações reais buscadas da internet');
        return info;
      }
    } catch (error) {
      console.error('Erro ao buscar informações na internet:', error);
    }
    
    return '';
  }

  
  private static async generateStructure(theme: string): Promise<any> {
    console.log(`🔍 Buscando informações reais sobre "${theme}" na internet...`);
    const realInfo = await this.searchRealInformation(theme);
    
    const prompt = `Você é um pesquisador acadêmico especializado. Crie uma apresentação de pesquisa COMPLETA, DETALHADA e ESPECÍFICA sobre "${theme}".

${realInfo ? `INFORMAÇÕES REAIS ENCONTRADAS NA INTERNET SOBRE "${theme}":
${realInfo}

USE ESTAS INFORMAÇÕES REAIS para criar a apresentação.` : ''}

⚠️ REGRAS CRÍTICAS E OBRIGATÓRIAS:
1. Use APENAS informações REAIS, VERDADEIRAS e VERIFICÁVEIS sobre "${theme}"
2. Seja EXTREMAMENTE ESPECÍFICO - NÃO use conteúdo genérico ou vago
3. Inclua DATAS EXATAS, NOMES REAIS, FATOS HISTÓRICOS CONCRETOS
4. Para pessoas (como "${theme}"): 
   - Inclua biografia REAL com datas de nascimento/morte REAIS
   - Conquistas e realizações ESPECÍFICAS e REAIS
   - Contexto histórico REAL da época
   - Fatos concretos, não generalizações
5. Para conceitos: 
   - Definições PRECISAS e específicas
   - Origem histórica REAL com datas
   - Exemplos CONCRETOS e verificáveis
6. Citações devem ser REAIS, atribuídas corretamente a pessoas reais
7. Cada parágrafo deve ter MÍNIMO 5-6 frases completas e detalhadas
8. Conteúdo deve ser RICO em detalhes específicos sobre "${theme}"
9. NÃO invente informações - use apenas fatos reais
10. Seja ESPECÍFICO sobre "${theme}" em TODAS as seções
11. TÍTULOS DAS SEÇÕES devem ser ESPECÍFICOS sobre "${theme}" - NÃO use títulos genéricos

ESTRUTURA OBRIGATÓRIA (5 seções) - TODAS ESPECÍFICAS SOBRE "${theme}":

⚠️ TÍTULOS DAS SEÇÕES: Cada título deve ser ESPECÍFICO sobre "${theme}", NÃO genérico.

Exemplos de títulos ESPECÍFICOS:
- Se tema for "Pelé": "Pelé: O Rei do Futebol Mundial" (não "Contexto Histórico")
- Se tema for "Filosofia Estoica": "Os Fundamentos do Estoicismo Antigo" (não "Contexto Histórico e Teórico")
- Se tema for "Freud": "Sigmund Freud e a Revolução da Psicanálise" (não "Metodologia e Abordagem")

1. INTRODUÇÃO/HERO
   - Título ESPECÍFICO sobre "${theme}" (ex: "${theme}: [subtítulo específico]")
   - Subtítulo que contextualiza "${theme}" especificamente
   - 4-5 parágrafos DETALHADOS sobre "${theme}" (mínimo 300 palavras)
   - Cada parágrafo deve mencionar "${theme}" especificamente com FATOS REAIS
   - 5-6 pontos-chave principais com informações ESPECÍFICAS sobre "${theme}"
   - Uma citação REAL e relevante sobre "${theme}" ou atribuída a alguém relacionado

2. CONTEXTO ESPECÍFICO
   - Título ESPECÍFICO sobre o contexto de "${theme}" (ex: "A Época de ${theme}" ou "Origens de ${theme}")
   - Contexto histórico REAL e ESPECÍFICO de "${theme}"
   - Se "${theme}" é uma pessoa: quando nasceu (DATA REAL), onde (LUGAR REAL), contexto da época, eventos históricos da época
   - Se "${theme}" é um conceito: quando surgiu (DATA REAL), onde (LUGAR REAL), quem criou (NOME REAL), contexto histórico
   - 4-5 parágrafos DETALHADOS (mínimo 350 palavras) sobre o contexto REAL de "${theme}"
   - 5-6 pontos contextuais com DATAS EXATAS e fatos reais sobre "${theme}"
   - Uma citação histórica REAL e atribuída relacionada a "${theme}"

3. CONQUISTAS E REALIZAÇÕES (se pessoa) ou DESCOBERTAS E APLICAÇÕES (se conceito)
   - Título ESPECÍFICO sobre as realizações de "${theme}" (ex: "As Conquistas de ${theme}" ou "Aplicações de ${theme}")
   - Se "${theme}" é pessoa: principais conquistas ESPECÍFICAS, realizações REAIS, legado concreto
   - Se "${theme}" é conceito: como foi estudado, pesquisas ESPECÍFICAS realizadas, descobertas REAIS
   - 4-5 parágrafos DETALHADOS (mínimo 350 palavras) sobre resultados/conquistas REAIS de "${theme}"
   - 6-7 pontos-chave com informações ESPECÍFICAS e verificáveis sobre "${theme}"
   - Dados, estatísticas ou fatos CONCRETOS sobre "${theme}"

4. IMPACTO E LEGADO
   - Título ESPECÍFICO sobre o impacto de "${theme}" (ex: "O Legado de ${theme}" ou "A Influência de ${theme}")
   - Análise profunda e ESPECÍFICA sobre "${theme}" (não genérica)
   - Impacto REAL de "${theme}", influência ESPECÍFICA, importância concreta
   - 4-5 parágrafos analíticos DETALHADOS (mínimo 350 palavras) sobre "${theme}"
   - 5-6 insights principais com análises ESPECÍFICAS sobre "${theme}"
   - Uma citação reflexiva REAL de especialista ou pensador sobre "${theme}"

5. REFLEXÕES FINAIS
   - Título ESPECÍFICO sobre reflexões sobre "${theme}" (ex: "Reflexões sobre ${theme}" ou "O Significado de ${theme}")
   - Síntese final ESPECÍFICA sobre "${theme}" (não genérica)
   - Reflexões profundas e ESPECÍFICAS sobre "${theme}"
   - 4-5 parágrafos conclusivos (mínimo 300 palavras) sobre "${theme}"
   - 4-5 pontos de fechamento com reflexões REAIS sobre "${theme}"
   - Pensamento filosófico ESPECÍFICO sobre "${theme}"

⚠️ EXEMPLOS DE TÍTULOS - O QUE NÃO FAZER vs O QUE FAZER:

❌ TÍTULOS GENÉRICOS (NÃO USAR):
- "Contexto Histórico e Teórico"
- "Metodologia e Abordagem"
- "Análise Crítica e Interpretação"
- "Conclusão e Reflexão"

✅ TÍTULOS ESPECÍFICOS (USAR):
Se tema for "Pelé":
- "Pelé: O Menino de Três Corações que Conquistou o Mundo"
- "Brasil dos Anos 1950-1970: O Contexto de Pelé"
- "As Três Copas do Mundo e 1281 Gols de Pelé"
- "O Legado de Pelé no Futebol Mundial"
- "Reflexões sobre o Rei do Futebol"

Se tema for "Filosofia Estoica":
- "Estoicismo: A Filosofia da Serenidade Antiga"
- "Roma Antiga: O Berço do Estoicismo"
- "Os Ensinamentos de Sêneca, Epicteto e Marco Aurélio"
- "A Influência do Estoicismo na Modernidade"
- "A Sabedoria Estoica para o Século XXI"

⚠️ REGRAS FINAIS:
- TÍTULOS devem ser ESPECÍFICOS sobre "${theme}"
- Mencione "${theme}" ESPECIFICAMENTE em cada seção
- Use DATAS, NOMES, LUGARES REAIS
- NÃO use frases genéricas que poderiam aplicar a qualquer tema
- Seja CONCRETO e ESPECÍFICO sobre "${theme}"
- Use as informações REAIS da internet fornecidas acima

⚠️ FORMATO JSON OBRIGATÓRIO:

IMPORTANTE: Os títulos das seções DEVEM ser ESPECÍFICOS sobre "${theme}", NÃO genéricos!

Exemplos CORRETOS de títulos:
- Se tema for "Pelé": 
  * Seção 1: "Pelé: O Rei do Futebol Mundial"
  * Seção 2: "Brasil dos Anos 1950-1970: O Contexto de Pelé"
  * Seção 3: "As Três Copas do Mundo e 1281 Gols de Pelé"
  * Seção 4: "O Legado de Pelé no Futebol Mundial"
  * Seção 5: "Reflexões sobre o Rei do Futebol"

- Se tema for "Freud":
  * Seção 1: "Sigmund Freud: O Pai da Psicanálise"
  * Seção 2: "Viena do Século XIX: O Contexto de Freud"
  * Seção 3: "A Descoberta do Inconsciente e a Psicanálise"
  * Seção 4: "A Influência de Freud na Psicologia Moderna"
  * Seção 5: "O Legado Freudiano na Contemporaneidade"

Responda APENAS com JSON válido:
{
  "title": "Título Específico sobre ${theme}",
  "subtitle": "Subtítulo Contextual Específico",
  "sections": [
    {
      "type": "hero",
      "title": "Título ESPECÍFICO sobre ${theme} (ex: '${theme}: [subtítulo específico]')",
      "subtitle": "Subtítulo opcional específico",
      "content": "Texto detalhado e específico sobre ${theme} com parágrafos separados por \\n\\n. Mínimo 300 palavras com informações REAIS. Mencione ${theme} especificamente com FATOS REAIS.",
      "keyPoints": ["Ponto específico 1 sobre ${theme}", "Ponto específico 2 sobre ${theme}", "Ponto específico 3 sobre ${theme}", "Ponto específico 4 sobre ${theme}", "Ponto específico 5 sobre ${theme}"],
      "quote": "Citação real e atribuída sobre ${theme}"
    },
    {
      "type": "context",
      "title": "Título ESPECÍFICO sobre contexto de ${theme} (NÃO use 'Contexto Histórico e Teórico')",
      "subtitle": "Subtítulo opcional",
      "content": "Texto detalhado sobre o contexto REAL de ${theme} com DATAS, LUGARES, FATOS REAIS. Mínimo 350 palavras.",
      "keyPoints": ["Ponto contextual específico 1", "Ponto contextual específico 2", "Ponto contextual específico 3", "Ponto contextual específico 4", "Ponto contextual específico 5", "Ponto contextual específico 6"],
      "quote": "Citação histórica real relacionada a ${theme}"
    },
    {
      "type": "methodology",
      "title": "Título ESPECÍFICO sobre realizações de ${theme} (NÃO use 'Metodologia e Abordagem')",
      "subtitle": "Subtítulo opcional",
      "content": "Texto detalhado sobre conquistas/realizações REAIS de ${theme} com FATOS CONCRETOS. Mínimo 350 palavras.",
      "keyPoints": ["Conquista/realização específica 1", "Conquista/realização específica 2", "Conquista/realização específica 3", "Conquista/realização específica 4", "Conquista/realização específica 5", "Conquista/realização específica 6", "Conquista/realização específica 7"]
    },
    {
      "type": "analysis",
      "title": "Título ESPECÍFICO sobre impacto de ${theme} (NÃO use 'Análise Crítica e Interpretação')",
      "subtitle": "Subtítulo opcional",
      "content": "Texto analítico detalhado sobre o impacto REAL de ${theme}. Mínimo 350 palavras.",
      "keyPoints": ["Insight específico 1", "Insight específico 2", "Insight específico 3", "Insight específico 4", "Insight específico 5", "Insight específico 6"],
      "quote": "Citação reflexiva real sobre ${theme}"
    },
    {
      "type": "conclusion",
      "title": "Título ESPECÍFICO sobre reflexões sobre ${theme} (NÃO use 'Conclusão e Reflexão')",
      "subtitle": "Subtítulo opcional",
      "content": "Texto conclusivo detalhado sobre ${theme} com reflexões REAIS. Mínimo 300 palavras.",
      "keyPoints": ["Reflexão específica 1", "Reflexão específica 2", "Reflexão específica 3", "Reflexão específica 4", "Reflexão específica 5"]
    }
  ]
}`;

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < GEMINI_API_KEYS.length; attempt++) {
      try {
        const apiKey = getNextApiKey();
        console.log(`🔄 Tentativa ${attempt + 1} com API key ${apiKey.substring(0, 20)}...`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ 
                parts: [{ 
                  text: prompt 
                }] 
              }],
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8000,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ API Error (${response.status}):`, errorText);
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            
            if (parsed.sections && parsed.sections.length >= 5) {
              console.log('✅ Estrutura gerada com sucesso!');
              return parsed;
            } else {
              console.warn('⚠️ Estrutura incompleta, tentando próxima chave...');
              continue;
            }
          } catch (parseError) {
            console.error('Erro ao parsear JSON:', parseError);
            console.log('Texto recebido:', text.substring(0, 500));
            continue;
          }
        }
        
        throw new Error('JSON não encontrado na resposta');
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Erro na tentativa ${attempt + 1}:`, error);
        if (attempt < GEMINI_API_KEYS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
    }
    
    console.warn('⚠️ Todas as tentativas falharam, usando estrutura padrão melhorada');
    return this.getDefaultStructure(theme);
  }

  
  private static async generateImagePrompts(theme: string, structure: any): Promise<string[]> {
    const imagePromptGeneration = `Crie 5 prompts detalhados e específicos para gerar imagens sobre "${theme}".

Cada prompt deve ser:
1. ESPECÍFICO sobre "${theme}" - não genérico
2. Descrever cenas, pessoas, objetos ou conceitos reais relacionados
3. Incluir estilo visual: sépia, preto e branco, vintage, acadêmico
4. Ser detalhado e descritivo

Para cada uma das 5 seções:
1. HERO/INTRODUÇÃO: Imagem épica e impactante sobre "${theme}"
2. CONTEXTO: Imagem histórica ou contextual sobre "${theme}"
3. METODOLOGIA/RESULTADOS: Imagem técnica ou de conquistas sobre "${theme}"
4. ANÁLISE: Imagem contemplativa ou analítica sobre "${theme}"
5. CONCLUSÃO: Imagem filosófica ou reflexiva sobre "${theme}"

Responda APENAS com JSON:
{
  "prompts": [
    "Prompt específico 1",
    "Prompt específico 2",
    "Prompt específico 3",
    "Prompt específico 4",
    "Prompt específico 5"
  ]
}`;

    try {
      const apiKey = getNextApiKey();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: imagePromptGeneration }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 2000,
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
          if (parsed.prompts && parsed.prompts.length === 5) {
            console.log('✅ Prompts de imagem gerados com sucesso');
            return parsed.prompts;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao gerar prompts de imagem:', error);
    }

    const themeLower = theme.toLowerCase();
    const isPerson = themeLower.includes('rei') || themeLower.includes('pelé') || 
                     themeLower.includes('presidente') || themeLower.includes('artista');
    
    if (isPerson) {
      return [
        `Retrato épico e histórico de ${theme}, fotografia vintage em sépia, alta qualidade, estilo documental histórico`,
        `Contexto histórico e época de ${theme}, fotografia de época, estilo jornalístico antigo, sépia`,
        `Conquistas e realizações de ${theme}, fotografia de momentos históricos, preto e branco, estilo documental`,
        `Legado e impacto de ${theme}, retrato contemplativo, iluminação dramática, sépia artística`,
        `Reflexão sobre o legado de ${theme}, arte conceitual metafórica, tons dourados e sépia, atmosfera filosófica`
      ];
    }
    
    return [
      `${theme} épico e dramático, ilustração acadêmica detalhada, manuscrito antigo, sépia, preto e branco, alta qualidade artística`,
      `Contexto histórico específico de ${theme}, ilustração científica vintage, estilo gravura antiga, sépia desaturado`,
      `Metodologia e descobertas sobre ${theme}, diagrama técnico científico detalhado, estilo ilustração acadêmica antiga`,
      `Análise crítica detalhada de ${theme}, fotografia artística clássica, iluminação dramática, tons sépia`,
      `Reflexão filosófica profunda sobre ${theme}, arte conceitual metafórica, tons dourados e sépia, atmosfera contemplativa`
    ];
  }

  
  private static async createSections(
    structure: any,
    imagePrompts: string[],
    theme: string,
    onProgress?: (progress: number, message: string) => void
  ): Promise<PresentationSection[]> {
    const sections: PresentationSection[] = [];
    const sectionTypes: PresentationSection['type'][] = [
      'hero',
      'context',
      'methodology',
      'analysis',
      'conclusion'
    ];

    const { GeminiImageService } = await import('./geminiImageService');

    for (let i = 0; i < structure.sections.length && i < sectionTypes.length; i++) {
      const sectionData = structure.sections[i];
      const sectionType = sectionTypes[i];

      if (onProgress) {
        const baseProgress = 50;
        const imageProgress = (i / sectionTypes.length) * 40;
        onProgress(baseProgress + imageProgress, `Criando imagem ${i + 1} de ${sectionTypes.length}...`);
      }

      let generatedImage;
      try {
        generatedImage = await GeminiImageService.generateImage(
          imagePrompts[i], 
          theme,
          sectionType
        );
        console.log(`✅ Imagem ${i + 1} gerada com sucesso para ${theme}`);
      } catch (error) {
        console.error(`❌ Erro ao gerar imagem ${i + 1}:`, error);
        generatedImage = {
          imageUrl: this.generateSVGImageUrl(theme, i, imagePrompts[i]),
          prompt: imagePrompts[i],
          theme: theme
        };
      }

      const finalImageUrl = generatedImage.imageUrl || this.generateSVGImageUrl(theme, i, imagePrompts[i]);
      
      sections.push({
        id: `section-${i + 1}`,
        type: sectionType,
        order: i + 1,
        title: sectionData.title || `Seção ${i + 1}`,
        subtitle: sectionData.subtitle,
        content: {
          mainText: sectionData.content || '',
          paragraphs: sectionData.content?.split('\n\n').filter((p: string) => p.trim()) || [],
          keyPoints: sectionData.keyPoints || [],
          quotes: sectionData.quote ? [sectionData.quote] : []
        },
        visualElements: [
          {
            id: `visual-${i + 1}`,
            type: i === 0 ? 'hero-image' : i === 3 ? 'detail-image' : 'context-image',
            imagePrompt: imagePrompts[i],
            imageUrl: finalImageUrl,
            fallbackSources: [
              this.generateSVGImageUrl(theme, i, imagePrompts[i]),
              `https://picsum.photos/seed/${this.hashString(theme + i)}/1200/800`,
              `https://images.unsplash.com/photo-${this.getUnsplashPhotoId(theme, i)}?w=1200&h=800&fit=crop&q=80`,
              `https://via.placeholder.com/1200x800/1a1a1a/d4af37?text=${encodeURIComponent(theme.substring(0, 30))}`
            ],
            position: i === 0 ? 'background' : i % 2 === 0 ? 'left' : 'right',
            size: i === 0 ? 'full' : i === 3 ? 'medium' : 'large',
            caption: `${sectionData.title}`,
            style: {
              filter: i === 0 ? 'dramatic' : i === 2 ? 'black-white' : 'sepia',
              border: true,
              frame: i === 3
            }
          }
        ],
        layout: i === 0 ? 'full-width' : i === 2 ? 'split' : 'split',
        hasImage: true
      });

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (onProgress) onProgress(95, 'Finalizando apresentação...');

    return sections;
  }

  
  private static generatePlaceholderImage(prompt: string, index: number, theme: string): string {
    const cleanTheme = theme.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 2)
      .join('+');
    
    const imageSources = [
      `https://images.unsplash.com/photo-${this.getUnsplashPhotoId(theme, index)}?w=1200&h=800&fit=crop&q=80`,
      
      `https://picsum.photos/seed/${this.hashString(theme + index)}/1200/800`,
      
      this.generateSVGImageUrl(theme, index, prompt)
    ];
    
    return imageSources[0];
  }

  
  private static getUnsplashPhotoId(theme: string, index: number): string {
    const photoIds = [
      '1507003211169-0a1dd7228f2d',
      '1481627834876-b7833e8f5570',
      '1516979187457-637ebb4ccbd2',
      '1503676260728-1c00da094a0b',
      '1522202176988-66273c2fd55f',
      '1451187580459-803db64bdc60',
      '1521737604893-d14cc237f11d',
      '1516321318423-f06f85e504b3',
      '1509228468518-180618486925',
      '1516321497487-e288fb19713b'
    ];
    
    const hash = this.hashString(theme + index);
    return photoIds[Math.abs(hash) % photoIds.length];
  }

  
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  
  private static generateSVGImageUrl(theme: string, index: number, prompt: string): string {
    const colors = [
      { bg: '#1a1a1a', text: '#d4af37', accent: '#c9a961' },
      { bg: '#2c1810', text: '#c9a961', accent: '#b8860b' },
      { bg: '#1e1e1e', text: '#b8860b', accent: '#ffd700' },
      { bg: '#0f0f0f', text: '#ffd700', accent: '#daa520' },
      { bg: '#2d2410', text: '#daa520', accent: '#d4af37' }
    ];
    
    const colorIndex = index % colors.length;
    const color = colors[colorIndex];
    
    const shortText = prompt.substring(0, 40)
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const svg = `
      <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
          </linearGradient>
          <pattern id="grid${index}" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${color.accent}" stroke-width="0.5" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="1200" height="800" fill="url(#grad${index})"/>
        <rect width="1200" height="800" fill="url(#grid${index})"/>
        <circle cx="600" cy="300" r="80" fill="none" stroke="${color.text}" stroke-width="3" opacity="0.3"/>
        <text x="600" y="420" font-family="Georgia, serif" font-size="36" fill="${color.text}" text-anchor="middle" font-weight="bold">${shortText}</text>
        <text x="600" y="460" font-family="Arial, sans-serif" font-size="20" fill="${color.accent}" text-anchor="middle" opacity="0.7">${theme}</text>
      </svg>
    `.trim();
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  
  private static getDefaultStructure(theme: string): any {
    const themeLower = theme.toLowerCase();
    const isPerson = themeLower.includes('rei') || themeLower.includes('pelé') || 
                     themeLower.includes('presidente') || themeLower.includes('artista') ||
                     themeLower.includes('escritor') || themeLower.includes('cientista');
    
    if (isPerson) {
      return {
        title: `${theme}: Uma Biografia Acadêmica`,
        subtitle: `Explorando a vida, obra e legado de ${theme}`,
        sections: [
          {
            type: 'hero',
            title: `${theme}: Introdução Biográfica`,
            subtitle: 'Uma visão abrangente sobre esta figura histórica',
            content: `${theme} é uma figura de grande importância histórica e cultural. Esta apresentação explora detalhadamente sua vida, desde os primeiros anos até seu legado duradouro.\n\nAtravés de uma análise biográfica rigorosa, examinaremos os momentos-chave, conquistas e o impacto que ${theme} teve em sua época e nas gerações seguintes.\n\nEsta exploração busca compreender não apenas os fatos históricos, mas também o contexto social, político e cultural que moldou esta personalidade.`,
            keyPoints: [
              `Vida e trajetória de ${theme}`,
              'Contexto histórico e social',
              'Principais conquistas e realizações',
              'Legado e influência duradoura',
              'Relevância contemporânea'
            ],
            quote: `"A história é escrita pelos grandes homens e mulheres que ousaram sonhar."`
          },
          {
            type: 'context',
            title: 'Contexto Histórico e Biográfico',
            content: `Para compreender ${theme}, é essencial entender o contexto histórico em que viveu. A época, as circunstâncias sociais, políticas e culturais moldaram profundamente sua trajetória.\n\nEste período histórico foi marcado por transformações significativas que influenciaram diretamente as ações e decisões de ${theme}. O ambiente social, as oportunidades disponíveis e os desafios enfrentados foram determinantes em sua formação.\n\nAnalisando o contexto histórico, podemos compreender melhor as motivações, escolhas e o impacto das ações de ${theme} em sua época.`,
            keyPoints: [
              'Contexto histórico da época',
              'Ambiente social e cultural',
              'Circunstâncias políticas relevantes',
              'Influências e formação',
              'Eventos históricos contemporâneos'
            ],
            quote: `"Nenhum homem é uma ilha, completo em si mesmo." - John Donne`
          },
          {
            type: 'methodology',
            title: 'Metodologia e Abordagem',
            content: `A abordagem e metodologia utilizada por ${theme} em suas realizações revela muito sobre sua forma de trabalho e pensamento. Esta seção examina como ${theme} desenvolveu suas habilidades e aplicou seus conhecimentos.\n\nA metodologia de ${theme} foi caracterizada por características específicas que contribuíram para seu sucesso. Esta abordagem pode ser analisada e compreendida através de seus métodos, processos e estratégias.\n\nExaminar esta metodologia nos oferece insights valiosos sobre como ${theme} alcançou suas conquistas e como podemos aprender com sua abordagem.`,
            keyPoints: [
              'Abordagem e metodologia utilizada',
              'Processos e estratégias desenvolvidas',
              'Forma de trabalho e pensamento',
              'Desenvolvimento de habilidades',
              'Aplicação de conhecimentos',
              'Características distintivas'
            ]
          },
          {
            type: 'results',
            title: 'Resultados e Descobertas',
            content: `${theme} alcançou realizações notáveis ao longo de sua trajetória. Estas conquistas representam marcos importantes não apenas em sua vida pessoal, mas também no contexto histórico mais amplo.\n\nCada realização foi resultado de dedicação, talento e, muitas vezes, superação de obstáculos significativos. Estas conquistas deixaram um legado duradouro que continua a influenciar e inspirar.\n\nExaminar estas realizações nos permite compreender a magnitude de sua contribuição e o impacto que teve em diferentes áreas.`,
            keyPoints: [
              'Principais conquistas e marcos',
              'Contribuições em diferentes áreas',
              'Reconhecimentos e honrarias recebidas',
              'Impacto das realizações',
              'Legado técnico e cultural',
              'Influência em gerações futuras'
            ]
          },
          {
            type: 'analysis',
            title: 'Análise do Legado e Impacto',
            content: `O legado de ${theme} transcende seu tempo, continuando a influenciar e inspirar. Esta análise examina o impacto duradouro de suas contribuições e como elas se relacionam com questões contemporâneas.\n\nO impacto de ${theme} pode ser observado em múltiplas dimensões: cultural, social, política ou técnica, dependendo de sua área de atuação. Este legado não é estático, mas continua a evoluir e ser reinterpretado por novas gerações.\n\nCompreender este legado nos permite não apenas honrar o passado, mas também extrair lições e inspiração para o presente e futuro.`,
            keyPoints: [
              'Impacto histórico e cultural',
              'Influência em áreas específicas',
              'Relevância contemporânea',
              'Interpretações e reinterpretações',
              'Lições para o presente',
              'Análise crítica do legado'
            ],
            quote: `"O que fazemos em vida ecoa na eternidade." - Máximo Décimo Merídio`
          },
          {
            type: 'discussion',
            title: 'Discussões e Debates',
            content: `A figura de ${theme} tem sido objeto de diversas discussões e debates ao longo do tempo. Diferentes perspectivas e interpretações enriquecem nossa compreensão sobre sua vida, obra e legado.\n\nEstes debates não são meramente acadêmicos, mas refletem questões mais amplas sobre história, cultura, sociedade e valores. As diferentes visões sobre ${theme} revelam muito sobre como interpretamos o passado e o presente.\n\nExaminar estas discussões nos permite compreender a complexidade de ${theme} e como diferentes gerações e perspectivas interpretam sua importância e legado.`,
            keyPoints: [
              'Perspectivas diversas sobre o tema',
              'Debates acadêmicos e culturais',
              'Interpretações variadas',
              'Questões controversas',
              'Evolução das interpretações',
              'Contribuições de diferentes escolas de pensamento'
            ]
          },
          {
            type: 'examples',
            title: 'Exemplos e Casos Práticos',
            content: `Exemplos concretos e casos práticos ilustram como ${theme} se manifesta na realidade. Estes exemplos tornam tangível o que pode parecer abstrato e oferecem insights práticos sobre sua relevância.\n\nCasos específicos demonstram a aplicação prática e o impacto real de ${theme} em diferentes contextos. Estes exemplos podem ser históricos, contemporâneos ou ambos, oferecendo uma visão abrangente.\n\nAtravés destes exemplos, podemos ver como ${theme} não é apenas um conceito teórico, mas algo que tem manifestações concretas e impactos reais no mundo.`,
            keyPoints: [
              'Exemplos históricos específicos',
              'Casos práticos contemporâneos',
              'Aplicações em diferentes contextos',
              'Manifestações concretas',
              'Impactos reais observados',
              'Ilustrações tangíveis'
            ]
          },
          {
            type: 'conclusion',
            title: 'Reflexões Finais sobre o Legado',
            content: `A trajetória de ${theme} oferece uma rica fonte de reflexão sobre temas universais: determinação, excelência, impacto e legado. Sua história nos convida a pensar sobre como indivíduos podem moldar o curso da história.\n\nAs lições extraídas da vida e obra de ${theme} permanecem relevantes, oferecendo insights sobre perseverança, inovação e a capacidade humana de transcender limitações.\n\nAo finalizar esta exploração, reconhecemos que ${theme} representa mais do que uma figura histórica - representa possibilidades, inspiração e um exemplo de como uma vida bem vivida pode deixar um legado duradouro.`,
            keyPoints: [
              'Síntese do legado duradouro',
              'Relevância para o presente',
              'Inspiração para futuras gerações',
              'Reflexões sobre excelência e impacto',
              'Lições aprendidas'
            ]
          }
        ]
      };
    }
    
    return {
      title: `${theme}: Uma Análise Acadêmica Completa`,
      subtitle: `Explorando ${theme} em profundidade`,
      sections: [
        {
          type: 'hero',
          title: `${theme}: Introdução e Visão Geral`,
          subtitle: 'Uma exploração abrangente e detalhada',
          content: `Esta apresentação oferece uma análise acadêmica completa sobre ${theme}, explorando suas origens, desenvolvimento histórico, definições fundamentais e implicações na sociedade contemporânea.\n\nAtravés de uma abordagem multidisciplinar e rigorosa, examinaremos os aspectos teóricos, práticos e aplicados que definem ${theme} como campo de estudo e área de conhecimento.\n\nA compreensão profunda de ${theme} é essencial para diversos campos do conhecimento e tem implicações significativas em múltiplas dimensões da vida humana e social.`,
          keyPoints: [
            `Definições e conceitos fundamentais de ${theme}`,
            'Origens históricas e desenvolvimento',
            'Perspectivas teóricas principais',
            'Aplicações práticas e contemporâneas',
            'Relevância e importância atual'
          ],
          quote: `"O conhecimento é a única fonte inesgotável de riqueza."`
        },
        {
          type: 'context',
          title: 'Contexto Histórico e Teórico',
          content: `O desenvolvimento de ${theme} está profundamente enraizado em transformações históricas, sociais, culturais e intelectuais ao longo do tempo. Compreender este contexto é fundamental para uma análise crítica e informada.\n\nAs origens de ${theme} remontam a períodos históricos específicos, onde condições particulares permitiram seu desenvolvimento. Este contexto histórico moldou não apenas a forma como ${theme} emergiu, mas também como evoluiu ao longo do tempo.\n\nA base teórica de ${theme} foi construída através de contribuições de diversos pensadores, pesquisadores e praticantes, cada um adicionando camadas de compreensão e refinamento.`,
          keyPoints: [
            'Origens históricas e desenvolvimento',
            'Contexto social e cultural de origem',
            'Evolução teórica e conceitual',
            'Principais contribuidores e pensadores',
            'Influências e correntes teóricas'
          ],
          quote: `"A verdadeira sabedoria está em reconhecer a própria ignorância." - Sócrates`
        },
        {
          type: 'methodology',
          title: 'Metodologia, Pesquisa e Descobertas',
          content: `A compreensão de ${theme} foi construída através de diversas abordagens metodológicas, desde pesquisas empíricas até análises teóricas profundas. Esta seção examina como ${theme} tem sido estudado e quais descobertas importantes foram realizadas.\n\nMetodologias rigorosas têm sido aplicadas para investigar diferentes aspectos de ${theme}, resultando em descobertas significativas que expandem nosso entendimento. Estas descobertas não apenas enriquecem o conhecimento teórico, mas também têm aplicações práticas importantes.\n\nOs resultados de pesquisas sobre ${theme} revelam padrões, relações e insights valiosos que contribuem tanto para o avanço do conhecimento quanto para aplicações práticas.`,
          keyPoints: [
            'Abordagens metodológicas utilizadas',
            'Principais pesquisas e estudos realizados',
            'Descobertas e resultados significativos',
            'Análise de dados e evidências',
            'Validação empírica e teórica',
            'Aplicações práticas das descobertas'
          ]
        },
        {
          type: 'analysis',
          title: 'Análise Crítica e Interpretação',
          content: `A análise crítica de ${theme} revela implicações profundas para nossa compreensão de questões fundamentais. Esta seção examina interpretações, debates e perspectivas diversas sobre ${theme}.\n\nDiferentes escolas de pensamento e abordagens teóricas oferecem interpretações variadas de ${theme}, enriquecendo o debate acadêmico e a compreensão. Estas diferentes perspectivas não são contraditórias, mas complementares, oferecendo visões mais completas.\n\nA análise crítica permite identificar não apenas os pontos de consenso, mas também áreas de debate e investigação contínua, apontando para direções futuras de pesquisa.`,
          keyPoints: [
            'Interpretações e perspectivas diversas',
            'Debates acadêmicos relevantes',
            'Implicações teóricas e práticas',
            'Aplicações em diferentes contextos',
            'Limitações e áreas de investigação futura'
          ],
          quote: `"A ciência avança através de questionamentos constantes."`
        },
        {
          type: 'conclusion',
          title: 'Conclusões e Reflexões Finais',
          content: `Esta exploração de ${theme} demonstra a complexidade, riqueza e importância deste campo de estudo. As conclusões apontam tanto para o que sabemos quanto para direções futuras de investigação.\n\nA compreensão de ${theme} continua a evoluir, com novas pesquisas, descobertas e interpretações enriquecendo constantemente nosso conhecimento. Este caráter dinâmico é uma das forças do campo.\n\nAs reflexões finais sobre ${theme} nos convidam a considerar não apenas o conhecimento acumulado, mas também as questões que permanecem abertas e as possibilidades de investigação futura.`,
          keyPoints: [
            'Síntese dos principais achados',
            'Contribuições para o conhecimento',
            'Direções futuras de pesquisa',
            'Relevância e aplicações práticas'
          ]
        }
      ]
    };
  }

  
  static async savePresentation(presentation: ResearchPresentation): Promise<string> {
    try {
      if (!db) {
        console.warn('Firebase não inicializado');
        return presentation.id;
      }

      const presentationRef = doc(db, 'presentations', presentation.id);
      
      await setDoc(presentationRef, {
        theme: presentation.theme,
        themeNormalized: presentation.theme.toLowerCase().trim(),
        title: presentation.title,
        subtitle: presentation.subtitle,
        sections: presentation.sections,
        metadata: presentation.metadata,
        createdAt: Timestamp.fromDate(presentation.createdAt),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Apresentação salva no Firebase');
      return presentation.id;
    } catch (error) {
      console.error('❌ Erro ao salvar apresentação:', error);
      return presentation.id;
    }
  }

  
  static async loadPresentation(presentationId: string): Promise<ResearchPresentation | null> {
    try {
      if (!db) return null;

      const presentationRef = doc(db, 'presentations', presentationId);
      const snapshot = await getDoc(presentationRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return this.firestoreToPresentation(snapshot.id, data);
    } catch (error) {
      console.error('Erro ao carregar apresentação:', error);
      return null;
    }
  }

  
  private static firestoreToPresentation(id: string, data: any): ResearchPresentation {
    return {
      id,
      theme: data.theme,
      title: data.title,
      subtitle: data.subtitle,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      sections: data.sections || [],
      metadata: {
        authorId: data.metadata?.authorId,
        authorName: data.metadata?.authorName || 'Sistema',
        isPublic: data.metadata?.isPublic !== false,
        isEditable: data.metadata?.isEditable !== false,
        views: data.metadata?.views || 0,
        likes: data.metadata?.likes || 0,
        likedBy: data.metadata?.likedBy || []
      }
    };
  }

  
  static async incrementViews(presentationId: string): Promise<void> {
    try {
      if (!db) return;

      const presentationRef = doc(db, 'presentations', presentationId);
      await updateDoc(presentationRef, {
        'metadata.views': increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  }

  
  static async toggleLike(presentationId: string, userId: string): Promise<boolean> {
    try {
      if (!db) return false;

      const presentationRef = doc(db, 'presentations', presentationId);
      const snapshot = await getDoc(presentationRef);

      if (!snapshot.exists()) return false;

      const data = snapshot.data();
      const likedBy = data.metadata?.likedBy || [];
      const isLiked = likedBy.includes(userId);

      if (isLiked) {
        await updateDoc(presentationRef, {
          'metadata.likes': increment(-1),
          'metadata.likedBy': likedBy.filter((id: string) => id !== userId),
          updatedAt: serverTimestamp()
        });
        return false;
      } else {
        await updateDoc(presentationRef, {
          'metadata.likes': increment(1),
          'metadata.likedBy': [...likedBy, userId],
          updatedAt: serverTimestamp()
        });
        return true;
      }
    } catch (error) {
      console.error('Erro ao alternar like:', error);
      return false;
    }
  }

  
  static async getPublicPresentations(limitCount: number = 10): Promise<ResearchPresentation[]> {
    try {
      if (!db) return [];

      const presentationsRef = collection(db, 'presentations');
      const q = query(
        presentationsRef,
        where('metadata.isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const presentations: ResearchPresentation[] = [];

      snapshot.forEach((doc) => {
        presentations.push(this.firestoreToPresentation(doc.id, doc.data()));
      });

      return presentations;
    } catch (error) {
      console.error('Erro ao buscar apresentações públicas:', error);
      return [];
    }
  }
}
