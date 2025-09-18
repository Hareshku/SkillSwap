import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PasswordChangeModal from '../components/PasswordChangeModal';
import BadgeDisplay from '../components/BadgeDisplay';
import axios from 'axios';

// RecommendedPosts component
const RecommendedPosts = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track recommendation interaction
  const trackInteraction = async (postId, interactionType) => {
    try {
      await axios.post('/api/recommendations/track', {
        postId,
        interactionType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      if (!user || !token) return;

      try {
        console.log('Fetching recommendations for user:', user?.id);
        const response = await axios.get('/api/recommendations?limit=6', {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Recommendations response:', response.data);
        setRecommendedPosts(response.data.data?.posts || []);
      } catch (error) {
        console.error('Error fetching recommended posts:', error);
        console.error('Error details:', error.response?.data);

        setRecommendedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedPosts();
  }, [user, token]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendedPosts.length === 0) {
    return (
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Recommended Posts</h3>
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 text-sm">No recommendations available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Recommended Posts</h3>
        <button
          onClick={() => {
            // Track that user wants to see more recommendations
            if (recommendedPosts.length > 0) {
              trackInteraction(recommendedPosts[0].id, 'view');
            }
            navigate('/discover');
          }}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base self-start sm:self-auto"
        >
          View All →
        </button>
      </div>

      <div className="space-y-4">
        {recommendedPosts.slice(0, 2).map((post) => (
          <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            {/* Post Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                {post.author?.profile_picture ? (
                  <img
                    src={post.author.profile_picture}
                    alt={post.author.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {post.author?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{post.author?.full_name || 'Unknown User'}</h4>
                <p className="text-sm text-gray-500">{post.author?.profession || 'User'}</p>
              </div>
            </div>

            {/* Post Content */}
            <h5 className="font-semibold text-gray-900 mb-2" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>{post.title}</h5>
            <p className="text-gray-600 text-sm mb-4" style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>{post.description}</p>

            {/* Skills */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                  Teaching:
                </span>
                {post.skills_to_teach?.slice(0, 2).map((skill, index) => {
                  const isMatched = post.learningMatches?.includes(skill.toLowerCase());
                  return (
                    <span
                      key={index}
                      className={`text-xs px-2 py-1 rounded ${isMatched
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-green-50 text-green-700'
                        }`}
                    >
                      {skill} {isMatched && '🤝'}
                    </span>
                  );
                })}
                {post.skills_to_teach?.length > 2 && (
                  <span className="text-xs text-green-600">+{post.skills_to_teach.length - 2} more</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  Learning:
                </span>
                {post.skills_to_learn?.slice(0, 2).map((skill, index) => {
                  const isMatched = post.teachingMatches?.includes(skill.toLowerCase());
                  return (
                    <span
                      key={index}
                      className={`text-xs px-2 py-1 rounded ${isMatched
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-blue-50 text-blue-700'
                        }`}
                    >
                      {skill} {isMatched && '⭐'}
                    </span>
                  );
                })}
                {post.skills_to_learn?.length > 2 && (
                  <span className="text-xs text-blue-600">+{post.skills_to_learn.length - 2} more</span>
                )}
              </div>

              {/* Match Type and Score Indicator */}
              {post.matchScore > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  {post.matchType === 'mutual' && (
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                      🔄 Perfect Match - Mutual Exchange
                    </span>
                  )}
                  {post.matchType === 'teaching' && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                      📚 They can teach you
                    </span>
                  )}
                  {post.matchType === 'learning' && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                      🎓 You can teach them
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Post Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {post.created_at
                  ? new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                  : 'Date not available'
                }
              </span>
              <button
                onClick={() => {
                  trackInteraction(post.id, 'click');
                  navigate('/discover');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OwnProfile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ skill_name: '', skill_type: 'learn', proficiency_level: 'beginner' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userBadges, setUserBadges] = useState([]);
  const [newBadges, setNewBadges] = useState(0);
  const [pendingMeetings, setPendingMeetings] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

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
          const response = await axios.get(`/api/users/profile/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfileData(response.data.data);
          setSkills(response.data.data.skills || []);

          // Fetch user badges
          try {
            const badgeResponse = await axios.get(`/api/badges/user/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUserBadges(badgeResponse.data.data.userBadges || []);
          } catch (badgeError) {
            console.error('Error fetching user badges:', badgeError);
            setUserBadges([]);
          }

          // Populate form with existing data
          const userData = response.data.data;
          Object.keys(userData).forEach(key => {
            if (userData[key] !== null && userData[key] !== undefined) {
              setValue(key, userData[key]);
            }
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfileData(user);
          Object.keys(user).forEach(key => {
            if (user[key] !== null && user[key] !== undefined) {
              setValue(key, user[key]);
            }
          });
        }
      }
    };

    fetchProfile();
    fetchNotificationCounts();
  }, [user, token, setValue]);

  // Fetch notification counts for profile navigation
  const fetchNotificationCounts = async () => {
    if (!user || !token) return;

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
        console.log('Unread messages response:', messagesResponse.data);
        setUnreadMessages(messagesResponse.data.data?.unreadCount || 0);
      } catch (error) {
        console.error('Error fetching unread messages:', error);
        setUnreadMessages(0);
      }

      // Fetch pending connection requests
      try {
        const requestsResponse = await axios.get('/api/connections/incoming', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Pending requests response:', requestsResponse.data);
        const requests = requestsResponse.data.data || [];
        setPendingRequests(requests.length);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        setPendingRequests(0);
      }

      // Fetch new badges count (for now, show total badges count)
      try {
        const badgesResponse = await axios.get(`/api/badges/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const badges = badgesResponse.data.data?.userBadges || [];
        setNewBadges(badges.length);
      } catch (error) {
        console.error('Error fetching badges count:', error);
        setNewBadges(0);
      }

    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Submitting profile data:', data);
      console.log('Skills to submit:', skills);

      const profileData = {
        ...data,
        skills: skills
      };

      console.log('Final profile data:', profileData);

      const response = await axios.put('/api/users/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Profile update response:', response.data);
      setProfileData(response.data.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);

      let errorMessage = 'Failed to update profile. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(err => err.msg).join(', ');
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      alert(errorMessage);
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
    if (profileData && profileData.skills) {
      setSkills(profileData.skills);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto bg-white shadow-lg sm:mx-4 lg:mx-auto">

        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
            {/* Profile Picture */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white mx-auto sm:mx-0 flex-shrink-0">
              {displayData?.profile_picture ? (
                <img
                  src={displayData.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-600">
                  {displayData?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="text-white flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">{displayData?.full_name || 'User Name'}</h1>
              <p className="text-lg sm:text-xl opacity-90 mb-1">{displayData?.profession || 'student'}</p>
              <p className="text-base sm:text-lg opacity-80 mb-2 sm:mb-4">{displayData?.institute || 'MUET'}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm sm:text-base"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 sm:gap-4 lg:gap-8 overflow-x-auto">
            <button
              onClick={() => navigate('/messages')}
              className="flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 border-b-2 border-transparent hover:border-blue-500 text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              <div className="relative">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium text-[10px]">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </div>
              <span className="text-sm sm:text-base">Messages</span>
            </button>

            <button
              onClick={() => navigate('/badges')}
              className="flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 border-b-2 border-transparent hover:border-blue-500 text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              <div className="relative">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                {newBadges > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium text-[10px]">
                    {newBadges > 9 ? '9+' : newBadges}
                  </span>
                )}
              </div>
              <span className="text-sm sm:text-base">Badges</span>
            </button>

            <button
              onClick={() => navigate('/meetings')}
              className="flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 border-b-2 border-transparent hover:border-blue-500 text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              <div className="relative">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {pendingMeetings > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium text-[10px]">
                    {pendingMeetings > 9 ? '9+' : pendingMeetings}
                  </span>
                )}
              </div>
              <span className="text-sm sm:text-base">Meetings</span>
            </button>

            <button
              onClick={() => navigate('/connection-requests')}
              className="flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 border-b-2 border-transparent hover:border-blue-500 text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              <div className="relative">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.25" />
                </svg>
                {pendingRequests > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium text-[10px]">
                    {pendingRequests > 9 ? '9+' : pendingRequests}
                  </span>
                )}
              </div>
              <span className="text-sm sm:text-base">Requests</span>
            </button>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Profile Information</h2>
          </div>

          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
                {/* Left Column - Bio and Skills */}
                <div className="flex-1 space-y-4 sm:space-y-6">
                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      {...register('bio')}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Skills</label>

                    {/* Add New Skill */}
                    <div className="flex space-x-2 mb-4">
                      <input
                        type="text"
                        value={newSkill.skill_name}
                        onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Skill name (e.g., JavaScript, Python)"
                      />
                      <select
                        value={newSkill.skill_type}
                        onChange={(e) => setNewSkill({ ...newSkill, skill_type: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="learn">Want to Learn</option>
                        <option value="teach">Can Teach</option>
                      </select>
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {/* Skills List */}
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${skill.skill_type === 'teach'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                            }`}
                        >
                          {skill.skill_name}
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Other Information */}
                <div className="lg:w-80 lg:flex-shrink-0 space-y-4 sm:space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          {...register('state')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Sindh, Pakistan"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <input
                          {...register('timezone')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Asia/Karachi"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
                        <input
                          {...register('institute')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., MUET"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree Level</label>
                        <select
                          {...register('degree_level')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select degree level</option>
                          <option value="high_school">High School</option>
                          <option value="bachelor">Bachelor's</option>
                          <option value="master">Master's</option>
                          <option value="phd">PhD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Display Mode */
            <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
              {/* Left Column - Bio and Skills */}
              <div className="flex-1">
                {/* Bio Section */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Bio</h2>
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {displayData?.bio || "Hi, I am Rohit kumar here"}
                    </p>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Skills</h2>
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {skills.length > 0 ? (
                        skills.map((skill, index) => (
                          <span
                            key={index}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${skill.skill_type === 'teach'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-green-100 text-green-800 border border-green-200'
                              }`}
                          >
                            {skill.skill_name}
                            <span className="ml-1 sm:ml-2 text-xs opacity-75">
                              ({skill.skill_type === 'teach' ? 'Can Teach' : 'Learning'})
                            </span>
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm sm:text-base">No skills added yet. Click "Edit Profile" to add your skills!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Information */}
              <div className="lg:w-80 lg:flex-shrink-0">
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Profile Information</h2>

                  {/* Basic Information */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Basic Information</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <span className="font-medium text-gray-600 text-sm sm:text-base">Location:</span>
                        <p className="text-gray-900 text-sm sm:text-base">{displayData?.state || 'Sindh'}, {displayData?.country || 'Pakistan'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 text-sm sm:text-base">Timezone:</span>
                        <p className="text-gray-900 text-sm sm:text-base">{displayData?.timezone || 'Asia/Karachi'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 text-sm sm:text-base">Joined:</span>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {displayData?.created_at
                            ? new Date(displayData.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long'
                            })
                            : 'Not available'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 text-sm sm:text-base">Institute:</span>
                        <p className="text-gray-900 text-sm sm:text-base">{displayData?.institute || 'MUET'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 text-sm sm:text-base">Degree Level:</span>
                        <p className="text-gray-900 capitalize text-sm sm:text-base">{displayData?.degree_level?.replace('_', ' ') || 'High School'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                </div>
              </div>
            </div>
          )}

          {/* Recommended Posts */}
          <div className="mt-8 sm:mt-12">
            <RecommendedPosts />
          </div>

          {/* Badges & Achievements */}
          <div className="mt-8 sm:mt-12">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Badges & Achievements</h3>
              <button
                onClick={() => navigate('/badges')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base self-start sm:self-auto"
              >
                View All →
              </button>
            </div>
            <BadgeDisplay badges={userBadges} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && (
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

export default OwnProfile;