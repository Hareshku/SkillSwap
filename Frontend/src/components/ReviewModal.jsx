import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Rating from './Rating';
import axios from 'axios';

const ReviewModal = ({
  isOpen,
  onClose,
  revieweeId,
  revieweeName,
  meetingId = null,
  onReviewSubmitted = null
}) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableMeetings, setAvailableMeetings] = useState([]);
  const [formData, setFormData] = useState({
    meeting_id: meetingId || '',
    rating: 5,
    feedback: '',
    skills_exchanged: [],
    exchange_type: 'mutual_exchange',
    communication_rating: 5,
    knowledge_rating: 5,
    punctuality_rating: 5,
    would_recommend: true
  });
  const [newSkill, setNewSkill] = useState('');

  // Fetch available meetings when modal opens
  useEffect(() => {
    if (isOpen && revieweeId && !meetingId) {
      fetchAvailableMeetings();
    }
  }, [isOpen, revieweeId, meetingId]);

  const fetchAvailableMeetings = async () => {
    try {
      const response = await axios.get(`/api/reviews/can-review/${revieweeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAvailableMeetings(response.data.data.availableMeetings || []);
        if (response.data.data.availableMeetings?.length > 0) {
          setFormData(prev => ({
            ...prev,
            meeting_id: response.data.data.availableMeetings[0].id
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching available meetings:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills_exchanged.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_exchanged: [...prev.skills_exchanged, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills_exchanged: prev.skills_exchanged.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reviewData = {
        reviewee_id: parseInt(revieweeId),
        rating: parseInt(formData.rating),
        feedback: formData.feedback,
        skills_exchanged: formData.skills_exchanged,
        exchange_type: formData.exchange_type,
        communication_rating: parseInt(formData.communication_rating),
        knowledge_rating: parseInt(formData.knowledge_rating),
        punctuality_rating: parseInt(formData.punctuality_rating),
        would_recommend: formData.would_recommend
      };

      // Only add meeting_id if it's selected
      if (formData.meeting_id && formData.meeting_id !== '') {
        reviewData.meeting_id = parseInt(formData.meeting_id);
      }

      console.log('Submitting review data:', reviewData);

      const response = await axios.post('/api/reviews', reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Review submitted successfully!');
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data.data);
        }
        onClose();
        // Reset form
        setFormData({
          meeting_id: meetingId || '',
          rating: 5,
          feedback: '',
          skills_exchanged: [],
          exchange_type: 'mutual_exchange',
          communication_rating: 5,
          knowledge_rating: 5,
          punctuality_rating: 5,
          would_recommend: true
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error response:', error.response?.data);

      if (error.response?.data?.errors) {
        // Show specific validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg).join('\n');
        alert(`Validation errors:\n${errorMessages}`);
      } else {
        alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Review {revieweeName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meeting Selection */}
            {!meetingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Meeting (Optional)
                </label>
                {availableMeetings.length > 0 ? (
                  <select
                    value={formData.meeting_id}
                    onChange={(e) => handleInputChange('meeting_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a meeting (optional)</option>
                    {availableMeetings.map(meeting => (
                      <option key={meeting.id} value={meeting.id}>
                        {meeting.title} - {meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Date TBD'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-gray-100 rounded-md text-sm text-gray-600">
                    No completed meetings found. You can still leave a general review.
                  </div>
                )}
              </div>
            )}

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <Rating
                rating={formData.rating}
                interactive={true}
                onChange={(rating) => handleInputChange('rating', rating)}
                size="lg"
                showValue={true}
              />
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication
                </label>
                <Rating
                  rating={formData.communication_rating}
                  interactive={true}
                  onChange={(rating) => handleInputChange('communication_rating', rating)}
                  size="md"
                  showValue={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Knowledge
                </label>
                <Rating
                  rating={formData.knowledge_rating}
                  interactive={true}
                  onChange={(rating) => handleInputChange('knowledge_rating', rating)}
                  size="md"
                  showValue={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Punctuality
                </label>
                <Rating
                  rating={formData.punctuality_rating}
                  interactive={true}
                  onChange={(rating) => handleInputChange('punctuality_rating', rating)}
                  size="md"
                  showValue={true}
                />
              </div>
            </div>

            {/* Exchange Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exchange Type *
              </label>
              <select
                value={formData.exchange_type}
                onChange={(e) => handleInputChange('exchange_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="mutual_exchange">Mutual Exchange</option>
                <option value="teaching">I was teaching</option>
                <option value="learning">I was learning</option>
              </select>
            </div>

            {/* Skills Exchanged */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills Exchanged
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills_exchanged.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback *
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => handleInputChange('feedback', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your experience with this skill exchange session..."
                required
                minLength={10}
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.feedback.length}/1000 characters (minimum 10)
              </p>
            </div>

            {/* Would Recommend */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="would_recommend"
                checked={formData.would_recommend}
                onChange={(e) => handleInputChange('would_recommend', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="would_recommend" className="ml-2 block text-sm text-gray-900">
                I would recommend this person to others
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || formData.feedback.length < 10}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;