import React, { useEffect, useState } from 'react';
import './NewsSection.css';

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const API_KEY = 'cv7j2n1r01qpecig65hgcv7j2n1r01qpecig65i0'; // Replace with your API key
      const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`);
      const data = await response.json();

      // Filter news related to Indian stock market (NSE, BSE, Sensex, Nifty, etc.)
      const indianStockNews = data.filter(article =>
        article.headline.toLowerCase().includes('nifty') ||
        article.headline.toLowerCase().includes('sensex') ||
        article.headline.toLowerCase().includes('bse') ||
        article.headline.toLowerCase().includes('nse') ||
        article.headline.toLowerCase().includes('india')
      );

      setNews(indianStockNews.slice(0, 5)); // Show top 5 Indian stock news
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="news-section">
      <h2>Latest Indian Stock Market News</h2>
      {loading ? <p>Loading news...</p> : (
        <ul>
          {news.length > 0 ? (
            news.map((article, index) => (
              <li key={index} className="news-item">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <img src={article.image || 'default-news.jpg'} alt="news" />
                  <div>
                    <h3>{article.headline}</h3>
                    <p>{article.source}</p>
                  </div>
                </a>
              </li>
            ))
          ) : <p>No Indian stock news available.</p>}
        </ul>
      )}
    </div>
  );
};

export default NewsSection;
