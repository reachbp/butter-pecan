import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketIO } from './services/socketService';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const httpServer = createServer(app);

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: config.allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Setup Socket.IO
setupSocketIO(io);

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log(`🚀 SchoolWatch Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔌 Socket.IO ready for connections`);
});

export { app, io };
