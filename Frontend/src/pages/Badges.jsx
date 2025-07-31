import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import BadgeCard from '../components/BadgeCard';
import BadgeDisplay from '../components/BadgeDisplay';

const Badges = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('my-badges');
  const [userBadges, setUserBadges] = useState([]);
  const [allBadges, setBadges] = useState([]);
  const [badgeProgress, setBadgeProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    rarity: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userBadgesRes, allBadgesRes, progressRes] = await Promise.all([
        axios.get('/api/badges/my-badges', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/badges', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/badges/user/${user.id}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUserBadges(userBadgesRes.data.data.userBadges || []);
      setBadges(allBadgesRes.data.data.badges || []);
      setBadgeProgress(progressRes.data.data || {});
    } catch (error) {
      console.error('Error fetching badge data:', error);
      setError('Failed to load badge data');
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = allBadges.filter(badge => {
    if (filters.type && badge.badge_type !== filters.type) return false;
    if (filters.rarity && badge.rarity !== filters.rarity) return false;
    return true;
  });

  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

  const badgeTypes = [
    { value: '', label: 'All Types' },
    { value: 'skill_sharing', label: 'Skill Sharing' },
    { value: 'community_engagement', label: 'Community Engagement' },
    { value: 'learning_achievement', label: 'Learning Achievement' },
    { value: 'mentorship', label: 'Mentorship' },
    { value: 'consistency', label: 'Consistency' },
    { value: 'special', label: 'Special' }
  ];

  const rarityLevels = [
    { value: '', label: 'All Rarities' },
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
    { value: 'epic', label: 'Epic' },
    { value: 'legendary', label: 'Legendary' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Badge Collection</h1>
          <p className="text-gray-600">Track your achievements and progress on GrowTogather</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 justify-center">
            <button
              onClick={() => setActiveTab('my-badges')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'my-badges'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Badges ({userBadges.length})
            </button>
            <button
              onClick={() => setActiveTab('all-badges')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'all-badges'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Badges ({allBadges.length})
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Progress
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'my-badges' && (
          <div className="space-y-6">
            {userBadges.length > 0 ? (
              <>
                {/* Badge Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Achievement Stats</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{userBadges.length}</div>
                      <div className="text-sm text-gray-600">Badges Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {userBadges.reduce((sum, ub) => sum + (ub.badge?.points_value || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {userBadges.filter(ub => ['rare', 'epic', 'legendary'].includes(ub.badge?.rarity)).length}
                      </div>
                      <div className="text-sm text-gray-600">Rare+ Badges</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {badgeProgress.completionPercentage || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Collection Complete</div>
                    </div>
                  </div>
                </div>

                {/* Badge Display */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Badges</h2>
                  <BadgeDisplay badges={userBadges} showAll={true} />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">🏆</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
                <p className="text-gray-600 mb-4">Start participating in the community to earn your first badge!</p>
                <button
                  onClick={() => setActiveTab('all-badges')}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  View Available Badges
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'all-badges' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Badges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {badgeTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rarity</label>
                  <select
                    value={filters.rarity}
                    onChange={(e) => setFilters({ ...filters, rarity: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {rarityLevels.map(rarity => (
                      <option key={rarity.value} value={rarity.value}>{rarity.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* All Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isEarned={earnedBadgeIds.includes(badge.id)}
                  userBadge={userBadges.find(ub => ub.badge_id === badge.id)}
                />
              ))}
            </div>

            {filteredBadges.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No badges found matching your filters.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            {Object.entries(badgeProgress.progressByType || {}).map(([type, progress]) => (
              <div key={type} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {type.replace(/_/g, ' ')}
                  </h3>
                  <span className="text-sm text-gray-600">
                    {progress.earned}/{progress.total} badges
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.earned / progress.total) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {progress.badges.map(badge => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      isEarned={badge.isEarned}
                      userBadge={badge.isEarned ? { earned_at: badge.earnedAt } : null}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Badges;
