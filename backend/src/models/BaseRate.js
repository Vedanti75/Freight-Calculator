const mongoose = require('mongoose');

const baseRateSchema = new mongoose.Schema({
  origin_zone: {
    type: String,
    required: true
  },
  destination_zone: {
    type: String,
    required: true
  },
  mode_of_transport: {
    type: String,
    enum: ['road', 'air', 'sea', 'rail'],
    required: true
  },
  weight_min: {
    type: Number,
    required: true
  },
  weight_max: {
    type: Number,
    required: true
  },
  rate_per_kg: {
    type: Number,
    required: true
  },
  fuel_surcharge_pct: {
    type: Number,
    default: 0
  },
  valid_from: {
    type: Date,
    required: true
  },
  valid_to: {
    type: Date,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BaseRate', baseRateSchema);
