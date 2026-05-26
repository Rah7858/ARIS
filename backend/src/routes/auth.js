'use strict';

const { Router } = require('express');
const { register, login, profile, updateProfile, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

const router = Router();

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validateRegister, register);
router.post('/login',    authLimiter, validateLogin,    login);
router.get( '/profile',  verifyToken, profile);
router.put( '/profile',  verifyToken, updateProfile);
router.post('/logout',   verifyToken, logout);

module.exports = router;
