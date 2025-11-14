// Utility function to generate a robust unique ID (UUID)
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  const formatMessage = (message) => {
      // Ensures all messages sent to the client adhere to the Message model structure
      return {
        id: message.id,
        sender: message.sender,
        senderId: message.senderId,
        message: message.message,
        timestamp: message.timestamp,
        room: message.room,
        isPrivate: message.isPrivate || false,
        recipientId: message.recipientId || null,
        delivered: message.delivered || true,
        read: message.read || false,
        reactions: message.reactions || []
      };
    };
    
    const formatUser = (user) => {
      // Ensures all user data sent to the client is clean
      return {
        id: user.id,
        username: user.username,
        room: user.room,
        online: user.online,
        joinedAt: user.joinedAt
      };
    };
    
    const sanitizeMessage = (message) => {
      return message.trim().substring(0, 1000);
    };
    
    const validateUsername = (username) => {
      return username && username.trim().length >= 2 && username.trim().length <= 20;
    };
    
    module.exports = {
      generateUUID,
      formatMessage,
      formatUser,
      sanitizeMessage,
      validateUsername
    };
  