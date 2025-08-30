import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ReportModal = ({ isOpen, onClose, reportedUser }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    reportType: '',
    reason: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('ReportModal - isOpen:', isOpen);
    console.log('ReportModal - reportedUser:', reportedUser);
    if (reportedUser) {
      console.log('ReportModal - reportedUser.id:', reportedUser.id);
      console.log('ReportModal - reportedUser.full_name:', reportedUser.full_name);
    }
  }, [isOpen, reportedUser]);

  const reportTypes = [
    { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
    { value: 'harassment', label: 'Harassment or Bullying' },
    { value: 'spam', label: 'Spam or Unwanted Content' },
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'fake_profile', label: 'Fake Profile' },
    { value: 'scam', label: 'Scam or Fraud' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();

    // Validate reportedUser exists
    if (!reportedUser || !reportedUser.id) {
      console.error('ReportModal: reportedUser is undefined or missing id:', reportedUser);
      alert('Error: Unable to identify the user to report. Please try again.');
      return;
    }

    if (!formData.reportType || !formData.reason.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    console.log('Submitting report for user:', reportedUser);
    console.log('Report data:', formData);

    setLoading(true);

    try {
      const response = await axios.post('/api/reports', {
        reportedUserId: reportedUser.id,
        reportType: formData.reportType,
        reason: formData.reason,
        description: formData.description || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Report submitted successfully:', response.data);
      alert('Report submitted successfully. Our moderation team will review it shortly.');
      setFormData({
        reportType: '',
        reason: '',
        description: ''
      });
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      console.error('Error response:', error.response?.data);

      let errorMessage = 'Failed to submit report. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Report service not found. Please contact support.';
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Report {reportedUser?.full_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Please only report content that violates our community guidelines.
            False reports may result in action against your account.
          </p>
        </div>

        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type *
            </label>
            <select
              name="reportType"
              value={formData.reportType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">Select a reason</option>
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Please explain why you are reporting this user..."
              required
              minLength={10}
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.reason.length}/1000 characters (minimum 10)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Provide any additional context or evidence..."
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/2000 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.reportType || formData.reason.length < 10}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
