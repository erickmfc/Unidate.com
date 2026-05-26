import React, { useState, useEffect } from 'react';
import { Heart, X, RotateCcw, MessageCircle, Sparkles, MapPin, GraduationCap, Info, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileService, UserProfile } from '../services/userProfileService';
import { ChatService } from '../services/chatService';
import { useUniDateToast } from '../components/UI/Toast';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';

interface SwipeInteraction {
  userId: string;
  type: 'like' | 'pass';
  timestamp: string;
}

const Discover: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError, showInfo } = useUniDateToast();
  const navigate = useNavigate();

  // State
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [swipedUserIds, setSwipedUserIds] = useState<string[]>([]);
  const [lastSwipe, setLastSwipe] = useState<{ profile: UserProfile; type: 'like' | 'pass' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'super' | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      if (!currentUser?.uid) return;

      try {
        setLoading(true);
        // Load all profiles
        const allUsers = await UserProfileService.getAllUsers();
        
        // Filter out current user
        let filtered = allUsers.filter(p => p.uid !== currentUser.uid);

        // Load swiped users
        const swipedKey = `unidate_swiped_users_${currentUser.uid}`;
        const swiped = JSON.parse(localStorage.getItem(swipedKey) || '[]');
        setSwipedUserIds(swiped);

        // Filter out already swiped users
        filtered = filtered.filter(p => !swiped.includes(p.uid));

        setProfiles(filtered);
      } catch (error) {
        console.error('Erro ao carregar perfis de descoberta:', error);
        showError('Erro ao carregar perfis. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [currentUser?.uid]);

  const currentProfile = profiles[0] || null;

  const handleSwipe = async (type: 'like' | 'pass') => {
    if (!currentUser || !currentProfile) return;

    // Trigger swipe animation
    setSwipeDirection(type === 'like' ? 'right' : 'left');

    const profileToSwipe = currentProfile;

    // Wait for animation to finish
    setTimeout(async () => {
      // Add to swiped list
      const swipedKey = `unidate_swiped_users_${currentUser.uid}`;
      const newSwiped = [...swipedUserIds, profileToSwipe.uid];
      localStorage.setItem(swipedKey, JSON.stringify(newSwiped));
      setSwipedUserIds(newSwiped);

      // Save last swipe for undo
      setLastSwipe({ profile: profileToSwipe, type });

      // Remove from deck
      setProfiles(prev => prev.slice(1));
      setSwipeDirection(null);
      setShowDetails(false);

      if (type === 'like') {
        await processLike(profileToSwipe);
      }
    }, 300);
  };

  const processLike = async (swipedUser: UserProfile) => {
    if (!currentUser) return;

    try {
      // In online mode, save swipe to Firestore
      if (db) {
        await addDoc(collection(db, 'swipes'), {
          fromUserId: currentUser.uid,
          toUserId: swipedUser.uid,
          type: 'like',
          createdAt: serverTimestamp()
        });

        // Check if other user liked back
        const matchQuery = query(
          collection(db, 'swipes'),
          where('fromUserId', '==', swipedUser.uid),
          where('toUserId', '==', currentUser.uid),
          where('type', '==', 'like')
        );
        const matchSnapshot = await getDocs(matchQuery);

        if (!matchSnapshot.empty) {
          // It's a match!
          await triggerMatch(swipedUser);
        }
      } else {
        // Offline Mode: Deterministic/Probabilistic match
        // 50% chance of match to make it fun, or always match for user_1 and user_3
        const isMatch = Math.random() > 0.4 || swipedUser.uid === 'mock_user_1' || swipedUser.uid === 'mock_user_3';
        
        if (isMatch) {
          await triggerMatch(swipedUser);
        } else {
          showInfo(`Você curtiu ${swipedUser.name}! Se ela te curtir de volta, será um Match!`);
        }
      }
    } catch (err) {
      console.error('Erro ao processar curtida:', err);
    }
  };

  const triggerMatch = async (matchedUser: UserProfile) => {
    if (!currentUser) return;

    try {
      // Add friendship connection
      await UserProfileService.addFriend(currentUser.uid, matchedUser.uid);
      
      // Initialize chat channel
      await ChatService.getOrCreateChat(currentUser.uid, matchedUser.uid);

      // Show modal
      setMatchedProfile(matchedUser);
      setShowMatchModal(true);
      showSuccess(`É um Match com ${matchedUser.name}! 🎉`);
    } catch (err) {
      console.error('Erro ao salvar match:', err);
    }
  };

  const handleUndo = () => {
    if (!currentUser || !lastSwipe) {
      showInfo('Não há mais deslizes para desfazer!');
      return;
    }

    const { profile, type } = lastSwipe;

    // Remove from swiped local storage list
    const swipedKey = `unidate_swiped_users_${currentUser.uid}`;
    const newSwiped = swipedUserIds.filter(uid => uid !== profile.uid);
    localStorage.setItem(swipedKey, JSON.stringify(newSwiped));
    
    setSwipedUserIds(newSwiped);
    setProfiles(prev => [profile, ...prev]);
    setLastSwipe(null);
    showSuccess(`Desfeito! ${profile.name} voltou ao deck.`);
  };

  const handleReset = () => {
    if (!currentUser) return;
    const swipedKey = `unidate_swiped_users_${currentUser.uid}`;
    localStorage.removeItem(swipedKey);
    setSwipedUserIds([]);
    setLastSwipe(null);
    
    // Reload profiles
    UserProfileService.getAllUsers().then(allUsers => {
      const filtered = allUsers.filter(p => p.uid !== currentUser.uid);
      setProfiles(filtered);
      showSuccess('Deck reiniciado! Agora você pode avaliar os perfis novamente.');
    });
  };

  const startChatAndNavigate = () => {
    if (!matchedProfile) return;
    setShowMatchModal(false);
    navigate('/chat', { state: { activeContactId: matchedProfile.uid } });
  };

  // Helper colors based on index or interests
  const getInterestColor = (index: number) => {
    const colors = [
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-amber-100 text-amber-700 border-amber-200'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex flex-col justify-between py-6 px-4 select-none">
      {/* Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between px-2 mb-4">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-pink-500 fill-current animate-pulse" />
          <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
            UniDate Descoberta
          </span>
        </div>
        <button
          onClick={handleReset}
          className="p-2 text-gray-500 hover:text-purple-600 bg-white rounded-full shadow hover:shadow-md transition duration-200"
          title="Reiniciar deslizes"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      {/* Main card stack area */}
      <div className="flex-grow flex items-center justify-center relative max-w-md w-full mx-auto h-[480px]">
        {loading ? (
          <div className="text-center">
            <div className="spinner-large mb-4"></div>
            <p className="text-gray-500 font-medium animate-pulse">Procurando estudantes por perto...</p>
          </div>
        ) : !currentProfile ? (
          <div className="text-center bg-white rounded-3xl p-8 shadow-xl border border-gray-100 w-full max-w-sm mx-auto">
            <Sparkles className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Fim do deck por hoje!</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Você já avaliou todos os estudantes da sua universidade. Tente reiniciar os seus deslizes para ver as pessoas novamente!
            </p>
            <button
              onClick={handleReset}
              className="py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:shadow-lg transition duration-200 transform hover:scale-102"
            >
              Reiniciar Perfis
            </button>
          </div>
        ) : (
          <div className="w-full h-full relative flex items-center justify-center">
            {/* Card stacked underneath (Preview next card) */}
            {profiles[1] && (
              <div 
                className="absolute w-full h-[440px] bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 transform scale-95 translate-y-4 opacity-50 z-0 select-none"
              >
                <div className="w-full h-2/3 bg-gray-200 flex items-center justify-center">
                  {profiles[1].avatar ? (
                    <img 
                      src={profiles[1].avatar} 
                      alt="" 
                      className="w-full h-full object-cover filter blur-sm pointer-events-none" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-gray-200 to-gray-300"></div>
                  )}
                </div>
                <div className="p-4 bg-white">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Top Card */}
            <div 
              className={`
                absolute w-full h-[440px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 z-10 flex flex-col justify-between
                transition-all duration-300 transform select-none cursor-pointer
                ${swipeDirection === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : ''}
                ${swipeDirection === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : ''}
                ${swipeDirection === null ? 'scale-100 translate-y-0 opacity-100' : ''}
              `}
              onClick={() => setShowDetails(!showDetails)}
            >
              {/* Photo Area */}
              <div className="relative w-full flex-grow overflow-hidden bg-gray-900 group">
                {currentProfile.avatar ? (
                  <img 
                    src={currentProfile.avatar} 
                    alt={currentProfile.name}
                    className="w-full h-full object-cover object-center transition duration-500 transform group-hover:scale-105 pointer-events-none" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-7xl font-extrabold tracking-tight">
                      {currentProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Tags on Photo (Interests) */}
                <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 z-20 pointer-events-none">
                  {currentProfile.interests?.slice(0, 3).map((interest, i) => (
                    <span 
                      key={interest}
                      className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20"
                    >
                      {interest}
                    </span>
                  ))}
                  {currentProfile.isVerified && (
                    <span className="ml-auto px-2.5 py-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center space-x-1 shadow-md">
                      <Sparkles className="h-3.5 w-3.5 fill-current" />
                      <span>Verificado</span>
                    </span>
                  )}
                </div>

                {/* Overlaid Info (Sleek Glassmorphism at Bottom of Card) */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 text-white flex flex-col justify-end z-20">
                  <div className="flex items-baseline space-x-2">
                    <h2 className="text-2xl font-black tracking-tight">{currentProfile.name}</h2>
                    {currentProfile.period && (
                      <span className="text-lg font-medium text-pink-300">{currentProfile.period}º Período</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 text-gray-300 text-sm mt-1 font-medium">
                    <GraduationCap className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="truncate">{currentProfile.course}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-300 text-xs mt-0.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                    <span className="truncate">{currentProfile.university.split(' - ')[0]}</span>
                  </div>

                  {/* Swipe Indicator Badges */}
                  {swipeDirection === 'right' && (
                    <div className="absolute top-1/2 left-6 -translate-y-1/2 border-4 border-emerald-500 text-emerald-500 font-black text-3xl px-4 py-2 rounded-xl transform -rotate-12 tracking-wide bg-emerald-500/10 uppercase shadow-lg select-none">
                      Curtir
                    </div>
                  )}
                  {swipeDirection === 'left' && (
                    <div className="absolute top-1/2 right-6 -translate-y-1/2 border-4 border-red-500 text-red-500 font-black text-3xl px-4 py-2 rounded-xl transform rotate-12 tracking-wide bg-red-500/10 uppercase shadow-lg select-none">
                      Passar
                    </div>
                  )}
                </div>
              </div>

              {/* Bio & Details Drawer when clicked */}
              {showDetails && (
                <div className="bg-white p-6 border-t border-gray-100 max-h-[160px] overflow-y-auto animate-slide-up">
                  <div className="flex items-center space-x-1 text-gray-800 font-bold text-sm mb-1">
                    <Info className="h-4 w-4 text-purple-600" />
                    <span>Sobre mim</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {currentProfile.bio || 'Este estudante ainda não escreveu uma bio, mas você pode curtir para bater um papo no chat! 😊'}
                  </p>
                  
                  {currentProfile.interests && currentProfile.interests.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Interesses</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentProfile.interests.map((interest, idx) => (
                          <span 
                            key={interest}
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getInterestColor(idx)}`}
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Swipe Deck Buttons */}
      <div className="max-w-xs w-full mx-auto flex items-center justify-around mt-4 px-2">
        {/* Undo button */}
        <button
          onClick={handleUndo}
          disabled={!lastSwipe || loading}
          className={`
            p-3.5 rounded-full bg-white shadow-lg border border-gray-100 transition duration-300 transform hover:scale-110 active:scale-95
            ${!lastSwipe ? 'opacity-40 cursor-not-allowed hover:scale-100' : 'text-amber-500 hover:shadow-xl'}
          `}
          title="Desfazer último deslize"
        >
          <RotateCcw className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Pass button */}
        <button
          onClick={() => handleSwipe('pass')}
          disabled={!currentProfile || loading}
          className={`
            p-5 rounded-full bg-white shadow-lg border border-gray-100 transition duration-300 transform hover:scale-110 active:scale-95
            ${!currentProfile ? 'opacity-40 cursor-not-allowed hover:scale-100' : 'text-red-500 hover:shadow-xl hover:border-red-100'}
          `}
          title="Recusar (Pass)"
        >
          <X className="h-8 w-8 stroke-[3]" />
        </button>

        {/* Like button */}
        <button
          onClick={() => handleSwipe('like')}
          disabled={!currentProfile || loading}
          className={`
            p-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-110 active:scale-95
            ${!currentProfile ? 'opacity-40 cursor-not-allowed hover:scale-100' : 'hover:from-purple-600 hover:to-pink-600'}
          `}
          title="Curtir (Like)"
        >
          <Heart className="h-8 w-8 fill-current" />
        </button>
      </div>

      {/* Match Fullscreen Overlay Modal */}
      {showMatchModal && matchedProfile && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="text-center max-w-sm w-full mx-auto flex flex-col items-center">
            {/* Celebration text */}
            <div className="relative mb-6">
              <Sparkles className="h-10 w-10 text-yellow-400 absolute -top-8 -left-8 animate-bounce" />
              <h1 className="text-5xl font-black tracking-tight text-white drop-shadow">
                É um Match!
              </h1>
              <p className="text-pink-300 font-bold text-lg mt-2 tracking-wide uppercase">
                Você e {matchedProfile.name} se curtiram!
              </p>
              <Sparkles className="h-8 w-8 text-pink-400 absolute -bottom-4 -right-8 animate-ping" />
            </div>

            {/* Avatars side-by-side with heart connector */}
            <div className="flex items-center space-x-6 my-10 relative">
              {/* Current user photo */}
              <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden transform -rotate-6 transition duration-500 hover:rotate-0">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Você" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-purple-800 flex items-center justify-center text-white text-3xl font-black">
                    {userProfile?.displayName ? userProfile.displayName.substring(0, 2).toUpperCase() : 'VC'}
                  </div>
                )}
              </div>

              {/* Pulsing heart in middle */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full border-2 border-white shadow-lg animate-bounce z-20">
                <Heart className="h-8 w-8 text-white fill-current animate-pulse" />
              </div>

              {/* Matched user photo */}
              <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden transform rotate-6 transition duration-500 hover:rotate-0">
                {matchedProfile.avatar ? (
                  <img src={matchedProfile.avatar} alt={matchedProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-pink-600 to-pink-800 flex items-center justify-center text-white text-3xl font-black">
                    {matchedProfile.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-8 max-w-xs leading-relaxed font-medium">
              Conecte-se agora! Que tal começar a conversa perguntando sobre o curso de <b>{matchedProfile.course}</b>?
            </p>

            {/* Action buttons */}
            <div className="w-full flex flex-col space-y-3">
              <button
                onClick={startChatAndNavigate}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-lg shadow-xl hover:shadow-2xl transition duration-200 transform hover:scale-102 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="h-5 w-5 fill-current" />
                <span>Enviar Mensagem</span>
              </button>
              
              <button
                onClick={() => setShowMatchModal(false)}
                className="w-full py-4 px-6 rounded-2xl bg-white/10 text-white border border-white/20 font-bold text-md hover:bg-white/20 transition duration-200"
              >
                Continuar Navegando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spinner and keyframe styling */}
      <style>{`
        .spinner-large {
          border: 4px solid rgba(139, 92, 246, 0.1);
          border-top: 4px solid #8b5cf6;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-left: auto;
          margin-right: auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.25s ease-out forwards;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Discover;
