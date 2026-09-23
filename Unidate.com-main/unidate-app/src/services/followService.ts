import { supabase } from '../supabaseClient';

export interface FollowSuggestion {
  uid: string;
  name: string;
  avatar: string;
  course: string;
  university: string;
  year: number | null;
  interests: string[];
  commonalities: string[];
  score: number;
}

interface CurrentProfile {
  university?: string | null;
  course?: string | null;
  year?: number | null;
  interests?: string[] | null;
}

const normalize = (value?: string | null) => (value || '').trim().toLocaleLowerCase();
const isUseful = (value: string) => value !== '' && !value.includes('não informado');

export class FollowService {
  static async getFollowingIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);
    if (error) throw error;
    return (data || []).map(row => row.following_id);
  }

  static async getSuggestions(
    userId: string,
    currentProfile: CurrentProfile,
    limitCount = 5
  ): Promise<FollowSuggestion[]> {
    const [profilesResult, followsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, display_name, photo_url, university, course, year, interests')
        .neq('id', userId)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId),
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (followsResult.error) throw followsResult.error;

    const alreadyFollowing = new Set((followsResult.data || []).map(row => row.following_id));
    const myUniversity = normalize(currentProfile.university);
    const myCourse = normalize(currentProfile.course);
    const myYear = currentProfile.year || null;
    const myInterests = new Set((currentProfile.interests || []).map(normalize).filter(Boolean));

    return (profilesResult.data || [])
      .filter(profile => !alreadyFollowing.has(profile.id))
      .map(profile => {
        const university = profile.university || '';
        const course = profile.course || '';
        const year = profile.year || null;
        const interests: string[] = ((profile.interests || []) as string[]).filter(Boolean);
        const commonalities: string[] = [];
        let score = 0;

        if (isUseful(myUniversity) && normalize(university) === myUniversity) {
          commonalities.push('Mesma universidade');
          score += 10;
        }
        if (isUseful(myCourse) && normalize(course) === myCourse) {
          commonalities.push('Mesmo curso');
          score += 8;
        }
        if (myYear && year === myYear) {
          commonalities.push('Mesmo ano');
          score += 3;
        }

        const sharedInterests = interests.filter(interest => myInterests.has(normalize(interest)));
        sharedInterests.slice(0, 2).forEach(interest => commonalities.push(`Interesse: ${interest}`));
        score += sharedInterests.length * 5;

        return {
          uid: profile.id,
          name: profile.display_name || 'Estudante',
          avatar: profile.photo_url || '',
          course,
          university,
          year,
          interests,
          commonalities,
          score,
        };
      })
      .filter(profile => profile.score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'pt-BR'))
      .slice(0, limitCount);
  }

  static async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) throw new Error('Você não pode seguir seu próprio perfil.');
    const { error } = await supabase.from('user_follows').insert({
      follower_id: followerId,
      following_id: followingId,
    });
    if (error && error.code !== '23505') throw error;
    window.dispatchEvent(new Event('unidate-follows-updated'));
  }

  static async unfollow(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) throw error;
    window.dispatchEvent(new Event('unidate-follows-updated'));
  }

  static async getProfileStats(viewerId: string, profileId: string): Promise<{
    isFollowing: boolean;
    followers: number;
    following: number;
  }> {
    const [followState, followersResult, followingResult] = await Promise.all([
      supabase
        .from('user_follows')
        .select('follower_id')
        .eq('follower_id', viewerId)
        .eq('following_id', profileId)
        .maybeSingle(),
      supabase
        .from('user_follows')
        .select('follower_id', { count: 'exact', head: true })
        .eq('following_id', profileId),
      supabase
        .from('user_follows')
        .select('following_id', { count: 'exact', head: true })
        .eq('follower_id', profileId),
    ]);

    if (followState.error) throw followState.error;
    if (followersResult.error) throw followersResult.error;
    if (followingResult.error) throw followingResult.error;

    return {
      isFollowing: Boolean(followState.data),
      followers: followersResult.count || 0,
      following: followingResult.count || 0,
    };
  }
}
