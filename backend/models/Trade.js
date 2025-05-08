// Changed tradeSchema by adding user attribute, tradeType attribute

const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  companyName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  tradeType: { type: String, enum: ['BUY', 'SELL'], required: true },
  tradeTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trade', tradeSchema);

