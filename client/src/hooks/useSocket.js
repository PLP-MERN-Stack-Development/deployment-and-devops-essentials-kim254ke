// ==========================================
// client/src/hooks/useSocket.js - FIXED
// ==========================================
import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

// REMOVED: export default useSocket;