import React, { lazy, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import Index from './components/Index';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';

// Lazy load components
const Home2 = lazy(() => import('./pages/Home2'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const About = lazy(() => import('./pages/About'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Orders = lazy(() => import('./components/Profile/Orders'));
const GetStarted = lazy(() => import('./components/GetStarted'));
const ChooseAction = lazy(() => import('./components/ChooseAction'));
const StockWatchlist = lazy(() => import('./pages/StockWatchlist'));

const ProtectedRoute = ({ children, authenticated }) => {
  const location = useLocation();
  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

const isTokenExpiringSoon = (token, thresholdMinutes = 5) => {
  try {
    const decoded = jwtDecode(token);
    const expiry = decoded.exp * 1000;
    const now = Date.now();
    const diffMinutes = (expiry - now) / (1000 * 60);
    return diffMinutes <= thresholdMinutes && diffMinutes > 0;
  } catch (err) {
    return false;
  }
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ added loading state
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const expiryTime = decoded.exp * 1000;

        if (Date.now() < expiryTime) {
          if (isTokenExpiringSoon(token)) {
            toast.warning("Your session is about to expire!", {
              position: "top-right",
              autoClose: 5000,
            });
          }

          const timeUntilExpiry = expiryTime - Date.now();
          const logoutTimer = setTimeout(() => {
            toast.error("Your session has expired.", {
              position: "top-right",
              autoClose: 5000,
            });
            handleLogout();
          }, timeUntilExpiry);

          setAuthenticated(true);
          setLoading(false);
          // ✅ Redirect only if on "/" or "/index"
          if (location.pathname === '/' || location.pathname === '/index') {
            navigate('/home2', { replace: true });
          }
          return () => clearTimeout(logoutTimer);
        } else {
          handleLogout(); // Clear token if expired
          navigate('/', { replace: true }); // ✅ redirect to "/"
          setLoading(false);
        }
      } catch (err) {
        console.error("Invalid token", err);
        handleLogout(); // Clear token if invalid
        navigate('/', { replace: true });
        setLoading(false);
      }
    } else {
      setLoading(false);
      navigate('/', { replace: true }); // ✅ No token → redirect to "/"
    }
  }, []);


  const handleLogin = () => {
    setAuthenticated(true);
    navigate('/get-started', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthenticated(false);
    navigate('/login');
  };

  const hidePaths = ['/login', '/signup', '/choose-action', '/get-started'];
  const showNavAndFooter = authenticated && !hidePaths.includes(location.pathname);

  return (
    <div className="app-container">
      {showNavAndFooter && <Navbar onLogout={handleLogout} currentUser={currentUser} />}

      {loading ? (
        <div style={{ textAlign: 'center', paddingTop: '50px' }}>Loading...</div>
      ) : (
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/index" element={<Index />} />

          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/get-started" element={
            authenticated ? (
              <div className="full-screen-route">
                <GetStarted />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/home2" element={
            <ProtectedRoute authenticated={authenticated}>
              <Home2 />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute authenticated={authenticated}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/about" element={
            <ProtectedRoute authenticated={authenticated}>
              <About />
            </ProtectedRoute>
          } />

          <Route path="/portfolio" element={
            <ProtectedRoute authenticated={authenticated}>
              <Portfolio />
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute authenticated={authenticated}>
              <Orders />
            </ProtectedRoute>
          } />

          <Route path="/choose-action" element={
            <ProtectedRoute authenticated={authenticated}>
              <ChooseAction />
            </ProtectedRoute>
          } />

          <Route path="/stockWatchlist" element={
            <ProtectedRoute authenticated={authenticated}>
              <StockWatchlist />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}

      {showNavAndFooter && <Footer />}
      <ToastContainer />
    </div>
  );
}

export default App;
