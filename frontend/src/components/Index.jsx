import React from 'react';
import { Link } from 'react-router-dom';
import ChartIcon from '../components/ChartIcon';
import './Index.css';

const Index = () => {
  return (
    <div className="index-container">
      <nav className="navbar">
        <div className="brand">
          <ChartIcon size={32} />
          <h1>PaperTrade</h1>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="signup-btn">Sign Up</Link>
        </div>
      </nav>
      
      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-tag">
            <ChartIcon size={24} />
            <span>Risk-Free Paper Trading Platform</span>
          </div>
          
          <h1 className="hero-title">
            Trade. Learn. <span className="highlight">Master.</span>
          </h1>
          
          <p className="hero-description">
            Perfect your trading strategies with zero risk using our paper trading
            platform, backed by real-time market data and professional insights.
          </p>
          
          <div className="cta-buttons">
            <Link to="/login" className="primary-btn">Get Started</Link>
            <Link to="/signup" className="secondary-btn">Learn More</Link>
          </div>
          
          <div className="features">
            <div className="feature">
              <div className="feature-icon stocks"></div>
              <span>Stocks</span>
            </div>
            <div className="feature">
              <div className="feature-icon realtime"></div>
              <span>Real-time Data</span>
            </div>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="trading-chart">
            <div className="chart-mockup"></div>
          </div>
          <div className="floating-card card-1">
            <div className="card-icon profit"></div>
            <div className="card-content">
              <span className="card-title">Portfolio up 12.4%</span>
              <span className="card-subtitle">Last 30 days</span>
            </div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon trade"></div>
            <div className="card-content">
              <span className="card-title">Zero-Risk Trading</span>
              <span className="card-subtitle">Practice with ₹ 100,000</span>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="footer">
        <p>Trade stocks, ETFs, and cryptocurrencies with real-time market data</p>
      </footer>
    </div>
  );
};

export default Index;
