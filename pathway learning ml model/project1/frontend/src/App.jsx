import React, { useState, useEffect } from 'react';

import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  // Check for token immediately on render
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('access_token');

    
    return !!token;
  });
  const [currentPage, setCurrentPage] = useState('signup'); // 'signup' or 'login'

  // Callback when user successfully logs in
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Callback when user logs out
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('signup'); // Reset to signup page after logout
  };

  // If user is authenticated, show dashboard
  if (isAuthenticated) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Welcome to AI Learning Platform</h1>
          <Dashboard onLogout={handleLogout} />
        </header>
      </div>
    );
  }

  // Otherwise show login/signup pages
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to AI Learning Platform</h1>
        
        {/* Navigation buttons */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setCurrentPage('login')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: currentPage === 'login' ? '#4CAF50' : '#e0e0e0',
              color: currentPage === 'login' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setCurrentPage('signup')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentPage === 'signup' ? '#4CAF50' : '#e0e0e0',
              color: currentPage === 'signup' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Display appropriate page */}
        {currentPage === 'login' ? <LoginPage onLogin={handleLogin} /> : <SignupPage />}
      </header>
    </div>
  );
}

export default App;
