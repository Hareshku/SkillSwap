import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AchievementsModal = ({ isOpen, onClose, userId, userName }) => {
  const { token } = useAuth();
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserBadges();
    }
  }, [isOpen, userId]);

  const fetchUserBadges = async () => {
    if (!token || !userId) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Fetch user's detailed badge progress (this includes both earned and unearned badges)
      const badgesResponse = await axios.get(`/api/badges/user/${userId}/detailed-progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (badgesResponse.data.success) {
        const responseData = badgesResponse.data.data;
        const badgeData = responseData.progress || [];

        // Debug logs (remove in production)
        console.log('Badge response data:', responseData);
        console.log('Badge progress data:', badgeData);

        if (!Array.isArray(badgeData)) {
          throw new Error('Invalid badge data format received');
        }

        setBadges(badgeData);

        // Calculate stats
        const earnedBadges = badgeData.filter(b => b.isEarned);
        const totalPoints = earnedBadges.reduce((sum, b) => sum + (b.badge?.points_value || 0), 0);

        setStats({
          totalBadges: responseData.totalBadges || badgeData.length,
          earnedBadges: responseData.earnedBadges || earnedBadges.length,
          totalPoints: totalPoints,
          completionPercentage: responseData.completionPercentage || 0
        });
      } else {
        throw new Error(badgesResponse.data.message || 'Failed to fetch badge data');
      }
    } catch (error) {
      console.error('Error fetching user badges:', error);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                🏆 {userName}'s Achievements
              </h2>
              {stats && (
                <p className="text-yellow-100 mt-1">
                  {stats.earnedBadges}/{stats.totalBadges} badges earned • {stats.totalPoints} points • {stats.completionPercentage}% complete
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
              <span className="ml-3 text-gray-600">Loading achievements...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-semibold">{error}</p>
              </div>
              <button
                onClick={fetchUserBadges}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div>
              {/* Stats Summary */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.earnedBadges}</div>
                    <div className="text-sm text-blue-800">Badges Earned</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalPoints}</div>
                    <div className="text-sm text-green-800">Total Points</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.completionPercentage}%</div>
                    <div className="text-sm text-purple-800">Completion</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.totalBadges - stats.earnedBadges}</div>
                    <div className="text-sm text-orange-800">To Unlock</div>
                  </div>
                </div>
              )}

              {/* Earned Badges */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  ✨ Earned Badges
                  {stats && (
                    <span className="ml-2 bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                      {stats.earnedBadges}
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.filter(b => b.isEarned).map((badgeData) => (
                    <div key={badgeData.badge.id} className="bg-white border-2 border-yellow-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{badgeData.badge.icon_url}</div>
                        <h4 className="font-bold text-gray-900">{badgeData.badge.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{badgeData.badge.description}</p>
                        <div className="flex items-center justify-center space-x-4 text-xs">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {badgeData.badge.points_value} pts
                          </span>
                          <span className={`px-2 py-1 rounded ${badgeData.badge.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                            badgeData.badge.rarity === 'epic' ? 'bg-orange-100 text-orange-800' :
                              badgeData.badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                                badgeData.badge.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}>
                            {badgeData.badge.rarity}
                          </span>
                        </div>
                        {badgeData.earnedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Earned: {new Date(badgeData.earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {badges.filter(b => b.isEarned).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-lg">No badges earned yet</p>
                    <p className="text-sm">Start participating to earn your first badge!</p>
                  </div>
                )}
              </div>

              {/* Available Badges */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  🎯 Available Badges
                  {stats && (
                    <span className="ml-2 bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
                      {stats.totalBadges - stats.earnedBadges}
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.filter(b => !b.isEarned).map((badgeData) => (
                    <div key={badgeData.badge.id} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 opacity-75">
                      <div className="text-center">
                        <div className="text-4xl mb-2 grayscale">{badgeData.badge.icon_url}</div>
                        <h4 className="font-bold text-gray-700">{badgeData.badge.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{badgeData.badge.description}</p>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{badgeData.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${badgeData.progressPercentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {badgeData.currentProgress} / {badgeData.targetProgress}
                          </div>
                        </div>

                        <div className="flex items-center justify-center space-x-4 text-xs">
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {badgeData.badge.points_value} pts
                          </span>
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {badgeData.badge.rarity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;