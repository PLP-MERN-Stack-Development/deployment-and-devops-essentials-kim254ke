const Message = require('../models/Message');
const User = require('../models/User');
const { formatMessage, formatUser, generateUUID } = require('../utils/helpers');

class SocketController {
  constructor() {
    this.users = {}; // Key: socket.id, Value: User object
    this.messages = []; // Global message history (in-memory)
    this.typingUsers = {}; // Key: socket.id, Value: username
    this.rooms = ['general', 'random', 'tech', 'gaming'];
  }

  // --- User Management ---

  handleUserJoin(socket, username) {
    // Reuse existing user if reconnecting, otherwise create new
    if (this.users[socket.id]) {
        this.users[socket.id].username = username;
        this.users[socket.id].online = true;
        this.users[socket.id].room = this.users[socket.id].room || 'general';
    } else {
        const user = new User(socket.id, username);
        this.users[socket.id] = user;
    }
    
    const user = this.users[socket.id];
    
    // Ensure user joins default room
    socket.join(user.room);
    
    console.log(`👤 ${username} joined (ID: ${socket.id}) in room ${user.room}`);
    return user;
  }

  handleDisconnect(socket) {
    const user = this.users[socket.id];
    if (user) {
      console.log(`👋 ${user.username} disconnected`);
      user.online = false; // Mark as offline instead of deleting
      delete this.typingUsers[socket.id];
      return user;
    }
    return null;
  }
  
  // --- Message Management ---

  handleMessage(socket, messageData) {
    const user = this.users[socket.id];
    if (!user) return null;

    // Task 2: Create message with UUID and current room
    const message = new Message(
      generateUUID(), 
      user.username,
      socket.id,
      messageData.message,
      messageData.room || user.room // Use room from data or user's current room
    );

    this.messages.push(message);
    if (this.messages.length > 500) this.messages.shift(); // Simple pagination/limit (Task 5)

    console.log(`💬 Message from ${user.username} in ${message.room}: ${message.message}`);
    
    return message;
  }

  handlePrivateMessage(socket, { to, message }) {
    const sender = this.users[socket.id];
    const recipient = this.users[to];
    
    // Task 3: Handle private messages
    if (!sender || !recipient || sender.id === recipient.id) return null;

    const privateMessage = new Message(
      generateUUID(),
      sender.username,
      socket.id,
      message,
      // Create a deterministic room name for private chat history
      `private-${Math.min(socket.id, to)}-${Math.max(socket.id, to)}`, 
      true, // isPrivate
      to // recipientId
    );

    this.messages.push(privateMessage);
    if (this.messages.length > 500) this.messages.shift();
    
    console.log(`🤫 Private message from ${sender.username} to ${recipient.username}`);

    return privateMessage;
  }
  
  handleAddReaction(messageId, userId, emoji) {
    // Task 3: Implement message reactions
    const message = this.messages.find(msg => msg.id === messageId);
    if (!message) return null;

    message.addReaction(userId, emoji);
    return message;
  }

  // --- Room & Status Management ---

  handleJoinRoom(socket, room) {
    const user = this.users[socket.id];
    if (!user || user.room === room || !this.rooms.includes(room)) return null;

    const oldRoom = user.room;

    // Leave current room and join new room
    socket.leave(oldRoom);
    socket.join(room);
    user.room = room;

    console.log(`🚪 ${user.username} moved from ${oldRoom} to ${room}`);
    
    return { user, oldRoom, newRoom: room };
  }

  handleTyping(socket) {
    const user = this.users[socket.id];
    if (!user) return null;

    // Get all users in the same room who are currently typing
    const typingUsersInRoom = Object.keys(this.typingUsers)
        .filter(id => this.users[id] && this.users[id].room === user.room && id !== socket.id)
        .map(id => this.typingUsers[id]);
        
    return { room: user.room, typingUsers: typingUsersInRoom };
  }
  
  // --- Data Retrieval ---

  getUsers(room = null) {
    const userArray = Object.values(this.users);
    
    // Task 2: Filter users by room and return formatted data
    if (room) {
        return userArray
            .filter(user => user.room === room && user.online)
            .map(user => formatUser(user));
    }
    // Return all online users globally
    return userArray.filter(user => user.online).map(user => formatUser(user));
  }

  getMessages(room = null) {
    if (!room) {
      return this.messages.map(msg => formatMessage(msg));
    }
    // Filter messages for the requested room, including private messages 
    // where the user is either the sender or the recipient.
    return this.messages
        .filter(msg => {
            const isPublicRoomMsg = !msg.isPrivate && msg.room === room;
            
            // Note: This logic assumes the client knows the private room name convention,
            // which is handled client-side by filtering on the current `room` state.
            const isPrivateMsgInRoom = msg.isPrivate && msg.room === room; 
            
            return isPublicRoomMsg || isPrivateMsgInRoom;
        })
        .map(msg => formatMessage(msg));
  }
}

module.exports = new SocketController();
