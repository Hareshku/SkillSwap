import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  changePassword,
  getUserRecommendations,
  getPostRecommendations,
  searchUsers
} from '../controllers/userController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation rules - temporarily minimal for debugging
const updateProfileValidation = [];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
];

const searchValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Routes

// Get user profile by ID
router.get('/profile/:userId',
  authenticateToken,
  param('userId').isInt({ min: 1 }).withMessage('Invalid user ID'),
  validateRequest,
  getUserProfile
);

// Update current user's profile
router.put('/profile',
  authenticateToken,
  upload.single('profile_picture'),
  updateUserProfile
);

// Upload profile picture
router.post('/profile/picture',
  authenticateToken,
  upload.single('profilePicture'),
  uploadProfilePicture
);

// Change password
router.put('/password',
  authenticateToken,
  changePasswordValidation,
  validateRequest,
  changePassword
);

// Get user recommendations
router.get('/recommendations',
  authenticateToken,
  getUserRecommendations
);

// Get post recommendations for user
router.get('/post-recommendations',
  authenticateToken,
  getPostRecommendations
);

// Search users
router.get('/search',
  authenticateToken,
  searchValidation,
  validateRequest,
  searchUsers
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }

  if (error.message === 'Invalid file type. Only JPEG, PNG and GIF are allowed.') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

export default router;
