const mongoose = require('mongoose');

const listSchema = mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Settings - TBD
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'History' }], // Add this if missing
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  imageUrl: { type: String, required: false },
  joinCode: {
    type: String,
    required: true,
    unique: true,
  },
  settings: {
    continious: { type: Boolean, default: false },
    assignItems: { type: Boolean, default: false },
  }
});

module.exports = mongoose.models.List || mongoose.model('List', listSchema);
