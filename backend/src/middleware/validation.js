/**
 * Validate quote request body
 */
const validateQuoteRequest = (req, res, next) => {
  try {
    const {
      origin_country,
      origin_city,
      destination_country,
      destination_city,
      weight,
      mode_of_transport,
      delivery_type,
      shipment_date
    } = req.body;

    const errors = [];

    // Required fields
    if (!origin_country) errors.push('origin_country is required');
    if (!origin_city) errors.push('origin_city is required');
    if (!destination_country) errors.push('destination_country is required');
    if (!destination_city) errors.push('destination_city is required');
    if (!weight) errors.push('weight is required');
    if (!mode_of_transport) errors.push('mode_of_transport is required');
    if (!delivery_type) errors.push('delivery_type is required');
    if (!shipment_date) errors.push('shipment_date is required');

    // Validate types and values
    if (weight && (isNaN(weight) || weight <= 0)) {
      errors.push('weight must be a positive number');
    }

    if (mode_of_transport && !['road', 'air', 'sea', 'rail'].includes(mode_of_transport)) {
      errors.push('mode_of_transport must be: road, air, sea, or rail');
    }

    if (delivery_type && !['urgent', 'standard'].includes(delivery_type)) {
      errors.push('delivery_type must be: urgent or standard');
    }

    if (shipment_date && new Date(shipment_date) < new Date()) {
      errors.push('shipment_date must be in the future');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation failed',
      error: error.message
    });
  }
};

/**
 * Validate base rate request body
 */
const validateBaseRate = (req, res, next) => {
  try {
    const {
      origin_zone,
      destination_zone,
      mode_of_transport,
      weight_min,
      weight_max,
      rate_per_kg,
      valid_from,
      valid_to
    } = req.body;

    const errors = [];

    // Required fields
    if (!origin_zone) errors.push('origin_zone is required');
    if (!destination_zone) errors.push('destination_zone is required');
    if (!mode_of_transport) errors.push('mode_of_transport is required');
    if (weight_min === undefined) errors.push('weight_min is required');
    if (weight_max === undefined) errors.push('weight_max is required');
    if (!rate_per_kg) errors.push('rate_per_kg is required');
    if (!valid_from) errors.push('valid_from is required');
    if (!valid_to) errors.push('valid_to is required');

    // Validate values
    if (weight_min !== undefined && weight_min < 0) {
      errors.push('weight_min must be >= 0');
    }

    if (weight_max !== undefined && weight_min !== undefined && weight_max < weight_min) {
      errors.push('weight_max must be >= weight_min');
    }

    if (rate_per_kg && (isNaN(rate_per_kg) || rate_per_kg <= 0)) {
      errors.push('rate_per_kg must be a positive number');
    }

    if (mode_of_transport && !['road', 'air', 'sea', 'rail'].includes(mode_of_transport)) {
      errors.push('mode_of_transport must be: road, air, sea, or rail');
    }

    if (valid_from && valid_to && new Date(valid_to) < new Date(valid_from)) {
      errors.push('valid_to must be after valid_from');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation failed',
      error: error.message
    });
  }
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }

    next();
  };
};

module.exports = {
  validateQuoteRequest,
  validateBaseRate,
  validateObjectId
};
