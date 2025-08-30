import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MessageModal = ({ isOpen, onClose, recipientUser }) => {
  const { token } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    console.log('Sending message to:', recipientUser);
    console.log('Message content:', message.trim());

    setLoading(true);
    try {
      const response = await axios.post('/api/messages', {
        receiverId: recipientUser.id,
        content: message.trim(),
        messageType: 'text'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Message sent successfully:', response.data);
      alert('Message sent successfully!');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      let errorMessage = 'Failed to send message. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Message service not found. Please contact support.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You must be connected to send messages. Please send a connection request first.';
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
            Send Message to {recipientUser?.full_name}
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

        <form onSubmit={handleSendMessage}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message here..."
              required
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {message.length}/2000 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;
