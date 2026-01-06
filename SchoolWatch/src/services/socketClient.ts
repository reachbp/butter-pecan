import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

/**
 * Socket.IO Client Service
 * Manages real-time connections and event handling
 */

class SocketClientService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Initialize and connect to Socket.IO server
   */
  connect(userId: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.userId = userId;

    // Create socket connection
    this.socket = io(API_BASE_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventHandlers();
    console.log('🔌 Connecting to Socket.IO server...');
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.reconnectAttempts = 0;
      console.log('🔌 Disconnected from Socket.IO server');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;

      // Authenticate user
      if (this.userId) {
        this.socket?.emit('auth:login', { userId: this.userId });
      }
    });

    this.socket.on('auth:success', (data) => {
      console.log('👤 Socket authenticated:', data);
      this.emitToListeners('auth:success', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.emitToListeners('disconnect', { reason });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error(`⚠️ Connection error (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}):`, error);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        this.emitToListeners('reconnect:failed', { error });
      }
    });

    // Application events
    this.socket.on('application:updated', (data) => {
      console.log('📝 Application updated:', data);
      this.emitToListeners('application:updated', data);
    });

    // Reminder events
    this.socket.on('reminder:notification', (data) => {
      console.log('🔔 Reminder notification:', data);
      this.emitToListeners('reminder:notification', data);
    });

    // Community data events
    this.socket.on('community:stats:updated', (data) => {
      console.log('📊 Community stats updated:', data);
      this.emitToListeners('community:stats:updated', data);
    });

    this.socket.on('community:contribution:new', (data) => {
      console.log('✨ New community contribution:', data);
      this.emitToListeners('community:contribution:new', data);
    });

    // System events
    this.socket.on('system:announcement', (data) => {
      console.log('📢 System announcement:', data);
      this.emitToListeners('system:announcement', data);
    });

    // Heartbeat
    this.socket.on('heartbeat:ack', (data) => {
      this.emitToListeners('heartbeat:ack', data);
    });
  }

  /**
   * Subscribe to school updates
   */
  subscribeToSchool(schoolId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot subscribe: Socket not connected');
      return;
    }

    this.socket.emit('subscribe:school', schoolId);
    console.log('📚 Subscribed to school:', schoolId);
  }

  /**
   * Unsubscribe from school updates
   */
  unsubscribeFromSchool(schoolId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('unsubscribe:school', schoolId);
    console.log('📚 Unsubscribed from school:', schoolId);
  }

  /**
   * Subscribe to application updates
   */
  subscribeToApplication(applicationId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot subscribe: Socket not connected');
      return;
    }

    this.socket.emit('subscribe:application', applicationId);
    console.log('📝 Subscribed to application:', applicationId);
  }

  /**
   * Unsubscribe from application updates
   */
  unsubscribeFromApplication(applicationId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('unsubscribe:application', applicationId);
    console.log('📝 Unsubscribed from application:', applicationId);
  }

  /**
   * Send heartbeat
   */
  sendHeartbeat(): void {
    if (this.socket?.connected) {
      this.socket.emit('heartbeat');
    }
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Remove all event listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitToListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    userId: string | null;
    socketId: string | null;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected(),
      userId: this.userId,
      socketId: this.socket?.id ?? null,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Export singleton instance
export const socketClient = new SocketClientService();
export default socketClient;
