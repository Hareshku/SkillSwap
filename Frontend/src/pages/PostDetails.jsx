import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { User, Calendar, Globe, ArrowLeft } from "lucide-react";
import OnlineStatusIndicator from "../components/OnlineStatusIndicator";

const PostDetails = () => {
  const { postId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(response.data.data);
    } catch (error) {
      console.error("Error fetching post details:", error);
      setError("Failed to load post details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const viewProfile = (userId) => {
    if (!userId) {
      console.error("No userId provided");
      return;
    }
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-600">Loading post details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-600">{error || "Post not found"}</div>
            <button
              onClick={() => navigate('/discover')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Discover
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/discover')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>

        {/* Main Post Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                    {post.author?.profile_picture ? (
                      <img
                        src={post.author.profile_picture}
                        alt={post.author?.full_name || post.author?.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                      style={{ display: post.author?.profile_picture ? 'none' : 'flex' }}
                    >
                      {getInitials(post.author?.full_name || post.author?.username)}
                    </div>
                  </div>
                  <OnlineStatusIndicator
                    isOnline={post.author?.is_online || false}
                    lastSeen={post.author?.last_seen}
                    size="md"
                    className="-bottom-1 -right-1"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {post.author?.full_name || post.author?.username}
                  </h2>
                  <p className="text-gray-600 text-sm flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>A professional</span>
                  </p>
                  <p className="text-gray-500 text-xs flex items-center space-x-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Posted on {formatDate(post.created_at)}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => viewProfile(post.author?.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Profile
              </button>
            </div>

            {/* Post Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {post.title}
            </h1>
          </div>

          {/* Post Content */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {post.description}
                </p>
              </div>
            </div>

            {/* Skills Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Skills to Teach */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Skills to Teach</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.skills_to_teach?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills to Learn */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Skills to Learn</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.skills_to_learn?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Experience Level</h4>
                <p className="text-gray-700 capitalize">
                  {post.experience_level || 'Not specified'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>Meeting Preference</span>
                </h4>
                <p className="text-gray-700 capitalize">
                  {post.preferred_meeting_type || 'Not specified'}
                </p>
              </div>

              {post.availability && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-2">Availability</h4>
                  <p className="text-gray-700">
                    {post.availability}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;