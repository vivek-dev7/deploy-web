import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import ChartIcon from "../components/ChartIcon";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import "./Login.css";
// 
const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const baseURL = import.meta.env.VITE_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${baseURL}/api/auth/login`,
        { email, password }
      );

      // console.log("Login Response:", response.data); // Debugging step

      // Save token
      localStorage.setItem("token", response.data.token);

      // Store user data, including wallet
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          wallet: response.data.user.wallet || 0.0, // Ensure wallet is stored
        })
      );

      onLogin();
      navigate("/get-started");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brand-logo">
          <ChartIcon size={40} />
          <h1>PaperTrade</h1>
        </div>
        <div className="welcome-text">
          <h2>Welcome Back!</h2>
          <p>Enter your credentials to continue your trading journey</p>
        </div>
        <div className="login-image-container">
          <img
            src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Trading dashboard"
            className="login-image"
          />
        </div>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Login to Your Account</h2>
          <p className="subtitle">
            Keep track of your investments and performance
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label>Email</label>
            <div className="input-with-icon">
              <i className="email-icon"></i>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <i className="password-icon"></i>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
            <div className="forgot-password">
              <a href="#">Forgot password?</a>
            </div>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>

          <div className="or-divider">
            <span>OR</span>
          </div>

          <div className="social-login google-wrapper">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const decoded = jwtDecode(credentialResponse.credential);
                  const { email, name, sub } = decoded;

                  const res = await axios.post(`${baseURL}/api/auth/google-signin`, {
                    name,
                    email,
                    googleId: sub,
                  });

                  localStorage.setItem('token', res.data.token);
                  localStorage.setItem(
                    'user',
                    JSON.stringify({
                      id: res.data.user.id,
                      name: res.data.user.name,
                      email: res.data.user.email,
                      wallet: res.data.user.wallet || 0.0,
                    })
                  );

                  onLogin();
                  navigate('/get-started');
                } catch (err) {
                  setError(err.response?.data?.message || 'Google Sign-in failed');
                }
              }}
              onError={() => {
                setError('Google Sign-in was unsuccessful. Try again later.');
              }}
              theme="outline"
              size="large"
              text="signin_with"
              shape="pill"
              logo_alignment="center"
            />

            </div>
            
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
