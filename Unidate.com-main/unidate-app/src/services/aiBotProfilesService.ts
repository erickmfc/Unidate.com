import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { PostsService } from './postsService';

const GEMINI_API_KEY = 'AIzaSyB64td1KPT4Y-ENAhGzwusiChhpwQ_VY-Q';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface BotProfile {
  id: string;
  name: string;
  handle: string;
  course: string;
  university: string;
  period: number;
  avatar: string;
  bio: string;
  writingStyle: string;
  personality: string;
  interests: string[];
  postingFrequency: {
    enabled: boolean;
    intervalMinutes: number;
  };
  status: 'active' | 'paused' | 'draft';
  postsCount: number;
  lastPostTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AIBotProfilesService {
  
  static async createProfile(profileData: Omit<BotProfile, 'id' | 'postsCount' | 'lastPostTime' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!db) throw new Error('Firebase não inicializado');

      const profileRef = await addDoc(collection(db, 'aiBotProfiles'), {
        ...profileData,
        postsCount: 0,
        lastPostTime: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return profileRef.id;
    } catch (error) {
      console.error('Erro ao criar perfil de bot:', error);
      throw error;
    }
  }

  
  static async getProfiles(): Promise<BotProfile[]> {
    try {
      if (!db) throw new Error('Firebase não inicializado');

      const snapshot = await getDocs(collection(db, 'aiBotProfiles'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastPostTime: doc.data().lastPostTime?.toDate?.() || null,
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      } as BotProfile));
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      return [];
    }
  }

  
  static async updateProfile(profileId: string, updates: Partial<BotProfile>): Promise<void> {
    try {
      if (!db) throw new Error('Firebase não inicializado');

      const { id, createdAt, ...updateData } = updates;
      
      const updateFields: any = { ...updateData };
      if (updateFields.lastPostTime instanceof Date) {
        updateFields.lastPostTime = updateFields.lastPostTime;
      }
      
      await updateDoc(doc(db, 'aiBotProfiles', profileId), {
        ...updateFields,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  
  static async deleteProfile(profileId: string): Promise<void> {
    try {
      if (!db) throw new Error('Firebase não inicializado');
      await deleteDoc(doc(db, 'aiBotProfiles', profileId));
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      throw error;
    }
  }

  
  static async generatePostForProfile(profile: BotProfile): Promise<string> {
    const prompt = `Você é ${profile.name}, um estudante universitário brasileiro.

PERFIL:
- Nome: ${profile.name}
- Curso: ${profile.course} (${profile.period}° período)
- Universidade: ${profile.university}
- Personalidade: ${profile.personality}
- Estilo de escrita: ${profile.writingStyle}
- Interesses: ${profile.interests.join(', ')}

Crie um tweet curto e autêntico sobre vida universitária. O tweet deve:
- Ter no máximo 280 caracteres
- Refletir a personalidade "${profile.personality}"
- Ser escrito no estilo "${profile.writingStyle}"
- Ser sobre um dos interesses: ${profile.interests.join(', ')} ou vida universitária em geral
- Ser em português brasileiro
- Ter um tom casual e relatable
- Pode incluir um comentário entre parênteses para adicionar contexto ou humor

Exemplos de estilo baseado na personalidade:
- Se for "sarcástico": "estudando com brilhos nos olhos (lágrimas)"
- Se for "motivacional": "mais um dia de estudos, mais um passo em direção aos meus sonhos"
- Se for "descontraído": "se eu gostasse de estudar igual eu gosto de dormir, eu tava era em harvard"
- Se for "reflexivo": "não bastava as neuras internas que a gente tinha que ignorar pra estudar decentemente..."

IMPORTANTE: O tweet deve soar como se ${profile.name} realmente escrevesse, mantendo consistência com o perfil.

Responda APENAS com o texto do tweet, sem aspas, sem explicações.`;

    try {
      const response = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 150,
              topP: 0.95,
              topK: 40
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar post');
      }

      const data = await response.json();
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      content = content.trim();
      content = content.replace(/^["']|["']$/g, '');
      content = content.replace(/\n/g, ' ');
      
      if (content.length > 280) {
        content = content.substring(0, 277) + '...';
      }

      if (!content || content.length < 10) {
        return this.getFallbackPost(profile);
      }

      return content;
    } catch (error) {
      console.error('Erro ao gerar post para perfil:', error);
      return this.getFallbackPost(profile);
    }
  }

  
  private static getFallbackPost(profile: BotProfile): string {
    const fallbackPosts: Record<string, string[]> = {
      'sarcástico': [
        'estudando com brilhos nos olhos (lágrimas)',
        'se eu gostasse de estudar igual eu gosto de dormir, eu tava era em harvard',
        'vou fechar esse semestre com chave de choro'
      ],
      'motivacional': [
        'mais um dia de estudos, mais um passo em direção aos meus sonhos',
        'a persistência é a chave do sucesso acadêmico',
        'cada página lida é uma vitória'
      ],
      'descontraído': [
        'professora não entendi vc poderia encerrar o semestre por gentileza',
        'café: 3 reais | sono: gratuito | minha escolha: café (porque preciso passar de ano)',
        'quando você finalmente entende a matéria mas a prova já foi ontem'
      ],
      'reflexivo': [
        'não bastava as neuras internas que a gente tinha que ignorar pra estudar decentemente, agora tem só uma pandemia rolando pra facilitar a fixação do conteúdo',
        'estudar às 3h da manhã não é produtividade, é desespero',
        'a diferença entre estudar e revisar: estudar é quando você não sabe nada, revisar é quando você esqueceu tudo'
      ]
    };

    const personality = profile.personality.toLowerCase();
    const posts = fallbackPosts[personality] || fallbackPosts['descontraído'];
    return posts[Math.floor(Math.random() * posts.length)];
  }

  
  static async createPostForProfile(profile: BotProfile): Promise<string> {
    if (!db) throw new Error('Firebase não inicializado');
    
    const content = await this.generatePostForProfile(profile);
    
    const postData = {
      author: {
        uid: `ai-bot-${profile.id}`,
        name: profile.name,
        course: profile.course,
        university: profile.university,
        avatar: profile.avatar
      },
      content: content,
      type: 'text' as const,
      likes: 0,
      comments: 0,
      isLiked: false,
      hashtags: this.extractHashtags(content),
      timestamp: undefined as any
    };

    const postId = await PostsService.createPost(postData);
    
    if (!db) {
      console.error('❌ Firestore não está disponível para atualizar contador de posts');
      return postId;
    }
    
    const profileRef = doc(db, 'aiBotProfiles', profile.id);
    await updateDoc(profileRef, {
      postsCount: profile.postsCount + 1,
      lastPostTime: new Date(),
      updatedAt: serverTimestamp()
    });

    return postId;
  }

  
  private static extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  }

  
  static generateAvatar(name: string, course: string): string {
    const colors = ['8b5cf6', 'ec4899', '06b6d4', '10b981', 'f59e0b', 'ef4444'];
    const color = colors[name.length % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=128&bold=true`;
  }
}
