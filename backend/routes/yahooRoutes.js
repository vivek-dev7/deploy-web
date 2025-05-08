const express = require('express');
const router = express.Router();
const axios = require('axios');

// Route: GET /api/stock/chart/:symbol
router.get('/chart/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const range = req.query.range || '6mo';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}&t=${Date.now()}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error("Yahoo API error:", err.message);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

// Route: GET /api/stock/search
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`;
    const response = await axios.get(yahooUrl);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

module.exports = router;