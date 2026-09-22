import { supabase } from '../supabaseClient';

type TimestampLike = { toDate: () => Date; seconds: number; nanoseconds: number };
const asTimestamp = (value?: string | null): TimestampLike => {
  const date = value ? new Date(value) : new Date();
  return { toDate: () => date, seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 };
};

export interface GroupPost {
  id: string; groupId: string;
  author: { uid: string; name: string; avatar?: string; course?: string };
  content: string; type: 'text' | 'image' | 'poll'; image?: string;
  pollData?: { question: string; options: string[]; votes: Record<string, number> };
  likes: string[]; comments: number; hashtags: string[];
  createdAt: TimestampLike; updatedAt: TimestampLike;
}

const mapPost = (row: any): GroupPost => ({
  id: row.id, groupId: row.group_id,
  author: { uid: row.author_id, name: row.author?.display_name || 'Usuário', avatar: row.author?.photo_url || '', course: row.author?.course || '' },
  content: row.content, type: row.type || 'text', image: row.image || undefined,
  pollData: row.poll_data || undefined, likes: row.likes || [], comments: row.comments_count || 0,
  hashtags: row.hashtags || [], createdAt: asTimestamp(row.created_at), updatedAt: asTimestamp(row.updated_at),
});

export class GroupPostsService {
  static async createPost(groupId: string, postData: { author: GroupPost['author']; content: string; type: GroupPost['type']; image?: string; pollData?: GroupPost['pollData'] }): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');
    const { data, error } = await supabase.from('group_posts').insert({
      group_id: groupId, author_id: user.id, content: postData.content, type: postData.type,
      image: postData.image || null, poll_data: postData.pollData || null,
      hashtags: postData.content.match(/#\w+/g)?.map((tag) => tag.substring(1)) || [],
    }).select('id').single();
    if (error || !data) throw error || new Error('Não foi possível criar a publicação');
    return data.id;
  }

  static async getGroupPosts(groupId: string, limitCount = 20): Promise<GroupPost[]> {
    const { data, error } = await supabase.from('group_posts').select('*, author:profiles(id, display_name, photo_url, course)')
      .eq('group_id', groupId).order('created_at', { ascending: false }).limit(limitCount);
    if (error) throw error;
    return (data || []).map(mapPost);
  }

  static async toggleLike(postId: string, userId: string, isLiking: boolean): Promise<void> {
    const { data: post, error: readError } = await supabase.from('group_posts').select('likes').eq('id', postId).single();
    if (readError || !post) throw readError || new Error('Publicação não encontrada');
    const likes = new Set<string>(post.likes || []);
    if (isLiking) likes.add(userId); else likes.delete(userId);
    const { error } = await supabase.from('group_posts').update({ likes: Array.from(likes) }).eq('id', postId);
    if (error) throw error;
  }

  static async votePoll(postId: string, userId: string, optionIndex: number): Promise<void> {
    const { data: post, error } = await supabase.from('group_posts').select('poll_data').eq('id', postId).single();
    if (error || !post?.poll_data) throw error || new Error('Esta publicação não é uma enquete');
    const votes = { ...(post.poll_data.votes || {}), [userId]: optionIndex };
    const { error: updateError } = await supabase.from('group_posts').update({ poll_data: { ...post.poll_data, votes } }).eq('id', postId);
    if (updateError) throw updateError;
  }

  static async incrementComments(postId: string): Promise<void> {
    const { data } = await supabase.from('group_posts').select('comments_count').eq('id', postId).single();
    if (data) await supabase.from('group_posts').update({ comments_count: (data.comments_count || 0) + 1 }).eq('id', postId);
  }

  static async deletePost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('group_posts').delete().eq('id', postId).eq('author_id', userId);
    if (error) throw error;
  }
}
