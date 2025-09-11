import React from 'react';

const BadgeCard = ({ badge, userBadge = null, isEarned = false, showProgress = false }) => {
  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800 border-gray-300',
      uncommon: 'bg-green-100 text-green-800 border-green-300',
      rare: 'bg-blue-100 text-blue-800 border-blue-300',
      epic: 'bg-purple-100 text-purple-800 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'common':
        return '⚪';
      case 'uncommon':
        return '🟢';
      case 'rare':
        return '🔵';
      case 'epic':
        return '🟣';
      case 'legendary':
        return '🟡';
      default:
        return '⚪';
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  return (
    <div className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${isEarned
        ? 'bg-white border-green-300 shadow-sm'
        : 'bg-gray-50 border-gray-200 opacity-75'
      }`}>
      {/* Badge Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getBadgeTypeIcon(badge.badge_type)}</span>
          <div>
            <h3 className={`font-semibold ${isEarned ? 'text-gray-900' : 'text-gray-600'}`}>
              {badge.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(badge.rarity)}`}>
                {getRarityIcon(badge.rarity)} {badge.rarity}
              </span>
              <span className="text-xs text-gray-500">
                {badge.points_value} pts
              </span>
            </div>
          </div>
        </div>

        {isEarned && (
          <div className="flex flex-col items-end">
            <span className="text-green-600 text-xl">✓</span>
            {userBadge?.earned_at && (
              <span className="text-xs text-gray-500 mt-1">
                {formatDate(userBadge.earned_at)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Badge Description */}
      <p className={`text-sm mb-3 ${isEarned ? 'text-gray-700' : 'text-gray-500'}`}>
        {badge.description}
      </p>

      {/* Badge Criteria */}
      {badge.criteria && (
        <div className="text-xs text-gray-500 mb-2">
          <span className="font-medium">Criteria: </span>
          {Object.entries(badge.criteria).map(([key, value], index) => (
            <span key={key}>
              {index > 0 && ', '}
              {key.replace(/_/g, ' ')}: {value}
            </span>
          ))}
        </div>
      )}

      {/* Progress Bar (if applicable) */}
      {showProgress && badge.progress && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{badge.progress.current}/{badge.progress.required}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((badge.progress.current / badge.progress.required) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Badge Type Label */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <span className="text-xs text-gray-500 capitalize">
          {badge.badge_type.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Earned Badge Glow Effect */}
      {isEarned && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/10 to-blue-400/10 pointer-events-none"></div>
      )}
    </div>
  );
};

export default BadgeCard;
