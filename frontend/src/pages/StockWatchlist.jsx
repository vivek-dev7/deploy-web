  import React, { useEffect, useState, useRef, useCallback } from "react";
  import { useNavigate } from "react-router-dom";
  import axios from "axios";
  import { toast } from "react-toastify";
  import "./StockWatchlist.css";
  import SparklineChart from "../components/SparklineChart";

  const CACHE_DURATION = 100000; // 5 minutes cache
  const REFRESH_INTERVAL = 5000; // 5 seconds (like Groww)
  const HISTORY_CACHE_DURATION = 300000; // 5 minutes for historical data

  const StockWatchlist = ({ userId }) => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [priceHistory, setPriceHistory] = useState({});
    const [priceData, setPriceData] = useState({});
    const isInitialMount = useRef(true);
    const watchlistRef = useRef([]);
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_BASE_URL;

    // Track previous prices for animation
    const [prevPrices, setPrevPrices] = useState({});

    // Function to fetch historical price data for sparkline with caching
    const fetchHistoricalData = async (symbol) => {
      // Check cache first
      const historyCacheKey = `${symbol}_history`;
      const cachedHistory = localStorage.getItem(historyCacheKey);

      if (cachedHistory) {
        const parsed = JSON.parse(cachedHistory);
        if (Date.now() - parsed.timestamp < HISTORY_CACHE_DURATION) {
          return parsed.data;
        }
      }

      try {
        const response = await fetch(`${baseURL}/api/stock/chart/${symbol}?range=5d`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const jsonResponse = await response.json();
        if (jsonResponse.chart?.result) {
          // Extract closing prices from the response
          const closePrices = jsonResponse.chart.result[0].indicators.quote[0].close || [];

          // Filter out null values
          const validPrices = closePrices.filter(price => price !== null);

          // Cache the historical data
          localStorage.setItem(
            historyCacheKey,
            JSON.stringify({
              timestamp: Date.now(),
              data: validPrices
            })
          );

          return validPrices;
        }
        return generateMockData();
      } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error);
        return generateMockData();
      }
    };

    // Generate mock data for testing or when API fails
    const generateMockData = () => {
      const data = [];
      let basePrice = 100 + Math.random() * 50;

      for (let i = 0; i < 20; i++) {
        basePrice += (Math.random() - 0.5) * 5;
        data.push(parseFloat(basePrice.toFixed(2)));
      }

      return data;
    };

    // Initial fetch of watchlist items (only happens once)
    const fetchWatchlistItems = async () => {
      setLoading(true);
      try {
        const watchlistRes = await axios.get(`${baseURL}/api/watchlist/${currentUser.id}`);
        const watchlistData = Array.isArray(watchlistRes.data) ? watchlistRes.data : [];

        if (watchlistData.length === 0) {
          setWatchlist([]);
          watchlistRef.current = [];
          setLoading(false);
          return;
        }

        // Set watchlist items with basic data
        setWatchlist(watchlistData);
        watchlistRef.current = watchlistData;

        // Now fetch the initial price and history data
        await fetchPricesAndHistory(watchlistData);

      } catch (error) {
        console.error("Error fetching watchlist items:", error);
        toast.error("Failed to load watchlist. Please try again.");
        setWatchlist([]);
        watchlistRef.current = [];
      } finally {
        setLoading(false);
      }
    };

    // Function to fetch only prices and history data
    const fetchPricesAndHistory = async (stocks = null) => {
      const stocksToUpdate = stocks || watchlistRef.current;

      if (!stocksToUpdate || stocksToUpdate.length === 0) return;

      // Store current prices for animation reference
      const currentPriceMap = {};
      Object.entries(priceData).forEach(([symbol, data]) => {
        if (data && data.currentPrice) {
          currentPriceMap[symbol] = data.currentPrice;
        }
      });

      if (Object.keys(currentPriceMap).length > 0) {
        setPrevPrices(currentPriceMap);
      }

      try {
        // Fetch historical data for sparklines
        const historyPromises = stocksToUpdate.map(stock => fetchHistoricalData(stock.symbol));
        const historicalResults = await Promise.all(historyPromises);

        const historyMap = {};
        stocksToUpdate.forEach((stock, index) => {
          historyMap[stock.symbol] = historicalResults[index];
        });
        setPriceHistory(prev => ({ ...prev, ...historyMap }));

        // Fetch current prices and price changes
        const pricePromises = stocksToUpdate.map(async (stock) => {
          const cacheKey = stock.symbol;
          const cached = localStorage.getItem(cacheKey);

          if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < CACHE_DURATION) {
              return [stock.symbol, {
                currentPrice: parsed.data.regularMarketPrice,
                change: parsed.data.change,
                changePercent: parsed.data.changePercent
              }];
            }
          }

          try {
            const response = await fetch(`${baseURL}/api/stock/chart/${stock.symbol}?range=1d`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const jsonResponse = await response.json();
            if (jsonResponse.chart?.result) {
              const meta = jsonResponse.chart.result[0].meta;
              const price = meta.regularMarketPrice?.toFixed(2) || null;
              const prevClose = meta.chartPreviousClose;
              const change = (price - prevClose).toFixed(2);
              const changePercent = ((change / prevClose) * 100).toFixed(2);

              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  timestamp: Date.now(),
                  data: {
                    regularMarketPrice: price,
                    change: change,
                    changePercent: changePercent
                  },
                })
              );

              return [stock.symbol, {
                currentPrice: price,
                change: change,
                changePercent: changePercent
              }];
            }
          } catch (error) {
            console.error(`Error fetching price for ${stock.symbol}:`, error);
            // Get current data if available, or defaults
            const current = priceData[stock.symbol] || {
              currentPrice: null,
              change: '0.00',
              changePercent: '0.00'
            };
            return [stock.symbol, current];
          }
        });

        const priceResults = await Promise.all(pricePromises);

        // Convert array of results to object
        const newPriceData = {};
        priceResults.forEach(result => {
          if (result) {
            const [symbol, data] = result;
            newPriceData[symbol] = data;
          }
        });

        // Update price data without re-rendering the whole list
        setPriceData(prev => ({ ...prev, ...newPriceData }));

      } catch (error) {
        console.error("Error updating prices and history:", error);
      }
    };

    // Initial fetch on mount
    useEffect(() => {
      fetchWatchlistItems();

      // Set interval to update only prices and charts every 5 seconds
      const interval = setInterval(() => {
        fetchPricesAndHistory();
      }, REFRESH_INTERVAL);

      return () => clearInterval(interval);
    }, [userId]);

    const handleStockClick = async (symbol, name) => {
      try {
        // Replace with actual user ID from context/auth
        const userId = currentUser.id;

        // Call the backend to add or update the recently visited entry
        await axios.post(`${baseURL}/api/recentlyVisited/add`, {
          user: userId,
          symbol,
          companyName: name,
        });

        // Navigate to the stock's dashboard
        navigate(`/dashboard?symbol=${encodeURIComponent(symbol)}&name=${encodeURIComponent(name)}`);
      } catch (error) {
        console.error('Failed to add recently visited entry:', error);
      }
    };

    // Determine price change animation class
    const getPriceChangeClass = (symbol, currentPrice) => {
      if (!prevPrices[symbol] || !currentPrice) return "";
      const prevPrice = parseFloat(prevPrices[symbol]);
      const currPrice = parseFloat(currentPrice);

      if (currPrice > prevPrice) return "price-up";
      if (currPrice < prevPrice) return "price-down";
      return "";
    };

    // Format change and change percentage with '+' for positive values
    const formatChange = (value) => {
      if (!value) return "+₹0.00";
      return parseFloat(value) >= 0 ? `+₹${value}` : `-₹${Math.abs(value)}`;
    };

    const formatChangePercent = (percent) => {
      if (!percent) return "+0.00%";
      return parseFloat(percent) >= 0 ? `+${percent}%` : `${percent}%`;
    };

    return (
      <>
        {loading ? (
          <p className="loading-state">Loading prices...</p>
        ) : watchlist.length > 0 ? (
          watchlist.map((stock) => {
            const stockData = priceHistory[stock.symbol] || [];
            const prices = priceData[stock.symbol] || {};
            const isPositive = parseFloat(prices.change) >= 0;

            return (
              <div
                key={stock._id}
                className="watchlist-item"
                onClick={() => handleStockClick(stock.symbol, stock.companyName)}
              >
                <div className="stock-info">
                  <h3 className="stock-name">{stock.companyName}</h3>
                </div>

                {/* Sparkline Chart */}
                <div className="stock-sparkline">
                  {stockData.length > 0 && (
                    <SparklineChart
                      data={stockData}
                      color={isPositive ? "#0ecb81" : "#f6465d"}
                      width={80}
                      height={35}
                    />
                  )}
                </div>

                <div className="stock-price-info">
                  <p className={`stock-price ${getPriceChangeClass(stock.symbol, prices.currentPrice)}`}>
                    {prices.currentPrice !== null && prices.currentPrice !== undefined
                      ? `₹${prices.currentPrice}`
                      : "N/A"}
                  </p>
                  <div className={`stock-returns ${isPositive ? 'positive' : 'negative'}`}>
                    {formatChange(prices.change)} ({formatChangePercent(prices.changePercent)})
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="empty-state">No stocks in your watchlist.</p>
        )}
      </>
    );
  };

  export default StockWatchlist;