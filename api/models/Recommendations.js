// models/Recommendation.js
const mongoose = require('mongoose');

const recommendationSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  frequency: { type: Number, required: true }, // Average days between purchases
  lastPurchased: { type: Date, required: false },
  purchaseHistory: [{ 
    date: Date,
    quantity: { type: Number, default: 1 },
    price: { type: Number }
  }], // Enhanced purchase history with more features
  confidence: { type: Number, required: true, default: 0.5 }, // Confidence score (0-1)
  imageUrl: { type: String, required: false },
  // New ML-related fields
  featureVector: { type: [Number], default: [] }, // Numerical representation for ML algorithms
  seasonalFactors: { 
    dayOfWeek: { type: [Number], default: [0,0,0,0,0,0,0] }, // Purchase counts by day of week
    monthOfYear: { type: [Number], default: [0,0,0,0,0,0,0,0,0,0,0,0] } // Purchase counts by month
  },
  similarItems: [{ 
    itemName: String, 
    score: Number 
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for faster lookup by user
recommendationSchema.index({ userId: 1, itemName: 1 }, { unique: true });
recommendationSchema.index({ userId: 1, category: 1 }); // For category-based queries

module.exports = mongoose.model('Recommendation', recommendationSchema);