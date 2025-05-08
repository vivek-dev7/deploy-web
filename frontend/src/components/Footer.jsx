import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* About Section */}
        <div className="footer-section about">
          <h2>PaperTrade India</h2>
          <p>
            Your premier paper trading platform for the Indian market. Enjoy real-time data,
            secure trading, and in-depth analysis that empower your trading decisions.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section links">
          <h2>Quick Links</h2>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section contact">
          <h2>Contact Us</h2>
          <p><span className="contact-label">Email:</span> support@papertradeindia.com</p>
          <p><span className="contact-label">Phone:</span> +91 98765 43210</p>
          <p><span className="contact-label">Address:</span> 1234 Market Street, Mumbai, India</p>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} PaperTrade India | All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
