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
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { Contribution, ContributionVote, ContributionReview } from '../types/subjects';

export class ContributionsService {
  // Criar contribuição
  static async createContribution(contributionData: Omit<Contribution, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'totalVotes' | 'upvotes' | 'downvotes' | 'reviews'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const contributionsRef = collection(db, 'contributions');
      const docRef = doc(contributionsRef);
      
      await setDoc(docRef, {
        ...contributionData,
        status: 'pending',
        votes: [],
        totalVotes: 0,
        upvotes: 0,
        downvotes: 0,
        reviews: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar contribuição:', error);
      throw error;
    }
  }

  // Obter contribuições por matéria
  static async getContributionsBySubject(subjectId: string): Promise<Contribution[]> {
    try {
      if (!db) {
        return [];
      }

      const contributionsRef = collection(db, 'contributions');
      const q = query(
        contributionsRef,
        where('subjectId', '==', subjectId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const contributions: Contribution[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        contributions.push({
          id: doc.id,
          subjectId: data.subjectId,
          lessonId: data.lessonId,
          contributorId: data.contributorId,
          contributorName: data.contributorName,
          contributorAvatar: data.contributorAvatar,
          type: data.type,
          content: data.content,
          status: data.status,
          votes: data.votes || [],
          totalVotes: data.totalVotes || 0,
          upvotes: data.upvotes || 0,
          downvotes: data.downvotes || 0,
          reviews: data.reviews || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return contributions;
    } catch (error) {
      console.error('❌ Erro ao buscar contribuições:', error);
      return [];
    }
  }

  // Votar em contribuição
  static async vote(
    contributionId: string, 
    userId: string, 
    vote: 'up' | 'down'
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const contributionRef = doc(db, 'contributions', contributionId);
      const contributionDoc = await getDoc(contributionRef);

      if (!contributionDoc.exists()) {
        throw new Error('Contribuição não encontrada');
      }

      const data = contributionDoc.data();
      const votes: ContributionVote[] = data.votes || [];
      
      // Verificar se usuário já votou
      const existingVoteIndex = votes.findIndex(v => v.userId === userId);
      
      if (existingVoteIndex >= 0) {
        // Atualizar voto existente
        const existingVote = votes[existingVoteIndex];
        if (existingVote.vote === vote) {
          // Remover voto se for o mesmo
          votes.splice(existingVoteIndex, 1);
          await updateDoc(contributionRef, {
            votes,
            totalVotes: votes.length,
            upvotes: votes.filter(v => v.vote === 'up').length,
            downvotes: votes.filter(v => v.vote === 'down').length,
            updatedAt: serverTimestamp(),
          });
        } else {
          // Mudar voto
          votes[existingVoteIndex] = { userId, vote, createdAt: new Date() };
          await updateDoc(contributionRef, {
            votes,
            totalVotes: votes.length,
            upvotes: votes.filter(v => v.vote === 'up').length,
            downvotes: votes.filter(v => v.vote === 'down').length,
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        // Adicionar novo voto
        votes.push({ userId, vote, createdAt: new Date() });
        await updateDoc(contributionRef, {
          votes,
          totalVotes: votes.length,
          upvotes: votes.filter(v => v.vote === 'up').length,
          downvotes: votes.filter(v => v.vote === 'down').length,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('❌ Erro ao votar em contribuição:', error);
      throw error;
    }
  }

  // Adicionar revisão
  static async review(
    contributionId: string,
    reviewerId: string,
    reviewerName: string,
    comment: string,
    rating: number
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const contributionRef = doc(db, 'contributions', contributionId);
      const contributionDoc = await getDoc(contributionRef);

      if (!contributionDoc.exists()) {
        throw new Error('Contribuição não encontrada');
      }

      const data = contributionDoc.data();
      const reviews: ContributionReview[] = data.reviews || [];

      const newReview: ContributionReview = {
        id: `${Date.now()}`,
        reviewerId,
        reviewerName,
        comment,
        rating,
        createdAt: new Date(),
      };

      reviews.push(newReview);

      await updateDoc(contributionRef, {
        reviews,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Erro ao adicionar revisão:', error);
      throw error;
    }
  }

  // Aprovar contribuição (admin/expert)
  static async approve(contributionId: string, approverId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const contributionRef = doc(db, 'contributions', contributionId);
      await updateDoc(contributionRef, {
        status: 'approved',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Erro ao aprovar contribuição:', error);
      throw error;
    }
  }

  // Rejeitar contribuição (admin/expert)
  static async reject(contributionId: string, rejectorId: string, reason?: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const contributionRef = doc(db, 'contributions', contributionId);
      await updateDoc(contributionRef, {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Erro ao rejeitar contribuição:', error);
      throw error;
    }
  }

  // Obter contribuições pendentes
  static async getPendingContributions(): Promise<Contribution[]> {
    try {
      if (!db) {
        return [];
      }

      const contributionsRef = collection(db, 'contributions');
      const q = query(
        contributionsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const contributions: Contribution[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        contributions.push({
          id: doc.id,
          subjectId: data.subjectId,
          lessonId: data.lessonId,
          contributorId: data.contributorId,
          contributorName: data.contributorName,
          contributorAvatar: data.contributorAvatar,
          type: data.type,
          content: data.content,
          status: data.status,
          votes: data.votes || [],
          totalVotes: data.totalVotes || 0,
          upvotes: data.upvotes || 0,
          downvotes: data.downvotes || 0,
          reviews: data.reviews || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return contributions;
    } catch (error) {
      console.error('❌ Erro ao buscar contribuições pendentes:', error);
      return [];
    }
  }
}

