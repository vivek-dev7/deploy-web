import React, { useState, useEffect } from 'react';
import './TradeSection.css';

const CACHE_DURATION = 100000; // 5 minutes in milliseconds

const TradeSection = ({ stock }) => {
  const [stockDetails, setStockDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [quantity, setQuantity] = useState('');
  const baseURL = import.meta.env.VITE_BASE_URL;

  const fetchStockDetails = async (symbol) => {
    setLoading(true);
    const cacheKey = symbol;
    const cached = localStorage.getItem(cacheKey);
  
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        setStockDetails(parsed.data);
        setLoading(false);
        return;
      }
    }
  
    try {
      const response = await fetch(`${baseURL}/api/stock/chart/${symbol}?range=1d`);
  
      if (response.status === 429) {
        console.warn('Rate limit hit. Retrying in 30 seconds...');
        setTimeout(() => fetchStockDetails(symbol), 30000);
        return;
      }
  
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const jsonResponse = await response.json();
  
      if (jsonResponse.chart?.result) {
        const result = jsonResponse.chart.result[0].meta;
        const details = {
          symbol,
          currency: result.currency || '',
          regularMarketPrice: result.regularMarketPrice?.toFixed(2) || 'N/A',
          previousClose: result.chartPreviousClose?.toFixed(2) || 'N/A',
          high: result.regularMarketDayHigh?.toFixed(2) || 'N/A',
          low: result.regularMarketDayLow?.toFixed(2) || 'N/A',
          open: result.regularMarketOpen?.toFixed(2) || 'N/A',
        };
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: details }));
        setStockDetails(details);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      if (cached) setStockDetails(JSON.parse(cached).data);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if (stock && stock.symbol) {
      // Immediately use the passed stock to match the popular list
      setStockDetails(stock);
      fetchStockDetails(stock.symbol);
      if (intervalId) clearInterval(intervalId);
      const newIntervalId = setInterval(() => {
        fetchStockDetails(stock.symbol);
      }, 60000);
      setIntervalId(newIntervalId);
      return () => clearInterval(newIntervalId);
    }
  }, [stock]);


const handleBuyStock = async (e) => {
  e.preventDefault();
  try {
      // Validate quantity
      if (!quantity || isNaN(quantity) || quantity <= 0) {
          alert('Please enter a valid quantity');
          return;
      }

      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
          alert('You need to be logged in to trade');
          return;
      }

      // Get current user and wallet balance
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const walletBalance = currentUser.wallet;
      const userEmail = currentUser.email; // Assuming user object contains email

      // Prepare trade data
      const tradePrice = stockDetails ? parseFloat(stockDetails.regularMarketPrice) : 0;
      const tradeQuantity = parseInt(quantity, 10);
      const totalCost = tradePrice * tradeQuantity;

      // To check if the values are getting passed
      // console.log("Wallet:", walletBalance, "Quantity:", tradeQuantity, "Price per stock:", tradePrice, "Total Cost:", totalCost);

      // Check if wallet has enough funds
      if (walletBalance < totalCost) {
          alert("Insufficient funds! You don't have enough points in your wallet.");
          return;
      }

      // Execute trade
      const tradeData = {
          symbol: stock.symbol,
          companyName: stock.name,
          price: tradePrice,
          quantity: tradeQuantity,
      };

      const response = await fetch(`${baseURL}/api/trades`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(tradeData),
      });

      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.message || 'Failed to execute trade');
      }

      // Deduct the total cost from the user's wallet
      const walletResponse = await fetch(`${baseURL}/api/update/tradewallet`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email: userEmail, wallet: -totalCost }) // Sending negative value
      });

      const walletResult = await walletResponse.json();

      if (!walletResponse.ok) {
          throw new Error(walletResult.message || 'Failed to update wallet balance');
      }

      // Success handling
      alert('Trade executed successfully!');
      setQuantity('');
      setShowBuyForm(false);

      // Update local storage with new wallet balance
      currentUser.wallet = walletResult.wallet;
      localStorage.setItem("user", JSON.stringify(currentUser));

  } catch (error) {
      console.error('Trade error:', error);
      alert(error.message || 'Error executing trade. Please try again.');
  }
};

  if (!stock) {
    return (
      <div className="trade-section-container">
        <div className="outer-card">
          <h2 className="trade-title">Trade Section</h2>
          <div className="trade-header">
            <h3>Please select a stock to view details & trade.</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-section-container">
      <div className="outer-card">
        <h2 className="trade-title">Trade Section</h2>
        <div className="trade-header">
          <h3>{stock.name} ({stock.symbol})</h3>
        </div>
        {loading ? (
          <p className="loading-msg">Loading stock details...</p>
        ) : stockDetails ? (
          <div className="inner-card">
            <p><strong>Current Price:</strong> {stock.currency} {stockDetails.regularMarketPrice}</p>
            <p><strong>High:</strong> {stock.currency} {stockDetails.high}</p>
            <p><strong>Low:</strong> {stock.currency} {stockDetails.low}</p>
            <p><strong>Open:</strong> {stock.currency} {stockDetails.open}</p>
            <p><strong>Previous Close:</strong> {stock.currency} {stockDetails.previousClose}</p>
            <div className="action-buttons">
              <button className="buy-btn" onClick={() => { setShowBuyForm(true); setShowSellForm(false); }}>Buy Stock</button>
            </div>
            {showBuyForm && (
              <form onSubmit={handleBuyStock} className="trade-form">
                <label>
                  Quantity:&nbsp;
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                  />
                </label>
                <button type="submit" className="confirm-btn">Confirm Buy</button>
              </form>
            )}

          </div>
        ) : (
          <p className="no-details-msg">No stock details available.</p>
        )}
      </div>
    </div>
  );
};

export default TradeSection;