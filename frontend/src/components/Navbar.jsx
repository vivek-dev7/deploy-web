import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import Profile from "../components/Profile/Profile";
import axios from "axios";

const Navbar = ({ onLogout, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const MIN_QUERY_LENGTH = 2;
  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmedQuery = searchQuery.trim();

      if (trimmedQuery.length >= MIN_QUERY_LENGTH) {
        setIsSearching(true);
        try {
          const response = await fetch(
            `${baseURL}/api/stock/search?q=${encodeURIComponent(trimmedQuery)}`
          );
          if (!response.ok) throw new Error("Network response was not ok");

          const results = await response.json();

          const stocks = results.quotes
            .filter((q) => q.symbol.endsWith(".NS"))
            .map((q) => ({
              symbol: q.symbol,
              name: q.shortname || q.longname || q.symbol,
            }));

          setSearchResults(stocks);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, baseURL]);

  const handleSuggestionClick = async (symbol, name) => {
    try {
      const userId = currentUser.id; // Replace with your actual user context or prop

      // Save to RecentlyVisited collection in DB
      await axios.post(`${baseURL}/api/recentlyVisited/add`, {
        user: userId,
        symbol,
        companyName: name,
      });

      // Navigate and clear search state
      navigate(`/dashboard?symbol=${encodeURIComponent(symbol)}&name=${encodeURIComponent(name)}`);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error saving recently visited entry:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="navbar-container">
      <div className="navbar-logo">
        <Link to="/home2">TradeSense</Link>
      </div>

      <div className={`navbar-content ${mobileMenuOpen ? "active" : ""}`}>
        <ul className="navbar-links">
          <li>
            <Link to="/home2" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/portfolio" onClick={() => setMobileMenuOpen(false)}>
              Portfolio
            </Link>
          </li>
        </ul>

        <div className="navbar-search-container">
          <div className="navbar-search">
            <input
              type="text"
              placeholder="Search NSE Stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Stock search input"
            />
            {isSearching && (
              <div className="search-loading-indicator">
                <div className="loading-spinner"></div>
              </div>
            )}
            {searchResults.length > 0 ? (
              <div className="search-results-dropdown">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="search-result-item"
                    onClick={() =>
                      handleSuggestionClick(stock.symbol, stock.name)
                    }
                  >
                    <div className="stock-info">
                      <span className="stock-symbol">
                        {stock.symbol.replace(".NS", "")}
                      </span>
                      <span className="stock-name">{stock.name}</span>
                    </div>
                    <span className="stock-exchange">NSE</span>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 0 &&
              searchQuery.length < MIN_QUERY_LENGTH ? (
              <div className="search-results-dropdown">
                <div className="search-info-message">
                  Keep typing... (minimum {MIN_QUERY_LENGTH} characters)
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="navbar-actions">
          <Profile onLogout={handleLogout} currentUser={currentUser} />
        </div>
      </div>

      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
    </div>
  );
};

export default Navbar;
