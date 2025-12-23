const Quote = require('../models/Quote');
const rateMatcher = require('./rateMatcher');
const priceCalculator = require('./priceCalculator');
const pdfGenerator = require('./pdfGenerator');

class QuotationService {
  /**
   * Generate a new quote with date validation
   */
  async generateQuote(quoteRequest, userId) {
    try {
      // 1. Validate request
      this.validateRequest(quoteRequest);
      
      // 2. Find matching rate
      const matchedRate = await rateMatcher.findMatchingRate(quoteRequest);
      
      if (!matchedRate) {
        throw new Error('No matching rate found for this route and weight');
      }

      // 3. Validate shipment date against rate validity
      const shipmentDate = new Date(quoteRequest.shipment_date);
      const rateValidFrom = new Date(matchedRate.valid_from);
      const rateValidTo = new Date(matchedRate.valid_to);

      if (shipmentDate > rateValidTo) {
        throw new Error(
          `Shipment date exceeds rate validity. Rate is valid until ${rateValidTo.toLocaleDateString()}`
        );
      }

      if (shipmentDate < rateValidFrom) {
        throw new Error(
          `Shipment date is before rate validity. Rate is valid from ${rateValidFrom.toLocaleDateString()}`
        );
      }
      
      // 4. Calculate pricing
      const pricing = priceCalculator.calculatePrice(quoteRequest, matchedRate);
      
      // 5. Create quote object
      const quote = new Quote({
        user_id: userId,
        origin_country: quoteRequest.origin_country,
        origin_city: quoteRequest.origin_city,
        destination_country: quoteRequest.destination_country,
        destination_city: quoteRequest.destination_city,
        shipment_date: quoteRequest.shipment_date,
        mode_of_transport: quoteRequest.mode_of_transport,
        weight: quoteRequest.weight,
        volume: quoteRequest.volume || null,
        delivery_type: quoteRequest.delivery_type,
        special_services: quoteRequest.special_services || '',
        base_rate_applied: matchedRate.rate_per_kg,
        base_cost: pricing.baseCost,
        surcharges: pricing.surcharges,
        total_price: pricing.totalPrice,
        currency: 'USD',
        quote_status: 'pending'
      });
      
      // 6. Save quote
      const savedQuote = await quote.save();
      
      // 7. Generate PDF (async)
      this.generatePDFAsync(savedQuote._id, userId);
      
      // 8. Return quote
      return await Quote.findById(savedQuote._id).populate('user_id', 'name email company_name');
    } catch (error) {
      console.error('Error generating quote:', error);
      throw error;
    }
  }

  /**
   * Generate PDF asynchronously
   */
  async generatePDFAsync(quoteId, userId) {
    try {
      const User = require('../models/User');
      const quote = await Quote.findById(quoteId);
      const user = await User.findById(userId);
      
      if (!quote || !user) return;
      
      const pdfUrl = await pdfGenerator.generate(quote, user);
      
      quote.pdf_url = pdfUrl;
      await quote.save();
    } catch (error) {
      console.error('Error generating PDF async:', error);
    }
  }

  /**
   * Validate quote request
   */
  validateRequest(request) {
    const required = [
      'origin_country', 'origin_city', 
      'destination_country', 'destination_city',
      'weight', 'mode_of_transport', 
      'delivery_type', 'shipment_date'
    ];

    for (const field of required) {
      if (!request[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (request.weight <= 0) {
      throw new Error('Weight must be greater than 0');
    }

    if (new Date(request.shipment_date) < new Date()) {
      throw new Error('Shipment date must be in the future');
    }
  }

  /**
   * Get quote by ID
   */
  async getQuoteById(quoteId) {
    return await Quote.findById(quoteId).populate('user_id', 'name email company_name');
  }

  /**
   * Get user quotes
   */
  async getUserQuotes(userId) {
    return await Quote.find({ user_id: userId }).sort({ createdAt: -1 });
  }

  /**
   * Get all quotes (admin)
   */
  async getAllQuotes() {
    return await Quote.find()
      .populate('user_id', 'name email company_name')
      .sort({ createdAt: -1 });
  }

  /**
   * Update quote status
   */
  async updateQuoteStatus(quoteId, status) {
    const quote = await Quote.findById(quoteId);
    
    if (!quote) {
      throw new Error('Quote not found');
    }
    
    quote.quote_status = status;
    await quote.save();
    
    return quote;
  }
}

module.exports = new QuotationService();
