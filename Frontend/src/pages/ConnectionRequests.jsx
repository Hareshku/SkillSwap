import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const ConnectionRequests = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const fetchIncomingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/connections/incoming', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
      alert('Failed to load connection requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      setProcessingId(connectionId);
      await axios.put(`/api/connections/accept/${connectionId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove the accepted request from the list
      setRequests(requests.filter(request => request.id !== connectionId));
      alert('Connection request accepted!');
    } catch (error) {
      console.error('Error accepting connection request:', error);
      alert(error.response?.data?.message || 'Failed to accept connection request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      setProcessingId(connectionId);
      await axios.put(`/api/connections/reject/${connectionId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove the rejected request from the list
      setRequests(requests.filter(request => request.id !== connectionId));
      alert('Connection request rejected');
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      alert(error.response?.data?.message || 'Failed to reject connection request');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Connection Requests</h1>
            <p className="text-primary-100 mt-2">
              Manage your incoming connection requests
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No connection requests</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any pending connection requests at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {requests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      {/* User Info */}
                      <div className="flex items-start space-x-4">
                        <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                          {request.requester.profile_picture ? (
                            <img
                              src={request.requester.profile_picture}
                              alt="Profile"
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-primary-600">
                              {request.requester.full_name?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.requester.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">@{request.requester.username}</p>
                          {request.requester.profession && (
                            <p className="text-sm text-gray-500 mt-1">{request.requester.profession}</p>
                          )}
                          {request.requester.bio && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{request.requester.bio}</p>
                          )}
                          {request.message && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Sent on {formatDate(request.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3 ml-4">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={processingId === request.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {processingId === request.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={processingId === request.id}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {processingId === request.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionRequests;
