import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';

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
          post_type: filterType === 'all' ? undefined : filterType
        }
      });
      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
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
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discover Skills</h1>
              <p className="text-gray-600 mt-2">
                Find learning opportunities and connect with fellow learners
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Create Post
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts by title, skills, or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Posts</option>
                <option value="exchange">Skill Exchange</option>
                <option value="teach">Teaching</option>
                <option value="learn">Learning</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500">Loading posts...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600 mb-4">
                Be the first to create a skill exchange post!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {post.author?.full_name?.charAt(0) || post.author?.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{post.author?.full_name || post.author?.username}</h4>
                      <p className="text-sm text-gray-500">{post.author?.profession}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => viewProfile(post.author?.id)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View Profile
                  </button>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{post.description}</p>
                </div>

                {/* Skills */}
                <div className="space-y-3 mb-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Skills to Teach:</h5>
                    <div className="flex flex-wrap gap-1">
                      {post.skills_to_teach?.map((skill, index) => (
                        <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Skills to Learn:</h5>
                    <div className="flex flex-wrap gap-1">
                      {post.skills_to_learn?.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Post Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <span>{post.preferred_meeting_type}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

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
