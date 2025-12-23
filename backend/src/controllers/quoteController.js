const Quote = require('../models/Quote');
const User = require('../models/User');
const pdfGenerator = require('../services/pdfGenerator');
const path = require('path');
const fs = require('fs');


class QuoteController {
  /**
   * Create a new quote (Public or with optional auth)
   * POST /api/quotes
   */
  async createQuote(req, res) {
    try {
      const quoteRequest = req.body;
      const userId = req.user?.userId || null;

      // Generate quote logic
      const quote = await this.generateQuoteLogic(quoteRequest, userId);

      // Generate PDF asynchronously
      this.generatePDFAsync(quote._id, userId);

      res.status(201).json({
        success: true,
        message: 'Quote generated successfully',
        data: quote
      });
    } catch (error) {
      console.error('Create quote error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to generate quote'
      });
    }
  }

  /**
   * Generate quote logic
   */
  async generateQuoteLogic(quoteRequest, userId) {
    try {
      // 1. Validate request
      this.validateRequest(quoteRequest);

      // 2. Find matching rate
      const matchedRate = await this.findMatchingRate(quoteRequest);

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
      const pricing = this.calculatePrice(quoteRequest, matchedRate);

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

      // 7. Return quote
      return await Quote.findById(savedQuote._id).populate('user_id', 'name email company_name');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find matching rate from database
   */
  async findMatchingRate(quoteRequest) {
    const BaseRate = require('../models/BaseRate');

    const rate = await BaseRate.findOne({
      origin_zone: new RegExp(quoteRequest.origin_country, 'i'),
      destination_zone: new RegExp(quoteRequest.destination_country, 'i'),
      mode_of_transport: quoteRequest.mode_of_transport,
      weight_min: { $lte: quoteRequest.weight },
      weight_max: { $gte: quoteRequest.weight },
      is_active: true
    });

    return rate;
  }

  /**
   * Calculate price based on quote and rate
   */
  calculatePrice(quoteRequest, rate) {
    const weight = parseFloat(quoteRequest.weight);
    const baseCost = weight * rate.rate_per_kg;

    // Fuel surcharge
    const fuelSurcharge = baseCost * (rate.fuel_surcharge_pct / 100);

    // Urgency surcharge (20% for urgent delivery)
    const urgencySurcharge = quoteRequest.delivery_type === 'urgent' ? baseCost * 0.2 : 0;

    // Special services surcharge (5% if present)
    const specialServicesSurcharge = quoteRequest.special_services ? baseCost * 0.05 : 0;

    const totalPrice = baseCost + fuelSurcharge + urgencySurcharge + specialServicesSurcharge;

    return {
      baseCost,
      surcharges: {
        fuel: fuelSurcharge,
        urgency: urgencySurcharge,
        specialServices: specialServicesSurcharge
      },
      totalPrice
    };
  }

  /**
   * Generate PDF asynchronously
   */
  async generatePDFAsync(quoteId, userId) {
    try {
      const quote = await Quote.findById(quoteId);
      const user = userId ? await User.findById(userId) : { name: 'Guest', email: 'N/A' };

      if (!quote || !user) return;

      const pdfUrl = await pdfGenerator.generate(quote, user);
      quote.pdf_url = pdfUrl;
      await quote.save();

      console.log(`✓ PDF generated for quote ${quoteId}`);
    } catch (error) {
      console.error('Error generating PDF async:', error);
    }
  }

  /**
   * Validate quote request
   */
  validateRequest(request) {
    const required = [
      'origin_country',
      'origin_city',
      'destination_country',
      'destination_city',
      'weight',
      'mode_of_transport',
      'delivery_type',
      'shipment_date'
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
   * Get a specific quote by ID (Auth required)
   * GET /api/quotes/:id
   */
  async getQuoteById(req, res) {
    try {
      const { id } = req.params;
      const quote = await Quote.findById(id);

      if (!quote) {
        return res.status(404).json({
          success: false,
          message: 'Quote not found'
        });
      }

      // Check authorization
      if (req.user.role !== 'admin' && quote.user_id && quote.user_id.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this quote'
        });
      }

      res.status(200).json({
        success: true,
        data: quote
      });
    } catch (error) {
      console.error('Get quote error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quote',
        error: error.message
      });
    }
  }

  /**
   * Get all quotes for the logged-in user
   * GET /api/quotes/my-quotes
   */
  async getMyQuotes(req, res) {
    try {
      const userId = req.user.userId;
      const quotes = await Quote.find({ user_id: userId }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: quotes,
        count: quotes.length
      });
    } catch (error) {
      console.error('Get my quotes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotes',
        error: error.message
      });
    }
  }

  /**
   * Get all quotes (Admin only)
   * GET /api/quotes/all
   */
  async getAllQuotes(req, res) {
    try {
      const quotes = await Quote.find()
        .populate('user_id', 'name email company_name')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: quotes,
        count: quotes.length
      });
    } catch (error) {
      console.error('Get all quotes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotes',
        error: error.message
      });
    }
  }

  /**
   * Update quote status (Admin only)
   * PATCH /api/quotes/:id/status
   */
  async updateQuoteStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: pending, approved, or rejected'
        });
      }

      const quote = await Quote.findById(id).populate('user_id', 'name email');

      if (!quote) {
        return res.status(404).json({
          success: false,
          message: 'Quote not found'
        });
      }

      // Update status
      quote.quote_status = status;
      await quote.save();

      // Regenerate PDF with new status asynchronously
      (async () => {
        try {
          if (quote.user_id) {
            const pdfUrl = await pdfGenerator.generate(quote, quote.user_id);
            quote.pdf_url = pdfUrl;
            await quote.save();
            console.log(`✓ PDF regenerated for quote ${id} with status: ${status}`);
          }
        } catch (error) {
          console.error('Error regenerating PDF:', error);
        }
      })();

      res.status(200).json({
        success: true,
        message: 'Quote status updated successfully',
        data: quote
      });
    } catch (error) {
      console.error('Update quote status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update quote status'
      });
    }
  }

  /**
   * Delete a quote (Admin only)
   * DELETE /api/quotes/:id
   */
  async deleteQuote(req, res) {
    try {
      const { id } = req.params;
      const quote = await Quote.findById(id);

      if (!quote) {
        return res.status(404).json({
          success: false,
          message: 'Quote not found'
        });
      }

      // Delete the quote
      await Quote.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Quote deleted successfully'
      });
    } catch (error) {
      console.error('Delete quote error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete quote',
        error: error.message
      });
    }
  }

  /**
 * Download quote PDF (Auth required)
 * GET /api/quotes/:id/download
 */
async downloadQuotePDF(req, res) {
  try {
    const { id } = req.params;
    const quote = await Quote.findById(id);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && (!quote.user_id || quote.user_id.toString() !== req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to download this quote'
      });
    }
    
    // Check if PDF needs to be generated
    let pdfUrl = quote.pdf_url;
    let needsGeneration = false;
    
    if (!pdfUrl) {
      needsGeneration = true;
      console.log('PDF URL not set, generating...');
    } else {
      // Check if file actually exists on disk
      const filename = pdfUrl.split('/').pop();
      const pdfPath = path.join(__dirname, '../../uploads', filename);
      
      if (!fs.existsSync(pdfPath)) {
        needsGeneration = true;
        console.log('PDF file missing on disk, regenerating...');
      }
    }
    
    // Generate PDF on-demand if needed
    if (needsGeneration) {
      try {
        const user = quote.user_id 
          ? await User.findById(quote.user_id) 
          : { name: 'Guest', email: 'N/A' };
        
        pdfUrl = await pdfGenerator.generate(quote, user);
        quote.pdf_url = pdfUrl;
        await quote.save();
        console.log(`✓ PDF generated on-demand for quote ${id}`);
      } catch (error) {
        console.error('PDF generation error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to generate PDF',
          error: error.message
        });
      }
    }
    
    // Serve the PDF file
    const filename = pdfUrl.split('/').pop();
    const pdfPath = path.join(__dirname, '../../uploads', filename);
    
    console.log('Serving PDF from:', pdfPath);
    
    if (!fs.existsSync(pdfPath)) {
      console.error('PDF file still not found after generation:', pdfPath);
      return res.status(500).json({
        success: false,
        message: 'PDF file could not be generated or found'
      });
    }
    
    const fileSize = fs.statSync(pdfPath).size;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quote_${id}.pdf"`);
    res.setHeader('Content-Length', fileSize);
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming file' });
      }
    });
    
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF',
      error: error.message
    });
  }
}

}

module.exports = new QuoteController();
