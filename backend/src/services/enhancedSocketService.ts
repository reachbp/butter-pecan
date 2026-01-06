import { Server, Socket } from 'socket.io';

/**
 * Enhanced Socket.IO Service
 * Provides real-time updates for SchoolWatch application
 */

interface SocketUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
}

// Store active users
const activeUsers = new Map<string, SocketUser>();

export const setupEnhancedSocketIO = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // User authentication and room joining
    socket.on('auth:login', (data: { userId: string }) => {
      const { userId } = data;

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Store active user
      activeUsers.set(socket.id, {
        userId,
        socketId: socket.id,
        connectedAt: new Date(),
      });

      console.log(`👤 User ${userId} authenticated on socket ${socket.id}`);

      // Send confirmation
      socket.emit('auth:success', {
        userId,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Subscribe to school updates
    socket.on('subscribe:school', (schoolId: string) => {
      socket.join(`school:${schoolId}`);
      console.log(`📚 Socket ${socket.id} subscribed to school: ${schoolId}`);
      socket.emit('subscribe:school:success', { schoolId });
    });

    // Unsubscribe from school updates
    socket.on('unsubscribe:school', (schoolId: string) => {
      socket.leave(`school:${schoolId}`);
      console.log(`📚 Socket ${socket.id} unsubscribed from school: ${schoolId}`);
    });

    // Subscribe to application updates
    socket.on('subscribe:application', (applicationId: string) => {
      socket.join(`application:${applicationId}`);
      console.log(`📝 Socket ${socket.id} subscribed to application: ${applicationId}`);
    });

    // Unsubscribe from application updates
    socket.on('unsubscribe:application', (applicationId: string) => {
      socket.leave(`application:${applicationId}`);
      console.log(`📝 Socket ${socket.id} unsubscribed from application: ${applicationId}`);
    });

    // Client heartbeat (for connection health monitoring)
    socket.on('heartbeat', () => {
      socket.emit('heartbeat:ack', { timestamp: Date.now() });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        console.log(`❌ User ${user.userId} disconnected (socket ${socket.id})`);
        activeUsers.delete(socket.id);
      } else {
        console.log(`❌ Client disconnected: ${socket.id}`);
      }
    });
  });

  return io;
};

/**
 * Emit application update to user
 */
export const emitApplicationUpdate = (
  io: Server,
  userId: string,
  applicationId: string,
  data: any
) => {
  io.to(`user:${userId}`).emit('application:updated', {
    applicationId,
    ...data,
    timestamp: new Date().toISOString(),
  });

  // Also emit to application-specific room
  io.to(`application:${applicationId}`).emit('application:updated', {
    applicationId,
    ...data,
    timestamp: new Date().toISOString(),
  });

  console.log(`📝 Emitted application update to user:${userId} and application:${applicationId}`);
};

/**
 * Emit reminder notification to user
 */
export const emitReminderNotification = (
  io: Server,
  userId: string,
  reminder: any
) => {
  io.to(`user:${userId}`).emit('reminder:notification', {
    ...reminder,
    timestamp: new Date().toISOString(),
  });

  console.log(`🔔 Emitted reminder notification to user:${userId}`);
};

/**
 * Emit community data update to school subscribers
 */
export const emitCommunityDataUpdate = (
  io: Server,
  schoolId: string,
  stats: any
) => {
  io.to(`school:${schoolId}`).emit('community:stats:updated', {
    schoolId,
    stats,
    timestamp: new Date().toISOString(),
  });

  console.log(`📊 Emitted community stats update for school:${schoolId}`);
};

/**
 * Emit new community contribution notification
 */
export const emitNewCommunityContribution = (
  io: Server,
  schoolId: string,
  year: number
) => {
  io.to(`school:${schoolId}`).emit('community:contribution:new', {
    schoolId,
    year,
    timestamp: new Date().toISOString(),
  });

  console.log(`✨ Emitted new contribution notification for school:${schoolId} (${year})`);
};

/**
 * Broadcast system announcement to all users
 */
export const broadcastAnnouncement = (
  io: Server,
  announcement: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
  }
) => {
  io.emit('system:announcement', {
    ...announcement,
    timestamp: new Date().toISOString(),
  });

  console.log(`📢 Broadcasted system announcement: ${announcement.title}`);
};

/**
 * Get count of active users
 */
export const getActiveUserCount = (): number => {
  return activeUsers.size;
};

/**
 * Get active user IDs
 */
export const getActiveUserIds = (): string[] => {
  return Array.from(activeUsers.values()).map((user) => user.userId);
};

/**
 * Check if user is connected
 */
export const isUserConnected = (userId: string): boolean => {
  return Array.from(activeUsers.values()).some((user) => user.userId === userId);
};

export default setupEnhancedSocketIO;
