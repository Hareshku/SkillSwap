import React, { useState, useEffect } from 'react';

const BadgeNotification = ({ badges, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badges && badges.length > 0) {
      setVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [badges]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300); // Wait for animation to complete
  };

  if (!badges || badges.length === 0 || !visible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 transform transition-all duration-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🎉</span>
              <h3 className="font-semibold text-gray-900">
                New Badge{badges.length > 1 ? 's' : ''} Earned!
              </h3>
            </div>

            <div className="space-y-2">
              {badges.map((badge, index) => (
                <div key={badge.id || index} className="flex items-center space-x-2">
                  <span className="text-lg">{badge.icon_url}</span>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{badge.name}</p>
                    <p className="text-xs text-gray-600">{badge.points_value} points</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => window.location.href = '/badges'}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                View All Badges
              </button>
              <button
                onClick={handleClose}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeNotification;