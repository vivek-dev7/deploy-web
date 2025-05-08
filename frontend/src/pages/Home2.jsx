import React, { useEffect, useState } from 'react';
import { Pin, Newspaper, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StockWatchlist from './StockWatchlist'; // Import the component
import RecentlyVisited from '../components/RecentlyVisited';
import './Home2.css';

let cachedData = {
  nifty: null,
  sensex: null,
  bankNifty: null,
  news: null,
  timestamp: 0,
};

const Home2 = () => {
  const navigate = useNavigate();
  const [niftyData, setNiftyData] = useState(null);
  const [sensexData, setSensexData] = useState(null);
  const [bankNiftyData, setBankNiftyData] = useState(null);
  const [news, setNews] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const baseURL = import.meta.env.VITE_BASE_URL;

  const fetchIndexData = async (symbol, setData, cacheKey) => {
    try {
      const response = await fetch(`${baseURL}/api/stock/chart/${symbol}?range=1d`);
      const stockData = await response.json();

      if (stockData?.chart?.result?.[0]?.meta) {
        const meta = stockData.chart.result[0].meta;
        const change = meta.regularMarketPrice - meta.chartPreviousClose;
        const changePercent = (change / meta.chartPreviousClose) * 100;
        const result = {
          currentPrice: meta.regularMarketPrice?.toFixed(2) || 'N/A',
          change: change.toFixed(2),
          changePercent: changePercent.toFixed(2),
          currency: meta.currency || '₹',
        };
        setData(result);
        cachedData[cacheKey] = result;
      }
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
      setData({ currentPrice: 'N/A', change: '0.00', changePercent: '0.00', currency: '₹' });
    }
  };


  const fetchNews = async () => {
    try {
      const response = await fetch(`${baseURL}/api/news`);
      const data = await response.json();
      console.log('News API response:', data); // Add this to verify structure
      const newsArray = Array.isArray(data) ? data : data.news;
      const top6News = Array.isArray(newsArray) ? newsArray.slice(0, 6) : [];
  
      setNews(top6News);
      cachedData.news = top6News;
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    }
  };
  

  useEffect(() => {
    const loadData = () => {
      const now = Date.now();
      if (now - cachedData.timestamp < 60000) {
        setNiftyData(cachedData.nifty);
        setSensexData(cachedData.sensex);
        setBankNiftyData(cachedData.bankNifty);
        setNews(cachedData.news || []);
        return;
      }
      fetchIndexData('^NSEI', setNiftyData, 'nifty');
      fetchIndexData('^BSESN', setSensexData, 'sensex');
      fetchIndexData('^NSEBANK', setBankNiftyData, 'bankNifty');
      fetchNews();
      cachedData.timestamp = now;
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home2-page">
      {/* Market Indices */}
      <div className="indices-container">
        <div className="index-card">
          <h3>NIFTY 50</h3>
          <div className="index-value">
            {niftyData ? `${niftyData.currency} ${niftyData.currentPrice}` : 'Loading...'}
          </div>
          <div className={`index-change ${niftyData?.change >= 0 ? 'positive' : 'negative'}`}>
            {niftyData ? `${niftyData.change} (${niftyData.changePercent}%)` : '0.00 (0.00%)'}
          </div>
        </div>
        <div className="index-card">
          <h3>SENSEX</h3>
          <div className="index-value">
            {sensexData ? `${sensexData.currency} ${sensexData.currentPrice}` : 'Loading...'}
          </div>
          <div className={`index-change ${sensexData?.change >= 0 ? 'positive' : 'negative'}`}>
            {sensexData ? `${sensexData.change} (${sensexData.changePercent}%)` : '0.00 (0.00%)'}
          </div>
        </div>
        <div className="index-card">
          <h3>BANKNIFTY</h3>
          <div className="index-value">
            {bankNiftyData ? `${bankNiftyData.currency} ${bankNiftyData.currentPrice}` : 'Loading...'}
          </div>
          <div className={`index-change ${bankNiftyData?.change >= 0 ? 'positive' : 'negative'}`}>
            {bankNiftyData ? `${bankNiftyData.change} (${bankNiftyData.changePercent}%)` : '0.00 (0.00%)'}
          </div>
        </div>
      </div>

      <div className="recently-visited-container">
        <h2 className="section-title flex items-center gap-1">
          Recently Visited <Pin className="w-5 h-5 text-black-600" />
        </h2>
        <RecentlyVisited />
      </div>


      {/* Watchlist and News Sections */}
      <div className="watchlist-news-container">
        {/* News Section */}
        <div className="news-container">
          <h2 className="section-title flex items-center gap-1">
            Market News <Newspaper className="w-5 h-5 text-gray-600" />
          </h2>
          <div className="news-list">
            {news.length > 0 ? (
              news.map((article, index) => (
                <div key={index} className="news-item">
                  <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link">
                    <h3 className="news-title">{article.title}</h3>
                  </a>
                </div>
              ))
            ) : (
              <div className="loading-news">Loading market news...</div>
            )}
          </div>
        </div>

        {/* Watchlist Section */}
        <div className="watchlist-container">
          <h2 className="section-title flex items-center gap-1">
            Your Watchlist <Star className="w-5 h-5 text-yellow-500" />
          </h2>
          <div className="watchlist-scroll">
            <StockWatchlist userId={currentUser?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home2;