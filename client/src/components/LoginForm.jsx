import React, { useState } from 'react';
import { Users } from 'lucide-react';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    if (username.trim().length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }
    setError('');
    onLogin(username.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-cyan-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Chat App</h1>
          <p className="text-gray-600 mt-2">Connect with friends in real-time</p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition"
            placeholder="Enter your username"
            maxLength={20}
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition"
        >
          Join Chat
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Enter any username to start chatting</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;