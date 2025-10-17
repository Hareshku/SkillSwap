import React, { useState } from "react";
import { User, Code, Globe, Calendar, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OnlineStatusIndicator from "./OnlineStatusIndicator";

const SkillExchangeCard = ({ post, onViewProfile }) => {
  const navigate = useNavigate();
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
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Date not available";
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const getFirstLineDescription = (description) => {
    if (!description) return "";
    // Split by new lines and take the first line
    const firstLine = description.split("\n")[0];
    // If the first line is too long (more than 80 characters), truncate it
    if (firstLine.length > 80) {
      return firstLine.substring(0, 77) + "...";
    }
    return firstLine;
  };

  const shouldShowSeeMore = (description) => {
    if (!description) return false;
    const firstLine = description.split("\n")[0];
    // Show "See More" if there are multiple lines OR if the first line was truncated
    return description.split("\n").length > 1 || firstLine.length > 80;
  };

  const handleSeeMore = (e) => {
    e.stopPropagation();
    navigate(`/post/${post.id}`);
  };

  return (
    <div
      className={`relative group transition-all duration-500 transform max-w-sm w-full ${
        isHovered ? "scale-105" : "hover:scale-102"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered
          ? `scale(1.05) rotateX(${(mousePosition.y - 50) * 0.05}deg) rotateY(${
              (mousePosition.x - 50) * 0.05
            }deg)`
          : "scale(1)",
      }}
    >
      {/* Main card */}
      <div className="relative bg-white rounded-xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className={`relative transition-all duration-300 ${
                isHovered ? "scale-110 rotate-6" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                {post.author?.profile_picture ? (
                  <img
                    src={post.author.profile_picture}
                    alt={post.author?.full_name || post.author?.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{
                    display: post.author?.profile_picture ? "none" : "flex",
                  }}
                >
                  {getInitials(post.author?.full_name || post.author?.username)}
                </div>
              </div>
              <OnlineStatusIndicator
                isOnline={post.author?.is_online || false}
                lastSeen={post.author?.last_seen}
                size="sm"
                className="-top-0.5 -right-0.5"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {post.author?.full_name || post.author?.username}
              </h2>
              <p className="text-gray-600 text-xs flex items-center space-x-1">
                <User className="w-2.5 h-2.5" />
                <span>A professional</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (post.author?.id) {
                  onViewProfile(post.author.id);
                } else {
                  console.error("No author ID found in post data");
                }
              }}
              className="text-blue-600 hover:text-blue-700 transition-colors text-xs font-medium hover:underline cursor-pointer z-10 relative"
            >
              View Profile
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4 relative">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-all duration-300">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {post.title}
            </p>
            <div className="text-gray-600 text-xs">
              <span>{getFirstLineDescription(post.description)}</span>
              {shouldShowSeeMore(post.description) && (
                <>
                  {!post.description.split("\n")[0].endsWith("...") && " "}
                  <button
                    onClick={handleSeeMore}
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline ml-1 cursor-pointer"
                  >
                    See More
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Skills - Compact layout */}
        <div className="space-y-3 mb-4">
          {/* Skills to Teach */}
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Skills to Teach:</span>
            </h3>
            <div className="flex flex-wrap gap-1">
              {post.skills_to_teach?.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-green-200 transition-all duration-300 cursor-pointer"
                >
                  {skill}
                </span>
              ))}
              {post.skills_to_teach?.length > 3 && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  +{post.skills_to_teach.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Skills to Learn */}
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Skills to Learn:</span>
            </h3>
            <div className="flex flex-wrap gap-1">
              {post.skills_to_learn?.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-all duration-300 cursor-pointer"
                >
                  {skill}
                </span>
              ))}
              {post.skills_to_learn?.length > 3 && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  +{post.skills_to_learn.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillExchangeCard;
