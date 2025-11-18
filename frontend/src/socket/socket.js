import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://chat-app-server-0tl2.onrender.com';
console.log('🔌 Attempting connection to:', SOCKET_URL);

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['polling', 'websocket'],
  withCredentials: true,
  path: '/socket.io/',
});

// Enhanced debug logging
socket.on('connect', () => {
  console.log('✅ Successfully connected!');
  console.log('   Socket ID:', socket.id);
  console.log('   Transport:', socket.io.engine.transport.name);
  
  // Safely add upgrade listener after connection
  socket.io.engine.on('upgrade', (transport) => {
    console.log('⬆️ Transport upgraded to:', transport.name);
  });
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
  console.error('   Full error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

export default socket;