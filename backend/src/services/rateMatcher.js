const BaseRate = require('../models/BaseRate');

class RateMatcher {
  /**
   * Find matching rate for a quote request
   * @param {Object} quoteRequest - The quote request details
   * @returns {Object|null} - Matched rate or null
   */
  async findMatchingRate(quoteRequest) {
    try {
      const { origin_country, destination_country, mode_of_transport, weight } = quoteRequest;
      
      // Query for matching rates
      const matchingRates = await BaseRate.find({
        origin_zone: origin_country,
        destination_zone: destination_country,
        mode_of_transport: mode_of_transport,
        is_active: true,
        weight_min: { $lte: weight },
        weight_max: { $gte: weight },
        valid_from: { $lte: new Date() },
        valid_to: { $gte: new Date() }
      }).sort({ rate_per_kg: 1 }); // Sort by lowest rate first

      if (matchingRates.length === 0) {
        return null;
      }

      // Return the best (lowest) rate
      return matchingRates[0];
    } catch (error) {
      console.error('Error in findMatchingRate:', error);
      throw new Error('Failed to find matching rate');
    }
  }

  /**
   * Check if a rate exists for given parameters
   * @param {String} origin - Origin zone
   * @param {String} destination - Destination zone
   * @param {String} mode - Transport mode
   * @returns {Boolean}
   */
  async rateExists(origin, destination, mode) {
    const count = await BaseRate.countDocuments({
      origin_zone: origin,
      destination_zone: destination,
      mode_of_transport: mode,
      is_active: true
    });
    
    return count > 0;
  }
}

module.exports = new RateMatcher();
