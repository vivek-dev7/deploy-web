import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import "./Portfolio.css";

const TradeList = () => {
  const [rawTrades, setRawTrades] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [sellQuantity, setSellQuantity] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewFilter, setViewFilter] = useState('all');

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const controllerRef = useRef(new AbortController());
  const symbolsRef = useRef([]);
  const tableContainerRef = useRef(null);

  const baseURL = import.meta.env.VITE_BASE_URL;

  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);

  const processTrades = useCallback((trades) => {
    return trades.reduce((acc, trade) => {
      const existing = acc.find((t) => t.symbol === trade.symbol);
      if (existing) {
        existing.totalQuantity += trade.quantity;
        existing.totalCost += trade.price * trade.quantity;
        existing.avgPrice = existing.totalCost / existing.totalQuantity;
        existing.tradeIds.push(trade._id);
      } else {
        acc.push({
          symbol: trade.symbol,
          companyName: trade.companyName,
          totalQuantity: trade.quantity,
          totalCost: trade.price * trade.quantity,
          avgPrice: trade.price,
          tradeIds: [trade._id],
          tradeType: trade.tradeType,
        });
      }
      return acc;
    }, []);
  }, []);

  const groupedTrades = useMemo(
    () => processTrades(rawTrades),
    [rawTrades, processTrades]
  );

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${baseURL}/api/trades`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        signal: controllerRef.current.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setRawTrades(data);
      return data;
    } catch (error) {
      if (error.name !== "AbortError") setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuotes = useCallback(async () => {
    if (!symbolsRef.current.length) return;
    try {
      const response = await fetch(
        `${baseURL}/api/quote?symbol=${encodeURIComponent(symbolsRef.current.join(","))}`
      );
      const data = await response.json();
      
      const newQuotes = data.quoteResponse.result.reduce((acc, item) => ({
        ...acc,
        [item.symbol]: {
          currentPrice: Number(item.regularMarketPrice.toFixed(2))
        }
      }), {});

      setQuotes(newQuotes);
    } catch (error) {
      console.error("Quote error:", error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const initialize = async () => {
      const tradesData = await fetchTrades();
      const processed = processTrades(tradesData);
      symbolsRef.current = processed.map((t) => t.symbol);
      fetchQuotes();
    };

    initialize();
    const quoteInterval = setInterval(fetchQuotes, 30000);

    return () => {
      controllerRef.current.abort();
      clearInterval(quoteInterval);
      controllerRef.current = new AbortController();
    };
  }, [isAuthenticated, fetchTrades, processTrades, fetchQuotes]);

  useEffect(() => {
    symbolsRef.current = groupedTrades.map((t) => t.symbol);
    fetchQuotes();
  }, [groupedTrades, fetchQuotes]);

  const totalInvested = useMemo(() => {
    return groupedTrades.reduce((sum, t) => sum + t.totalCost, 0);
  }, [groupedTrades]);

  const totalCurrentValue = useMemo(() => {
    return groupedTrades.reduce((sum, t) => {
      const currentPrice = quotes[t.symbol]?.currentPrice ?? t.avgPrice;
      return sum + currentPrice * t.totalQuantity;
    }, 0);
  }, [groupedTrades, quotes]);

  const totalReturns = totalCurrentValue - totalInvested;
  const totalReturnsPct = totalInvested
    ? ((totalReturns / totalInvested) * 100).toFixed(2)
    : 0;

  const calculateOneDayReturn = (symbol, quantity, avgPrice) => {
    const quote = quotes[symbol];
    if (!quote) return { value: 0, percentage: 0 };

    const priceChange = quote.currentPrice - avgPrice;
    const valueChange = priceChange * quantity;
    const percentageChange = avgPrice > 0 ? (priceChange / avgPrice) * 100 : 0;

    return { 
      value: valueChange,
      percentage: percentageChange
    };
  };

  const totalOneDayReturns = useMemo(() => {
    return groupedTrades.reduce((sum, group) => {
      const oneDayReturn = calculateOneDayReturn(
        group.symbol, 
        group.totalQuantity,
        group.avgPrice
      );
      return sum + oneDayReturn.value;
    }, 0);
  }, [groupedTrades, quotes]);

  const totalOneDayReturnsPct = useMemo(() => {
    if (totalInvested <= 0) return 0;
    return (totalOneDayReturns / totalInvested) * 100;
  }, [totalOneDayReturns, totalInvested]);

  const { profitableTrades, lossTrades } = useMemo(() => {
    const profitable = [];
    const loss = [];

    groupedTrades.forEach((group) => {
      const currentPrice = quotes[group.symbol]?.currentPrice ?? group.avgPrice;
      const totalValue = currentPrice * group.totalQuantity;
      const profit = totalValue - group.totalCost;

      if (profit >= 0) {
        profitable.push(group);
      } else {
        loss.push(group);
      }
    });

    return { profitableTrades: profitable, lossTrades: loss };
  }, [groupedTrades, quotes]);

  const handleSell = useCallback(
    async (group) => {
      const quantity = Number(sellQuantity[group.symbol]);
      if (!quantity || quantity <= 0 || quantity > group.totalQuantity) {
        alert("Invalid quantity");
        return;
      }

      try {
        const sellPrice = quotes[group.symbol]?.currentPrice;
        const totalEarnings = sellPrice * quantity;

        const response = await fetch(`${baseURL}/api/trades/sell`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            symbol: group.symbol,
            quantity: quantity,
            price: sellPrice,
            companyName: group.companyName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Sale failed");
        }

        const currentUser = JSON.parse(localStorage.getItem("user"));

        const walletResponse = await fetch(`${baseURL}/api/update/tradewallet`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ email: currentUser.email, wallet: totalEarnings }),
        });

        const walletResult = await walletResponse.json();

        if (!walletResponse.ok) {
          throw new Error(walletResult.message || "Failed to update wallet balance");
        }

        currentUser.wallet = walletResult.wallet;
        localStorage.setItem("user", JSON.stringify(currentUser));

        const updatedTrades = await fetchTrades();
        setRawTrades(updatedTrades);
        setSellQuantity((prev) => ({ ...prev, [group.symbol]: "" }));
      } catch (error) {
        alert(`Sale failed: ${error.message}`);
        console.error("Sale error:", error);
        await fetchTrades();
      }
    },
    [fetchTrades, quotes, sellQuantity]
  );

  const handleQuantityChange = (e, group) => {
    const value = Math.max(
      0,
      Math.min(Number(e.target.value), group.totalQuantity)
    );
    setSellQuantity((prev) => ({
      ...prev,
      [group.symbol]: value || "",
    }));
  };

  const renderRow = (group) => {
    const quote = quotes[group.symbol];
    const currentPrice = quote?.currentPrice ?? group.avgPrice;
    const totalValue = currentPrice * group.totalQuantity;
    const profit = totalValue - group.totalCost;
    const tReturns = (totalValue - group.totalCost).toFixed(2);
    const profitPct = group.totalCost
      ? ((profit / group.totalCost) * 100).toFixed(2)
      : 0;
    const quantityValue = sellQuantity[group.symbol] || "";
    const oneDayReturn = calculateOneDayReturn(
      group.symbol, 
      group.totalQuantity,
      group.avgPrice
    );

    return (
      <motion.tr
        key={group.symbol}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <td className="company-cell">
          <div className="company-name">{group.companyName}</div>
          <div className="company-sub">
            {group.totalQuantity} shares • Avg ₹{group.avgPrice.toFixed(2)}
          </div>
        </td>

        <td className="price-cell">₹{currentPrice.toFixed(2)}</td>

        <td className={`returns-cell ${profitPct >= 0 ? "positive" : "negative"}`}>
          <span className="returns-value">
            {profit >= 0 ? "₹+" : "₹-"}
            {Math.abs(tReturns)}
          </span>
          <span className="returns-percentage">
            ({profitPct >= 0 ? "+" : ""}
            {profitPct}%)
          </span>
        </td>

        <td className={`oneday-cell ${oneDayReturn.value >= 0 ? "positive" : "negative"}`}>
          <span className="oneday-value">
            {oneDayReturn.value >= 0 ? "₹+" : "₹-"}
            {Math.abs(oneDayReturn.value).toFixed(2)}
          </span>
          <span className="oneday-percentage">
            ({oneDayReturn.percentage >= 0 ? "+" : ""}
            {oneDayReturn.percentage.toFixed(2)}%)
          </span>
        </td>

        <td className="value-cell">
          <div className="current-value-table">₹{totalValue.toFixed(2)}</div>
          <div className="invested-value">
            (₹{group.totalCost.toFixed(2)})
          </div>
        </td>

        <td className="quantity-cell">
          <input
            type="number"
            min="1"
            max={group.totalQuantity}
            value={quantityValue}
            onChange={(e) => handleQuantityChange(e, group)}
            onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
          />
        </td>

        <td className="action-cell">
          <button
            className={`sell-btn ${quantityValue ? "active" : ""}`}
            onClick={() => handleSell(group)}
            disabled={!quantityValue}
          >
            Sell
          </button>
        </td>
      </motion.tr>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="portfolio-section">
        <h2>Portfolio Overview</h2>
        <div className="auth-message">Please log in to view your portfolio</div>
      </div>
    );
  }

  const filteredTrades = groupedTrades.filter(trade => {
    if (viewFilter === 'all') return true;
    const currentPrice = quotes[trade.symbol]?.currentPrice ?? trade.avgPrice;
    const totalValue = currentPrice * trade.totalQuantity;
    const profit = totalValue - trade.totalCost;
    return viewFilter === 'profit' ? profit >= 0 : profit < 0;
  });

  return (
    <div className="portfolio-section compact">
      <div className="portfolio-header">
        <div className="header-left">
          <div className="subtext">My Portfolio Value</div>
          <div className="current-value">
            ₹{totalCurrentValue.toFixed(2)}
          </div>
        </div>

        <div className="header-right">
          <div className="stat">
            <span>Invested Value</span>
            <strong>₹{totalInvested.toFixed(2)}</strong>
          </div>
          <div className="stat">
            <span>Total Returns</span>
            <strong className={totalReturns >= 0 ? "positive" : "negative"}>
              ₹{totalReturns.toFixed(2)} ({totalReturnsPct}%)
            </strong>
          </div>
          <div className="stat">
            <span>1D Returns</span>
            <strong className={totalOneDayReturns >= 0 ? "positive" : "negative"}>
              ₹{totalOneDayReturns.toFixed(2)} ({totalOneDayReturnsPct.toFixed(2)}%)
            </strong>
          </div>
        </div>
      </div>

      <div className="filter-buttons">
        <button 
          className={`filter-btn ${viewFilter === 'all' ? 'active' : ''}`}
          onClick={() => setViewFilter('all')}
        >
          Show All
        </button>
        <button 
          className={`filter-btn profit ${viewFilter === 'profit' ? 'active' : ''}`}
          onClick={() => setViewFilter('profit')}
        >
          Profit
        </button>
        <button 
          className={`filter-btn loss ${viewFilter === 'loss' ? 'active' : ''}`}
          onClick={() => setViewFilter('loss')}
        >
          Loss
        </button>
      </div>

      {loading ? (
        <div className="loading-pulse">Loading portfolio data...</div>
      ) : error ? (
        <div className="error-message">⚠️ {error}</div>
      ) : groupedTrades.length === 0 ? (
        <div className="empty-portfolio">Your portfolio is empty. Start trading!</div>
      ) : filteredTrades.length === 0 ? (
        <div className="no-trades-message">
          <img src="/no-trades.svg" alt="No trades" className="no-trades-image" />
          <p>No {viewFilter === 'profit' ? 'profitable' : 'loss-making'} trades found</p>
        </div>
      ) : (
        <div className="table-scroll-container" ref={tableContainerRef}>
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Market Price</th>
                <th>T Returns</th>
                <th>1D Return</th>
                <th>
                  <div>Current Value</div>
                  <div style={{ fontSize: "11px", color: "grey", marginTop: "-2px" }}>
                    (Invested Value)
                  </div>
                </th>
                <th>Sell Qty</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map(renderRow)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default React.memo(TradeList);