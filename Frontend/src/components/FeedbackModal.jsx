import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const FeedbackModal = ({ isOpen, onClose, userId, userName }) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedback, setFeedback] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      fetchFeedbackData();
    }
  }, [isOpen, userId]);

  const fetchFeedbackData = async () => {
    if (!token || !userId) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Fetch feedback, reviews, and stats in parallel
      const [feedbackResponse, reviewsResponse, statsResponse] = await Promise.all([
        axios.get(`/api/feedback/user/${userId}?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/reviews/user/${userId}?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/feedback/stats/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (feedbackResponse.data.success) {
        setFeedback(feedbackResponse.data.data.feedback || []);
      }

      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.data.reviews || []);
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

    } catch (error) {
      console.error('Error fetching feedback data:', error);
      setError('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
      >
        ⭐
      </span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFeedbackTypeColor = (type) => {
    switch (type) {
      case 'skill_teaching': return 'bg-blue-100 text-blue-800';
      case 'skill_learning': return 'bg-green-100 text-green-800';
      case 'communication': return 'bg-purple-100 text-purple-800';
      case 'overall': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                💬 {userName}'s Feedback & Reviews
              </h2>
              {stats && stats.overall && (
                <p className="text-blue-100 mt-1">
                  Overall Rating: {(stats.overall.overall_average || 0).toFixed(1)} ⭐
                  ({stats.overall.total_feedback} reviews)
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              💬 Feedback ({feedback.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              ⭐ Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              📊 Statistics
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading feedback...</span>
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
                onClick={fetchFeedbackData}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div>
              {/* Feedback Tab */}
              {activeTab === 'feedback' && (
                <div>
                  {feedback.length > 0 ? (
                    <div className="space-y-4">
                      {feedback.map((item) => (
                        <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                {renderStars(item.rating)}
                                <span className="text-sm text-gray-600 ml-2">
                                  ({item.rating}/5)
                                </span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFeedbackTypeColor(item.feedback_type)}`}>
                                {item.feedback_type.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(item.created_at)}
                            </span>
                          </div>

                          {item.comment && (
                            <p className="text-gray-700 mb-3">{item.comment}</p>
                          )}

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>
                              From: {item.is_anonymous ? 'Anonymous' : (item.giver?.username || 'Unknown')}
                            </span>
                            {item.helpful_count > 0 && (
                              <span className="flex items-center">
                                👍 {item.helpful_count} helpful
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-6xl mb-4">💬</div>
                      <p className="text-lg">No feedback received yet</p>
                      <p className="text-sm">Feedback will appear here when others rate your interactions</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-600 ml-2">
                                  ({review.rating}/5)
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(review.created_at)}
                            </span>
                          </div>

                          {review.comment && (
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                          )}

                          <div className="text-sm text-gray-500">
                            <span>
                              From: {review.reviewer?.username || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-6xl mb-4">⭐</div>
                      <p className="text-lg">No reviews received yet</p>
                      <p className="text-sm">Reviews will appear here when others rate your skills and interactions</p>
                    </div>
                  )}
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === 'stats' && (
                <div>
                  {stats ? (
                    <div className="space-y-6">
                      {/* Overall Stats */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Overall Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {(stats.overall?.overall_average || 0).toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600">Average Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {stats.overall?.total_feedback || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Feedback</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {feedback.filter(f => f.rating >= 4).length}
                            </div>
                            <div className="text-sm text-gray-600">Positive Reviews</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {feedback.reduce((sum, f) => sum + (f.helpful_count || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-600">Helpful Votes</div>
                          </div>
                        </div>
                      </div>

                      {/* Rating Distribution */}
                      {stats.ratingDistribution && stats.ratingDistribution.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ Rating Distribution</h3>
                          <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map(rating => {
                              const ratingData = stats.ratingDistribution.find(r => r.rating === rating);
                              const count = ratingData?.count || 0;
                              const total = stats.overall?.total_feedback || 1;
                              const percentage = Math.round((count / total) * 100);

                              return (
                                <div key={rating} className="flex items-center space-x-3">
                                  <span className="text-sm font-medium w-8">{rating}⭐</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600 w-12">{count}</span>
                                  <span className="text-sm text-gray-500 w-12">{percentage}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Feedback by Type */}
                      {stats.byType && stats.byType.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Feedback by Category</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats.byType.map(type => (
                              <div key={type.feedback_type} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFeedbackTypeColor(type.feedback_type)}`}>
                                    {type.feedback_type.replace('_', ' ')}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {type.total_count} reviews
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center">
                                    {renderStars(Math.round(type.average_rating))}
                                  </div>
                                  <span className="text-sm font-medium">
                                    {parseFloat(type.average_rating).toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-6xl mb-4">📊</div>
                      <p className="text-lg">No statistics available</p>
                      <p className="text-sm">Statistics will appear here once you receive feedback</p>
                    </div>
                  )}
                </div>
              )}
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

export default FeedbackModal;