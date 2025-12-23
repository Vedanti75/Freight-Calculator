const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/google
 * @desc    Login/Register with Google OAuth
 * @access  Public
 */
router.post('/google', authController.googleAuth);

/**
 * @route   POST /api/auth/register
 * @desc    Register with email/password
 * @access  Public
 */
router.post('/register', authController.emailPasswordRegister);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email/password
 * @access  Public
 */
router.post('/login', authController.emailPasswordLogin);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Protected
 */
router.get('/verify', authenticateToken, authController.verifyToken);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Protected
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Protected
 */
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
