import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import { 
  Search, Filter, 
  Image, 
  Smile, 
  Hash, 
  MessageCircle, 
  Heart, 
  Share2, 
  TrendingUp, 
  Users, 
  Calendar,
  Zap,
  Plus,
  Send,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUniDateToast } from '../components/UI/Toast';
import { PostsService, Post } from '../services/postsService';
import { FollowService } from '../services/followService';
import SuggestedProfiles from '../components/Feed/SuggestedProfiles';
import CampusSummary from '../components/Feed/CampusSummary';
import { GroupPostsService } from '../services/groupPostsService';
import { supabase } from '../supabaseClient';
import UserAvatar from '../components/UI/UserAvatar';

const FEED_CATEGORIES = [
  { id: 'tudo', name: 'Tudo' },
  { id: 'em-alta', name: 'Em alta' },
  { id: 'seguindo', name: 'Seguindo' },
  { id: 'grupos', name: 'Grupos' },
  { id: 'hashtags', name: '#Hashtags' }
];

const QUICK_ACTIONS = [
  { id: 'tevi', name: 'Postar #TeVi', icon: Zap, bg: 'bg-pink-50 text-pink-500 hover:bg-pink-100/70' },
  { id: 'enquete', name: 'Criar Enquete', icon: TrendingUp, bg: 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100/70' },
  { id: 'explorar', name: 'Explorar Hashtags', icon: Hash, bg: 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100/70' },
  { id: 'grupo', name: 'Criar Grupo', icon: Users, bg: 'bg-purple-50 text-purple-500 hover:bg-purple-100/70' }
];

const TRENDING_HASHTAGS = [
  { rank: 1, tag: '#FestaDoDireito', count: '1.2k posts' },
  { rank: 2, tag: '#Calculo01', count: '987 posts' },
  { rank: 3, tag: '#Biblioteca', count: '756 posts' }
];

const Feed: React.FC = () => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag');

  const [posts, setPosts] = useState<Post[]>([]);
  const [groupFeedPosts, setGroupFeedPosts] = useState<Post[]>([]);
  const [loadingGroupFeed, setLoadingGroupFeed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [followingUserIds, setFollowingUserIds] = useState<string[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [activeCategory, setActiveCategory] = useState('tudo');
  const [activeTab, setActiveTab] = useState<'text' | 'tevi' | 'poll'>('text');
  
  // Composer state
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isMediaDragging, setIsMediaDragging] = useState(false);
  const mediaInputRef = React.useRef<HTMLInputElement>(null);

  const readImageFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMediaUrl(String(reader.result || ''));
      setShowMediaInput(true);
    };
    reader.readAsDataURL(file);
  };
  
  // Enquete (Poll) state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  // TeVi state
  const [teviLoc, setTeviLoc] = useState('');
  const [teviClothing, setTeviClothing] = useState('');
  const [teviActivity, setTeviActivity] = useState('');

  // Comment input state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, any[]>>({});
  const [showCommentBox, setShowCommentBox] = useState<Record<string, boolean>>({});

  const loadPosts = async () => {
    try {
      setLoading(true);
      setPostsError(null);
      const data = await PostsService.getPosts(50);
      setPosts(data);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'Não foi possível carregar as publicações.';
      setPostsError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // A sessão do Supabase é restaurada de forma assíncrona. Esperar o AuthContext
    // terminar evita consultar o feed como visitante e guardar um resultado vazio.
    if (authLoading) return;
    void loadPosts();
  }, [authLoading, currentUser?.uid]);

  useEffect(() => {
    let active = true;
    if (activeCategory !== 'grupos') return;
    if (!currentUser?.uid) {
      setGroupFeedPosts([]);
      return;
    }

    setLoadingGroupFeed(true);
    GroupPostsService.getJoinedGroupFeed(currentUser.uid, 50)
      .then(data => { if (active) setGroupFeedPosts(data); })
      .catch(error => {
        console.error('Erro ao carregar feed dos grupos:', error);
        if (active) setGroupFeedPosts([]);
      })
      .finally(() => { if (active) setLoadingGroupFeed(false); });
    return () => { active = false; };
  }, [activeCategory, currentUser?.uid]);

  useEffect(() => {
    let active = true;
    const loadFollowingIds = async () => {
      if (!currentUser?.uid) {
        setFollowingUserIds([]);
        setLoadingFollowing(false);
        return;
      }

      setLoadingFollowing(true);
      try {
        const ids = await FollowService.getFollowingIds(currentUser.uid);
        if (active) setFollowingUserIds(ids);
      } catch (error) {
        console.error('Erro ao carregar a rede do feed:', error);
        if (active) setFollowingUserIds([]);
      } finally {
        if (active) setLoadingFollowing(false);
      }
    };

    const refreshFollowing = () => void loadFollowingIds();
    void loadFollowingIds();
    window.addEventListener('unidate-follows-updated', refreshFollowing);
    return () => {
      active = false;
      window.removeEventListener('unidate-follows-updated', refreshFollowing);
    };
  }, [currentUser?.uid]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && activeTab === 'text') {
      showError('Sua postagem precisa de algum texto!');
      return;
    }

    try {
      let postData: any = {
        content: content,
        type: activeTab,
        hashtags: extractHashtags(content),
        likes: 0,
        comments: 0,
        isLiked: false,
        author: {
          uid: currentUser?.uid || '',
          name: userProfile?.displayName || 'Usuário',
          course: userProfile?.course || '',
          university: userProfile?.university || '',
          avatar: userProfile?.photoURL || ''
        }
      };

      if (mediaUrl) {
        postData.image = mediaUrl;
      }

      if (activeTab === 'poll') {
        postData.pollData = {
          question: pollQuestion || 'Enquete rápida:',
          options: pollOptions.filter(o => o.trim() !== ''),
          votes: pollOptions.filter(o => o.trim() !== '').map(() => 0)
        };
        postData.content = content || pollQuestion;
      }

      if (activeTab === 'tevi') {
        postData.teviData = {
          location: teviLoc || 'No Campus',
          clothing: teviClothing || 'Casual',
          activity: teviActivity || 'Estudando'
        };
        postData.content = content || `#TeVi no ${teviLoc}: ${teviActivity}`;
        if (!postData.hashtags.includes('TeVi')) {
          postData.hashtags.push('TeVi');
        }
      }

      const postId = await PostsService.createPost(postData);
      const createdAt = new Date().toISOString();
      const newPost: Post = {
        ...postData,
        id: postId,
        author: { ...postData.author, uid: currentUser?.uid || '' },
        timestamp: createdAt,
        createdAt,
        updatedAt: createdAt
      };
      setPosts(previous => [newPost, ...previous.filter(post => post.id !== postId)]);
      showSuccess('Publicação criada!');
      setContent('');
      setMediaUrl('');
      setShowMediaInput(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setTeviLoc('');
      setTeviClothing('');
      setTeviActivity('');
      await loadPosts();
    } catch (error: any) {
      console.error(error);
      showError('Erro ao publicar: ' + error.message);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (!currentUser) return;
      const post = posts.find(item => item.id === postId);
      if (post?.sourceGroupPost) {
        await GroupPostsService.toggleLike(postId, currentUser.uid, !isLiked);
      } else {
        await PostsService.toggleLike(postId, currentUser.uid, isLiked);
      }
      
      const updateLikedPost = (items: Post[]) => items.map(p => p.id === postId
        ? { ...p, isLiked: !isLiked, likes: p.likes + (isLiked ? -1 : 1) }
        : p);
      setPosts(updateLikedPost);
      setGroupFeedPosts(updateLikedPost);
    } catch (e) {
      console.error(e);
      showError('Erro ao curtir post.');
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      await PostsService.addComment(postId, { content: text });
      showSuccess('Comentário enviado!');
      setCommentInputs({ ...commentInputs, [postId]: '' });
      
      // Atualizar o número de comentários no post
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, comments: p.comments + 1 };
        }
        return p;
      }));

      // Recarregar comentários expandidos se estiverem abertos
      if (showCommentBox[postId]) {
        loadComments(postId);
      }
    } catch (e) {
      console.error(e);
      showError('Erro ao comentar.');
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          author:profiles(id, display_name, photo_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setExpandedComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCommentsBox = (postId: string) => {
    const isShowing = !showCommentBox[postId];
    setShowCommentBox(prev => ({ ...prev, [postId]: isShowing }));
    if (isShowing) {
      loadComments(postId);
    }
  };

  const handlePollVote = async (postId: string, optionIndex: number) => {
    try {
      const post = [...posts, ...groupFeedPosts].find(p => p.id === postId);
      if (!post || !post.pollData) return;

      if (post.sourceGroupPost) {
        await GroupPostsService.votePoll(postId, currentUser?.uid || '', optionIndex);
        const votes = [...post.pollData.votes];
        votes[optionIndex] = (votes[optionIndex] || 0) + 1;
        setGroupFeedPosts(previous => previous.map(item => item.id === postId && item.pollData
          ? { ...item, pollData: { ...item.pollData, votes } }
          : item));
        showSuccess('Voto registrado!');
        return;
      }

      const votes = [...post.pollData.votes];
      votes[optionIndex] = (votes[optionIndex] || 0) + 1;

      const updatedPollData = {
        ...post.pollData,
        votes: votes
      };

      const { error } = await supabase
        .from('posts')
        .update({ poll_data: updatedPollData })
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, pollData: updatedPollData };
        }
        return p;
      }));
      showSuccess('Voto registrado!');
    } catch (e) {
      console.error(e);
      showError('Erro ao registrar voto.');
    }
  };

  const extractHashtags = (text: string): string[] => {
    const regex = /#(\w+)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  };

  const getFilteredPosts = () => {
    let filtered = posts;

    // Filter by category
    if (activeCategory === 'seguindo') {
      const followingIds = new Set(followingUserIds);
      filtered = filtered.filter(post => followingIds.has(post.author.uid));
    } else if (activeCategory === 'em-alta') {
      filtered = [...filtered].sort((a, b) => b.likes - a.likes);
    } else if (activeCategory === 'grupos') {
      filtered = groupFeedPosts;
    } else if (activeCategory === 'hashtags') {
      filtered = filtered.filter(p => p.hashtags.length > 0);
    }

    // Filter by tag in URL
    if (tagFilter) {
      filtered = filtered.filter(p => p.hashtags.map(t => t.toLowerCase()).includes(tagFilter.toLowerCase()) || p.content.toLowerCase().includes(`#${tagFilter.toLowerCase()}`));
    }

    return filtered;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Coluna Esquerda: Sidebar */}
      <Sidebar activeHashtag={tagFilter || undefined} onHashtagClick={(tag) => setSearchParams({ tag })} />

      {/* Feed, sugestões de colegas e ações do campus */}
    <div className="flex-1 ml-64 min-h-screen flex justify-center bg-slate-50">
        <div className="grid w-full max-w-[1560px] grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)_360px]">
          <aside className="px-6 py-8 xl:col-start-1 xl:row-start-1">
            <SuggestedProfiles maxProfiles={5} />
          </aside>
          {/* Coluna Central: Feed */}
          <div className="min-w-0 w-full max-w-[760px] px-6 py-8 xl:col-start-2 xl:row-start-1">
          
          {/* Barra de Pesquisa */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Buscar pessoas, grupos, eventos ou hashtags..." 
              className="w-full pl-12 pr-10 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500/20"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md font-bold select-none uppercase tracking-wider">
              ⌘ K
            </span>
          </div>

          {/* Banner de Boas-Vindas */}
          <div className="bg-gradient-to-r from-violet-50/70 via-indigo-50/70 to-pink-50/70 rounded-3xl p-6 mb-6 border border-indigo-100/30 flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center space-x-4 relative z-10">
              <div className="relative">
                <UserAvatar
                  photoURL={userProfile?.photoURL}
                  displayName={userProfile?.displayName}
                  email={currentUser?.email}
                  size="lg"
                  showGraduationCap={false}
                  className="ring-2 ring-indigo-500/10 rounded-full"
                />
                <div className="absolute right-0 bottom-0 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="h-1.5 w-1.5 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800 text-lg flex items-center space-x-1.5">
                  <span>Boa tarde, {userProfile?.displayName?.split(' ')[0] || 'Matheus'}!</span>
                  <span>👋</span>
                </h2>
                <p className="text-slate-500 text-xs mt-1">A voz do campus &bull; Não é sobre conectar, é sobre pertencer.</p>
              </div>
            </div>
            
            {/* Wave graphic decorator */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <svg className="w-40 h-20 text-indigo-600" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,50 Q25,70 50,50 T100,50 L100,100 L0,100 Z" />
              </svg>
            </div>
          </div>

          {/* Compositor de Posts */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-6">
            {/* Tabs de Tipo */}
            <div className="flex space-x-4 border-b border-slate-50 pb-4 mb-4 text-sm font-semibold text-slate-400">
              <button 
                onClick={() => setActiveTab('text')}
                className={`pb-1 transition-all ${activeTab === 'text' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'hover:text-slate-600'}`}
              >
                Texto
              </button>
              <button 
                onClick={() => setActiveTab('tevi')}
                className={`pb-1 transition-all ${activeTab === 'tevi' ? 'text-pink-600 border-b-2 border-pink-600' : 'hover:text-slate-600'}`}
              >
                #TeVi
              </button>
              <button 
                onClick={() => setActiveTab('poll')}
                className={`pb-1 transition-all ${activeTab === 'poll' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'hover:text-slate-600'}`}
              >
                Enquete
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Conteúdo Dinâmico com base no activeTab */}
              {activeTab === 'text' && (
                <div className="flex items-start space-x-3">
                  <UserAvatar
                    photoURL={userProfile?.photoURL}
                    displayName={userProfile?.displayName}
                    email={currentUser?.email}
                    size="md"
                    showGraduationCap={false}
                  />
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="O que está rolando no campus?"
                    className="flex-1 bg-transparent border-0 outline-none text-slate-700 text-sm resize-none focus:ring-0 placeholder-slate-400 min-h-[60px]"
                  />
                </div>
              )}

              {activeTab === 'tevi' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-pink-500 uppercase tracking-widest bg-pink-50 px-3 py-1.5 rounded-full w-fit">
                    <Zap className="h-3 w-3 fill-pink-500" />
                    <span>#TeVi - Dedique um flag visual de alguém que você avistou</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="Onde avistou? (Ex: Biblioteca)" 
                      value={teviLoc}
                      onChange={(e) => setTeviLoc(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none text-slate-700 focus:ring-2 focus:ring-pink-500/20"
                    />
                    <input 
                      type="text" 
                      placeholder="O que vestia?" 
                      value={teviClothing}
                      onChange={(e) => setTeviClothing(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none text-slate-700 focus:ring-2 focus:ring-pink-500/20"
                    />
                    <input 
                      type="text" 
                      placeholder="O que fazia? (Ex: Rindo alto)" 
                      value={teviActivity}
                      onChange={(e) => setTeviActivity(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none text-slate-700 focus:ring-2 focus:ring-pink-500/20"
                    />
                  </div>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Quer dedicar um comentário especial ao avistamento?"
                    className="w-full bg-slate-50/50 p-3 border border-slate-100 rounded-2xl outline-none text-slate-700 text-xs resize-none focus:ring-2 focus:ring-pink-500/20 placeholder-slate-400 min-h-[50px]"
                  />
                </div>
              )}

              {activeTab === 'poll' && (
                <div className="space-y-3 bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/30">
                  <input 
                    type="text" 
                    placeholder="Qual é a pergunta da enquete?" 
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-semibold outline-none text-slate-700 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <div className="space-y-2">
                    {pollOptions.map((opt, idx) => (
                      <input 
                        key={idx}
                        type="text" 
                        placeholder={`Opção ${idx + 1}`} 
                        value={opt}
                        onChange={(e) => {
                          const copy = [...pollOptions];
                          copy[idx] = e.target.value;
                          setPollOptions(copy);
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs outline-none text-slate-700 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    ))}
                    <button 
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="text-xs text-emerald-600 font-bold hover:underline px-1 flex items-center space-x-1"
                    >
                      <span>+ Adicionar opção</span>
                    </button>
                  </div>
                </div>
              )}

              {/* URL de mídia se aberto */}
              {showMediaInput && (
                <div
                  onDragOver={(event) => { event.preventDefault(); setIsMediaDragging(true); }}
                  onDragLeave={() => setIsMediaDragging(false)}
                  onDrop={(event) => { event.preventDefault(); setIsMediaDragging(false); readImageFile(event.dataTransfer.files[0]); }}
                  className={`space-y-2 rounded-xl border-2 border-dashed p-3 transition-colors ${isMediaDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <input ref={mediaInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => readImageFile(event.target.files?.[0])} />
                    <button type="button" onClick={() => mediaInputRef.current?.click()} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700">Escolher imagem</button>
                    <span className="text-[11px] text-slate-500">ou arraste uma imagem aqui</span>
                  </div>
                  <input type="text" placeholder="Ou cole aqui o link da imagem..." value={mediaUrl.startsWith('data:') ? '' : mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  {mediaUrl && <img src={mediaUrl} alt="Prévia da publicação" className="max-h-40 w-full rounded-lg object-cover" />}
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setShowMediaInput(!showMediaInput)}
                    className="flex items-center space-x-1 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all text-xs font-semibold"
                  >
                    <Image className="h-4 w-4 text-slate-400" />
                    <span>Foto</span>
                  </button>
                  <button 
                    type="button" 
                    className="flex items-center space-x-1 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all text-xs font-semibold"
                  >
                    <Smile className="h-4 w-4 text-slate-400" />
                    <span>Emoji</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (!content.includes('#')) {
                        setContent(content + ' #');
                      }
                    }}
                    className="flex items-center space-x-1 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all text-xs font-semibold"
                  >
                    <Hash className="h-4 w-4 text-slate-400" />
                    <span>Hashtags</span>
                  </button>
                </div>

                <button 
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md shadow-indigo-100 transition-all"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>

          {/* Categorias e Filtros de Feed */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1.5 overflow-x-auto min-w-max pb-1">
              {FEED_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    // Limpar filtro de tag se mudar de categoria
                    if (tagFilter) setSearchParams({});
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    activeCategory === cat.id && !tagFilter
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-slate-100/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              
              {tagFilter && (
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl text-xs font-bold border border-indigo-100 flex items-center space-x-1">
                  <span>Filtrado por: #{tagFilter}</span>
                  <button onClick={() => setSearchParams({})} className="text-indigo-400 hover:text-indigo-600 font-bold ml-1">&times;</button>
                </div>
              )}
            </div>

            {/* Ordenação */}
            <button className="flex items-center space-x-1 bg-white border border-slate-100/50 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-50">
              <Filter className="h-3.5 w-3.5" />
              <span>Mais recentes</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Lista de Posts */}
          {loading || (activeCategory === 'seguindo' && loadingFollowing) || (activeCategory === 'grupos' && loadingGroupFeed) ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  {/* Cabeçalho do Post */}
                  <div className="flex justify-between items-start mb-4">
                    <button
                      onClick={() => navigate(`/profile/${post.author.uid}`)}
                      className="flex items-center space-x-3 text-left"
                      aria-label={`Ver perfil de ${post.author.name}`}
                    >
                      <UserAvatar
                        photoURL={post.author.avatar}
                        displayName={post.author.name}
                        size="md"
                        showGraduationCap={false}
                        isAutomated={post.author.isAutomated}
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-extrabold text-slate-800 text-sm">{post.author.name}</h4>
                          {post.author.isAutomated && (
                            <span className="text-[9px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
                              Personagem virtual
                            </span>
                          )}
                          <span className="text-[10px] bg-slate-50 text-slate-400 font-semibold px-2 py-0.5 rounded-full border border-slate-100">
                            {post.author.course.split(' ')[0] || 'Aluno'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {post.author.university.split(' - ')[0]} &bull; {new Date(post.createdAt || post.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {post.sourceGroupPost && (
                          <button onClick={() => navigate(`/groups/${post.groupId}`)} className="mt-1 text-[10px] font-bold text-indigo-600 hover:underline">
                            {post.groupName}
                          </button>
                        )}
                      </div>
                    </button>
                    
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Conteúdo do Post */}
                  <div className="space-y-3 text-slate-700 text-sm leading-relaxed mb-4">
                    <p>{post.content}</p>

                    {/* Renderização condicional por tipo */}
                    {post.type === 'tevi' && post.teviData && (
                      <div className="bg-pink-50/30 border border-pink-100 rounded-2xl p-4 space-y-2 mt-2">
                        <div className="flex items-center space-x-2 text-pink-600 font-bold text-xs uppercase">
                          <Zap className="h-4 w-4 fill-pink-500" />
                          <span>Flagged #TeVi!</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-white p-2 rounded-xl border border-pink-50">
                            <span className="text-[10px] text-slate-400 block font-semibold">Local</span>
                            <span className="font-bold text-slate-700">{post.teviData.location}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-pink-50">
                            <span className="text-[10px] text-slate-400 block font-semibold">Vestimenta</span>
                            <span className="font-bold text-slate-700">{post.teviData.clothing}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-pink-50">
                            <span className="text-[10px] text-slate-400 block font-semibold">Atividade</span>
                            <span className="font-bold text-slate-700">{post.teviData.activity}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {post.type === 'poll' && post.pollData && (
                      <div className="bg-emerald-50/20 border border-emerald-100/30 rounded-2xl p-4 space-y-3 mt-2">
                        <h5 className="font-bold text-slate-800 text-xs">{post.pollData.question}</h5>
                        <div className="space-y-2">
                          {post.pollData.options.map((opt, idx) => {
                            const votes = post.pollData?.votes || [];
                            const totalVotes = votes.reduce((a, b) => a + b, 0) || 1;
                            const optionVotes = votes[idx] || 0;
                            const pct = Math.round((optionVotes / totalVotes) * 100);
                            
                            return (
                              <button 
                                key={idx}
                                onClick={() => handlePollVote(post.id, idx)}
                                className="w-full text-left relative overflow-hidden bg-white border border-slate-100 hover:border-emerald-200 p-2.5 rounded-xl text-xs font-semibold flex justify-between items-center group transition-all"
                              >
                                {/* Pct overlay */}
                                <div className="absolute left-0 top-0 bottom-0 bg-emerald-50 transition-all duration-500" style={{ width: `${pct}%`, zIndex: 1 }}></div>
                                <span className="relative z-10 text-slate-700 group-hover:text-emerald-700">{opt}</span>
                                <span className="relative z-10 text-slate-400 group-hover:text-emerald-700">{pct}% ({optionVotes})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {post.image && (
                      <div className="rounded-2xl overflow-hidden mt-3 max-h-72 border border-slate-100">
                        <img src={post.image} alt="" className="w-full object-cover" />
                      </div>
                    )}

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {post.hashtags.map(t => (
                          <button
                            key={t}
                            onClick={() => setSearchParams({ tag: t })}
                            className="text-xs font-bold text-indigo-500 hover:underline"
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações / Estatísticas do Post */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50 text-slate-400 text-xs font-bold">
                    <div className="flex space-x-6">
                      <button 
                        onClick={() => handleLike(post.id, post.isLiked)}
                        className={`flex items-center space-x-1.5 transition-all ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                      >
                        <Heart className={`h-4.5 w-4.5 ${post.isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                        <span>{post.likes}</span>
                      </button>

                      <button 
                        onClick={() => post.sourceGroupPost ? navigate(`/groups/${post.groupId}`) : toggleCommentsBox(post.id)}
                        className="flex items-center space-x-1.5 hover:text-indigo-500 transition-all"
                      >
                        <MessageCircle className="h-4.5 w-4.5" />
                        <span>{post.sourceGroupPost ? `Ver no grupo · ${post.comments}` : post.comments}</span>
                      </button>
                    </div>

                    <div className="flex space-x-3">
                      <button className="p-1 hover:text-indigo-500 transition-all">
                        <Bookmark className="h-4 w-4" />
                      </button>
                      <button className="p-1 hover:text-indigo-500 transition-all">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Seção de comentários expandida */}
                  {showCommentBox[post.id] && (
                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
                      {/* Lista de Comentários */}
                      <div className="space-y-3">
                        {expandedComments[post.id]?.map((cmt) => (
                          <div key={cmt.id} className="flex space-x-2.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                            <UserAvatar
                              photoURL={cmt.author?.photo_url}
                              displayName={cmt.author?.display_name}
                              size="sm"
                              showGraduationCap={false}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <h5 className="font-bold text-slate-800">{cmt.author?.display_name || 'Estudante'}</h5>
                              <p className="text-slate-600 mt-1">{cmt.content}</p>
                              <span className="text-[9px] text-slate-400 block mt-1.5">
                                {new Date(cmt.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                        {(!expandedComments[post.id] || expandedComments[post.id].length === 0) && (
                          <p className="text-center text-xs text-slate-400 py-2">Seja o primeiro a comentar!</p>
                        )}
                      </div>

                      {/* Input de comentário */}
                      <div className="flex items-center space-x-2 mt-2">
                        <input 
                          type="text" 
                          placeholder="Escreva um comentário..." 
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommentSubmit(post.id);
                          }}
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button 
                          onClick={() => handleCommentSubmit(post.id)}
                          className="p-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && postsError && activeCategory !== 'grupos' && (
            <div role="alert" className="text-center py-12 bg-white rounded-3xl border border-amber-100">
              <p className="text-slate-600 text-sm mb-4">Não foi possível atualizar o Feed. Tente novamente.</p>
              <button onClick={() => void loadPosts()} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">
                Tentar novamente
              </button>
            </div>
          )}
          {!loading && !postsError && filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100/50">
              <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-xs">
                {activeCategory === 'seguindo' && followingUserIds.length === 0
                  ? 'Colegue com pessoas para ver as publicações delas aqui.'
                  : 'Nenhuma publicação encontrada nesta categoria.'}
              </p>
            </div>
          )}
        </div>

        {/* Coluna Direita: Ações e Resumo do Campus */}
        <div className="w-full max-w-[384px] px-6 py-8 border-l border-slate-100 flex flex-col space-y-6 xl:col-start-3 xl:row-start-1">
          
          <CampusSummary />

          {/* Card: Ações Rápidas */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    if (action.id === 'tevi') {
                      setActiveTab('tevi');
                      window.scrollTo({ top: 150, behavior: 'smooth' });
                    } else if (action.id === 'enquete') {
                      setActiveTab('poll');
                      window.scrollTo({ top: 150, behavior: 'smooth' });
                    } else if (action.id === 'explorar') {
                      setActiveCategory('hashtags');
                    } else if (action.id === 'grupo') {
                      navigate('/groups');
                    }
                  }}
                  className={`${action.bg} p-4 rounded-3xl transition-all flex flex-col justify-between items-start h-28 border border-slate-100/10 shadow-sm hover:scale-[1.02] active:scale-95 duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-bold text-slate-700 text-left mt-2 block">{action.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card: Hashtags em Alta */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-slate-800 text-sm">Hashtags em Alta</h3>
              <button onClick={() => setActiveCategory('hashtags')} className="text-indigo-600 text-xs font-bold hover:underline">Ver todas</button>
            </div>

            <div className="space-y-4">
              {TRENDING_HASHTAGS.map((item) => (
                <button
                  key={item.rank}
                  onClick={() => setSearchParams({ tag: item.tag.replace('#', '') })}
                  className="w-full flex justify-between items-center text-xs font-bold text-left p-1.5 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400 font-semibold">{item.rank}</span>
                    <span className="text-slate-700 font-extrabold">{item.tag}</span>
                  </div>
                  <span className="text-slate-400 font-semibold text-[10px] bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{item.count}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  );
};

export default Feed;
