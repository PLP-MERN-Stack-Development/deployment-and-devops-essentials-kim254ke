const { Server } = require('socket.io');
const socketConfig = require('../config/socket.config');
const socketController = require('../controllers/socketController');

let io;

const initialize = (server) => {
  io = new Server(server, socketConfig);

  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);
    
    // --- Initial Setup and Join ---
    socket.emit('available_rooms', socketController.rooms);

    socket.on('user_join', (username) => {
      const user = socketController.handleUserJoin(socket, username);
      const room = user.room;
      
      // Task 2 & 4: Broadcast to all rooms/clients that a user has joined (status update)
      io.emit('user_list', socketController.getUsers());
      
      // Notify current room that a user has joined (for chat history)
      socket.broadcast.to(room).emit('notification', { 
        type: 'join', 
        message: `${user.username} has joined the chat.`,
        room: room
      });
      
      // Send message history for the joined room to the user (Task 2)
      socket.emit('message_history', socketController.getMessages(room));
    });

    // --- Core Messaging ---

    socket.on('send_message', (messageData) => {
      const message = socketController.handleMessage(socket, messageData);
      if (message) {
        const room = message.room;
        
        // Task 2: Broadcast the message to everyone in the room *EXCEPT* the sender (Optimistic UI)
        socket.broadcast.to(room).emit('receive_message', message);
      }
    });

    // --- Advanced Features (Task 3) ---
    
    socket.on('private_message', ({ toUserId, message }) => {
      const privateMessage = socketController.handlePrivateMessage(socket, { to: toUserId, message });
      
      if (privateMessage) {
        // Send to recipient
        io.to(privateMessage.recipientId).emit('receive_message', privateMessage);
        
        // Send back to sender for their history
        socket.emit('receive_message', privateMessage);
        
        // Task 4: Send private notification to recipient
        io.to(privateMessage.recipientId).emit('notification', { 
            type: 'private', 
            message: `New private message from ${privateMessage.sender}.`,
            room: privateMessage.room
        });
      }
    });

    socket.on('add_reaction', ({ messageId, emoji }) => {
        // Task 3: Handle message reactions
        const user = socketController.users[socket.id];
        if (!user) return;
        
        const updatedMessage = socketController.handleAddReaction(messageId, socket.id, emoji);

        if (updatedMessage) {
             // Broadcast the updated message state to all users in the room
            io.to(updatedMessage.room).emit('message_updated', updatedMessage);
        }
    });

    // --- Status & Rooms ---

    socket.on('typing_start', () => {
        const user = socketController.users[socket.id];
        if (!user) return;
        socketController.typingUsers[socket.id] = user.username; // Mark as typing
        const { room, typingUsers } = socketController.handleTyping(socket);
        
        // Task 2: Broadcast typing status only to the current room (excluding sender)
        socket.broadcast.to(room).emit('typing_users', typingUsers);
    });

    socket.on('typing_stop', () => {
        const user = socketController.users[socket.id];
        if (!user) return;
        delete socketController.typingUsers[socket.id]; // Mark as stopped
        const { room, typingUsers } = socketController.handleTyping(socket);

        // Task 2: Broadcast typing status only to the current room (excluding sender)
        socket.broadcast.to(room).emit('typing_users', typingUsers);
    });

    socket.on('join_room', (room) => {
      const result = socketController.handleJoinRoom(socket, room);
      if (result) {
        // Task 4: Notify the *old* room that the user left
        socket.broadcast.to(result.oldRoom).emit('notification', { 
            type: 'leave', 
            message: `${result.user.username} left the room.`,
            room: result.oldRoom
        });

        // Update user list for everyone (status changed)
        io.emit('user_list', socketController.getUsers());
        
        // Task 4: Notify the *new* room that the user joined
        socket.broadcast.to(room).emit('notification', { 
            type: 'join', 
            message: `${result.user.username} joined the room.`,
            room: room
        });

        // Send new room history to the user
        socket.emit('message_history', socketController.getMessages(room));
        
        // Confirm join to the user
        socket.emit('room_joined', room);
      }
    });

    // --- Disconnect (Task 2 & 5) ---

    socket.on('disconnect', () => {
      const user = socketController.handleDisconnect(socket);
      if (user) {
        // Update global user list (online status change)
        io.emit('user_list', socketController.getUsers());
        
        // Task 4: Notify the last known room
        io.to(user.room).emit('notification', { 
            type: 'leave', 
            message: `${user.username} disconnected.`,
            room: user.room
        });
      }
      console.log(`🔌 Disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = { initialize };
