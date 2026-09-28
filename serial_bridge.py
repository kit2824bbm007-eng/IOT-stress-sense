#!/usr/bin/env python3
"""
StressSense: Arduino USB to Web App Bridge
-----------------------------------------
Reads live ECG & BPM telemetry from Arduino via USB Serial port
and forwards it directly to the StressSense backend /api/sensor/data endpoint.

Requirements:
  pip install pyserial
Usage:
  python3 serial_bridge.py [OPTIONAL_SERIAL_PORT]
"""

import sys
import glob
import time
import json
import urllib.request
import urllib.error

try:
    import serial
except ImportError:
    print("\n[!] 'pyserial' is not installed.")
    print("    Please run: pip install pyserial\n")
    sys.exit(1)

BACKEND_URL = "http://localhost:8080/api/sensor/data"
DEFAULT_BAUD = 115200

def find_arduino_port():
    """Auto-detect connected Arduino USB serial ports on macOS, Linux, and Windows."""
    ports = []
    # macOS
    ports.extend(glob.glob('/dev/cu.usbmodem*'))
    ports.extend(glob.glob('/dev/cu.usbserial*'))
    ports.extend(glob.glob('/dev/tty.usbmodem*'))
    ports.extend(glob.glob('/dev/ttyUSB*'))
    ports.extend(glob.glob('/dev/ttyACM*'))
    
    # Windows
    if sys.platform.startswith('win'):
        for i in range(1, 32):
            ports.append(f"COM{i}")

    return ports

def main():
    print("=" * 65)
    print(" StressSense - Arduino Hardware Serial Bridge")
    print(f" Target Backend: {BACKEND_URL}")
    print("=" * 65)

    port = None
    if len(sys.argv) > 1:
        port = sys.argv[1]
    else:
        candidates = find_arduino_port()
        if candidates:
            port = candidates[0]
            print(f"[*] Detected Arduino on port: {port}")
        else:
            print("[!] No active Arduino USB serial port auto-detected.")
            print("    Please plug in your Arduino USB cable or specify the port:")
            print("    Example: python3 serial_bridge.py /dev/cu.usbmodem1101\n")
            print("    Available ports:")
            for p in glob.glob('/dev/cu.*'):
                print(f"      - {p}")
            sys.exit(1)

    print(f"[*] Connecting to {port} at {DEFAULT_BAUD} baud...")
    try:
        ser = serial.Serial(port, DEFAULT_BAUD, timeout=1)
        time.sleep(2)  # Wait for Arduino to reset on connection
        print("[✓] Connected to Arduino! Streaming telemetry to web app...\n")
    except Exception as e:
        print(f"[X] Failed to open port {port}: {e}")
        sys.exit(1)

    packet_count = 0
    try:
        while True:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if not line:
                continue

            # Look for JSON packet from Arduino
            if line.startswith('{') and line.endswith('}'):
                try:
                    payload = json.loads(line)
                    bpm = payload.get('bpm', 0.0)
                    hrv = payload.get('hrv', 0.0)
                    buzzer = payload.get('buzzerAlarm', False)

                    # Highlight Bradycardia Buzzer Alert
                    if bpm > 0 and bpm < 60.0:
                        alert_tag = " [⚠️ BUZZER ACTIVE: BPM < 60!]"
                    else:
                        alert_tag = ""

                    # Send to Spring Boot Backend
                    req = urllib.request.Request(
                        BACKEND_URL,
                        data=json.dumps(payload).encode('utf-8'),
                        headers={'Content-Type': 'application/json'}
                    )
                    with urllib.request.urlopen(req, timeout=2) as resp:
                        if resp.status == 200:
                            packet_count += 1
                            if packet_count % 5 == 0:
                                print(f"[→] Forwarded Packet #{packet_count} | BPM: {bpm:.1f} | HRV: {hrv:.1f} ms{alert_tag}")
                except json.JSONDecodeError:
                    pass
                except urllib.error.URLError as e:
                    print(f"[!] Backend unreachable at {BACKEND_URL} ({e.reason}). Ensure Spring Boot is running on port 8080.")
                    time.sleep(1)
                except Exception as e:
                    print(f"[!] Error forwarding data: {e}")
            else:
                # Raw debug output from Arduino
                print(f"[Arduino]: {line}")

    except KeyboardInterrupt:
        print("\n[*] Stopping serial bridge. Goodbye!")
    finally:
        ser.close()

if __name__ == '__main__':
    main()
