// Configuration for Socket.IO server
module.exports = {
    cors: {
      // Use a permissive origin for the canvas environment/local development
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    reconnection: true, // Task 5: Reconnection logic
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    pingTimeout: 60000,
    pingInterval: 25000,
  };