const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  companyName: { type: String, required: true },
});

const watchlist = mongoose.model('watchlist', watchlistSchema);
module.exports = watchlist;
