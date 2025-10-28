import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const useBadgeNotifications = () => {
  const { token, user } = useAuth();
  const [newBadges, setNewBadges] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);

  // Check for new badges
  const checkForNewBadges = async () => {
    if (!token || !user) return [];

    try {
      const response = await axios.post('/api/badges/check', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data.newBadges.length > 0) {
        const badges = response.data.data.newBadges;
        setNewBadges(badges);
        setLastChecked(new Date());
        return badges;
      }
      return [];
    } catch (error) {
      console.error('Error checking for new badges:', error);
      return [];
    }
  };

  // Clear notifications
  const clearBadgeNotifications = () => {
    setNewBadges([]);
  };

  // Auto-check on mount and periodically
  useEffect(() => {
    if (token && user) {
      // Check immediately
      checkForNewBadges();

      // Check every 5 minutes
      const interval = setInterval(checkForNewBadges, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [token, user]);

  return {
    newBadges,
    checkForNewBadges,
    clearBadgeNotifications,
    lastChecked
  };
};