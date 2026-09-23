import React, { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, GraduationCap, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FollowService, FollowSuggestion } from '../../services/followService';
import { useToast } from '../../hooks/useToast';
import UserAvatar from '../UI/UserAvatar';

interface SuggestedProfilesProps {
  maxProfiles?: number;
}

const SuggestedProfiles: React.FC<SuggestedProfilesProps> = ({ maxProfiles = 5 }) => {
  const { currentUser, userProfile } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [suggestedProfiles, setSuggestedProfiles] = useState<FollowSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingId, setFollowingId] = useState<string | null>(null);

  const loadSuggestedProfiles = useCallback(async () => {
    if (!currentUser?.uid || !userProfile) {
      setSuggestedProfiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const suggestions = await FollowService.getSuggestions(currentUser.uid, userProfile, maxProfiles);
      setSuggestedProfiles(suggestions);
    } catch (loadError) {
      console.error('Erro ao carregar colegas sugeridos:', loadError);
      setSuggestedProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, userProfile?.university, userProfile?.course, userProfile?.year, userProfile?.interests, maxProfiles]);

  useEffect(() => {
    void loadSuggestedProfiles();
  }, [loadSuggestedProfiles]);

  const handleFollow = async (profile: FollowSuggestion) => {
    if (!currentUser?.uid || followingId) return;
    setFollowingId(profile.uid);
    try {
      await FollowService.follow(currentUser.uid, profile.uid);
      setSuggestedProfiles(previous => previous.filter(item => item.uid !== profile.uid));
      success(`${profile.name} entrou na sua rede do campus.`);
    } catch (followError: any) {
      error('Não foi possível seguir', followError?.message || 'Tente novamente.');
    } finally {
      setFollowingId(null);
    }
  };

  return (
    <section className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-600" />
          <h3 className="font-extrabold text-slate-800 text-sm">Colegas que talvez conheça</h3>
        </div>
        <button
          onClick={() => navigate('/discover')}
          className="text-indigo-600 text-xs font-bold hover:underline"
          aria-label="Ver mais sugestões"
        >
          Ver mais
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-4">Pessoas com cursos, campus ou interesses em comum.</p>

      {loading ? (
        <div className="space-y-3" aria-label="Carregando sugestões">
          {[0, 1, 2].map(item => <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-50" />)}
        </div>
      ) : suggestedProfiles.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-center">
          <GraduationCap className="h-6 w-6 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Ainda não encontramos novas afinidades.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestedProfiles.map(profile => (
            <article key={profile.uid} className="rounded-2xl border border-slate-100 p-3">
              <button
                onClick={() => navigate(`/profile/${profile.uid}`)}
                className="w-full flex items-center gap-3 text-left"
              >
                <UserAvatar photoURL={profile.avatar} displayName={profile.name} size="md" showGraduationCap />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-800">{profile.name}</span>
                  <span className="block truncate text-[11px] text-slate-500">{profile.course || 'Curso não informado'}</span>
                  <span className="block truncate text-[10px] text-slate-400">{profile.university || 'Universidade não informada'}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
              </button>

              {profile.commonalities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.commonalities.slice(0, 2).map(reason => (
                    <span key={reason} className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                      {reason}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => void handleFollow(profile)}
                disabled={followingId !== null}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-2 text-xs font-bold text-white transition hover:from-indigo-600 hover:to-purple-700 disabled:cursor-wait disabled:opacity-60"
                title="Colegar: seguir esta pessoa no UniDate"
              >
                <UserPlus className="h-3.5 w-3.5" />
                {followingId === profile.uid ? 'Entrando na rede…' : 'Colegar'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default SuggestedProfiles;
