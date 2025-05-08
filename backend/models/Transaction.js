// Created a new table called transaction to manage the order history of user
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  companyName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  tradeType: { type: String, enum: ['BUY', 'SELL'], required: true },
  tradeTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
