const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const Transaction = require('../models/Transaction')
const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all trades for logged-in user
router.get('/', authenticateUser, async (req, res) => {
  try {
    // const trades = await Trade.find({ user: req.userId }).sort({ tradeTime: -1 });

    // included attribute tradeType to only fetch transactions with 'BUY' attribute
    const trades = await Trade.find({ user: req.userId, tradeType: 'BUY' }).sort({ tradeTime: -1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trades' });
  }
});

// Buy stock function
router.post('/', authenticateUser, async (req, res) => {
  try {
    const tradeData = {
      ...req.body,
      user: req.userId,
      tradeType: 'BUY'
    }; 
    
    const trade = new Trade(tradeData);
    await trade.save();

    // creating new instance of transaction for fetching transaction history
    const transactionData = new Transaction(tradeData);
    await transactionData.save();

    res.status(201).json(trade);
  } catch (error) {
    res.status(500).json({ message: 'Error executing trade' });
  }
});

// Delete stock function
router.post('/sell', authenticateUser, async (req, res) => {
  try {
    const { symbol, quantity, price, companyName } = req.body;
    
    // Validate input
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    // Get all buy trades for this stock
    const buyTrades = await Trade.find({
      user: req.userId,
      symbol,
      tradeType: 'BUY'
    }).sort({ tradeTime: 1 });

    // Calculate total available shares
    const totalAvailable = buyTrades.reduce((sum, trade) => sum + trade.quantity, 0);
    
    if (totalAvailable < quantity) {
      return res.status(400).json({ message: 'Insufficient shares to sell' });
    }

    // Delete buy trades until we fulfill the sell quantity
    let remaining = quantity;
    for (const trade of buyTrades) {
      if (remaining <= 0) break;
      
      if (trade.quantity <= remaining) {
        await Trade.findByIdAndDelete(trade._id);
        remaining -= trade.quantity;
      } else {
        await Trade.findByIdAndUpdate(trade._id, {
          $inc: { quantity: -remaining }
        });
        remaining = 0;
      }
    }

    // saving the transaction history in transaction table
    const transaction = new Transaction({
      user: req.userId,
      symbol,
      quantity,
      price,
      companyName,
      tradeType: 'SELL',
      tradeTime: new Date()
    });

    await transaction.save();

    res.status(200).json({ message: 'Sale completed successfully' });
  } catch (error) {
    console.error('Sell error:', error);
    res.status(500).json({ message: 'Error processing sale' });
  }
});

// Get all transactions for logged-in user
router.get('/transactions', authenticateUser, async (req, res) => {
  try {
    const trades = await Transaction.find({ user: req.userId }).sort({ tradeTime: -1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trades' });
  }
});

// Chat-GPT updations

// router.get('/transactions', authenticateUser, async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const trades = await Transaction.find({ user: req.userId })
//       .sort({ tradeTime: -1 })
//       .select('symbol companyName price quantity tradeType tradeTime')
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     const totalTrades = await Transaction.countDocuments({ user: req.userId });

//     res.json({ trades, totalTrades });
//   } catch (error) {
//     console.error('Error fetching trades:', error);
//     res.status(500).json({ message: 'Error fetching trades' });
//   }
// });


module.exports = router;
