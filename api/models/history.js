const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
  action: { type: String, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: false },
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  previousState: { type: mongoose.Schema.Types.Mixed, required: false },
  
});

module.exports = mongoose.model('History', historySchema);
