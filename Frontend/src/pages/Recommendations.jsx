import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [trendingData, setTrendingData] = useState({ trendingSkills: [], popularPosts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personalized');
  const [filters, setFilters] = useState({
    skillFilter: '',
    experienceLevel: '',
    meetingType: ''
  });
  const [userSkillsAnalysis, setUserSkillsAnalysis] = useState(null);

  // Fetch personalized recommendations
  const fetchPersonalizedRecommendations = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.skillFilter) queryParams.append('skillFilter', filters.skillFilter);
      if (filters.experienceLevel) queryParams.append('experienceLevel', filters.experienceLevel);
      if (filters.meetingType) queryParams.append('meetingType', filters.meetingType);
      
      const response = await fetch(`/api/recommendations/personalized?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.data.recommendations);
        setUserSkillsAnalysis(data.data.userSkillsAnalysis);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch recommendations');
      console.error('Fetch recommendations error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trending data
  const fetchTrendingData = async () => {
    try {
      const response = await fetch('/api/recommendations/trending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTrendingData(data.data);
      }
    } catch (err) {
      console.error('Fetch trending data error:', err);
    }
  };

  // Track recommendation interaction
  const trackInteraction = async (postId, action) => {
    try {
      await fetch('/api/recommendations/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ postId, action })
      });
    } catch (err) {
      console.error('Track interaction error:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'personalized') {
      fetchPersonalizedRecommendations();
    } else if (activeTab === 'trending') {
      fetchTrendingData();
    }
  }, [activeTab, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handlePostClick = (postId) => {
    trackInteraction(postId, 'click');
  };

  const handleContactClick = (postId) => {
    trackInteraction(postId, 'contact');
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-blue-600 bg-blue-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Fair Match';
    return 'Potential Match';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recommendations for You</h1>
          <p className="mt-2 text-gray-600">
            Discover learning opportunities and potential teaching matches based on your skills and interests.
          </p>
        </div>

        {/* User Skills Analysis */}
        {userSkillsAnalysis && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Skills Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Skills You Want to Learn</h3>
                <div className="flex flex-wrap gap-2">
                  {userSkillsAnalysis.skillsToLearn.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Skills You Can Teach</h3>
                <div className="flex flex-wrap gap-2">
                  {userSkillsAnalysis.skillsToTeach.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Your Preferences</h3>
                <p className="text-sm text-gray-600">
                  Experience: <span className="font-medium">{userSkillsAnalysis.experienceLevel}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Meeting: <span className="font-medium">{userSkillsAnalysis.meetingType}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('personalized')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personalized'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Personalized
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Trending
            </button>
          </nav>
        </div>

        {/* Filters for Personalized Tab */}
        {activeTab === 'personalized' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Filter
                </label>
                <input
                  type="text"
                  value={filters.skillFilter}
                  onChange={(e) => handleFilterChange('skillFilter', e.target.value)}
                  placeholder="e.g., JavaScript, Python"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Type
                </label>
                <select
                  value={filters.meetingType}
                  onChange={(e) => handleFilterChange('meetingType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'personalized' && (
          <div>
            {recommendations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">
                  No personalized recommendations found. Try creating some posts with your skills to get better recommendations.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {recommendations.map((rec, index) => (
                  <div key={rec.post.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {rec.post.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(rec.score)}`}>
                            {getScoreLabel(rec.score)} ({Math.round(rec.score * 100)}%)
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{rec.post.description}</p>
                        
                        {/* Author Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <img
                            src={rec.post.author?.profile_picture || '/default-avatar.png'}
                            alt={rec.post.author?.full_name}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm text-gray-700">{rec.post.author?.full_name}</span>
                        </div>

                        {/* Skills */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Can Teach:</h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.post.skills_to_teach?.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Wants to Learn:</h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.post.skills_to_learn?.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        {rec.matchReasons.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-700 mb-2">Why this matches:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {rec.matchReasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Skill Matches Details */}
                        {rec.skillMatches.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-700 mb-2">Skill Matches:</h4>
                            <div className="space-y-1">
                              {rec.skillMatches.map((match, idx) => (
                                <div key={idx} className="text-sm text-gray-600">
                                  {match.type === 'learning_opportunity' ? (
                                    <span>
                                      🎓 You want to learn <strong>{match.userWants}</strong> → They teach <strong>{match.postOffers}</strong>
                                    </span>
                                  ) : (
                                    <span>
                                      🏫 You can teach <strong>{match.userOffers}</strong> → They want to learn <strong>{match.postWants}</strong>
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handlePostClick(rec.post.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleContactClick(rec.post.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trending Tab Content */}
        {activeTab === 'trending' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trending Skills */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Skills</h3>
              <div className="space-y-3">
                {trendingData.trendingSkills.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{item.skill}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {item.count} posts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Posts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Posts</h3>
              <div className="space-y-4">
                {trendingData.popularPosts.map((post, index) => (
                  <div key={post.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="font-medium text-gray-900 mb-1">{post.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{post.description.substring(0, 100)}...</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>by {post.author?.full_name}</span>
                      <span>{post.views_count} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
