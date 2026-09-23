import { supabase } from '../supabaseClient';
import { cleanDisplayName } from '../utils/displayName';

export interface Comment { id: string; postId: string; userId: string; userName: string; userAvatar?: string; content: string; timestamp: any; likes: number; likedBy: string[]; edited?: boolean; editedAt?: any; }

const mapComment = (row: any): Comment => ({ id: row.id, postId: row.post_id, userId: row.author_id, userName: cleanDisplayName(row.author?.display_name), userAvatar: row.author?.photo_url || '', content: row.content, timestamp: row.created_at, likes: 0, likedBy: [], edited: false, editedAt: row.updated_at });

export class CommentsService {
  static async addComment(postId: string, userId: string, userName: string, userAvatar: string, content: string): Promise<string> {
    if (!content.trim()) throw new Error('O comentário não pode estar vazio');
    const { data, error } = await supabase.from('comments').insert({ post_id: postId, author_id: userId, content: content.trim() }).select('id').single();
    if (error || !data) throw error || new Error('Não foi possível salvar o comentário');
    return data.id;
  }
  static loadPostComments(postId: string, onCommentsUpdate: (comments: Comment[]) => void, onError?: (error: Error) => void, limitCount = 50): () => void {
    let active = true;
    const load = async () => { const { data, error } = await supabase.from('comments').select('*, author:profiles(id, display_name, photo_url)').eq('post_id', postId).order('created_at', { ascending: true }).limit(limitCount); if (error) { onError?.(error); return; } if (active) onCommentsUpdate((data || []).map(mapComment)); };
    void load();
    const channel = supabase.channel(`comments:${postId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, () => { void load(); }).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }
  static async toggleCommentLike(_commentId: string, _userId: string, _isLiked: boolean): Promise<void> {}
  static async editComment(commentId: string, userId: string, newContent: string): Promise<void> { const { error } = await supabase.from('comments').update({ content: newContent.trim(), updated_at: new Date().toISOString() }).eq('id', commentId).eq('author_id', userId); if (error) throw error; }
  static async deleteComment(commentId: string, postId: string): Promise<void> { const { error } = await supabase.from('comments').delete().eq('id', commentId); if (error) throw error; }
}
