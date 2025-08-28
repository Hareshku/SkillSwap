import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import MessageModal from '../components/MessageModal';
import ScheduleModal from '../components/ScheduleModal';
import ReportModal from '../components/ReportModal';
import Rating from '../components/Rating';
import axios from 'axios';

// UserPosts component
const UserPosts = ({ userId }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId || !token) return;

      try {
        // Fetch user's posts - you might need to create this endpoint
        const response = await axios.get(`/api/posts/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserPosts(response.data.data || []);
      } catch (error) {
        console.error('Error fetching user posts:', error);
        setUserPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId, token]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (userPosts.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600 text-sm">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userPosts.slice(0, 3).map((post) => (
        <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
          <h4 className="font-semibold text-gray-900 mb-2" style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{post.title}</h4>

          <p className="text-gray-600 text-sm mb-3" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{post.description}</p>

          {/* Skills Preview */}
          <div className="flex flex-wrap gap-1 mb-3">
            {post.skills_to_teach?.slice(0, 2).map((skill, index) => (
              <span key={index} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
            {post.skills_to_learn?.slice(0, 2).map((skill, index) => (
              <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            <button
              onClick={() => navigate('/discover')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View
            </button>
          </div>
        </div>
      ))}

      {userPosts.length > 3 && (
        <button
          onClick={() => navigate('/discover')}
          className="w-full text-center py-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          View all posts ({userPosts.length})
        </button>
      )}
    </div>
  );
};

const UserProfile = () => {
  const { user, token } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && token && userId) {
        try {
          const response = await axios.get(`/api/users/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfileData(response.data.data);
          setSkills(response.data.data.skills || []);

          // Fetch user rating
          try {
            const ratingResponse = await axios.get(`/api/reviews/user/${userId}/rating`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUserRating(ratingResponse.data.data.averageRating || 0);
            setTotalReviews(ratingResponse.data.data.totalReviews || 0);
          } catch (ratingError) {
            console.error('Error fetching user rating:', ratingError);
            setUserRating(0);
            setTotalReviews(0);
          }

        } catch (error) {
          console.error('Error fetching profile:', error);
          alert('Failed to load user profile. User may not exist or profile is private.');
          navigate('/discover');
        }
      }
    };

    const fetchConnectionStatus = async () => {
      if (user && token && userId) {
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
  }, [user, token, userId, navigate]);

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

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white shadow-lg">

        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Profile Picture */}
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white">
                {profileData?.profile_picture ? (
                  <img
                    src={profileData.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-600">
                    {profileData?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{profileData?.full_name || 'User Name'}</h1>
                <p className="text-xl opacity-90 mb-1">{profileData?.profession || 'Professional'}</p>
                <p className="text-lg opacity-80 mb-4">{profileData?.institute || 'Institute'}</p>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <Rating value={userRating} readOnly size="lg" />
                  <span className="text-white opacity-90">
                    {userRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex space-x-3">
              <a
                href={profileData?.linkedin_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                title="LinkedIn"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href={profileData?.github_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                title="GitHub"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                title="Facebook"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href={profileData?.portfolio_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                title="Portfolio"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
          <div className="flex space-x-4">
            {/* Connection Button */}
            {connectionStatus?.status === 'none' || connectionStatus?.canSendRequest ? (
              <button
                onClick={() => setShowConnectionModal(true)}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 font-semibold text-lg min-w-[140px] justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.25" />
                </svg>
                <span>Connect</span>
              </button>
            ) : connectionStatus?.status === 'pending' ? (
              <button
                disabled
                className="bg-yellow-500 text-white px-8 py-3 rounded-lg cursor-not-allowed flex items-center space-x-2 font-semibold text-lg min-w-[140px] justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Pending</span>
              </button>
            ) : connectionStatus?.status === 'accepted' ? (
              <button
                disabled
                className="bg-green-500 text-white px-8 py-3 rounded-lg cursor-not-allowed flex items-center space-x-2 font-semibold text-lg min-w-[140px] justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Connected</span>
              </button>
            ) : null}

            {/* Message Button */}
            <button
              onClick={handleMessageClick}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-semibold text-lg min-w-[140px] justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Message</span>
            </button>

            {/* Schedule Button */}
            <button
              onClick={() => setShowScheduleModal(true)}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 font-semibold text-lg min-w-[140px] justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Schedule</span>
            </button>

            {/* Report Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 font-semibold text-lg min-w-[140px] justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-8 py-8">
          <div className="flex space-x-8">

            {/* Left Column - Bio and Skills */}
            <div className="flex-1">
              {/* Bio Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Bio</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {profileData?.bio || "This user hasn't added a bio yet."}
                  </p>
                </div>
              </div>

              {/* Skills Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex flex-wrap gap-3">
                    {skills.length > 0 ? (
                      skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-4 py-2 rounded-full text-sm font-medium ${skill.skill_type === 'teach'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                            }`}
                        >
                          {skill.skill_name}
                          <span className="ml-2 text-xs opacity-75">
                            ({skill.skill_type === 'teach' ? 'Can Teach' : 'Learning'})
                          </span>
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills listed yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* User's Posts Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Posts</h2>
                <UserPosts userId={userId} />
              </div>
            </div>

            {/* Right Column - Profile Information */}
            <div className="w-80">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>

                {/* Basic Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">Location:</span>
                      <p className="text-gray-900">{profileData?.state || 'Not specified'}, {profileData?.country || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Timezone:</span>
                      <p className="text-gray-900">{profileData?.timezone || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Joined:</span>
                      <p className="text-gray-900">
                        {profileData?.created_at
                          ? new Date(profileData.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                          })
                          : 'Not available'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Institute:</span>
                      <p className="text-gray-900">{profileData?.institute || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Degree Level:</span>
                      <p className="text-gray-900 capitalize">{profileData?.degree_level?.replace('_', ' ') || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Rating Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Rating Summary</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800 mb-2">{userRating.toFixed(1)}</div>
                    <Rating value={userRating} readOnly size="lg" />
                    <p className="text-gray-600 mt-2">
                      Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Request Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Connection Request</h3>
            <textarea
              value={connectionMessage}
              onChange={(e) => setConnectionMessage(e.target.value)}
              placeholder="Add a personal message (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={sendConnectionRequest}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => setShowConnectionModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showMessageModal && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipientId={userId}
          recipientName={profileData?.full_name}
        />
      )}

      {showScheduleModal && (
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          participantId={userId}
          participantName={profileData?.full_name}
        />
      )}

      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUserId={userId}
          reportedUserName={profileData?.full_name}
        />
      )}
    </div>
  );
};

export default UserProfile;