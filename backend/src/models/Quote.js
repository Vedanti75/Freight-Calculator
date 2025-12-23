const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin_country: {
    type: String,
    required: true
  },
  origin_city: {
    type: String,
    required: true
  },
  destination_country: {
    type: String,
    required: true
  },
  destination_city: {
    type: String,
    required: true
  },
  shipment_date: {
    type: Date,
    required: true
  },
  mode_of_transport: {
    type: String,
    enum: ['road', 'air', 'sea', 'rail'],
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  volume: Number,
  delivery_type: {
    type: String,
    enum: ['urgent', 'standard'],
    required: true
  },
  special_services: String,
  base_rate_applied: {
    type: Number,
    required: true
  },
  distance: Number,
  base_cost: {
    type: Number,
    required: true
  },
  surcharges: {
    fuel: Number,
    urgency: Number,
    specialServices: Number
  },
  total_price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  quote_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  pdf_url: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Quote', quoteSchema);
