import React from 'react';
import BadgeNotification from './BadgeNotification';
import { useBadgeNotifications } from '../hooks/useBadgeNotifications';

const BadgeNotificationProvider = ({ children }) => {
  const { newBadges, clearBadgeNotifications } = useBadgeNotifications();

  return (
    <>
      {children}
      <BadgeNotification
        badges={newBadges}
        onClose={clearBadgeNotifications}
      />
    </>
  );
};

export default BadgeNotificationProvider;