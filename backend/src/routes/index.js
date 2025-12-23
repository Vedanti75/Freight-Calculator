const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const quoteRoutes = require('./quotes');
const rateRoutes = require('./rates');
const healthRoutes = require('./health');

// Mount routes
router.use('/auth', authRoutes);
router.use('/quotes', quoteRoutes);
router.use('/rates', rateRoutes);
router.use('/health', healthRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Freight Quotation Tool API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/google': 'Login/Register with Google',
        'GET /api/auth/verify': 'Verify JWT token',
        'GET /api/auth/profile': 'Get user profile',
        'PUT /api/auth/profile': 'Update user profile'
      },
      quotes: {
        'POST /api/quotes': 'Create new quote',
        'GET /api/quotes/my-quotes': 'Get user quotes',
        'GET /api/quotes/all': 'Get all quotes (Admin)',
        'GET /api/quotes/:id': 'Get quote by ID',
        'PATCH /api/quotes/:id/status': 'Update quote status (Admin)',
        'GET /api/quotes/:id/download': 'Get quote PDF URL'
      },
      rates: {
        'GET /api/rates': 'Get all rates',
        'GET /api/rates/:id': 'Get rate by ID',
        'POST /api/rates': 'Create new rate (Admin)',
        'PUT /api/rates/:id': 'Update rate (Admin)',
        'DELETE /api/rates/:id': 'Delete rate (Admin)',
        'PATCH /api/rates/:id/toggle': 'Toggle rate status (Admin)'
      },
      health: {
        'GET /api/health': 'API health check'
      }
    }
  });
});

module.exports = router;
