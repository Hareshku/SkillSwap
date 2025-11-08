import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BadgeDisplay = ({ userId, showAll = false, maxDisplay = 3 }) => {
  const { token } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && userId) {
      fetchUserBadges();
    }
  }, [token, userId]);

  const fetchUserBadges = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/badges/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter only displayed badges and sort by rarity/points
      const displayedBadges = response.data.data.userBadges
        .filter(ub => ub.is_displayed)
        .sort((a, b) => {
          // Sort by rarity first, then by points
          const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
          const rarityDiff = (rarityOrder[b.badge.rarity] || 0) - (rarityOrder[a.badge.rarity] || 0);
          if (rarityDiff !== 0) return rarityDiff;
          return (b.badge.points_value || 0) - (a.badge.points_value || 0);
        });

      setBadges(showAll ? displayedBadges : displayedBadges.slice(0, maxDisplay));
    } catch (error) {
      console.error('Error fetching user badges:', error);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-100 text-gray-700 border-gray-300',
      uncommon: 'bg-green-100 text-green-700 border-green-300',
      rare: 'bg-blue-100 text-blue-700 border-blue-300',
      epic: 'bg-purple-100 text-purple-700 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-700 border-yellow-300'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityGlow = (rarity) => {
    const glows = {
      common: 'shadow-sm',
      uncommon: 'shadow-md shadow-green-200',
      rare: 'shadow-md shadow-blue-200',
      epic: 'shadow-lg shadow-purple-300',
      legendary: 'shadow-lg shadow-yellow-400'
    };
    return glows[rarity] || glows.common;
  };

  if (loading) {
    return (
      <div className="flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🏆</div>
        <div className="text-gray-600 text-base font-medium mb-2">No badges earned yet</div>
        <div className="text-gray-500 text-sm">
          Your earned badges and achievements will be displayed here
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Badge Grid */}
      <div className={`grid gap-3 ${showAll ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-3'}`}>
        {badges.map((userBadge) => {
          const badge = userBadge.badge;
          return (
            <div
              key={badge.id}
              className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${getRarityGlow(badge.rarity)}`}
              title={`${badge.name}: ${badge.description}`}
            >
              {/* Badge Container */}
              <div className={`bg-white rounded-lg p-3 border-2 ${getRarityColor(badge.rarity)}`}>
                {/* Badge Icon */}
                <div className="text-center">
                  <div className="text-3xl mb-1">{badge.icon_url}</div>
                  <div className="text-xs font-medium text-gray-600 truncate">
                    {badge.name}
                  </div>
                </div>

                {/* Rarity Indicator */}
                <div className="absolute -top-1 -right-1">
                  <div className={`w-3 h-3 rounded-full ${badge.rarity === 'legendary' ? 'bg-yellow-400' :
                    badge.rarity === 'epic' ? 'bg-purple-400' :
                      badge.rarity === 'rare' ? 'bg-blue-400' :
                        badge.rarity === 'uncommon' ? 'bg-green-400' :
                          'bg-gray-400'
                    }`}></div>
                </div>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                <div className="font-medium">{badge.name}</div>
                <div className="text-gray-300">{badge.description}</div>
                <div className="text-yellow-300">⭐ {badge.points_value} points</div>
                {userBadge.earned_at && (
                  <div className="text-gray-400 text-xs">
                    Earned: {new Date(userBadge.earned_at).toLocaleDateString()}
                  </div>
                )}
                {/* Tooltip Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More Link */}
      {!showAll && badges.length >= maxDisplay && (
        <div className="text-center">
          <a
            href={`/badges`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View all badges →
          </a>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;