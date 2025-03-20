const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Ensure `_id` is auto-generated
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  formattedPrice: { type: String, required: true },
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  purchased: { type: Boolean, default: false },
});

module.exports = mongoose.model('Item', itemSchema);
