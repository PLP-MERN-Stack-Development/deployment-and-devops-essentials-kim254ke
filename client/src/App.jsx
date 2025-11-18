// /client/src/App.jsx (Revised Structure)
import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import { useSocket } from './hooks/useSocket'; // Assuming you fixed the export

const App = () => {
  const [username, setUsername] = useState(null);
  const { connect, disconnect } = useSocket(); // <-- Use the connect/disconnect functions

  useEffect(() => {
    // 1. Check for stored username
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      // 2. IMPORTANT: Connect the socket when the App loads with a stored username
      connect(storedUsername);
    }
  }, [connect]); // Dependency array includes 'connect'

  const handleLogin = (user) => {
    setUsername(user);
    localStorage.setItem('username', user);
    connect(user); // 3. Connect socket immediately on successful login
  };

  const handleLogout = () => {
    disconnect(); // 4. Disconnect socket on logout
    setUsername(null);
    localStorage.removeItem('username');
  };

  if (!username) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 5. If username exists, render the ChatPage
  return (
    <ChatPage 
      username={username} 
      onLogout={handleLogout} 
    />
  );
};

export default App;