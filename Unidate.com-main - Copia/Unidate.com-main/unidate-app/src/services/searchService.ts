import { db } from '../firebase/config';
import { 
  collection, 
  doc,
  getDocs, 
  setDoc,
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { SearchResult, SearchFilters } from '../types/subjects';

export class SearchService {
  // Busca geral
  static async search(queryText: string, filters?: SearchFilters, limitCount: number = 20): Promise<SearchResult[]> {
    try {
      if (!db) {
        return [];
      }

      const results: SearchResult[] = [];
      const lowerQuery = queryText.toLowerCase();

      // Buscar em lições
      if (!filters?.type || filters.type.includes('lesson')) {
        const lessonsRef = collection(db, 'lessons');
        let lessonsQuery = query(lessonsRef, limit(limitCount));
        
        if (filters?.subjectId) {
          lessonsQuery = query(lessonsRef, where('subjectId', '==', filters.subjectId), limit(limitCount));
        }
        
        const lessonsSnapshot = await getDocs(lessonsQuery);
        lessonsSnapshot.forEach((doc) => {
          const data = doc.data();
          const title = data.title || '';
          const description = data.description || '';
          
          if (title.toLowerCase().includes(lowerQuery) || description.toLowerCase().includes(lowerQuery)) {
            const highlights: string[] = [];
            if (title.toLowerCase().includes(lowerQuery)) {
              highlights.push(title);
            }
            if (description.toLowerCase().includes(lowerQuery)) {
              highlights.push(description.substring(0, 100));
            }

            results.push({
              type: 'lesson',
              id: doc.id,
              title,
              description,
              relevance: this.calculateRelevance(queryText, title, description),
              highlights,
              metadata: {
                moduleId: data.moduleId,
                subjectId: data.subjectId,
                difficulty: data.difficulty,
              },
            });
          }
        });
      }

      // Buscar em matérias
      if (!filters?.type || filters.type.includes('subject')) {
        const subjectsRef = collection(db, 'subjects');
        const subjectsSnapshot = await getDocs(subjectsRef);
        
        subjectsSnapshot.forEach((doc) => {
          const data = doc.data();
          const name = data.name || '';
          const description = data.description || '';
          
          if (name.toLowerCase().includes(lowerQuery) || description.toLowerCase().includes(lowerQuery)) {
            results.push({
              type: 'subject',
              id: doc.id,
              title: name,
              description,
              relevance: this.calculateRelevance(queryText, name, description),
              highlights: [name],
              metadata: {
                color: data.color,
                category: data.category,
              },
            });
          }
        });
      }

      // Buscar em especialistas
      if (!filters?.type || filters.type.includes('expert')) {
        const expertsRef = collection(db, 'experts');
        const expertsSnapshot = await getDocs(expertsRef);
        
        expertsSnapshot.forEach((doc) => {
          const data = doc.data();
          const name = data.name || '';
          const bio = data.bio || '';
          
          if (name.toLowerCase().includes(lowerQuery) || bio.toLowerCase().includes(lowerQuery)) {
            results.push({
              type: 'expert',
              id: doc.id,
              title: name,
              description: bio,
              relevance: this.calculateRelevance(queryText, name, bio),
              highlights: [name],
              metadata: {
                rating: data.rating,
                specialties: data.specialties,
              },
            });
          }
        });
      }

      // Ordenar por relevância
      return results.sort((a, b) => b.relevance - a.relevance).slice(0, limitCount);
    } catch (error) {
      console.error('❌ Erro ao buscar:', error);
      return [];
    }
  }

  // Buscar em lições específicas
  static async searchInLessons(queryText: string, subjectId?: string): Promise<SearchResult[]> {
    try {
      if (!db) {
        return [];
      }

      const lessonsRef = collection(db, 'lessons');
      let q;
      
      if (subjectId) {
        q = query(lessonsRef, where('subjectId', '==', subjectId));
      } else {
        q = query(lessonsRef);
      }
      
      const snapshot = await getDocs(q);
      const results: SearchResult[] = [];
      const lowerQuery = queryText.toLowerCase();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const title = data.title || '';
        const description = data.description || '';
        const content = data.content?.text || '';
        
        if (
          title.toLowerCase().includes(lowerQuery) || 
          description.toLowerCase().includes(lowerQuery) ||
          content.toLowerCase().includes(lowerQuery)
        ) {
          const highlights: string[] = [];
          if (title.toLowerCase().includes(lowerQuery)) {
            highlights.push(title);
          }
          if (content.toLowerCase().includes(lowerQuery)) {
            const index = content.toLowerCase().indexOf(lowerQuery);
            highlights.push(content.substring(Math.max(0, index - 50), index + 100));
          }

          results.push({
            type: 'lesson',
            id: doc.id,
            title,
            description,
            relevance: this.calculateRelevance(queryText, title, description, content),
            highlights,
            metadata: {
              moduleId: data.moduleId,
              subjectId: data.subjectId,
            },
          });
        }
      });

      return results.sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      console.error('❌ Erro ao buscar em lições:', error);
      return [];
    }
  }

  // Obter sugestões baseadas em histórico
  static async getSuggestions(userId: string, limitCount: number = 5): Promise<SearchResult[]> {
    try {
      if (!db) {
        return [];
      }

      // Buscar histórico de busca do usuário
      const historyRef = collection(db, 'searchHistory', userId, 'searches');
      const historySnapshot = await getDocs(query(historyRef, orderBy('createdAt', 'desc'), limit(10)));
      
      const recentQueries: string[] = [];
      historySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.query) {
          recentQueries.push(data.query);
        }
      });

      // Buscar resultados baseados nas queries recentes
      const suggestions: SearchResult[] = [];
      for (const query of recentQueries.slice(0, 3)) {
        const results = await this.search(query, undefined, limitCount);
        suggestions.push(...results);
      }

      return suggestions.slice(0, limitCount);
    } catch (error) {
      console.error('❌ Erro ao obter sugestões:', error);
      return [];
    }
  }

  // Salvar histórico de busca
  static async saveSearchHistory(userId: string, queryText: string): Promise<void> {
    try {
      if (!db) {
        return;
      }

      const historyRef = collection(db, 'searchHistory', userId, 'searches');
      const docRef = doc(historyRef);
      
      await setDoc(docRef, {
        query: queryText,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Erro ao salvar histórico:', error);
    }
  }

  // Calcular relevância
  private static calculateRelevance(query: string, ...texts: string[]): number {
    const lowerQuery = query.toLowerCase();
    let relevance = 0;

    texts.forEach((text) => {
      const lowerText = text.toLowerCase();
      
      // Match exato
      if (lowerText === lowerQuery) {
        relevance += 100;
      }
      // Começa com a query
      else if (lowerText.startsWith(lowerQuery)) {
        relevance += 50;
      }
      // Contém a query
      else if (lowerText.includes(lowerQuery)) {
        relevance += 25;
      }
      // Palavras individuais
      const queryWords = lowerQuery.split(' ');
      queryWords.forEach((word) => {
        if (lowerText.includes(word)) {
          relevance += 10;
        }
      });
    });

    return relevance;
  }
}

