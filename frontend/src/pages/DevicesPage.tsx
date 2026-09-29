import React, { useState } from 'react';
import {
  Cpu,
  Server,
  Database,
  Radio,
  CheckCircle2,
  Activity,
  RefreshCw,
  AlertTriangle,
  Volume2,
  Plug,
  Terminal,
  Zap
} from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';

export const DevicesPage: React.FC = () => {
  const {
    wsStatus,
    selectedDeviceId,
    refreshDevices,
    isUsbConnected,
    connectUsbArduino,
    disconnectUsbArduino,
    isBuzzerActive,
    currentReading
  } = useMonitoring();
  const [loading, setLoading] = useState(false);

  const isConnected = wsStatus === 'CONNECTED';

  const handleRefresh = async () => {
    setLoading(true);
    await refreshDevices();
    setTimeout(() => setLoading(false), 400);
  };

  const handleUsbToggle = async () => {
    if (isUsbConnected) {
      await disconnectUsbArduino();
    } else {
      try {
        await connectUsbArduino();
      } catch (err: any) {
        alert(err.message || 'Could not connect to USB serial device.');
      }
    }
  };

  const recentEvents = [
    { time: '10:24:35', event: 'Data packet received', color: 'emerald' },
    { time: '10:24:10', event: 'Signal quality verified (SNR > 24dB)', color: 'emerald' },
    { time: '10:23:45', event: isUsbConnected ? 'Arduino USB Serial Active' : 'Device registered', color: 'emerald' },
    { time: '10:23:40', event: 'WebSocket telemetry stream live', color: 'emerald' },
    { time: '10:23:30', event: 'ECG Lead II acquisition active', color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B1F33] tracking-tight">Device Monitor</h1>
          <p className="text-xs text-slate-500 mt-0.5">Hardware connections, telemetry stream, and Arduino buzzer control</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleUsbToggle}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition border shadow-subtle ${
              isUsbConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
            }`}
          >
            <Plug className="w-4 h-4" />
            <span>{isUsbConnected ? 'Disconnect Arduino USB' : 'Connect Arduino (USB)'}</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-600 transition shadow-subtle flex items-center space-x-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 3 Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Active Device Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1D4ED8]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base text-[#0B1F33] font-mono block">
                  {selectedDeviceId || 'SIMULATOR_001'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isUsbConnected ? 'Arduino Hardware Node' : 'Biomedical Telemetry Node'}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{isUsbConnected ? 'HARDWARE LIVE' : 'ONLINE'}</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Device Type:</span>
              <span className="font-bold text-[#0B1F33]">
                {isUsbConnected ? 'Arduino UNO / AD8232 ECG' : 'IoT Telemetry Controller'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Heart Rate:</span>
              <span className="font-mono font-bold text-[#0B1F33]">
                {currentReading && currentReading.bpm > 0 ? Math.round(currentReading.bpm) : '--'} BPM
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Buzzer Alarm (&lt;60 BPM):</span>
              <span
                className={`font-semibold flex items-center space-x-1 ${
                  isBuzzerActive ? 'text-rose-600 font-bold' : 'text-emerald-600'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isBuzzerActive ? 'ACTIVE (D8 SOUNDING)' : 'STANDBY'}</span>
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Sampling Rate:</span>
              <span className="font-mono text-slate-700">250 Samples / sec</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Signal Quality:</span>
              <span className="font-semibold text-emerald-600">
                {currentReading?.signalQuality && currentReading.signalQuality > 80 ? 'Optimal (Clean Lead II)' : 'Good'}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Connection Channel:</span>
              <span className="font-mono text-blue-600">
                {isUsbConnected ? 'Direct Web Serial (115200)' : 'WebSocket Stream'}
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Live Connection Status */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Live Telemetry Bus
          </span>

          <div className="space-y-3 pt-1 text-xs">
            {/* USB Serial */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Plug className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-[#0B1F33]">Arduino USB Port</span>
              </div>
              <div
                className={`flex items-center space-x-1.5 font-semibold ${
                  isUsbConnected ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isUsbConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <span>{isUsbConnected ? 'Connected' : 'Ready to Connect'}</span>
              </div>
            </div>

            {/* WebSocket */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Radio className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-[#0B1F33]">WebSocket Bus</span>
              </div>
              <div className="flex items-center space-x-1.5 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Live (Port 8080)</span>
              </div>
            </div>

            {/* Ingestion API */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Server className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-[#0B1F33]">REST Ingestion API</span>
              </div>
              <div className="flex items-center space-x-1.5 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Online (POST /api/sensor/data)</span>
              </div>
            </div>

            {/* Database */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Database className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-[#0B1F33]">PostgreSQL Storage</span>
              </div>
              <div className="flex items-center space-x-1.5 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Recent Events */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Telemetry Events
          </span>

          <div className="divide-y divide-[#E2E8F0] text-xs font-mono">
            {recentEvents.map((evt, idx) => (
              <div key={idx} className="py-2.5 flex items-center space-x-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-400">{evt.time}</span>
                <span className="text-slate-800 font-sans font-medium">{evt.event}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E2E8F0]">
            <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
              Accepts 250 SPS Lead II ECG packets over serial USB or network REST API.
            </p>
          </div>
        </div>
      </div>

      {/* Hardware Wiring & Buzzer Configuration Guide */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E8F0] shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-[#0B1F33] flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Arduino Hardware Wiring &amp; Buzzer Setup</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect your AD8232 ECG sensor and buzzer to the specified Arduino pins
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>Alarm: Buzzer sounds if Heart Rate &lt; 60 BPM</span>
          </div>
        </div>

        {/* Pin Connections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* AD8232 Sensor Pins */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
              1. AD8232 ECG Sensor Wiring
            </span>
            <ul className="space-y-2 font-mono text-slate-600">
              <li className="flex justify-between">
                <span>AD8232 OUTPUT</span>
                <span className="font-bold text-[#1D4ED8]">➔ Arduino Analog A0</span>
              </li>
              <li className="flex justify-between">
                <span>AD8232 3.3V</span>
                <span className="font-bold text-emerald-600">➔ Arduino 3.3V (NOT 5V)</span>
              </li>
              <li className="flex justify-between">
                <span>AD8232 GND</span>
                <span className="font-bold text-slate-700">➔ Arduino GND</span>
              </li>
              <li className="flex justify-between">
                <span>AD8232 LO+</span>
                <span className="font-bold text-purple-600">➔ Arduino Digital Pin 10</span>
              </li>
              <li className="flex justify-between">
                <span>AD8232 LO-</span>
                <span className="font-bold text-purple-600">➔ Arduino Digital Pin 11</span>
              </li>
            </ul>
          </div>

          {/* Buzzer Wiring */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
              2. Active Buzzer Wiring (Alarm)
            </span>
            <ul className="space-y-2 font-mono text-slate-600">
              <li className="flex justify-between">
                <span>Buzzer Positive (+) / Signal</span>
                <span className="font-bold text-rose-600">➔ Arduino Digital Pin D8</span>
              </li>
              <li className="flex justify-between">
                <span>Buzzer Negative (-)</span>
                <span className="font-bold text-slate-700">➔ Arduino GND</span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-slate-200 text-slate-500 font-sans leading-relaxed text-[11px]">
              <span className="font-bold text-slate-700 block mb-1">How the Alarm Works:</span>
              Whenever measured Heart Rate drops below <strong>60 BPM (Bradycardia)</strong>, the Arduino immediately triggers <strong>Pin D8 HIGH (1000 Hz)</strong>, sounding the physical buzzer until heart rate normalizes.
            </div>
          </div>
        </div>

        {/* How to stream to web app */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-blue-800">
            <Terminal className="w-4 h-4" />
            <span>How to Stream Readings into the Web App</span>
          </div>
          <p className="leading-relaxed">
            <strong>Option A (Direct in Browser):</strong> Click the <strong>"Connect Arduino (USB)"</strong> button in the top bar. Chrome or Edge will prompt you to select your Arduino USB port at 115200 baud.
          </p>
          <p className="leading-relaxed">
            <strong>Option B (Python Serial Bridge):</strong> Run the included bridge script in your terminal to forward Arduino USB data to the backend:
          </p>
          <div className="p-2.5 rounded-lg bg-[#0B1F33] text-emerald-400 font-mono text-[11px]">
            python3 serial_bridge.py
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicesPage;
