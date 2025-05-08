import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { Bookmark, CheckCircle, XCircle } from 'lucide-react';
import { Mosaic } from 'react-loading-indicators';
import TradeSection from './TradeSection';
import NewsSection from './NewsSection';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [range, setRange] = useState('6mo');
  const [searchParams] = useSearchParams();
  const [isSaved, setIsSaved] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const symbolParam = searchParams.get('symbol');
    const nameParam = searchParams.get('name');

    if (symbolParam && nameParam) {
      const stock = {
        symbol: symbolParam,
        name: nameParam,
        logo_path: 'logo_images/default.png'
      };
      setSelectedStock(stock);
      fetchStockChartData(stock.symbol);
      checkWatchlistStatus(stock.symbol); // ✅ Check on initial load
    }
  }, [searchParams]);

  // ✅ Check if the stock exists in the user's watchlist
  const checkWatchlistStatus = async (symbol) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) return;

    try {
      const response = await axios.get(
        `${baseURL}/api/watchlist/check/${currentUser.id}/${symbol}`
      );
      setIsSaved(response.data.exists);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    }
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchStockChartData = async (symbol, newRange = range) => {
    setIsLoading(true);
    setRange(newRange);
    try {
      const response = await fetch(`${baseURL}/api/stock/chart/${symbol}?range=${encodeURIComponent(newRange)}`);
      const stockData = await response.json();

      if (!stockData.chart?.result?.[0]?.timestamp) {
        setToast({
          show: true,
          message: 'No historical data available',
          type: 'error'
        });
        return;
      }

      const result = stockData.chart.result[0];
      const timestamps = result.timestamp.map(ts => new Date(ts * 1000).toISOString());
      const prices = result.indicators.quote[0].close || [];
      const latestPrice = prices.length > 0 ? prices[prices.length - 1] : 0;

      const chartDataObj = {
        options: {
          chart: {
            id: 'stock-chart',
            type: 'area',
            toolbar: { show: true }
          },
          colors: ['#1a73e8'],
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.3,
              stops: [0, 90, 100]
            }
          },
          xaxis: {
            type: 'datetime',
            labels: { style: { colors: '#666', fontFamily: 'Poppins, sans-serif' } }
          },
          yaxis: {
            labels: {
              formatter: (value) => value.toFixed(2),
              style: { colors: '#666', fontFamily: 'Poppins, sans-serif' }
            }
          },
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth', width: 2 },
          tooltip: { theme: 'light', x: { format: 'dd MMM yyyy' } },
          grid: {
            borderColor: '#f1f1f1',
            row: { colors: ['transparent', 'transparent'], opacity: 0.5 }
          },
        },
        series: [{ name: symbol, data: timestamps.map((time, index) => ({ x: time, y: prices[index] })) }],
      };
      setChartData(chartDataObj);

      setSelectedStock(prev => ({
        ...prev,
        symbol,
        price: latestPrice.toFixed(2),
      }));
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
      setToast({
        show: true,
        message: 'Failed to load chart data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Toggle watchlist: add or remove with confirmation
  const handleWatchlistToggle = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      setToast({
        show: true,
        message: 'Please login to manage watchlist',
        type: 'error'
      });
      return;
    }

    if (isSaved) {
      const confirmRemove = window.confirm("Remove this stock from your watchlist?");
      if (!confirmRemove) return;

      try {
        await axios.delete(`${baseURL}/api/watchlist/remove`, {
          data: {
            user: currentUser.id,
            symbol: selectedStock.symbol
          }
        });

        setToast({
          show: true,
          message: 'Removed from watchlist',
          type: 'success'
        });
        setIsSaved(false);
      } catch (error) {
        setToast({
          show: true,
          message: error.response?.data?.message || 'Error removing from watchlist',
          type: 'error'
        });
      }

    } else {
      try {
        await axios.post(`${baseURL}/api/watchlist/add`, {
          user: currentUser.id,
          symbol: selectedStock.symbol,
          companyName: selectedStock.name,
        });

        setToast({
          show: true,
          message: 'Added to watchlist',
          type: 'success'
        });
        setIsSaved(true);
      } catch (error) {
        setToast({
          show: true,
          message: error.response?.data?.message || 'Error adding to watchlist',
          type: 'error'
        });
      }
    }
  };

  return (
    <div className="dashboard-container">
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      )}

      {selectedStock && (
        <section className="dashboard-content">
          {isLoading ? (
            <div className="mosaic-loader-container">
              <Mosaic color="#5f6ad9" size="large" text="" textColor="" />
            </div>
          ) : chartData && (
            <div className="dashboard-chart-section">
              <div className="chart-header">
                <div className="chart-title">
                  <h2>{selectedStock.name} ({selectedStock.symbol})</h2>
                  <p className="stock-price">Current Price: ₹{selectedStock.price}</p>
                </div>
                <button className="bookmark-btn" onClick={handleWatchlistToggle} title={isSaved ? "Remove from Watchlist" : "Add to Watchlist"}>
                  Watchlist<Bookmark size={20} className={isSaved ? "bookmark-filled" : ""} />
                </button>
              </div>

              <Chart options={chartData.options} series={chartData.series} type="area" height={350} />

              <div className="dashboard-time-period">
                <button onClick={() => fetchStockChartData(selectedStock.symbol, '1wk')} className={range === '1wk' ? 'active' : ''}>1w</button>
                <button onClick={() => fetchStockChartData(selectedStock.symbol, '1mo')} className={range === '1mo' ? 'active' : ''}>1m</button>
                <button onClick={() => fetchStockChartData(selectedStock.symbol, '6mo')} className={range === '6mo' ? 'active' : ''}>6m</button>
                <button onClick={() => fetchStockChartData(selectedStock.symbol, '1y')} className={range === '1y' ? 'active' : ''}>1y</button>
                <button onClick={() => fetchStockChartData(selectedStock.symbol, '5y')} className={range === '5y' ? 'active' : ''}>5y</button>
              </div>
            </div>
          )}
          <div className="dashboard-trade-section">
            <TradeSection stock={selectedStock} />
          </div>
        </section>
      )}
      {selectedStock && <NewsSection stockSymbol={selectedStock.symbol} />}
    </div>
  );
};

export default Dashboard;