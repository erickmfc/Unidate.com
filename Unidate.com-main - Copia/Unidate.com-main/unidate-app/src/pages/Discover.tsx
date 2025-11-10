import React, { useState, useEffect } from 'react';
import { Heart, Clock, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { useUniDateToast } from '../components/UI/Toast';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Discover: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError } = useUniDateToast();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isInWaitlist, setIsInWaitlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Data de lançamento: 1 de dezembro de 2025
  const launchDate = new Date('2025-12-01T00:00:00');
  const [isLaunched, setIsLaunched] = useState(false);

  // Verificar se já está na lista de espera
  useEffect(() => {
    const checkWaitlist = async () => {
      if (!currentUser?.uid || !db) {
        setLoading(false);
        return;
      }

      try {
        const waitlistRef = collection(db, 'discoverWaitlist');
        const q = query(waitlistRef, where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        setIsInWaitlist(!snapshot.empty);
      } catch (error) {
        console.error('Erro ao verificar lista de espera:', error);
      } finally {
        setLoading(false);
      }
    };

    checkWaitlist();
  }, [currentUser?.uid]);

  // Atualizar contador regressivo
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = launchDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
        setIsLaunched(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsLaunched(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    // Animação divertida - mudar a cada 2 segundos
    const animationTimer = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(animationTimer);
    };
  }, []);

  const handleJoinWaitlist = async () => {
    if (!currentUser?.uid || !db) {
      showError('Você precisa estar logado para entrar na lista de espera');
      return;
    }

    if (isInWaitlist) {
      showSuccess('Você já está na lista de espera! 🎉');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Adicionar à lista de espera
      await addDoc(collection(db, 'discoverWaitlist'), {
        userId: currentUser.uid,
        email: currentUser.email,
        displayName: userProfile?.displayName || currentUser.email,
        university: userProfile?.university || 'Não informado',
        course: userProfile?.course || 'Não informado',
        joinedAt: serverTimestamp(),
        notified: false,
      });

      // 2. Criar perfil na Descoberta para quando lançar
      const discoverProfileRef = doc(db, 'discoverProfiles', currentUser.uid);
      const profileExists = await getDoc(discoverProfileRef);

      if (!profileExists.exists()) {
        // Buscar informações completas do perfil do usuário
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        // Criar perfil completo na Descoberta
        await setDoc(discoverProfileRef, {
          userId: currentUser.uid,
          email: currentUser.email || '',
          displayName: userProfile?.displayName || userData.displayName || currentUser.email || 'Usuário',
          photoURL: userProfile?.photoURL || userData.photoURL || currentUser.photoURL || '',
          university: userProfile?.university || userData.university || 'Não informado',
          course: userProfile?.course || userData.course || 'Não informado',
          year: userProfile?.year || userData.year || null,
          period: userProfile?.period || userData.period || null,
          bio: userProfile?.bio || userData.bio || '',
          interests: userProfile?.interests || userData.interests || [],
          registrationNumber: userProfile?.registrationNumber || userData.registrationNumber || '',
          isActive: false, // Será ativado quando a funcionalidade for lançada
          isVerified: userProfile?.isVerified || userData.isVerified || false,
          joinedWaitlistAt: serverTimestamp(),
          profileCreatedAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          // Campos específicos da Descoberta
          discoverSettings: {
            showInDiscover: true,
            ageRange: null,
            maxDistance: 50, // km
            lookingFor: [], // tipos de conexão
          },
          stats: {
            views: 0,
            likes: 0,
            matches: 0,
            superLikes: 0,
          }
        });

        console.log('✅ Perfil criado na Descoberta para quando lançar');
      } else {
        // Atualizar perfil existente
        await setDoc(discoverProfileRef, {
          joinedWaitlistAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        }, { merge: true });
        console.log('✅ Perfil atualizado na Descoberta');
      }

      setIsInWaitlist(true);
      showSuccess('Você entrou na lista de espera! Seu perfil foi salvo e estará pronto quando lançarmos! 🚀');
    } catch (error) {
      console.error('Erro ao adicionar à lista de espera:', error);
      showError('Erro ao entrar na lista de espera. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Se já foi lançado, mostrar página de disponibilidade
  if (isLaunched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="relative mb-8">
            <div className="w-48 h-48 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Heart className="h-24 w-24 text-white animate-pulse" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Descoberta está disponível! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            A Descoberta foi lançada! Agora você pode encontrar pessoas incríveis da sua universidade.
          </p>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nenhum perfil disponível ainda
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Ainda não há outros usuários cadastrados na sua universidade. Entre na lista de espera e seja o primeiro a saber quando novos perfis estiverem disponíveis!
            </p>

            <button
              onClick={handleJoinWaitlist}
              disabled={isInWaitlist || submitting || loading}
              className={`
                w-full py-4 px-8 rounded-2xl font-bold text-lg
                transition-all duration-300 transform hover:scale-105
                shadow-lg hover:shadow-2xl
                ${isInWaitlist 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }
                disabled:opacity-70 disabled:cursor-not-allowed
                flex items-center justify-center space-x-2
              `}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Verificando...</span>
                </>
              ) : submitting ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Adicionando...</span>
                </>
              ) : isInWaitlist ? (
                <>
                  <Heart className="h-5 w-5" />
                  <span>Você está na lista! 🎉</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Entrar na Lista de Espera</span>
                </>
              )}
            </button>

            {isInWaitlist && (
              <p className="text-sm text-gray-500 mt-4">
                ✨ Você receberá uma notificação quando novos perfis estiverem disponíveis!
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animação Divertida - Coração Pulsante com Efeitos */}
        <div className="relative mb-8">
          <div 
            key={animationKey}
            className="w-48 h-48 mx-auto relative animate-bounce"
            style={{
              animation: `pulse 2s ease-in-out infinite, bounce 2s ease-in-out infinite`,
            }}
          >
            {/* Coração Principal */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <Heart className="h-24 w-24 text-white animate-pulse" />
            </div>
            
            {/* Partículas flutuantes */}
            <Sparkles className="absolute top-0 left-1/4 h-8 w-8 text-yellow-400 animate-ping" style={{ animationDelay: '0s' }} />
            <Sparkles className="absolute top-1/4 right-0 h-6 w-6 text-pink-400 animate-ping" style={{ animationDelay: '0.5s' }} />
            <Sparkles className="absolute bottom-0 left-0 h-7 w-7 text-purple-400 animate-ping" style={{ animationDelay: '1s' }} />
            <Zap className="absolute bottom-1/4 right-1/4 h-5 w-5 text-blue-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Descoberta está chegando! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Estamos preparando algo incrível para você!
        </p>

        {/* Contador Regressivo */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Clock className="h-6 w-6 text-purple-600 animate-pulse" />
            <p className="text-lg font-semibold text-gray-700">
              Lançamento em:
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {/* Dias */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-200 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Dias
              </div>
            </div>

            {/* Horas */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-pink-200 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-pink-600 mb-2">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Horas
              </div>
            </div>

            {/* Minutos */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-200 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Minutos
              </div>
            </div>

            {/* Segundos */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-pink-200 transform hover:scale-105 transition-transform duration-300 animate-pulse">
              <div className="text-4xl font-bold text-pink-600 mb-2">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Segundos
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isInWaitlist ? 'Você está na lista de espera! 🎊' : 'Nenhum perfil disponível ainda'}
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {isInWaitlist 
              ? 'Fique tranquilo! Te avisaremos assim que a Descoberta for lançada. Prepare-se para encontrar pessoas incríveis da sua universidade! 💫'
              : 'Ainda não há outros usuários cadastrados na sua universidade. Entre na lista de espera e seja o primeiro a saber quando a Descoberta for lançada!'
            }
          </p>

          {/* Botão de Lista de Espera */}
          <button
            onClick={handleJoinWaitlist}
            disabled={isInWaitlist || submitting || loading}
            className={`
              w-full py-4 px-8 rounded-2xl font-bold text-lg
              transition-all duration-300 transform hover:scale-105
              shadow-lg hover:shadow-2xl
              ${isInWaitlist 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              }
              disabled:opacity-70 disabled:cursor-not-allowed
              flex items-center justify-center space-x-2
            `}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                <span>Verificando...</span>
              </>
            ) : submitting ? (
              <>
                <div className="spinner-small"></div>
                <span>Adicionando...</span>
              </>
            ) : isInWaitlist ? (
              <>
                <Heart className="h-5 w-5" />
                <span>Você está na lista! 🎉</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Entrar na Lista de Espera</span>
              </>
            )}
          </button>

          {isInWaitlist && (
            <p className="text-sm text-gray-500 mt-4">
              ✨ Você receberá uma notificação quando lançarmos!
            </p>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            O que você vai encontrar na Descoberta?
          </h3>
          <ul className="text-left text-gray-700 space-y-2 max-w-md mx-auto">
            <li className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span>Encontre pessoas da sua universidade</span>
            </li>
            <li className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span>Conecte-se com pessoas que têm interesses em comum</span>
            </li>
            <li className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Sistema de matches inteligente</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CSS para animações */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .spinner-small {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Discover;
