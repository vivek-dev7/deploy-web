const express = require('express');
const yahooFinance = require('yahoo-finance2').default;

const router = express.Router();

// Fetch stock quotes
router.get('/', async (req, res) => {
  const symbolParam = req.query.symbol;
  if (!symbolParam) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  try {
    const symbols = [...new Set(symbolParam.split(',').map(s => s.trim()))]; // Remove duplicates
    if (symbols.length === 0) {
      return res.status(400).json({ error: 'No valid symbols provided' });
    }

    const quoteData = await yahooFinance.quote(symbols);
    if (!quoteData) {
      return res.status(500).json({ error: 'No data received from Yahoo Finance' });
    }

    const formattedResult = Array.isArray(quoteData) ? 
      quoteData.map(quote => formatQuote(quote)) : 
      [formatQuote(quoteData)];

    res.json({ quoteResponse: { result: formattedResult } });
  } catch (error) {
    console.error('Error fetching quote:', error);
    if (error instanceof SyntaxError) {
      res.status(500).json({ error: 'Invalid response format from Yahoo Finance' });
    } else {
      res.status(500).json({ error: 'Failed to fetch quote. Please try again later.' });
    }
  }
});

// Helper function to format quotes
const formatQuote = (quote) => ({
  symbol: quote.symbol,
  currency: quote.currency,
  regularMarketPrice: quote.regularMarketPrice ?? 0, // Default to 0 if not available
  regularMarketPreviousClose: quote.regularMarketPreviousClose,
  regularMarketDayHigh: quote.regularMarketDayHigh,
  regularMarketDayLow: quote.regularMarketDayLow,
  regularMarketOpen: quote.regularMarketOpen,
});

module.exports = router;
