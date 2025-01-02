require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use environment variable for frontend URL
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.set('io', io); // Allow socket.io instance to be accessed elsewhere in the app

// MongoDB Connection
const connectDB = async () => {
  try {
    if (process.env.USE_MEMORY_DB === 'true') {
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ In-memory MongoDB connected');
    } else {
      await mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected');
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};
connectDB();

// Routes
app.use('/api/users', userRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running!' });
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Handle user joining a specific room
  socket.on('join', (username) => {
    if (!username || typeof username !== 'string' || !username.trim()) {
      console.error('❌ Invalid username for join event');
      return;
    }
    const room = username.trim();
    socket.join(room);
    console.log(`✅ User ${username} joined room: ${room}`);
    socket.emit('joinedRoom', { room }); // Notify the client that they joined successfully
  });

  // Handle timer updates
  socket.on('timerUpdate', (data) => {
    const { username, timeLeft, isWorkSession } = data || {};
    if (!username || timeLeft == null || isWorkSession == null) {
      console.error('❌ Invalid timerUpdate data received:', data);
      return;
    }

    const room = username.trim();
    console.log(`✅ Broadcasting timerUpdate to room ${room}:`, data);
    io.to(room).emit('timerUpdate', { username, timeLeft, isWorkSession });
  });

  // Handle user disconnection
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${reason}`);
  });
});

// Handle unexpected errors in socket events
io.on('error', (error) => {
  console.error('❌ Socket.IO Error:', error.message);
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
