// models/Recommendation.js
const mongoose = require('mongoose');

const recommendationSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  frequency: { type: Number, required: true }, // Average days between purchases
  lastPurchased: { type: Date, required: false },
  purchaseHistory: [{ date: Date }], // Track purchase dates for pattern analysis
  confidence: { type: Number, required: true, default: 0.5 }, // Confidence score (0-1)
  imageUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for faster lookup by user
recommendationSchema.index({ userId: 1, itemName: 1 }, { unique: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);