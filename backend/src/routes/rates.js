const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rateController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateBaseRate, validateObjectId } = require('../middleware/validation');

/**
 * @route   GET /api/rates
 * @desc    Get all base rates
 * @access  Protected
 */
router.get(
  '/',
  authenticateToken,
  rateController.getAllRates
);

/**
 * @route   GET /api/rates/:id
 * @desc    Get a specific rate by ID
 * @access  Protected
 */
router.get(
  '/:id',
  authenticateToken,
  validateObjectId('id'),
  rateController.getRateById
);

/**
 * @route   POST /api/rates
 * @desc    Create a new base rate (Admin only)
 * @access  Protected (Admin)
 */
router.post(
  '/',
  authenticateToken,
  isAdmin,
  validateBaseRate,
  rateController.createRate
);

/**
 * @route   PUT /api/rates/:id
 * @desc    Update a base rate (Admin only)
 * @access  Protected (Admin)
 */
router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  validateObjectId('id'),
  validateBaseRate,
  rateController.updateRate
);

/**
 * @route   DELETE /api/rates/:id
 * @desc    Delete a base rate (Admin only)
 * @access  Protected (Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  validateObjectId('id'),
  rateController.deleteRate
);

/**
 * @route   PATCH /api/rates/:id/toggle
 * @desc    Toggle rate active/inactive status (Admin only)
 * @access  Protected (Admin)
 */
router.patch(
  '/:id/toggle',
  authenticateToken,
  isAdmin,
  validateObjectId('id'),
  rateController.toggleRateStatus
);

module.exports = router;
