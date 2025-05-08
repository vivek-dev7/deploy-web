import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Signup from '../components/Signup';
import Home from '../pages/Home';     // Landing page (visible if not logged in)
import Home2 from '../pages/Home2';   // Market page (visible after login)
import Dashboard from '../pages/Dashboard';
import About from '../pages/About';
import Profile from '../pages/Profile';

const ProtectedRoute = ({ children, authenticated }) => {
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem('authenticated'));

  const handleLogin = () => setAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('authenticated');
    setAuthenticated(false);
  };

  return (
    <div>
      {/* Always show Navbar so that if a not-authenticated user clicks a link,
          the ProtectedRoute will redirect them to /login */}
      <Navbar onLogout={handleLogout} authenticated={authenticated} />
      <Routes>
        <Route path="/" element={authenticated ? <Navigate to="/home2" replace /> : <Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/home2"
          element={
            <ProtectedRoute authenticated={authenticated}>
              <Home2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute authenticated={authenticated}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute authenticated={authenticated}>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute authenticated={authenticated}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
