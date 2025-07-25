const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');
const { errorHandler } = require('./middleware/error');
const { setupSocket } = require('./config/socket');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Routes
const authRoutes = require('./routes/auth');

// Gunakan routes dengan prefix /api (standar)
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/users'));
const groupRoutes = require('./routes/groups');
app.use('/api/groups', groupRoutes);
app.use('/api/calls', require('./routes/calls'));

// Fallback routes untuk auth tanpa prefix /api (untuk kompatibilitas dengan Mini Program)
console.log('Setting up fallback auth routes without /api prefix for backward compatibility');
app.use('/auth', authRoutes);

// Fallback routes untuk groups tanpa prefix /api (untuk kompatibilitas dengan Mini Program)
console.log('Setting up fallback group routes without /api prefix for backward compatibility');
app.use('/groups', groupRoutes);

// Fallback routes untuk calls tanpa prefix /api (untuk kompatibilitas dengan Mini Program)
console.log('Setting up fallback call routes without /api prefix for backward compatibility');
app.use('/calls', require('./routes/calls'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TouringApp API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    agoraAppId: process.env.AGORA_APP_ID || '8aaf8e4b769a4859910b338b25658ef1'
  });
});

// Error handler middleware
app.use(errorHandler);

// Prioritize Railway port (default 10000) if available
const PORT = process.env.PORT || 10000;

console.log('=== SERVER INITIALIZATION ===');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Using port: ${PORT}`);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup Socket.io with authentication and event handlers
setupSocket(io);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=== SERVER STARTED ===`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Health endpoints available at: /health and /api/health`);
  console.log(`Current timestamp: ${new Date().toISOString()}`);
});
