import React, { useEffect, useState } from 'react';
import { Trophy, Lock } from 'lucide-react';
import { UserMetricsService } from '../../services/userMetricsService';
import { Badge, BADGE_DEFINITIONS, BADGE_CATEGORY_COLORS, BadgeCategory } from '../../types/metrics';

interface BadgesSystemProps {
  userId: string;
  showAllBadges?: boolean;
  showProgress?: boolean;
}

const BadgesSystem: React.FC<BadgesSystemProps> = ({ userId, showAllBadges = false, showProgress = false }) => {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const badges = await UserMetricsService.getUserBadges(userId);
        setEarnedBadges(badges);
      } catch (error) {
        console.error('Erro ao carregar badges:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBadges();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const earnedBadgeIds = earnedBadges.map((b) => b.id);

  const badgesToShow = showAllBadges
    ? BADGE_DEFINITIONS.map((def) => {
        const earned = earnedBadges.find((b) => b.id === def.id);
        return earned || { ...def, earnedAt: undefined as unknown as Date };
      })
    : earnedBadges;

  if (badgesToShow.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum Badge Ainda</h3>
          <p className="text-gray-500 text-sm">
            Continue contribuindo para ganhar badges!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {showAllBadges ? 'Todos os Badges' : 'Meus Badges'}
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {badgesToShow.map((badge) => {
          const isEarned = earnedBadgeIds.includes(badge.id);
          const categoryColor = BADGE_CATEGORY_COLORS[badge.category as BadgeCategory] || 'bg-gray-100 text-gray-800';

          return (
            <div
              key={badge.id}
              className={`relative p-3 rounded-lg border text-center transition-all ${
                isEarned
                  ? `${categoryColor} border-transparent`
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {!isEarned && (
                <div className="absolute top-1 right-1">
                  <Lock className="h-3 w-3 text-gray-400" />
                </div>
              )}
              <div className="text-2xl mb-1">{badge.icon}</div>
              <div className={`text-xs font-medium ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
                {badge.name}
              </div>
              {isEarned && badge.earnedAt && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(badge.earnedAt).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showProgress && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Progresso</span>
            <span>{earnedBadges.length} / {BADGE_DEFINITIONS.length}</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all"
              style={{ width: `${(earnedBadges.length / BADGE_DEFINITIONS.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgesSystem;
