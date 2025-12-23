const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { authenticateToken, optionalAuth, isAdmin } = require('../middleware/auth');

/**
 * @route   POST /quotes
 * @desc    Create a new quote (No auth needed)
 * @access  Public
 */
router.post('/', optionalAuth, (req, res) => {
  quoteController.createQuote(req, res);
});

/**
 * @route   GET /quotes/my-quotes
 * @desc    Get all quotes for logged-in user
 * @access  Protected
 */
router.get('/my-quotes', authenticateToken, (req, res) => {
  quoteController.getMyQuotes(req, res);
});

/**
 * @route   GET /quotes/all
 * @desc    Get all quotes (Admin only)
 * @access  Protected (Admin)
 */
router.get('/all', authenticateToken, isAdmin, (req, res) => {
  quoteController.getAllQuotes(req, res);
});

/**
 * @route   DELETE /quotes/:id
 * @desc    Delete a quote (Admin only)
 * @access  Protected (Admin)
 * NOTE: Must come before GET /:id
 */
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  quoteController.deleteQuote(req, res);
});

/**
 * @route   GET /quotes/:id
 * @desc    Get a specific quote by ID
 * @access  Protected
 */
router.get('/:id', authenticateToken, (req, res) => {
  quoteController.getQuoteById(req, res);
});

/**
 * @route   PATCH /quotes/:id/status
 * @desc    Update quote status (Admin only)
 * @access  Protected (Admin)
 */
router.patch('/:id/status', authenticateToken, isAdmin, (req, res) => {
  quoteController.updateQuoteStatus(req, res);
});

/**
 * @route   GET /quotes/:id/download
 * @desc    Get PDF download URL for a quote
 * @access  Protected
 */
router.get('/:id/download', authenticateToken, (req, res) => {
  quoteController.downloadQuotePDF(req, res);
});

module.exports = router;
