import { io, Socket } from 'socket.io-client';

class RealtimeService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✓ Real-time connection established');
    });

    this.socket.on('disconnect', () => {
      console.log('✗ Real-time connection lost');
    });

    // Listen for all events
    this.socket.on('interview:started', (data: Record<string, unknown>) => this.emit('interview:started', data));
    this.socket.on('interview:completed', (data: Record<string, unknown>) => this.emit('interview:completed', data));
    this.socket.on('application:updated', (data: Record<string, unknown>) => this.emit('application:updated', data));
    this.socket.on('job:created', (data: Record<string, unknown>) => this.emit('job:created', data));
    this.socket.on('user:online', (data: Record<string, unknown>) => this.emit('user:online', data));
    this.socket.on('dashboard:update', (data: Record<string, unknown>) => this.emit('dashboard:update', data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)!.delete(callback);
    };
  }

  private emit(event: string, data: Record<string, unknown>) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }

  // Emit events to server
  emitEvent(event: string, data: Record<string, unknown>) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

export default new RealtimeService();
