import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const FeedbackModal = ({ isOpen, onClose, userId, userName }) => {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      fetchReviews();
    }
  }, [isOpen, userId]);

  const fetchReviews = async () => {
    if (!token || !userId) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Fetch reviews
      const reviewsResponse = await axios.get(`/api/reviews/user/${userId}?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.data.reviews || []);
      }

    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
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
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Reviews & Ratings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading reviews...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-semibold">{error}</p>
              </div>
              <button
                onClick={fetchReviews}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-medium">
                          {getInitials(review.reviewer?.full_name || review.reviewer?.username)}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {review.reviewer?.full_name || review.reviewer?.username || 'Anonymous'}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {formatDate(review.created_at)}
                              </p>
                            </div>
                            {/* Stars */}
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>

                          {/* Review Text */}
                          {review.feedback && (
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {review.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">⭐</div>
                  <p className="text-lg">No reviews yet</p>
                  <p className="text-sm">Reviews will appear here when others rate your skills and interactions</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;