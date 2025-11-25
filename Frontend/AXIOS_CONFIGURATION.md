# Axios Configuration Guide

## Overview
This project now uses a centralized axios configuration with environment variables for the backend URL.

## Configuration Files

### 1. Environment Variable (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 2. Axios Instance (`src/api/axios.js`)
```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
```

## Usage

### Import the configured axios instance:
```javascript
import axios from '../api/axios';
```

### Make API calls (no need to specify full URL):
```javascript
// GET request
const response = await axios.get('/api/users/profile', {
  headers: { Authorization: `Bearer ${token}` }
});

// POST request
const response = await axios.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// PUT request
const response = await axios.put('/api/users/profile', data, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Updated Files

### Pages (14 files):
- `pages/AdminDashboard.jsx`
- `pages/Badges.jsx`
- `pages/CommunityRegistration.jsx`
- `pages/ConnectionRequests.jsx`
- `pages/Contact.jsx`
- `pages/Discover.jsx`
- `pages/ForgotPassword.jsx`
- `pages/Meetings.jsx`
- `pages/Messages.jsx`
- `pages/OwnProfile.jsx`
- `pages/PostDetails.jsx`
- `pages/Profile.jsx`
- `pages/ResetPassword.jsx`
- `pages/UserProfile.jsx`

### Components (9 files):
- `components/AchievementsModal.jsx`
- `components/BadgeDisplay.jsx`
- `components/FeedbackDisplay.jsx`
- `components/FeedbackForm.jsx`
- `components/FeedbackModal.jsx`
- `components/MessageModal.jsx`
- `components/PasswordChangeModal.jsx`
- `components/ReportModal.jsx`
- `components/ReviewModal.jsx`
- `components/ScheduleModal.jsx`

### Context (1 file):
- `context/AuthContext.jsx`

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `VITE_API_BASE_URL` if your backend runs on a different port or domain:
   ```env
   # For production
   VITE_API_BASE_URL=https://api.yourapp.com
   
   # For local development
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. Restart the Vite dev server after changing `.env` files

## Benefits

✅ **Centralized Configuration**: Single source of truth for API base URL  
✅ **Environment-Specific**: Easy to switch between dev/staging/production  
✅ **Type Safety**: Consistent axios instance across the app  
✅ **Maintainable**: Update base URL in one place  
✅ **Secure**: `.env` file is gitignored to prevent exposing sensitive URLs  

## Notes

- The `.env` file is gitignored to prevent committing sensitive information
- Use `.env.example` as a template for new developers
- Vite requires environment variables to be prefixed with `VITE_`
- Changes to `.env` require restarting the dev server
