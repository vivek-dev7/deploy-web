import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './RecentlyVisited.css';

const RecentlyVisited = ({ userId }) => {
  const [recent, setRecent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchRecentlyVisited = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${baseURL}/api/recentlyVisited/${currentUser.id}`);
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        const sortedData = data.sort((a, b) =>
          new Date(b.createdAt || b.timestamp || b.lastViewed) -
          new Date(a.createdAt || a.timestamp || a.lastViewed)
        );

        setRecent(sortedData.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch recently visited:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchRecentlyVisited();
    }
  }, [userId]);

  const handleClick = (symbol, name) => {
    navigate(`/dashboard?symbol=${encodeURIComponent(symbol)}&name=${encodeURIComponent(name)}`, {
      state: {
        symbol,
        name,
        fromRecent: true
      }
    });
  };

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = 300;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="recent-container compact">
        <div className="skeleton-loader">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recent.length === 0) {
    return (
      <div className="recent-container compact empty-state">
        <div className="empty-icon">📊</div>
        <h3>No Recent Activity</h3>
        <p>Stocks you view will appear here</p>
      </div>
    );
  }

  return (
    <div className="recent-container compact">
      <div className="carousel-wrapper">
        {recent.length > 4 && (
          <>
            <button
              className="scroll-button left"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              className="scroll-button right"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        <ul className="recent-list" ref={scrollRef}>
          {recent.map(({ symbol, companyName }, index) => (
            <li
              key={`${symbol}-${index}`}
              onClick={() => handleClick(symbol, companyName)}
              className="recent-card"
            >
              <div className="card-header">
                <span className="symbol-badge">{symbol}</span>
              </div>
              <h3 className="company-name">{companyName}</h3>
              <div className="view-button">View Details</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentlyVisited;
