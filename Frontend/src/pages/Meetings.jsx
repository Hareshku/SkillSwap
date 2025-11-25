import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Meetings = () => {
  const { token } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

  // Fetch user's meetings
  const fetchMeetings = async () => {
    try {
      const response = await axios.get('/api/meetings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(Array.isArray(response.data.data?.meetings) ? response.data.data.meetings : []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings([]); // Ensure meetings is always an array
    } finally {
      setLoading(false);
    }
  };

  // Accept meeting invitation
  const acceptMeeting = async (meetingId) => {
    try {
      await axios.put(`/api/meetings/${meetingId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Meeting accepted successfully!');
      await fetchMeetings();
      // Trigger navbar notification refresh
      window.dispatchEvent(new CustomEvent('meetingStatusChanged'));
    } catch (error) {
      console.error('Error accepting meeting:', error);
      alert(error.response?.data?.message || 'Failed to accept meeting. Please try again.');
    }
  };

  // Decline meeting invitation
  const declineMeeting = async (meetingId, reason = '') => {
    try {
      await axios.put(`/api/meetings/${meetingId}/decline`, {
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Meeting declined successfully!');
      await fetchMeetings();
      // Trigger navbar notification refresh
      window.dispatchEvent(new CustomEvent('meetingStatusChanged'));
    } catch (error) {
      console.error('Error declining meeting:', error);
      alert(error.response?.data?.message || 'Failed to decline meeting. Please try again.');
    }
  };

  // Cancel meeting
  const cancelMeeting = async (meetingId, reason = '') => {
    try {
      await axios.put(`/api/meetings/${meetingId}/cancel`, {
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Meeting cancelled successfully!');
      await fetchMeetings();
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      alert(error.response?.data?.message || 'Failed to cancel meeting. Please try again.');
    }
  };

  // Join meeting via link (automatically updates status)
  const joinMeeting = async (meetingId) => {
    try {
      const response = await axios.put(`/api/meetings/${meetingId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh meetings list to show updated status
      await fetchMeetings();

      // Open the meeting link in a new tab
      if (response.data.data?.meeting_link) {
        window.open(response.data.data.meeting_link, '_blank');
      }

      // Trigger navbar notification refresh
      window.dispatchEvent(new CustomEvent('meetingStatusChanged'));
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert(error.response?.data?.message || 'Failed to join meeting. Please try again.');
    }
  };

  // Mark meeting as completed
  const completeMeeting = async (meetingId, notes = '') => {
    try {
      await axios.put(`/api/meetings/${meetingId}/complete`, {
        notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Meeting marked as completed!');
      await fetchMeetings();
    } catch (error) {
      console.error('Error completing meeting:', error);
      alert(error.response?.data?.message || 'Failed to mark meeting as completed. Please try again.');
    }
  };

  // Filter meetings based on status
  const filteredMeetings = Array.isArray(meetings) ? meetings.filter(meeting => {
    if (filter === 'all') return true;
    return meeting.status === filter;
  }) : [];

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'declined': return 'bg-orange-100 text-orange-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  useEffect(() => {
    fetchMeetings();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Meetings</h1>
          <p className="mt-2 text-gray-600">Manage your scheduled meetings and invitations</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Meetings' },
                { key: 'pending', label: 'Pending' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'in_progress', label: 'In Progress' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' },
                { key: 'declined', label: 'Declined' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.key === 'all'
                      ? (Array.isArray(meetings) ? meetings.length : 0)
                      : (Array.isArray(meetings) ? meetings.filter(m => m.status === tab.key).length : 0)
                    }
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Meetings List */}
        <div className="space-y-6">
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6" />
              </svg>
              <p className="text-lg text-gray-500">No meetings found</p>
              <p className="text-sm text-gray-400 mt-2">
                {filter === 'all' ? 'You have no scheduled meetings.' : `No ${filter} meetings found.`}
              </p>
            </div>
          ) : (
            filteredMeetings.map((meeting) => {
              const { date, time } = formatDateTime(meeting.meeting_date);
              const isOrganizer = meeting.organizer?.id === meeting.organizer_id;
              const otherUser = isOrganizer ? meeting.participant : meeting.organizer;

              return (
                <div key={meeting.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Date:</span> {date}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Time:</span> {time}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Duration:</span> {meeting.duration_minutes} minutes
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Type:</span> {meeting.meeting_type}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">{isOrganizer ? 'Participant' : 'Organizer'}:</span> {otherUser?.full_name}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Role:</span> {isOrganizer ? 'Organizer' : 'Participant'}
                          </p>
                          {meeting.meeting_link && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Link:</span>{' '}
                              <button
                                onClick={() => joinMeeting(meeting.id)}
                                className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                              >
                                Join Meeting
                              </button>
                            </p>
                          )}
                        </div>
                      </div>

                      {meeting.description && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                          <p className="text-sm text-gray-600">{meeting.description}</p>
                        </div>
                      )}

                      {meeting.notes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                          <p className="text-sm text-gray-600">{meeting.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {meeting.status === 'pending' && !isOrganizer && (
                        <>
                          <button
                            onClick={() => acceptMeeting(meeting.id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for declining (optional):');
                              declineMeeting(meeting.id, reason || '');
                            }}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {(meeting.status === 'confirmed' || meeting.status === 'in_progress') && (
                        <>
                          <button
                            onClick={() => {
                              const notes = prompt('Meeting completion notes (optional):');
                              completeMeeting(meeting.id, notes || '');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                          {meeting.status !== 'in_progress' && (
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for cancelling (optional):');
                                cancelMeeting(meeting.id, reason || '');
                              }}
                              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      )}

                      {(meeting.status === 'pending' || meeting.status === 'confirmed') && isOrganizer && (
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for cancelling (optional):');
                            cancelMeeting(meeting.id, reason || '');
                          }}
                          className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Cancel Meeting
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Meetings;
