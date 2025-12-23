class PriceCalculator {
  /**
   * Calculate total price for a quote
   * @param {Object} quoteRequest - Quote request details
   * @param {Object} matchedRate - Matched base rate
   * @returns {Object} - Pricing breakdown
   */
  calculatePrice(quoteRequest, matchedRate) {
    const { weight, delivery_type, special_services } = quoteRequest;
    
    // 1. Calculate base cost
    const baseCost = this.calculateBaseCost(weight, matchedRate);
    
    // 2. Calculate fuel surcharge
    const fuelSurcharge = this.calculateFuelSurcharge(baseCost, matchedRate);
    
    // 3. Calculate urgency surcharge
    const urgencySurcharge = this.calculateUrgencySurcharge(baseCost, delivery_type);
    
    // 4. Calculate special services cost
    const specialServicesCost = this.calculateSpecialServices(special_services);
    
    // 5. Calculate total
    const totalPrice = baseCost + fuelSurcharge + urgencySurcharge + specialServicesCost;
    
    return {
      baseCost: parseFloat(baseCost.toFixed(2)),
      surcharges: {
        fuel: parseFloat(fuelSurcharge.toFixed(2)),
        urgency: parseFloat(urgencySurcharge.toFixed(2)),
        specialServices: parseFloat(specialServicesCost.toFixed(2))
      },
      totalPrice: parseFloat(totalPrice.toFixed(2))
    };
  }

  /**
   * Calculate base cost
   * @param {Number} weight - Shipment weight in kg
   * @param {Object} rate - Base rate object
   * @returns {Number}
   */
  calculateBaseCost(weight, rate) {
    return weight * rate.rate_per_kg;
  }

  /**
   * Calculate fuel surcharge
   * @param {Number} baseCost - Base cost
   * @param {Object} rate - Base rate object
   * @returns {Number}
   */
  calculateFuelSurcharge(baseCost, rate) {
    return baseCost * (rate.fuel_surcharge_pct / 100);
  }

  /**
   * Calculate urgency surcharge
   * @param {Number} baseCost - Base cost
   * @param {String} deliveryType - 'urgent' or 'standard'
   * @returns {Number}
   */
  calculateUrgencySurcharge(baseCost, deliveryType) {
    if (deliveryType === 'urgent') {
      return baseCost * 0.20; // 20% surcharge for urgent delivery
    }
    return 0;
  }

  /**
   * Calculate special services cost
   * @param {String} services - Special services string
   * @returns {Number}
   */
  calculateSpecialServices(services) {
    if (!services || services.trim() === '') {
      return 0;
    }

    let cost = 0;
    const servicesLower = services.toLowerCase();

    // Define service costs
    if (servicesLower.includes('insurance')) {
      cost += 50;
    }
    if (servicesLower.includes('temperature controlled') || servicesLower.includes('refrigerated')) {
      cost += 150;
    }
    if (servicesLower.includes('fragile') || servicesLower.includes('fragile handling')) {
      cost += 75;
    }
    if (servicesLower.includes('express')) {
      cost += 100;
    }
    if (servicesLower.includes('tracking')) {
      cost += 25;
    }

    return cost;
  }
}

module.exports = new PriceCalculator();
