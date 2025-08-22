/**
 * Utility functions for handling dates safely across the application
 */

/**
 * Safely format a date string or Date object
 * @param {string|Date} dateInput - The date to format
 * @param {string} formatType - 'date', 'time', or 'datetime'
 * @param {object} options - Additional formatting options
 * @returns {string} Formatted date string or fallback text
 */
export const formatDate = (dateInput, formatType = 'date', options = {}) => {
  if (!dateInput) return '';

  try {
    // Handle both string and Date object inputs
    let date;
    if (typeof dateInput === 'string') {
      // Handle ISO strings and other formats
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return 'Invalid date';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date detected:', dateInput);
      return 'Invalid date';
    }

    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };

    switch (formatType) {
      case 'time':
        return date.toLocaleTimeString([], defaultOptions);
      case 'datetime':
        return date.toLocaleString([], {
          ...defaultOptions,
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      case 'date':
      default:
        return date.toLocaleDateString([], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          ...options
        });
    }
  } catch (error) {
    console.error('Date formatting error:', error, dateInput);
    return 'Invalid date';
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 * @param {string|Date} dateInput - The date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateInput) => {
  if (!dateInput) return '';

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    // For older dates, show the actual date
    return formatDate(date, 'date');
  } catch (error) {
    console.error('Relative time error:', error, dateInput);
    return 'Invalid date';
  }
};

/**
 * Check if a date is today
 * @param {string|Date} dateInput - The date to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (dateInput) => {
  if (!dateInput) return false;

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return false;

    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is yesterday
 * @param {string|Date} dateInput - The date to check
 * @returns {boolean} True if the date is yesterday
 */
export const isYesterday = (dateInput) => {
  if (!dateInput) return false;

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return false;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  } catch (error) {
    return false;
  }
};