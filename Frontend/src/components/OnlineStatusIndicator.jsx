import React from 'react';

const OnlineStatusIndicator = ({ isOnline, lastSeen, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const positionClasses = {
    sm: 'bottom-0 right-0',
    md: 'bottom-1 right-1',
    lg: 'bottom-1 right-1'
  };

  // Determine if user is actually online based on last_seen
  const isActuallyOnline = () => {
    // If explicitly marked as offline, show offline
    if (isOnline === false) return false;

    // If marked as online, check last_seen timestamp
    if (isOnline === true) {
      if (!lastSeen) return true; // If no last_seen, trust the is_online flag

      // Consider user offline if last seen more than 10 minutes ago
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const lastSeenDate = new Date(lastSeen);

      return lastSeenDate > tenMinutesAgo;
    }

    // Default to offline if status is unclear
    return false;
  };

  const userIsOnline = isActuallyOnline();

  return (
    <div className={`absolute ${positionClasses[size]} ${className}`}>
      {userIsOnline ? (
        // Green filled circle for online
        <div className={`${sizeClasses[size]} bg-green-500 rounded-full border-2 border-white shadow-sm`} />
      ) : (
        // White circle with green border for offline
        <div className={`${sizeClasses[size]} bg-white rounded-full border-2 border-green-500 shadow-sm`} />
      )}
    </div>
  );
};

export default OnlineStatusIndicator;