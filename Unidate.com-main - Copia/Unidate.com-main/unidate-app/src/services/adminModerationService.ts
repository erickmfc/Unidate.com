import { 
  collection, 
  query, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface ModerationReport {
  id: string;
  type: 'post' | 'comment' | 'profile' | 'group';
  content: {
    text?: string;
    imageUrl?: string;
    author: string;
    authorId: string;
    createdAt: Date;
  };
  report: {
    reason: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'violence' | 'other';
    description: string;
    reporterId: string;
    reporterName: string;
    reportedAt: Date;
  };
  status: 'pending' | 'reviewed' | 'resolved';
  priority: 'low' | 'medium' | 'high';
}

export class AdminModerationService {
  static async getReports(): Promise<ModerationReport[]> {
    try {
      if (!db) {
        console.error('Firebase não inicializado');
        return [];
      }

      console.log('📊 Buscando denúncias...');

      // Buscar denúncias da coleção reports
      const reportsRef = collection(db, 'reports');
      const reportsQuery = query(
        reportsRef,
        where('status', '==', 'pending'),
        orderBy('reportedAt', 'desc')
      );
      const snapshot = await getDocs(reportsQuery);

      const reports: ModerationReport[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Buscar conteúdo denunciado
        let content: any = {};
        let type: 'post' | 'comment' | 'profile' | 'group' = 'post';

        try {
          if (data.type === 'post' && data.postId) {
            const postDocRef = doc(db, 'posts', data.postId);
            const postDoc = await getDoc(postDocRef);
            if (postDoc.exists()) {
              const postData = postDoc.data();
              content = {
                text: postData.conteudo || postData.titulo || '',
                author: postData.autorNome || 'Usuário',
                authorId: postData.autorId || '',
                createdAt: postData.dataCriacao?.toDate ? postData.dataCriacao.toDate() : new Date()
              };
              type = 'post';
            }
          } else if (data.type === 'comment' && data.commentId) {
            const commentDocRef = doc(db, 'comments', data.commentId);
            const commentDoc = await getDoc(commentDocRef);
            if (commentDoc.exists()) {
              const commentData = commentDoc.data();
              content = {
                text: commentData.content || commentData.text || '',
                author: commentData.authorName || 'Usuário',
                authorId: commentData.authorId || '',
                createdAt: commentData.createdAt?.toDate ? commentData.createdAt.toDate() : new Date()
              };
              type = 'comment';
            }
          } else if (data.type === 'profile' && data.userId) {
            const userDocRef = doc(db, 'users', data.userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              content = {
                author: userData.displayName || userData.name || 'Usuário',
                authorId: data.userId,
                createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date()
              };
              type = 'profile';
            }
          }
        } catch (error) {
          console.error('Erro ao buscar conteúdo denunciado:', error);
        }

        // Determinar prioridade baseado no motivo
        const priority: 'low' | 'medium' | 'high' = 
          data.reason === 'violence' || data.reason === 'harassment' ? 'high' :
          data.reason === 'inappropriate' || data.reason === 'fake' ? 'medium' : 'low';

        reports.push({
          id: docSnap.id,
          type,
          content,
          report: {
            reason: data.reason || 'other',
            description: data.description || data.reportDescription || '',
            reporterId: data.reporterId || data.userId || '',
            reporterName: data.reporterName || data.reporterDisplayName || 'Usuário',
            reportedAt: data.reportedAt?.toDate ? data.reportedAt.toDate() : new Date()
          },
          status: data.status || 'pending',
          priority
        });
      }

      console.log(`✅ ${reports.length} denúncias encontradas`);
      return reports;
    } catch (error) {
      console.error('❌ Erro ao buscar denúncias:', error);
      return [];
    }
  }

  static async handleReportAction(
    reportId: string, 
    action: 'ignore' | 'remove' | 'warn' | 'suspend'
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase não inicializado');
      }

      const reportRef = doc(db, 'reports', reportId);
      
      switch (action) {
        case 'ignore':
          await updateDoc(reportRef, {
            status: 'resolved',
            resolvedAt: Timestamp.now(),
            resolution: 'ignored'
          });
          break;
        
        case 'remove':
          await updateDoc(reportRef, {
            status: 'resolved',
            resolvedAt: Timestamp.now(),
            resolution: 'removed'
          });
          // TODO: Remover o conteúdo denunciado
          break;
        
        case 'warn':
          await updateDoc(reportRef, {
            status: 'reviewed',
            reviewedAt: Timestamp.now(),
            action: 'warned'
          });
          // TODO: Adicionar aviso ao usuário
          break;
        
        case 'suspend':
          await updateDoc(reportRef, {
            status: 'resolved',
            resolvedAt: Timestamp.now(),
            resolution: 'suspended'
          });
          // TODO: Suspender usuário
          break;
      }

      console.log(`✅ Ação ${action} aplicada ao report ${reportId}`);
    } catch (error) {
      console.error('❌ Erro ao processar ação:', error);
      throw error;
    }
  }
}

