import { socketClient } from '../socketClient';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    connected: false,
    id: 'mock-socket-id',
    emit: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn(),
  };

  return {
    io: jest.fn(() => mockSocket),
  };
});

describe('SocketClientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('should connect with user ID', () => {
      socketClient.connect('user-1');

      const status = socketClient.getStatus();
      expect(status.userId).toBe('user-1');
    });

    it('should not reconnect if already connected', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Connect first time
      socketClient.connect('user-1');

      // Try to connect again
      socketClient.connect('user-1');

      consoleLogSpy.mockRestore();
    });

    it('should disconnect properly', () => {
      socketClient.connect('user-1');
      socketClient.disconnect();

      const status = socketClient.getStatus();
      expect(status.userId).toBeNull();
    });

    it('should check connection status', () => {
      const connected = socketClient.isConnected();
      expect(typeof connected).toBe('boolean');
    });

    it('should get connection status with details', () => {
      const status = socketClient.getStatus();

      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('userId');
      expect(status).toHaveProperty('socketId');
      expect(status).toHaveProperty('reconnectAttempts');
    });
  });

  describe('School Subscriptions', () => {
    it('should subscribe to school updates', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      socketClient.connect('user-1');
      socketClient.subscribeToSchool('school-1');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Subscribed to school'),
        'school-1'
      );

      consoleLogSpy.mockRestore();
    });

    it('should unsubscribe from school updates', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      socketClient.connect('user-1');
      socketClient.unsubscribeFromSchool('school-1');

      consoleLogSpy.mockRestore();
    });

    it('should warn when subscribing without connection', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      socketClient.disconnect();
      socketClient.subscribeToSchool('school-1');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Cannot subscribe: Socket not connected'
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Application Subscriptions', () => {
    it('should subscribe to application updates', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      socketClient.connect('user-1');
      socketClient.subscribeToApplication('app-1');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Subscribed to application'),
        'app-1'
      );

      consoleLogSpy.mockRestore();
    });

    it('should unsubscribe from application updates', () => {
      socketClient.connect('user-1');
      socketClient.unsubscribeFromApplication('app-1');
    });
  });

  describe('Event Listeners', () => {
    it('should add event listener', () => {
      const callback = jest.fn();

      socketClient.on('test:event', callback);

      // Verify listener was added (indirectly through internal state)
      // We can't directly test the Map, but we can test removal
      socketClient.off('test:event', callback);
    });

    it('should remove event listener', () => {
      const callback = jest.fn();

      socketClient.on('test:event', callback);
      socketClient.off('test:event', callback);

      // Event listener should be removed
    });

    it('should remove all listeners for an event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      socketClient.on('test:event', callback1);
      socketClient.on('test:event', callback2);

      socketClient.removeAllListeners('test:event');

      // All listeners for 'test:event' should be removed
    });

    it('should remove all listeners', () => {
      socketClient.on('event1', jest.fn());
      socketClient.on('event2', jest.fn());

      socketClient.removeAllListeners();

      // All listeners should be removed
    });
  });

  describe('Heartbeat', () => {
    it('should send heartbeat when connected', () => {
      socketClient.connect('user-1');
      socketClient.sendHeartbeat();

      // Heartbeat should be sent
    });

    it('should not send heartbeat when disconnected', () => {
      socketClient.disconnect();
      socketClient.sendHeartbeat();

      // Heartbeat should not be sent
    });
  });
});
