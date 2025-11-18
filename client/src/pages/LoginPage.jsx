import React from 'react';
import LoginForm from '../components/LoginForm';
import { useSocket } from '../hooks/useSocket';

const LoginPage = ({ onLogin }) => {
  const { connect } = useSocket();

  const handleLogin = (username) => {
    connect(username);
    onLogin(username);
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default LoginPage;