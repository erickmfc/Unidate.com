import { supabase } from '../supabaseClient';

export interface Post {
  id: string;
  author: {
    uid: string;
    name: string;
    course: string;
    university: string;
    avatar: string;
  };
  content: string;
  type: 'text' | 'image' | 'poll' | 'tevi';
  image?: string;
  timestamp: any;
  likes: number;
  comments: number;
  isLiked: boolean;
  location?: string;
  teviData?: {
    location: string;
    clothing: string;
    activity: string;
  };
  pollData?: {
    question: string;
    options: string[];
    votes: number[];
  };
  event?: {
    title: string;
    date: string;
    attendees: number;
  };
  hashtags: string[];
  createdAt: any;
  updatedAt: any;
}

export class PostsService {
  static async createPost(postData: Omit<Post, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🔄 Tentando criar post no Supabase...', postData);

      const dbPost: any = {
        author_id: user.id,
        content: postData.content,
        type: postData.type,
        likes_count: 0,
        comments_count: 0,
        hashtags: postData.hashtags || []
      };

      if (postData.image) dbPost.image = postData.image;
      if (postData.location) dbPost.location = postData.location;
      if (postData.teviData) dbPost.tevi_data = postData.teviData;
      if (postData.pollData) dbPost.poll_data = postData.pollData;
      if (postData.event) dbPost.event_data = postData.event;

      const { data, error } = await supabase
        .from('posts')
        .insert(dbPost)
        .select('id')
        .single();

      if (error) throw error;

      console.log('✅ Post criado com sucesso no Supabase:', data.id);
      return data.id;
    } catch (error: any) {
      console.error('❌ Erro ao criar post no Supabase:', error);
      throw new Error(`Erro ao salvar post: ${error.message || 'Erro desconhecido'}`);
    }
  }

  static async getPosts(limitCount: number = 50): Promise<Post[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, display_name, photo_url, course, university),
          likes:likes(user_id)
        `)
        .order('created_at', { ascending: false })
        .limit(limitCount);

      if (error) throw error;

      const posts: Post[] = (postsData || []).map((p: any) => ({
        id: p.id,
        author: {
          uid: p.author?.id || '',
          name: p.author?.display_name || 'Usuário',
          course: p.author?.course || '',
          university: p.author?.university || '',
          avatar: p.author?.photo_url || ''
        },
        content: p.content,
        type: p.type,
        image: p.image,
        timestamp: p.created_at,
        likes: p.likes_count || 0,
        comments: p.comments_count || 0,
        isLiked: currentUserId ? p.likes?.some((l: any) => l.user_id === currentUserId) : false,
        location: p.location,
        teviData: p.tevi_data,
        pollData: p.poll_data,
        event: p.event_data,
        hashtags: p.hashtags || [],
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));

      console.log(`✅ ${posts.length} posts carregados do Supabase`);
      return posts;
    } catch (error) {
      console.error('❌ Erro ao carregar posts do Supabase:', error);
      return [];
    }
  }

  static async toggleLike(postId: string, userId: string, isLiked: boolean): Promise<void> {
    try {
      if (isLiked) {
        // Unlike: delete the row in the likes table
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Like: insert a row in the likes table
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: userId
          });

        if (error) throw error;
      }

      console.log('✅ Like atualizado no Supabase');
    } catch (error) {
      console.error('❌ Erro ao atualizar like no Supabase:', error);
      throw error;
    }
  }

  static async addComment(postId: string, commentData: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Insert comment
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: commentData.content || commentData.text || ''
        });

      if (commentError) throw commentError;

      // Update comments count in posts table
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('comments_count')
        .eq('id', postId)
        .single();

      if (!fetchError && post) {
        await supabase
          .from('posts')
          .update({ comments_count: (post.comments_count || 0) + 1 })
          .eq('id', postId);
      }

      console.log('✅ Comentário adicionado no Supabase');
    } catch (error) {
      console.error('❌ Erro ao adicionar comentário no Supabase:', error);
      throw error;
    }
  }

  static async getPostsByHashtag(hashtag: string): Promise<Post[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, display_name, photo_url, course, university),
          likes:likes(user_id)
        `)
        .contains('hashtags', [hashtag.toLowerCase().replace('#', '')])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (postsData || []).map((p: any) => ({
        id: p.id,
        author: {
          uid: p.author?.id || '',
          name: p.author?.display_name || 'Usuário',
          course: p.author?.course || '',
          university: p.author?.university || '',
          avatar: p.author?.photo_url || ''
        },
        content: p.content,
        type: p.type,
        image: p.image,
        timestamp: p.created_at,
        likes: p.likes_count || 0,
        comments: p.comments_count || 0,
        isLiked: currentUserId ? p.likes?.some((l: any) => l.user_id === currentUserId) : false,
        location: p.location,
        teviData: p.tevi_data,
        pollData: p.poll_data,
        event: p.event_data,
        hashtags: p.hashtags || [],
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar posts por hashtag no Supabase:', error);
      return [];
    }
  }

  static async getTrendingHashtags(): Promise<{tag: string, posts: number}[]> {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('hashtags');

      if (error) throw error;

      const hashtagCount: {[key: string]: number} = {};

      (postsData || []).forEach((post: any) => {
        if (post.hashtags && Array.isArray(post.hashtags)) {
          post.hashtags.forEach((hashtag: string) => {
            const tag = hashtag.toLowerCase();
            hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
          });
        }
      });

      const trending = Object.entries(hashtagCount)
        .map(([tag, posts]) => ({ tag: `#${tag}`, posts }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 5);

      return trending;
    } catch (error) {
      console.error('❌ Erro ao buscar hashtags trending no Supabase:', error);
      return [];
    }
  }

  static async deletePost(postId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', userId);

      if (error) throw error;
      
      console.log('✅ Post deletado com sucesso do Supabase:', postId);
    } catch (error) {
      console.error('❌ Erro ao deletar post do Supabase:', error);
      throw error;
    }
  }
}
