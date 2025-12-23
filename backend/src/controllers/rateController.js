const BaseRate = require('../models/BaseRate');

class RateController {
  /**
   * Get all base rates
   * GET /api/rates
   */
  async getAllRates(req, res) {
    try {
      const { is_active } = req.query;
      
      const filter = {};
      if (is_active !== undefined) {
        filter.is_active = is_active === 'true';
      }

      const rates = await BaseRate.find(filter)
        .populate('created_by', 'name email')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: rates,
        count: rates.length
      });
    } catch (error) {
      console.error('Get rates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rates',
        error: error.message
      });
    }
  }

  /**
   * Get a single rate by ID
   * GET /api/rates/:id
   */
  async getRateById(req, res) {
    try {
      const { id } = req.params;
      const rate = await BaseRate.findById(id).populate('created_by', 'name email');

      if (!rate) {
        return res.status(404).json({
          success: false,
          message: 'Rate not found'
        });
      }

      res.status(200).json({
        success: true,
        data: rate
      });
    } catch (error) {
      console.error('Get rate error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rate',
        error: error.message
      });
    }
  }

  /**
   * Create a new base rate (Admin only)
   * POST /api/rates
   */
  async createRate(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const rateData = {
        ...req.body,
        created_by: req.user.userId
      };

      const rate = new BaseRate(rateData);
      await rate.save();

      res.status(201).json({
        success: true,
        message: 'Rate created successfully',
        data: rate
      });
    } catch (error) {
      console.error('Create rate error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to create rate',
        error: error.message
      });
    }
  }

  /**
   * Update a base rate (Admin only)
   * PUT /api/rates/:id
   */
  async updateRate(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { id } = req.params;
      const rate = await BaseRate.findById(id);

      if (!rate) {
        return res.status(404).json({
          success: false,
          message: 'Rate not found'
        });
      }

      // Update fields
      Object.keys(req.body).forEach(key => {
        if (key !== '_id' && key !== 'created_by') {
          rate[key] = req.body[key];
        }
      });

      await rate.save();

      res.status(200).json({
        success: true,
        message: 'Rate updated successfully',
        data: rate
      });
    } catch (error) {
      console.error('Update rate error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update rate',
        error: error.message
      });
    }
  }

  /**
   * Delete a base rate (Admin only)
   * DELETE /api/rates/:id
   */
  async deleteRate(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { id } = req.params;
      const rate = await BaseRate.findByIdAndDelete(id);

      if (!rate) {
        return res.status(404).json({
          success: false,
          message: 'Rate not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Rate deleted successfully'
      });
    } catch (error) {
      console.error('Delete rate error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete rate',
        error: error.message
      });
    }
  }

  /**
   * Toggle rate active status (Admin only)
   * PATCH /api/rates/:id/toggle
   */
  async toggleRateStatus(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.'
        });
      }

      const { id } = req.params;
      const rate = await BaseRate.findById(id);

      if (!rate) {
        return res.status(404).json({
          success: false,
          message: 'Rate not found'
        });
      }

      rate.is_active = !rate.is_active;
      await rate.save();

      res.status(200).json({
        success: true,
        message: `Rate ${rate.is_active ? 'activated' : 'deactivated'} successfully`,
        data: rate
      });
    } catch (error) {
      console.error('Toggle rate status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle rate status',
        error: error.message
      });
    }
  }
}

module.exports = new RateController();
