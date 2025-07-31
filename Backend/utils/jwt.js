import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: 'growtogather-api',
    audience: 'growtogather-users'
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'growtogather-api',
      audience: 'growtogather-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Generate refresh token (longer expiry)
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'growtogather-api',
    audience: 'growtogather-users'
  });
};

// Decode token without verification (for expired token info)
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  generateToken,
  verifyToken,
  generateRefreshToken,
  decodeToken
};
