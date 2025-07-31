import React from 'react';

const BadgeDisplay = ({ badges = [], maxDisplay = 3, showAll = false }) => {
  const displayedBadges = showAll ? badges : badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'border-gray-300 bg-gray-50',
      uncommon: 'border-green-300 bg-green-50',
      rare: 'border-blue-300 bg-blue-50',
      epic: 'border-purple-300 bg-purple-50',
      legendary: 'border-yellow-300 bg-yellow-50'
    };
    return colors[rarity] || colors.common;
  };

  const getBadgeTypeIcon = (type) => {
    switch (type) {
      case 'skill_sharing':
        return '📚';
      case 'community_engagement':
        return '🤝';
      case 'learning_achievement':
        return '🎓';
      case 'mentorship':
        return '👨‍🏫';
      case 'consistency':
        return '🔥';
      case 'special':
        return '⭐';
      default:
        return '🏆';
    }
  };

  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-gray-400 text-4xl mb-2">🏆</div>
        <p className="text-gray-500 text-sm">No badges earned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Badge Grid */}
      <div className="flex flex-wrap gap-2">
        {displayedBadges.map((userBadge, index) => {
          const badge = userBadge.badge || userBadge;
          return (
            <div
              key={userBadge.id || index}
              className={`relative group cursor-pointer transition-all duration-200 hover:scale-105 ${
                showAll ? 'w-full' : 'w-auto'
              }`}
              title={`${badge.name} - ${badge.description}`}
            >
              {showAll ? (
                // Full badge display for badge collection page
                <div className={`p-3 rounded-lg border-2 ${getRarityColor(badge.rarity)}`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getBadgeTypeIcon(badge.badge_type)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{badge.name}</h4>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 capitalize">
                          {badge.rarity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {badge.points_value} pts
                        </span>
                        {userBadge.earned_at && (
                          <span className="text-xs text-gray-500">
                            Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Compact badge display for profile
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getRarityColor(badge.rarity)}`}>
                  <span className="text-lg">{getBadgeTypeIcon(badge.badge_type)}</span>
                </div>
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                <div className="font-medium">{badge.name}</div>
                <div className="text-gray-300">{badge.description}</div>
                <div className="text-gray-400 capitalize">{badge.rarity} • {badge.points_value} pts</div>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          );
        })}
        
        {/* Show remaining count */}
        {!showAll && remainingCount > 0 && (
          <div className="w-12 h-12 rounded-full border-2 border-gray-300 bg-gray-50 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">+{remainingCount}</span>
          </div>
        )}
      </div>

      {/* Badge Stats */}
      {showAll && badges.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{badges.length}</div>
              <div className="text-xs text-gray-600">Total Badges</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {badges.reduce((sum, ub) => sum + (ub.badge?.points_value || 0), 0)}
              </div>
              <div className="text-xs text-gray-600">Total Points</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {badges.filter(ub => ub.badge?.rarity === 'rare' || ub.badge?.rarity === 'epic' || ub.badge?.rarity === 'legendary').length}
              </div>
              <div className="text-xs text-gray-600">Rare+ Badges</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {new Set(badges.map(ub => ub.badge?.badge_type)).size}
              </div>
              <div className="text-xs text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;
