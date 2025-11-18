import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
// ❌ REMOVED: Unused import
// import { useSocket } from './context/SocketContext';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <div className="h-screen w-screen">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <ChatPage username={username} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;