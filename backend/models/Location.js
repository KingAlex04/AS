const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  address: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['checkin', 'checkout', 'tracking'],
    default: 'tracking'
  }
});

// Index for efficient queries
LocationSchema.index({ userId: 1, timestamp: -1 });
LocationSchema.index({ companyId: 1, timestamp: -1 });

module.exports = mongoose.model('Location', LocationSchema); 