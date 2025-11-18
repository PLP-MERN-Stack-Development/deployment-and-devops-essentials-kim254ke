// ==========================================
// client/src/context/SocketContext.jsx - FIXED & ENHANCED (Edit + Delete Enabled)
// ==========================================
import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../socket/socket';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [username, setUsername] = useState('');

  // ---------------- SOCKET EVENT HANDLERS ----------------
  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // ===== MESSAGE EVENTS =====
    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('message_history', (history) => {
      setMessages(history);
    });

    socket.on('message_updated', (updatedMessage) => {
      console.log('🔄 Message updated:', updatedMessage);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
      );
    });

    socket.on('message_deleted', (deletedId) => {
      console.log('🗑️ Message deleted:', deletedId);
      setMessages((prev) => prev.filter((msg) => msg._id !== deletedId));
    });

    // ===== USER EVENTS =====
    socket.on('user_list', (userList) => setUsers(userList));

    socket.on('notification', (notification) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: `notif-${Date.now()}`,
          system: true,
          message: notification.message,
          timestamp: new Date().toISOString(),
          room: notification.room,
        },
      ]);
    });

    // ===== TYPING + ROOMS =====
    socket.on('typing_users', setTypingUsers);
    socket.on('room_joined', (room) => setCurrentRoom(room));
    socket.on('available_rooms', (rooms) =>
      console.log('🏠 Available rooms:', rooms)
    );

    return () => {
      socket.removeAllListeners();
    };
  }, []);

  // ---------------- CONNECTION ----------------
  const connect = (user) => {
    setUsername(user);
    socket.connect();
    socket.emit('user_join', user);
  };

  const disconnect = () => {
    socket.disconnect();
    setUsername('');
  };

  // ---------------- MESSAGES ----------------
  const sendMessage = (message, room = null) => {
    const targetRoom = room || currentRoom;
    socket.emit('send_message', { message, room: targetRoom });

    const optimistic = {
      _id: `temp-${Date.now()}`,
      sender: username,
      senderId: socket.id,
      message,
      room: targetRoom,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
  };

  const sendImage = (imageData, caption, room = null) => {
    const targetRoom = room || currentRoom;
    socket.emit('send_message', { message: caption || '📷 Image', room: targetRoom, image: imageData });
  };

  // ---------------- EDIT MESSAGE ----------------
  const editMessage = (id, newContent) => {
    if (!id || !newContent) return;
    console.log('✏️ Editing message:', id);
    socket.emit('edit_message', { id, content: newContent });
  };

  // ---------------- DELETE MESSAGE ----------------
  const deleteMessage = (id) => {
    if (!id) return;
    console.log('🗑️ Deleting message:', id);
    socket.emit('delete_message', { id });
  };

  // ---------------- PRIVATE + TYPING ----------------
  const sendPrivateMessage = (toUserId, message) => {
    socket.emit('private_message', { toUserId, message });
  };

  const setTyping = (isTyping) => {
    socket.emit(isTyping ? 'typing_start' : 'typing_stop');
  };

  // ---------------- ROOMS + REACTIONS ----------------
  const joinRoom = (room) => {
    socket.emit('join_room', room);
    setCurrentRoom(room);
  };

  const addReaction = (messageId, emoji) => {
    socket.emit('add_reaction', { messageId, emoji });
  };

  const markMessageAsRead = (messageId) => {
    socket.emit('message_read', { messageId });
  };

  const value = {
    socket,
    isConnected,
    messages,
    users,
    typingUsers,
    currentRoom,
    username,
    connect,
    disconnect,
    sendMessage,
    sendImage,
    editMessage,
    deleteMessage,
    sendPrivateMessage,
    setTyping,
    joinRoom,
    addReaction,
    markMessageAsRead,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
