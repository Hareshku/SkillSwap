import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import SkillExchangeCard from '../components/SkillExchangeCard';

const Discover = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [newSkillLearn, setNewSkillLearn] = useState('');
  const [newSkillTeach, setNewSkillTeach] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showProfileIncompleteModal, setShowProfileIncompleteModal] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/posts', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchQuery,
          post_type: filterType === 'all' ? undefined : filterType,
          limit: 1000 // Request all posts
        }
      });

      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const addSkillToLearn = () => {
    if (newSkillLearn.trim() && !skillsToLearn.includes(newSkillLearn.trim())) {
      setSkillsToLearn([...skillsToLearn, newSkillLearn.trim()]);
      setNewSkillLearn('');
    }
  };

  const addSkillToTeach = () => {
    if (newSkillTeach.trim() && !skillsToTeach.includes(newSkillTeach.trim())) {
      setSkillsToTeach([...skillsToTeach, newSkillTeach.trim()]);
      setNewSkillTeach('');
    }
  };

  const removeSkillToLearn = (skill) => {
    setSkillsToLearn(skillsToLearn.filter(s => s !== skill));
  };

  const removeSkillToTeach = (skill) => {
    setSkillsToTeach(skillsToTeach.filter(s => s !== skill));
  };

  const onSubmitPost = async (data) => {
    try {
      if (skillsToLearn.length === 0 || skillsToTeach.length === 0) {
        alert('Please add at least one skill to learn and one skill to teach');
        return;
      }

      setLoading(true);
      const postData = {
        ...data,
        skills_to_learn: skillsToLearn,
        skills_to_teach: skillsToTeach
      };

      await axios.post('/api/posts', postData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Post created successfully!');
      setShowCreateModal(false);
      reset();
      setSkillsToLearn([]);
      setSkillsToTeach([]);
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPosts();
  };

  const viewProfile = (userId) => {
    console.log('Navigating to profile with userId:', userId);
    if (!userId) {
      console.error('No userId provided');
      return;
    }
    navigate(`/profile/${userId}`);
  };

  const handleCreatePostClick = () => {
    // Check if user is loaded and has completed their profile
    if (!user) {
      alert('Please log in to create a post');
      navigate('/login');
      return;
    }

    if (!user.profile_completed) {
      setShowProfileIncompleteModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  const handleGoToProfile = () => {
    setShowProfileIncompleteModal(false);
    navigate('/community-registration');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Discover Skills</h1>
              <p className="text-gray-300 mt-2">
                Find learning opportunities and connect with fellow learners
              </p>
            </div>
            <button
              onClick={handleCreatePostClick}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/25"
            >
              Create Post
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/50 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts by title, skills, or description..."
                className="w-full px-4 py-2 bg-gray-800/60 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-800/60 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="all">All Posts</option>
                <option value="exchange">Skill Exchange</option>
                <option value="teach">Teaching</option>
                <option value="learn">Learning</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              Search
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-300">Loading posts...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
              <p className="text-gray-300 mb-4">
                Be the first to create a skill exchange post!
              </p>
              <button
                onClick={handleCreatePostClick}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            posts.map((post, index) => (
              <SkillExchangeCard
                key={post.id}
                post={post}
                onViewProfile={viewProfile}
              />
            ))
          )}
        </div>

        {/* Profile Incomplete Modal */}
        {showProfileIncompleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Complete Your Profile First
                </h3>
                <p className="text-gray-600 mb-6">
                  Please complete your profile registration before creating posts. This helps other community members learn more about you and your skills.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setShowProfileIncompleteModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGoToProfile}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
                  >
                    Go to Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      {...register('title', {
                        required: 'Title is required',
                        minLength: { value: 5, message: 'Title must be at least 5 characters' },
                        maxLength: { value: 200, message: 'Title must not exceed 200 characters' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Looking to exchange React skills for Python tutoring"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description', {
                        required: 'Description is required',
                        minLength: { value: 10, message: 'Description must be at least 10 characters' },
                        maxLength: { value: 2000, message: 'Description must not exceed 2000 characters' }
                      })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Describe what you're looking for and what you can offer..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Skills to Teach */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills I Can Teach *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSkillTeach}
                        onChange={(e) => setNewSkillTeach(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToTeach())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter a skill you can teach"
                      />
                      <button
                        type="button"
                        onClick={addSkillToTeach}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillsToTeach.map((skill, index) => (
                        <span key={index} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkillToTeach(skill)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {skillsToTeach.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">Add at least one skill you can teach</p>
                    )}
                  </div>

                  {/* Skills to Learn */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills I Want to Learn *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSkillLearn}
                        onChange={(e) => setNewSkillLearn(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToLearn())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter a skill you want to learn"
                      />
                      <button
                        type="button"
                        onClick={addSkillToLearn}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillsToLearn.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkillToLearn(skill)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {skillsToLearn.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">Add at least one skill you want to learn</p>
                    )}
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level *
                    </label>
                    <select
                      {...register('experience_level', { required: 'Experience level is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select your experience level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                    {errors.experience_level && (
                      <p className="mt-1 text-sm text-red-600">{errors.experience_level.message}</p>
                    )}
                  </div>

                  {/* Preferred Meeting Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Meeting Type
                    </label>
                    <select
                      {...register('preferred_meeting_type')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="online">Online</option>
                      <option value="offline">In-Person</option>
                      <option value="both">Both Online & In-Person</option>
                    </select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability (Optional)
                    </label>
                    <textarea
                      {...register('availability')}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Weekends, evenings after 6 PM, flexible schedule..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Post'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default Discover;
