import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import ChartIcon from '../components/ChartIcon';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './Signup.css';
// 
const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const baseURL = import.meta.env.VITE_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post(`${baseURL}/api/auth/signup`, {
        name,
        email,
        password,
      });

      alert(response.data.message);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <div className="brand-logo">
          <ChartIcon size={40} />
          <h1>PaperTrade</h1>
        </div>
        <div className="welcome-text">
          <h2>Start Your Trading Journey</h2>
          <p>Create an account and begin practicing with zero risk using real market data</p>
        </div>
        <div className="signup-image"></div>
      </div>

      <div className="signup-right">
        <form className="signup-card" onSubmit={handleSubmit}>
          <h2>Create Your Account</h2>
          <p className="subtitle">Join thousands of traders perfecting their strategies</p>

          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            {/* <label>Full Name</label> */}
            <div className="input-with-icon">
              <i className="user-icon"></i>
              <input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            {/* <label>Email Address</label> */}
            <div className="input-with-icon">
              <i className="email-icon"></i>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            {/* <label>Password</label> */}
            <div className="input-with-icon">
              <i className="password-icon"></i>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <div className="input-group">
            {/* <label>Confirm Password</label> */}
            <div className="input-with-icon">
              <i className="password-icon"></i>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <div className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <div className="terms-checkbox">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
          </div>

          <button type="submit" className="signup-button">
            Create Account
          </button>

          <div className="or-divider">
            <span>OR</span>
          </div>

          <div className="social-signup google-wrapper">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                try {
                  const decoded = jwtDecode(credentialResponse.credential);
                  const { name, email, sub } = decoded;

                  axios.post(`${baseURL}/api/auth/signup`, {
                    name,
                    email,
                    googleId: sub,
                  })
                    .then(res => {
                      alert(res.data.message);
                      navigate('/login');
                    })
                    .catch(err => {
                      setError(err.response?.data?.message || 'Google Signup failed');
                    });
                } catch (err) {
                  setError('Error decoding Google credentials');
                }
              }}
              onError={() => {
                setError("Google Sign Up was unsuccessful. Try again later");
              }}
              useOneTap
              theme="outline"
              size="large"
              text="signup_with"
              shape="pill"
              logo_alignment="center"
            />
          </div>


          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;

