/**
 * Web Serial API Service for Direct Browser-to-Arduino USB Communication
 * Works in modern browsers (Chrome, Edge, Opera) without needing any backend bridge!
 */

export interface SerialTelemetryPacket {
  deviceId: string;
  deviceType?: string;
  bpm: number;
  rrInterval?: number;
  hrv?: number;
  stressIndex?: number;
  relaxationIndex?: number;
  signalQuality?: number;
  buzzerAlarm?: boolean;
  ecgSamples?: number[];
}

type PacketCallback = (data: SerialTelemetryPacket) => void;
type StatusCallback = (connected: boolean, portName?: string) => void;

class WebSerialService {
  private port: any = null;
  private reader: any = null;
  private isReading = false;
  private onPacketCallbacks: PacketCallback[] = [];
  private onStatusCallbacks: StatusCallback[] = [];

  public isSupported(): boolean {
    return 'serial' in navigator;
  }

  public subscribePacket(cb: PacketCallback): () => void {
    this.onPacketCallbacks.push(cb);
    return () => {
      this.onPacketCallbacks = this.onPacketCallbacks.filter((c) => c !== cb);
    };
  }

  public subscribeStatus(cb: StatusCallback): () => void {
    this.onStatusCallbacks.push(cb);
    return () => {
      this.onStatusCallbacks = this.onStatusCallbacks.filter((c) => c !== cb);
    };
  }

  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or run the serial_bridge.py Python script.');
    }

    try {
      // Prompt user to select Arduino USB port
      // @ts-ignore
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      this.notifyStatus(true, 'Arduino USB Connected');
      this.startReading();
      return true;
    } catch (err: any) {
      console.error('Serial connection error:', err);
      this.notifyStatus(false);
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    this.isReading = false;
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (e) {
        // ignore
      }
    }
    if (this.port) {
      try {
        await this.port.close();
      } catch (e) {
        // ignore
      }
      this.port = null;
    }
    this.notifyStatus(false);
  }

  private async startReading(): Promise<void> {
    this.isReading = true;
    const textDecoder = new TextDecoderStream();
    // @ts-ignore
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    this.reader = reader;

    let buffer = '';

    try {
      while (this.isReading) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep remainder

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
              try {
                const packet: SerialTelemetryPacket = JSON.parse(trimmed);
                this.notifyPacket(packet);
              } catch (e) {
                // Not valid JSON, ignore
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Serial read loop ended:', error);
    } finally {
      reader.releaseLock();
      this.notifyStatus(false);
    }
  }

  private notifyPacket(packet: SerialTelemetryPacket): void {
    this.onPacketCallbacks.forEach((cb) => cb(packet));
  }

  private notifyStatus(connected: boolean, portName?: string): void {
    this.onStatusCallbacks.forEach((cb) => cb(connected, portName));
  }
}

export const webSerialService = new WebSerialService();
export default webSerialService;
