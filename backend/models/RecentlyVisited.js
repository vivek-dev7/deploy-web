const mongoose = require('mongoose');

const recentlyVisitedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  companyName: { type: String, required: true },
  visitedAt: { type: Date, default: Date.now }, // Optional: To track when the item was visited
});

const recentlyVisited = mongoose.model('recentlyVisited', recentlyVisitedSchema);
module.exports = recentlyVisited;
