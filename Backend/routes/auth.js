import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  register,
  login,
  loginUser,
  loginAdmin,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  completeProfile
} from '../controllers/authController.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  validateForgotPassword,
  validateResetPassword,
  validateProfileCompletion
} from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/login/user', validateUserLogin, loginUser);
router.post('/login/admin', validateUserLogin, loginAdmin);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/complete-profile', authenticateToken, upload.single('profile_picture'), completeProfile);
router.put('/change-password', authenticateToken, validatePasswordChange, changePassword);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/logout', authenticateToken, logout);

export default router;
