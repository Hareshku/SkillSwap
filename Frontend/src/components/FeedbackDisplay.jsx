import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const FeedbackDisplay = ({ userId, maxDisplay = 5 }) => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchFeedback();
      fetchStats();
    }
  }, [userId]);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`/api/feedback/user/${userId}?limit=${maxDisplay}`);
      if (response.data.success) {
        setFeedback(response.data.data.feedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Failed to load feedback');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/feedback/stats/${userId}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-sm ${index < rating ? 'text-yellow-400' : 'text-gray-300'
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
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      {stats && stats.overall && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Overall Rating</h4>
              <div className="flex items-center space-x-2">
                {renderStars(Math.round(stats.overall.overall_average || 0))}
                <span className="text-sm text-gray-600">
                  {(stats.overall.overall_average || 0).toFixed(1)}
                  ({stats.overall.total_feedback} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback List */}
      {feedback.length > 0 ? (
        <div className="space-y-3">
          {feedback.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {renderStars(item.rating)}
                    <span className="text-sm text-gray-500">
                      {item.feedback_type.replace('_', ' ')}
                    </span>
                  </div>

                  {item.comment && (
                    <p className="text-gray-700 text-sm mb-2">{item.comment}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {item.is_anonymous ? 'Anonymous' : `by ${item.giver?.username || 'Unknown'}`}
                    </span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No feedback yet</p>
        </div>
      )}

      {/* View All Link */}
      {feedback.length >= maxDisplay && (
        <div className="text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Feedback →
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay;