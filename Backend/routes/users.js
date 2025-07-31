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

// Validation rules
const updateProfileValidation = [
  body('full_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('linkedin_url')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),
  body('github_url')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  body('portfolio_url')
    .optional()
    .isURL()
    .withMessage('Portfolio URL must be a valid URL'),
  body('profession')
    .optional()
    .isIn(['student', 'professional', 'freelancer', 'entrepreneur', 'other'])
    .withMessage('Invalid profession'),
  body('degree_level')
    .optional()
    .isIn(['high_school', 'bachelor', 'master', 'phd', 'other'])
    .withMessage('Invalid degree level'),
  body('institute')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Institute name must not exceed 200 characters'),
  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),
  body('timezone')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Timezone must not exceed 50 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*.skill_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Skill name must be between 1 and 100 characters'),
  body('skills.*.skill_type')
    .optional()
    .isIn(['learn', 'teach'])
    .withMessage('Skill type must be either learn or teach'),
  body('skills.*.proficiency_level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid proficiency level')
];

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
  updateProfileValidation,
  validateRequest,
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
