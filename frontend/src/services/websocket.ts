import { SensorReadingData } from '../types';

export type WebSocketStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

type MessageCallback = (data: SensorReadingData) => void;
type StatusCallback = (status: WebSocketStatus) => void;

class SensorWebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private messageListeners: Set<MessageCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 50;
  private reconnectTimeoutId: number | null = null;
  private isIntentionallyClosed = false;

  constructor() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_HOST || 'localhost:8080';
    this.url = `${wsProtocol}//${host}/ws/sensor`;
  }

  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isIntentionallyClosed = false;
    this.notifyStatus('CONNECTING');

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.notifyStatus('CONNECTED');
        console.log('[StressSense WS] Connected to live sensor stream:', this.url);
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data) as SensorReadingData;
          this.notifyMessage(parsed);
        } catch (err) {
          console.warn('[StressSense WS] Received non-JSON or invalid message:', err);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[StressSense WS] Connection error encountered:', err);
        this.notifyStatus('ERROR');
      };

      this.socket.onclose = () => {
        this.notifyStatus('DISCONNECTED');
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('[StressSense WS] Failed to initialize WebSocket:', err);
      this.notifyStatus('ERROR');
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimeoutId !== null) {
      window.clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.notifyStatus('DISCONNECTED');
  }

  public subscribeMessage(callback: MessageCallback): () => void {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  public subscribeStatus(callback: StatusCallback): () => void {
    this.statusListeners.add(callback);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[StressSense WS] Reached max reconnect attempts');
      return;
    }

    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;
    console.log(`[StressSense WS] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})...`);

    if (this.reconnectTimeoutId !== null) {
      window.clearTimeout(this.reconnectTimeoutId);
    }

    this.reconnectTimeoutId = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  private notifyMessage(data: SensorReadingData): void {
    this.messageListeners.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        console.error('[StressSense WS] Listener error:', err);
      }
    });
  }

  private notifyStatus(status: WebSocketStatus): void {
    this.statusListeners.forEach((fn) => {
      try {
        fn(status);
      } catch (err) {
        console.error('[StressSense WS] Status listener error:', err);
      }
    });
  }
}

export const sensorWebSocket = new SensorWebSocketService();
export default sensorWebSocket;
