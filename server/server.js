// ==========================================
// COMPLETE FIXED & PRODUCTION-READY SERVER (server.js)
// ==========================================

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet'; // Security Headers
import * as Sentry from '@sentry/node'; // Error Tracking
import * as Tracing from '@sentry/tracing'; // Performance Monitoring
import winston from 'winston'; // Logging

dotenv.config();

const app = express();
const server = http.createServer(app);

// ----------------------------------------------------------------------
// 1. Sentry Initialization (Error Tracking & APM)
// ----------------------------------------------------------------------
Sentry.init({
    // DSN must be set in Render environment variables
    dsn: process.env.SENTRY_DSN, 
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% sampling in prod
    environment: process.env.NODE_ENV || 'development',
});

// RequestHandler extracts tracing info from the incoming request
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());


// ----------------------------------------------------------------------
// 2. Logger Setup (Winston)
// ----------------------------------------------------------------------
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Log to console in all environments
        new winston.transports.Console(),
        // For production, you could add a File transport or a dedicated logging service transport
    ],
});


// ----------------------------------------------------------------------
// 3. App/Socket Configuration
// ----------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

// Security Middleware (Helmet)
app.use(helmet()); 

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://chat-app-client-9xi8.vercel.app', 
  'http://localhost:5173', 
  'http://localhost:3000'
].filter(Boolean);

// CORS for Express
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());


const io = new Server(server, {
  cors: { 
    origin: allowedOrigins, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});


// ---------------- MONGOOSE SETUP ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info('✅ Connected to MongoDB'))
  .catch((err) => {
    logger.error('❌ MongoDB connection error:', err);
    Sentry.captureException(new Error('MongoDB connection failed'));
  });


// ---------------- MESSAGE MODEL ----------------
const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    senderId: { type: String, required: true },
    message: { type: String, required: true },
    room: { type: String, default: 'general' },
    isPrivate: { type: Boolean, default: false },
    recipientId: String,
    delivered: { type: Boolean, default: true },
    read: { type: Boolean, default: false },
    reactions: [{ userId: String, emoji: String }],
    edited: { type: Boolean, default: false },
    image: String,
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);


// ---------------- USER TRACKING ----------------
const users = {};
const typingUsers = {};
const rooms = ['general', 'random', 'tech', 'gaming'];


// ---------------- EXPRESS ROUTES ----------------

// 4. Health Check Endpoint (Monitoring Requirement)
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
    
    res.status(200).json({ 
        status: dbStatus === 'CONNECTED' ? 'UP' : 'DEGRADED', 
        service: 'chat-app-server',
        database: dbStatus,
        users_online: Object.keys(users).length,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/messages/:room', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    logger.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    status: 'Chat Server Running ✅',
    timestamp: new Date(),
    socketIO: 'Active'
  });
});

// ---------------- SOCKET.IO HANDLERS ----------------
io.on('connection', (socket) => {
  logger.info('🟢 User connected:', { socketId: socket.id });

  socket.on('user_join', async (username) => {
    // ... (Your existing user_join logic)
    users[socket.id] = {
      id: socket.id,
      username,
      room: 'general',
      online: true,
      joinedAt: new Date(),
    };

    socket.join('general');
    socket.emit('available_rooms', rooms);

    const history = await Message.find({ room: 'general' }).sort({ createdAt: 1 }).limit(100);
    socket.emit('message_history', history);

    io.emit('user_list', Object.values(users).map(u => ({
      id: u.id,
      username: u.username,
      room: u.room,
      online: u.online,
    })));

    socket.broadcast.to('general').emit('notification', {
      type: 'join',
      message: `${username} joined the chat`,
      room: 'general',
    });
  });

  socket.on('send_message', async ({ message, room, image }) => {
    const user = users[socket.id];
    if (!user) return;

    const targetRoom = room || user.room;

    try {
      const newMessage = new Message({
        sender: user.username,
        senderId: socket.id,
        message: message || '📷 Image',
        room: targetRoom,
        image: image || null,
      });

      await newMessage.save();
      io.to(targetRoom).emit('receive_message', newMessage);
    } catch (err) {
      logger.error('❌ Error saving message:', err);
      Sentry.captureException(err);
    }
  });
  
  // ... (Your other socket handlers: edit_message, delete_message, join_room, typing, reactions, read, private_message)
  
  socket.on('edit_message', async ({ id, content }) => {
    try {
      const updated = await Message.findByIdAndUpdate(
        id,
        { message: content, edited: true },
        { new: true }
      );
      if (updated) {
        io.to(updated.room).emit('message_updated', updated);
      }
    } catch (err) {
      logger.error('❌ Error editing message:', err);
      Sentry.captureException(err);
    }
  });

  socket.on('delete_message', async ({ id }) => {
    try {
      const message = await Message.findById(id);
      if (message) {
        const room = message.room;
        await Message.findByIdAndDelete(id);
        io.to(room).emit('message_deleted', id);
      }
    } catch (err) {
      logger.error('❌ Error deleting message:', err);
      Sentry.captureException(err);
    }
  });

  socket.on('join_room', async (newRoom) => {
    const user = users[socket.id];
    if (!user || !rooms.includes(newRoom) || user.room === newRoom) return;

    const oldRoom = user.room;
    socket.leave(oldRoom);
    socket.broadcast.to(oldRoom).emit('notification', {
      type: 'leave',
      message: `${user.username} left the room`,
      room: oldRoom,
    });

    socket.join(newRoom);
    user.room = newRoom;

    socket.broadcast.to(newRoom).emit('notification', {
      type: 'join',
      message: `${user.username} joined the room`,
      room: newRoom,
    });

    const history = await Message.find({ room: newRoom }).sort({ createdAt: 1 }).limit(100);
    socket.emit('message_history', history);
    socket.emit('room_joined', newRoom);

    io.emit('user_list', Object.values(users).map(u => ({
      id: u.id,
      username: u.username,
      room: u.room,
      online: u.online,
    })));
  });

  socket.on('typing_start', () => {
    const user = users[socket.id];
    if (!user) return;

    typingUsers[socket.id] = user.username;
    const roomTyping = Object.keys(typingUsers)
      .filter(id => users[id]?.room === user.room && id !== socket.id)
      .map(id => typingUsers[id]);

    socket.broadcast.to(user.room).emit('typing_users', roomTyping);
  });

  socket.on('typing_stop', () => {
    const user = users[socket.id];
    if (!user) return;

    delete typingUsers[socket.id];
    const roomTyping = Object.keys(typingUsers)
      .filter(id => users[id]?.room === user.room)
      .map(id => typingUsers[id]);

    socket.broadcast.to(user.room).emit('typing_users', roomTyping);
  });

  socket.on('add_reaction', async ({ messageId, emoji }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;

      const existingIndex = message.reactions.findIndex(r => r.userId === socket.id);
      if (existingIndex > -1) {
        message.reactions[existingIndex].emoji = emoji;
      } else {
        message.reactions.push({ userId: socket.id, emoji });
      }

      await message.save();
      io.to(message.room).emit('message_updated', message);
    } catch (err) {
      logger.error('❌ Error adding reaction:', err);
      Sentry.captureException(err);
    }
  });

  socket.on('message_read', async ({ messageId }) => {
    try {
      const updated = await Message.findByIdAndUpdate(
        messageId,
        { read: true },
        { new: true }
      );
      if (updated) {
        io.to(updated.room).emit('message_updated', updated);
      }
    } catch (err) {
      logger.error('❌ Error marking message as read:', err);
      Sentry.captureException(err);
    }
  });

  socket.on('private_message', async ({ toUserId, message }) => {
    const sender = users[socket.id];
    const recipient = users[toUserId];

    if (!sender || !recipient) return;

    const privateRoomId = `private-${Math.min(socket.id, toUserId)}-${Math.max(socket.id, toUserId)}`;

    try {
      const newMessage = new Message({
        sender: sender.username,
        senderId: socket.id,
        message,
        room: privateRoomId,
        isPrivate: true,
        recipientId: toUserId,
      });

      await newMessage.save();
      io.to(socket.id).emit('receive_message', newMessage);
      io.to(toUserId).emit('receive_message', newMessage);

      io.to(toUserId).emit('notification', {
        type: 'private',
        message: `New private message from ${sender.username}`,
        room: privateRoomId,
      });
    } catch (err) {
      logger.error('❌ Error sending private message:', err);
      Sentry.captureException(err);
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      user.online = false;
      delete typingUsers[socket.id];

      socket.broadcast.to(user.room).emit('notification', {
        type: 'leave',
        message: `${user.username} disconnected`,
        room: user.room,
      });

      io.emit('user_list', Object.values(users).filter(u => u.online).map(u => ({
        id: u.id,
        username: u.username,
        room: u.room,
        online: u.online,
      })));

      delete users[socket.id];
    }
    logger.info('🔴 User disconnected:', { socketId: socket.id });
  });
});

// ----------------------------------------------------------------------
// 5. Final Error Handling & Server Listener
// ----------------------------------------------------------------------

// The Sentry error handler must come BEFORE any other error middleware
app.use(Sentry.Handlers.errorHandler());

// Custom Express Error Handler (Final error handling)
app.use((err, req, res, next) => {
    logger.error('Unhandled Express Error:', { stack: err.stack, method: req.method, path: req.path });
    res.status(err.status || 500).send({
        status: "error",
        message: "An internal server error occurred." 
    });
});

server.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));