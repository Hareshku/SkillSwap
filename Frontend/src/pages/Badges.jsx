import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Badges = () => {
  const { user, token } = useAuth();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [badgeProgress, setBadgeProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('earned');

  useEffect(() => {
    if (token) {
      fetchBadgeData();
    }
  }, [token]);

  const fetchBadgeData = async () => {
    try {
      setLoading(true);

      // Fetch all badges, user badges, and detailed progress
      const [allBadgesRes, userBadgesRes, progressRes] = await Promise.all([
        axios.get('/api/badges', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/badges/my-badges', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/badges/detailed-progress', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setBadges(allBadgesRes.data.data.badges);
      setUserBadges(userBadgesRes.data.data.userBadges);
      setBadgeProgress(progressRes.data.data.progress);
    } catch (error) {
      console.error('Error fetching badge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewBadges = async () => {
    try {
      const response = await axios.post('/api/badges/check', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.data.newBadges.length > 0) {
        alert(`🎉 Congratulations! You earned ${response.data.data.newBadges.length} new badge(s)!`);
        fetchBadgeData(); // Refresh data
      } else {
        alert('No new badges earned at this time. Keep engaging with the community!');
      }
    } catch (error) {
      console.error('Error checking badges:', error);
      alert('Error checking for new badges. Please try again.');
    }
  };

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

  const getRarityGlow = (rarity) => {
    const glows = {
      common: 'shadow-md',
      uncommon: 'shadow-lg shadow-green-200',
      rare: 'shadow-lg shadow-blue-200',
      epic: 'shadow-xl shadow-purple-300',
      legendary: 'shadow-2xl shadow-yellow-400'
    };
    return glows[rarity] || glows.common;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading badges...</p>
        </div>
      </div>
    );
  }

  const earnedBadges = badgeProgress.filter(p => p.isEarned);
  const availableBadges = badgeProgress.filter(p => !p.isEarned);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🏆 Badge Collection</h1>
          <p className="text-xl text-gray-600 mb-6">
            Earn badges by engaging with the SkillSwap community!
          </p>

          {/* Stats */}
          <div className="flex justify-center space-x-8 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{earnedBadges.length}</div>
              <div className="text-sm text-gray-500">Badges Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {userBadges.reduce((sum, ub) => sum + (ub.badge?.points_value || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round((earnedBadges.length / badgeProgress.length) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Completion</div>
            </div>
          </div>

          {/* Check Badges Button */}
          <button
            onClick={checkForNewBadges}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
          >
            🔍 Check for New Badges
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('earned')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'earned'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Earned ({earnedBadges.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'available'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Available ({availableBadges.length})
            </button>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(activeTab === 'earned' ? earnedBadges : availableBadges).map((badgeData) => {
            const badge = badgeData.badge;
            const isEarned = badgeData.isEarned;

            return (
              <div
                key={badge.id}
                className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105 ${isEarned ? getRarityGlow(badge.rarity) : 'opacity-60 grayscale'
                  } ${getRarityColor(badge.rarity)}`}
              >
                {/* Badge Icon */}
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{badge.icon_url}</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getRarityColor(badge.rarity)}`}>
                    {badge.rarity.toUpperCase()}
                  </div>
                </div>

                {/* Badge Info */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  <p className="text-xs text-gray-500 mb-4">{badge.criteria.description}</p>

                  {/* Progress Bar for Available Badges */}
                  {!isEarned && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{badgeData.currentProgress}/{badgeData.targetProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${badgeData.progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {badgeData.progressPercentage}% Complete
                      </div>
                    </div>
                  )}

                  {/* Points */}
                  <div className="flex justify-center items-center space-x-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-medium text-gray-700">
                      {badge.points_value} points
                    </span>
                  </div>

                  {/* Earned Date */}
                  {isEarned && badgeData.earnedAt && (
                    <div className="mt-2 text-xs text-gray-500">
                      Earned: {new Date(badgeData.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {activeTab === 'earned' && earnedBadges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No badges earned yet</h3>
            <p className="text-gray-600 mb-4">
              Start engaging with the community to earn your first badge!
            </p>
            <button
              onClick={() => setActiveTab('available')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Available Badges
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Badges;