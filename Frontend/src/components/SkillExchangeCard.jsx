import React, { useState } from 'react';
import { User, Code, Globe, Calendar, Sparkles } from 'lucide-react';

const SkillExchangeCard = ({ post, onViewProfile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`relative group transition-all duration-500 transform max-w-sm w-full ${isHovered ? 'scale-105' : 'hover:scale-102'
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered
          ? `scale(1.05) rotateX(${(mousePosition.y - 50) * 0.05}deg) rotateY(${(mousePosition.x - 50) * 0.05}deg)`
          : 'scale(1)'
      }}
    >
      {/* Glowing effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse"></div>

      {/* Main card */}
      <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl p-4 shadow-2xl border border-gray-700/50 backdrop-blur-sm">

        {/* Mouse tracking gradient */}
        <div
          className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-20' : ''
            }`}
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(168,85,247,0.3), transparent 60%)`
          }}
        ></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`relative transition-all duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                {post.author?.profile_picture ? (
                  <img
                    src={post.author.profile_picture}
                    alt={post.author?.full_name || post.author?.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{ display: post.author?.profile_picture ? 'none' : 'flex' }}
                >
                  {getInitials(post.author?.full_name || post.author?.username)}
                </div>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>

            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {post.author?.full_name || post.author?.username}
              </h2>
              <p className="text-gray-400 text-xs flex items-center space-x-1">
                <User className="w-2.5 h-2.5" />
                <span>{post.author?.profession || 'student'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Sparkles className={`w-4 h-4 text-yellow-400 transition-all duration-300 ${isHovered ? 'animate-spin text-yellow-300' : 'animate-pulse'
              }`} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('View Profile clicked, post:', post);
                console.log('Author ID:', post.author?.id);
                if (post.author?.id) {
                  onViewProfile(post.author.id);
                } else {
                  console.error('No author ID found in post data');
                }
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors text-xs font-medium hover:underline cursor-pointer z-10 relative"
            >
              View Profile
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4 relative">
          <div className="bg-gray-800/60 rounded-lg p-3 backdrop-blur-sm border border-gray-600/30 hover:border-purple-500/30 transition-all duration-300">
            <p className="text-sm font-semibold text-white mb-1">
              {post.title}
            </p>
            <p className="text-gray-400 text-xs line-clamp-2">{post.description}</p>
          </div>
        </div>

        {/* Skills - Compact layout */}
        <div className="space-y-3 mb-4">
          {/* Skills to Teach */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 mb-2 flex items-center space-x-1">
              <Code className="w-3 h-3 text-green-400" />
              <span>Skills to Teach:</span>
            </h3>
            <div className="flex flex-wrap gap-1">
              {post.skills_to_teach?.slice(0, 3).map((skill, index) => (
                <span key={index} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 cursor-pointer">
                  {skill}
                </span>
              ))}
              {post.skills_to_teach?.length > 3 && (
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  +{post.skills_to_teach.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Skills to Learn */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 mb-2 flex items-center space-x-1">
              <Globe className="w-3 h-3 text-blue-400" />
              <span>Skills to Learn:</span>
            </h3>
            <div className="flex flex-wrap gap-1">
              {post.skills_to_learn?.slice(0, 3).map((skill, index) => (
                <span key={index} className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 cursor-pointer">
                  {skill}
                </span>
              ))}
              {post.skills_to_learn?.length > 3 && (
                <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  +{post.skills_to_learn.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-700/50">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{post.preferred_meeting_type || 'online'}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(post.createdAt || post.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillExchangeCard;