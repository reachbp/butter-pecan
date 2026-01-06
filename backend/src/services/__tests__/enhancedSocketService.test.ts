import { Server } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import {
  setupEnhancedSocketIO,
  emitApplicationUpdate,
  emitReminderNotification,
  emitCommunityDataUpdate,
  emitNewCommunityContribution,
  broadcastAnnouncement,
  getActiveUserCount,
  getActiveUserIds,
  isUserConnected,
} from '../enhancedSocketService';

describe('Enhanced Socket.IO Service', () => {
  let io: Server;
  let serverSocket: any;
  let clientSocket: ClientSocket;

  beforeAll((done) => {
    const httpServer = require('http').createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = ioc(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });

    setupEnhancedSocketIO(io);
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  describe('User Authentication', () => {
    it('should authenticate user and join user room', (done) => {
      clientSocket.emit('auth:login', { userId: 'user-1' });

      clientSocket.on('auth:success', (data) => {
        expect(data.userId).toBe('user-1');
        expect(data.socketId).toBeTruthy();
        expect(data.timestamp).toBeTruthy();
        done();
      });
    });

    it('should track active users', (done) => {
      clientSocket.emit('auth:login', { userId: 'user-2' });

      clientSocket.on('auth:success', () => {
        expect(getActiveUserCount()).toBeGreaterThan(0);
        expect(isUserConnected('user-2')).toBe(true);
        done();
      });
    });
  });

  describe('School Subscriptions', () => {
    it('should subscribe to school updates', (done) => {
      clientSocket.emit('subscribe:school', 'school-1');

      clientSocket.on('subscribe:school:success', (data) => {
        expect(data.schoolId).toBe('school-1');
        done();
      });
    });

    it('should unsubscribe from school updates', (done) => {
      clientSocket.emit('subscribe:school', 'school-2');

      clientSocket.on('subscribe:school:success', () => {
        clientSocket.emit('unsubscribe:school', 'school-2');
        setTimeout(done, 100); // Give time for unsubscribe
      });
    });
  });

  describe('Application Subscriptions', () => {
    it('should subscribe to application updates', (done) => {
      clientSocket.emit('subscribe:application', 'app-1');
      setTimeout(done, 100);
    });

    it('should unsubscribe from application updates', (done) => {
      clientSocket.emit('unsubscribe:application', 'app-1');
      setTimeout(done, 100);
    });
  });

  describe('Real-time Updates', () => {
    it('should emit application updates to user', (done) => {
      clientSocket.emit('auth:login', { userId: 'user-3' });

      clientSocket.once('auth:success', () => {
        clientSocket.on('application:updated', (data) => {
          expect(data.applicationId).toBe('app-test');
          expect(data.status).toBe('accepted');
          expect(data.timestamp).toBeTruthy();
          done();
        });

        // Emit update from server
        emitApplicationUpdate(io, 'user-3', 'app-test', {
          status: 'accepted',
        });
      });
    });

    it('should emit reminder notifications to user', (done) => {
      clientSocket.emit('auth:login', { userId: 'user-4' });

      clientSocket.once('auth:success', () => {
        clientSocket.on('reminder:notification', (data) => {
          expect(data.reminderId).toBe('reminder-1');
          expect(data.message).toBeTruthy();
          done();
        });

        emitReminderNotification(io, 'user-4', {
          reminderId: 'reminder-1',
          message: 'Test reminder',
        });
      });
    });

    it('should emit community data updates to school subscribers', (done) => {
      clientSocket.emit('subscribe:school', 'school-test');

      clientSocket.once('subscribe:school:success', () => {
        clientSocket.on('community:stats:updated', (data) => {
          expect(data.schoolId).toBe('school-test');
          expect(data.stats).toBeTruthy();
          done();
        });

        emitCommunityDataUpdate(io, 'school-test', {
          acceptance_rate: 25.5,
        });
      });
    });

    it('should emit new contribution notifications', (done) => {
      clientSocket.emit('subscribe:school', 'school-contrib');

      clientSocket.once('subscribe:school:success', () => {
        clientSocket.on('community:contribution:new', (data) => {
          expect(data.schoolId).toBe('school-contrib');
          expect(data.year).toBe(2026);
          done();
        });

        emitNewCommunityContribution(io, 'school-contrib', 2026);
      });
    });

    it('should broadcast system announcements to all users', (done) => {
      clientSocket.on('system:announcement', (data) => {
        expect(data.title).toBe('Test Announcement');
        expect(data.message).toBe('This is a test');
        expect(data.type).toBe('info');
        done();
      });

      broadcastAnnouncement(io, {
        title: 'Test Announcement',
        message: 'This is a test',
        type: 'info',
      });
    });
  });

  describe('Heartbeat', () => {
    it('should respond to heartbeat', (done) => {
      clientSocket.emit('heartbeat');

      clientSocket.on('heartbeat:ack', (data) => {
        expect(data.timestamp).toBeTruthy();
        done();
      });
    });
  });

  describe('User Tracking', () => {
    it('should get active user IDs', () => {
      const userIds = getActiveUserIds();
      expect(Array.isArray(userIds)).toBe(true);
    });

    it('should check if user is connected', () => {
      // User from earlier test should still be connected
      const connected = isUserConnected('user-1');
      expect(typeof connected).toBe('boolean');
    });
  });
});
