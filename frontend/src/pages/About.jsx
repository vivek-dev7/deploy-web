import React from 'react';
import './About.css';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate(); // ✅ Correct way to get navigation function

  const handleGetStarted = () => {
    navigate("/home2"); // ✅ Now it will work correctly
  };

  return (
    <div className="about-container">
      {/* Hero Section */}
      <header className="about-hero">
        <h1>Master Trading Risk-Free with Virtual ₹100,000</h1>
        <p>Practice stock trading in real-market conditions without financial risk</p>
      </header>

      {/* Key Features */}
      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">💹</div>
          <h3>Real-Time Market Simulation</h3>
          <p>Experience live market conditions with delayed quotes</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💰</div>
          <h3>Virtual ₹100,000 Wallet</h3>
          <p>Start with virtual currency to test your strategies</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Advanced Trading Tools</h3>
          <p>Technical indicators and real-time portfolio tracking</p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mission-section">
        <h2>Our Mission</h2>
        <p className="mission-text">
          Empower both new and experienced traders with a risk-free environment to 
          develop and test investment strategies using real market data. We aim to bridge 
          the gap between theoretical knowledge and practical trading experience.
        </p>
      </section>

      {/* Development Team */}
      <section className="team-section">
        <h2 className="developers-header">Development Team</h2>
        <div className="developers-row">
          <div className="developer-item">
            <h4>Sujay Ladwa</h4>
            <p>Product Manager</p>
          </div>
          <div className="developer-item">
            <h4>Avaneesh</h4>
            <p>Full Stack Developer</p>
          </div>
          <div className="developer-item">
            <h4>Vivek</h4>
            <p>Full Stack Developer</p>
          </div>
          <div className="developer-item">
            <h4>Bharath</h4>
            <p>Full Stack Developer</p>
          </div>
          <div className="developer-item">
            <h4>Ankush</h4>
            <p>Full Stack Developer</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="cta-container">
        <button className="get-started-button" onClick={handleGetStarted}>
          Get Started Now
        </button>
      </div>
    </div>
  );
};

export default About;
