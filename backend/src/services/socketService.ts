import { Server, Socket } from 'socket.io';

export const setupSocketIO = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Handle school updates subscription
    socket.on('subscribe:school', (schoolId: string) => {
      socket.join(`school:${schoolId}`);
      console.log(`📚 Client ${socket.id} subscribed to school: ${schoolId}`);
    });

    // Handle unsubscribe
    socket.on('unsubscribe:school', (schoolId: string) => {
      socket.leave(`school:${schoolId}`);
      console.log(`📚 Client ${socket.id} unsubscribed from school: ${schoolId}`);
    });

    // Handle application status updates
    socket.on('application:update', (data) => {
      console.log(`📝 Application update from ${socket.id}:`, data);
      // Broadcast to all clients subscribed to this school
      socket.to(`school:${data.schoolId}`).emit('application:updated', data);
    });

    // Handle decision notifications
    socket.on('decision:report', (data) => {
      console.log(`🎓 Decision reported by ${socket.id}:`, data);
      // Broadcast to all clients
      io.emit('decision:new', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper function to emit events from other parts of the application
export const emitToSchool = (io: Server, schoolId: string, event: string, data: any) => {
  io.to(`school:${schoolId}`).emit(event, data);
};

export const emitToAll = (io: Server, event: string, data: any) => {
  io.emit(event, data);
};
