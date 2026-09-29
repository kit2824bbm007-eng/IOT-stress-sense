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
  private readableStreamClosed: Promise<void> | null = null;
  private isReading = false;
  private onPacketCallbacks: PacketCallback[] = [];
  private onStatusCallbacks: StatusCallback[] = [];

  public isSupported(): boolean {
    return 'serial' in navigator;
  }

  public isConnected(): boolean {
    return this.isReading && this.port !== null;
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
      throw new Error('Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
    }

    try {
      // If already holding a port, cleanly disconnect first
      if (this.port) {
        await this.disconnect();
      }

      // Prompt user to select Arduino USB port
      // @ts-ignore
      this.port = await navigator.serial.requestPort();

      // Open port only if not already open
      if (!this.port.readable) {
        await this.port.open({ baudRate: 115200 });
      }

      this.notifyStatus(true, 'Arduino USB Connected');
      this.startReading();
      return true;
    } catch (err: any) {
      console.error('Serial connection error:', err);
      this.notifyStatus(false);
      let msg = err.message || 'Could not connect to USB serial device.';
      if (
        msg.includes('Failed to open') ||
        msg.includes('already open') ||
        msg.includes('busy') ||
        err.name === 'NetworkError'
      ) {
        msg = 'Serial port is currently locked or in use. Please unplug the Arduino USB cable from your Mac, plug it back in, and ensure the Arduino IDE Serial Monitor is closed before retrying.';
      }
      throw new Error(msg);
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
      this.reader = null;
    }
    if (this.readableStreamClosed) {
      try {
        await this.readableStreamClosed.catch(() => {});
      } catch (e) {
        // ignore
      }
      this.readableStreamClosed = null;
    }
    if (this.port) {
      try {
        await this.port.close();
      } catch (e) {
        console.warn('Port close notice:', e);
      }
      this.port = null;
    }
    this.notifyStatus(false);
  }

  private async startReading(): Promise<void> {
    this.isReading = true;
    const textDecoder = new TextDecoderStream();
    // @ts-ignore
    this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
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
            if (!trimmed) continue;

            // 1. Primary: JSON Telemetry Packet extraction
            const startIdx = trimmed.indexOf('{');
            const endIdx = trimmed.lastIndexOf('}');
            if (startIdx !== -1 && endIdx > startIdx) {
              const jsonStr = trimmed.slice(startIdx, endIdx + 1);
              try {
                const packet: SerialTelemetryPacket = JSON.parse(jsonStr);
                if (
                  packet &&
                  (typeof packet.bpm === 'number' || (Array.isArray(packet.ecgSamples) && packet.ecgSamples.length > 0))
                ) {
                  this.notifyPacket(packet);
                  continue;
                }
              } catch (e) {
                // Not valid JSON chunk
              }
            }

            // 2. Fallback: Raw ADC / Float sample stream (e.g. "512" or "0.45")
            const num = parseFloat(trimmed);
            if (!isNaN(num) && isFinite(num) && !trimmed.includes(':')) {
              // Convert 0-1023 ADC or pass direct float
              const sampleMv = num > 50 ? ((num - 512.0) * 3.3) / 1024.0 : num;
              this.notifyPacket({
                deviceId: 'ARDUINO_001',
                deviceType: 'ARDUINO_ECG',
                bpm: 0,
                signalQuality: 95,
                ecgSamples: [sampleMv],
              });
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

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    webSerialService.disconnect();
  });
}

export default webSerialService;
