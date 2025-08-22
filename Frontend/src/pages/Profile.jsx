import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import PasswordChangeModal from '../components/PasswordChangeModal';
import MessageModal from '../components/MessageModal';
import ScheduleModal from '../components/ScheduleModal';
import ReportModal from '../components/ReportModal';
import BadgeDisplay from '../components/BadgeDisplay';
import axios from 'axios';

const Profile = () => {
  const { user, token } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ skill_name: '', skill_type: 'learn', proficiency_level: 'beginner' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [userBadges, setUserBadges] = useState([]);
  const [pendingMeetings, setPendingMeetings] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  // Check if viewing own profile or another user's profile
  const isOwnProfile = !userId || String(userId) === String(user?.id) || parseInt(userId) === user?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && token) {
        try {
          // Determine which user's profile to fetch
          const targetUserId = userId || user.id;
          const response = await axios.get(`/api/users/profile/${targetUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfileData(response.data.data);
          setSkills(response.data.data.skills || []);

          // Fetch user badges
          try {
            const badgeResponse = await axios.get(`/api/badges/user/${targetUserId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUserBadges(badgeResponse.data.data.userBadges || []);
          } catch (badgeError) {
            console.error('Error fetching user badges:', badgeError);
            setUserBadges([]);
          }

          // Only populate form with existing data if it's own profile
          if (isOwnProfile) {
            const userData = response.data.data;
            Object.keys(userData).forEach(key => {
              if (userData[key] !== null && userData[key] !== undefined) {
                setValue(key, userData[key]);
              }
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          if (isOwnProfile) {
            // Use current user data as fallback for own profile
            setProfileData(user);
            Object.keys(user).forEach(key => {
              if (user[key] !== null && user[key] !== undefined) {
                setValue(key, user[key]);
              }
            });
          } else {
            // For other users' profiles, show error message
            alert('Failed to load user profile. User may not exist or profile is private.');
            navigate('/discover');
          }
        }
      }
    };

    const fetchConnectionStatus = async () => {
      if (user && token && !isOwnProfile && userId) {
        try {
          const response = await axios.get(`/api/connections/status/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setConnectionStatus(response.data.data);
        } catch (error) {
          console.error('Error fetching connection status:', error);
        }
      }
    };

    fetchProfile();
    fetchConnectionStatus();

    // Fetch notification counts for own profile
    if (isOwnProfile) {
      fetchNotificationCounts();
    }
  }, [user, token, userId, isOwnProfile, setValue, navigate]);

  // Fetch notification counts for profile navigation
  const fetchNotificationCounts = async () => {
    if (!user || !token || !isOwnProfile) return;

    try {
      // Fetch pending meetings
      const meetingsResponse = await axios.get('/api/meetings?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const meetings = meetingsResponse.data.data?.meetings || [];
      const pendingInvitations = Array.isArray(meetings) ? meetings.filter(meeting =>
        meeting.participant_id === user?.id && meeting.status === 'pending'
      ) : [];
      setPendingMeetings(pendingInvitations.length);

      // Fetch unread messages
      try {
        const messagesResponse = await axios.get('/api/messages/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadMessages(messagesResponse.data.data?.count || 0);
      } catch (error) {
        console.error('Error fetching unread messages:', error);
        setUnreadMessages(0);
      }

      // Fetch pending connection requests
      try {
        const requestsResponse = await axios.get('/api/connections/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const requests = requestsResponse.data.data?.requests || [];
        setPendingRequests(requests.length);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        setPendingRequests(0);
      }

    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const profileData = {
        ...data,
        skills: skills
      };

      const response = await axios.put('/api/users/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileData(response.data.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.skill_name.trim()) {
      setSkills([...skills, { ...newSkill, id: Date.now() }]);
      setNewSkill({ skill_name: '', skill_type: 'learn', proficiency_level: 'beginner' });
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
    // Reset skills to original state
    if (profileData && profileData.skills) {
      setSkills(profileData.skills);
    }
  };

  // Connection functions
  const sendConnectionRequest = async () => {
    try {
      setLoading(true);
      await axios.post('/api/connections/request', {
        receiverId: parseInt(userId),
        message: connectionMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Connection request sent successfully!');
      setShowConnectionModal(false);
      setConnectionMessage('');

      // Refresh connection status
      const response = await axios.get(`/api/connections/status/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnectionStatus(response.data.data);
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert(error.response?.data?.message || 'Failed to send connection request');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = () => {
    if (connectionStatus?.canMessage) {
      setShowMessageModal(true);
    } else {
      alert('You must be connected to send messages. Please send a connection request first.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayData = profileData || user;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                {displayData?.profile_picture ? (
                  <img
                    src={displayData.profile_picture}
                    alt="Profile"
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">
                    {displayData?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="text-white text-center sm:text-left flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">{displayData?.full_name}</h1>
                <p className="text-blue-100 text-sm sm:text-base">{displayData?.profession || 'student'}</p>
                <p className="text-blue-100 text-sm sm:text-base">{displayData?.institute || 'MUET'}</p>
              </div>
            </div>
          </div>

          {/* Profile Navigation - Only show for own profile */}
          {isOwnProfile && (
            <div className="border-b border-gray-200 bg-gray-50 px-4 sm:px-6">
              <div className="flex flex-wrap gap-2 sm:gap-4 py-4">
                {/* Messages */}
                <button
                  onClick={() => navigate('/messages')}
                  className="flex items-center space-x-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-3 sm:px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 relative group"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm sm:text-base font-medium">Messages</span>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </span>
                  )}
                </button>

                {/* Badges */}
                <button
                  onClick={() => navigate('/badges')}
                  className="flex items-center space-x-2 bg-white hover:bg-yellow-50 text-gray-700 hover:text-yellow-600 px-3 sm:px-4 py-2 rounded-lg border border-gray-200 hover:border-yellow-300 transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-sm sm:text-base font-medium">Badges</span>
                </button>

                {/* Meetings */}
                <button
                  onClick={() => navigate('/meetings')}
                  className="flex items-center space-x-2 bg-white hover:bg-green-50 text-gray-700 hover:text-green-600 px-3 sm:px-4 py-2 rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-200 relative group"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm sm:text-base font-medium">Meetings</span>
                  {pendingMeetings > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingMeetings > 99 ? '99+' : pendingMeetings}
                    </span>
                  )}
                </button>

                {/* Requests */}
                <button
                  onClick={() => navigate('/connection-requests')}
                  className="flex items-center space-x-2 bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-600 px-3 sm:px-4 py-2 rounded-lg border border-gray-200 hover:border-purple-300 transition-all duration-200 relative group"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.25" />
                  </svg>
                  <span className="text-sm sm:text-base font-medium">Requests</span>
                  {pendingRequests > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingRequests > 99 ? '99+' : pendingRequests}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Profile Content */}
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
              {isOwnProfile ? (
                // Own profile - show edit options
                !isEditing ? (
                  <div className="space-x-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={handleCancel}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={loading}
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )
              ) : (
                // Other user's profile - show connection, message, schedule, report options
                <div className="space-x-2">
                  {/* Connection Button */}
                  {connectionStatus?.status === 'none' || connectionStatus?.canSendRequest ? (
                    <button
                      onClick={() => setShowConnectionModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 h-10 w-36 m-2.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.25" />
                      </svg>
                      <span>Connect</span>
                    </button>
                  ) : connectionStatus?.status === 'pending' ? (
                    <button
                      disabled
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md cursor-not-allowed flex items-center space-x-2 h-10 w-36 m-2.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Pending</span>
                    </button>
                  ) : connectionStatus?.status === 'accepted' ? (
                    <button
                      disabled
                      className="bg-green-500 text-white px-4 py-2 rounded-md cursor-not-allowed flex items-center space-x-2 h-10 w-36 m-2.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Connected</span>
                    </button>
                  ) : null}

                  {/* Message Button */}
                  <button
                    onClick={handleMessageClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 h-10 w-36 m-2.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Message</span>
                  </button>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 h-10 w-36 m-2.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Schedule</span>
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 h-10 w-36 m-2.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>Report</span>
                  </button>
                </div>
              )}
            </div>

            {isOwnProfile && isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('full_name', { required: 'Full name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.full_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Tell others about yourself, your interests, and what you're looking to learn or teach..."
                  />
                </div>

                {/* Professional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profession
                    </label>
                    <select
                      {...register('profession')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select profession</option>
                      <option value="student">Student</option>
                      <option value="professional">Professional</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="entrepreneur">Entrepreneur</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Degree Level
                    </label>
                    <select
                      {...register('degree_level')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select degree level</option>
                      <option value="high_school">High School</option>
                      <option value="bachelor">Bachelor's</option>
                      <option value="master">Master's</option>
                      <option value="phd">PhD</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Institute */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institute/Organization
                  </label>
                  <input
                    type="text"
                    {...register('institute')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Your school, university, or organization"
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      {...register('state')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      {...register('country')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <input
                      type="text"
                      {...register('timezone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., UTC+5:30"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      {...register('linkedin_url')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      {...register('github_url')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      {...register('portfolio_url')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>

                {/* Skills Management */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>

                  {/* Add New Skill */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Add New Skill</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={newSkill.skill_name}
                        onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                        placeholder="Skill name"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <select
                        value={newSkill.skill_type}
                        onChange={(e) => setNewSkill({ ...newSkill, skill_type: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="learn">Want to Learn</option>
                        <option value="teach">Can Teach</option>
                      </select>
                      <select
                        value={newSkill.proficiency_level}
                        onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                      <button
                        type="button"
                        onClick={addSkill}
                        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                      >
                        Add Skill
                      </button>
                    </div>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-2">
                    {skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900">{skill.skill_name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${skill.skill_type === 'teach'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            {skill.skill_type === 'teach' ? 'Can Teach' : 'Want to Learn'}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full capitalize">
                            {skill.proficiency_level}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {skills.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No skills added yet. Add your first skill above!</p>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Location:</span> {displayData?.state}, {displayData?.country}</p>
                      <p><span className="font-medium">Timezone:</span> {displayData?.timezone}</p>
                      <p><span className="font-medium">Joined:</span> {new Date(displayData?.created_at).toLocaleDateString()}</p>
                      {displayData?.institute && (
                        <p><span className="font-medium">Institute:</span> {displayData?.institute}</p>
                      )}
                      {displayData?.degree_level && (
                        <p><span className="font-medium">Degree Level:</span> {displayData?.degree_level}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Links</h3>
                    <div className="space-y-2">
                      {displayData?.linkedin_url && (
                        <a href={displayData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline block">
                          LinkedIn Profile
                        </a>
                      )}
                      {displayData?.github_url && (
                        <a href={displayData.github_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline block">
                          GitHub Profile
                        </a>
                      )}
                      {displayData?.portfolio_url && (
                        <a href={displayData.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline block">
                          Portfolio
                        </a>
                      )}
                      {!displayData?.linkedin_url && !displayData?.github_url && !displayData?.portfolio_url && (
                        <p className="text-gray-500">No links added yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {displayData?.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
                    <p className="text-gray-600">{displayData.bio}</p>
                  </div>
                )}

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                  {skills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-md font-medium text-green-700 mb-2">Can Teach</h4>
                        <div className="space-y-2">
                          {skills.filter(skill => skill.skill_type === 'teach').map((skill, index) => (
                            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-green-900">{skill.skill_name}</span>
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full capitalize">
                                  {skill.proficiency_level}
                                </span>
                              </div>
                            </div>
                          ))}
                          {skills.filter(skill => skill.skill_type === 'teach').length === 0 && (
                            <p className="text-gray-500">No teaching skills added yet</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium text-blue-700 mb-2">Want to Learn</h4>
                        <div className="space-y-2">
                          {skills.filter(skill => skill.skill_type === 'learn').map((skill, index) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-blue-900">{skill.skill_name}</span>
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                                  {skill.proficiency_level}
                                </span>
                              </div>
                            </div>
                          ))}
                          {skills.filter(skill => skill.skill_type === 'learn').length === 0 && (
                            <p className="text-gray-500">No learning skills added yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills added yet. Click "Edit Profile" to add your skills!</p>
                  )}
                </div>

                {/* Badges */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Badges & Achievements</h3>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate('/badges')}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View All →
                      </button>
                    )}
                  </div>
                  {userBadges.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <BadgeDisplay badges={userBadges} maxDisplay={6} />
                      {userBadges.length > 6 && (
                        <div className="mt-3 text-center">
                          <button
                            onClick={() => navigate('/badges')}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View All {userBadges.length} Badges →
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-gray-400 text-3xl mb-2">🏆</div>
                      <p className="text-gray-500">
                        {isOwnProfile
                          ? "No badges earned yet. Start participating to earn your first badge!"
                          : "This user hasn't earned any badges yet."
                        }
                      </p>
                      {isOwnProfile && (
                        <button
                          onClick={() => navigate('/badges')}
                          className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View Available Badges →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Password Change Modal */}
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />

        {/* Message Modal */}
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipientUser={profileData}
        />

        {/* Schedule Modal */}
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          participantUser={profileData}
        />

        {/* Report Modal */}
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUser={profileData}
        />

        {/* Connection Request Modal */}
        {showConnectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Send Connection Request</h2>
                <button
                  onClick={() => setShowConnectionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-3">
                  Send a connection request to <strong>{profileData?.full_name}</strong> to start messaging and collaborating.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  placeholder="Hi! I'd like to connect with you for skill exchange..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">{connectionMessage.length}/500 characters</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConnectionModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendConnectionRequest}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
