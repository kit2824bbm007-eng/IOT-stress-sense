import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Wifi,
  Server,
  Database,
  Radio,
  CheckCircle2,
  Activity,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import apiService from '../services/api';

export const DevicesPage: React.FC = () => {
  const { wsStatus, selectedDeviceId, devices, refreshDevices } = useMonitoring();
  const [loading, setLoading] = useState(false);

  const isConnected = wsStatus === 'CONNECTED';

  const handleRefresh = async () => {
    setLoading(true);
    await refreshDevices();
    setTimeout(() => setLoading(false), 400);
  };

  const recentEvents = [
    { time: '10:24:35', event: 'Data received', color: 'emerald' },
    { time: '10:24:10', event: 'Signal quality good', color: 'emerald' },
    { time: '10:23:45', event: 'Device connected', color: 'emerald' },
    { time: '10:23:40', event: 'WebSocket connected', color: 'emerald' },
    { time: '10:23:30', event: 'Monitoring session started', color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B1F33] tracking-tight">Device Monitor</h1>
          <p className="text-xs text-slate-500 mt-0.5">View device status and connection details</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-600 transition shadow-subtle flex items-center space-x-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* 3 Columns Layout matching reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Device Card */}
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
                <span className="text-[10px] text-slate-400 font-mono">Hardware-Agnostic Node</span>
              </div>
            </div>

            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>ONLINE</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Device Type:</span>
              <span className="font-bold text-[#0B1F33]">IoT Controller (Simulator)</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="font-semibold text-emerald-600 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Connected</span>
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Last Data:</span>
              <span className="font-mono text-slate-700">0.5 seconds ago</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Data Rate:</span>
              <span className="font-mono text-slate-700">2 readings/sec</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Signal Quality:</span>
              <span className="font-semibold text-emerald-600">Good</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Connection:</span>
              <span className="font-mono text-blue-600">WebSocket Connected</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Uptime:</span>
              <span className="font-mono text-slate-700">1h 24m 32s</span>
            </div>
          </div>
        </div>

        {/* Column 2: Live Connection Status */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Live Connection Status
          </span>

          <div className="space-y-3 pt-1 text-xs">
            {/* Device Connection */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Cpu className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-[#0B1F33]">Device Connection</span>
              </div>
              <div className="flex items-center space-x-1.5 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Connected</span>
              </div>
            </div>

            {/* WebSocket */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Radio className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-[#0B1F33]">WebSocket</span>
              </div>
              <div className="flex items-center space-x-1.5 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Connected</span>
              </div>
            </div>

            {/* Data Stream */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Activity className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-[#0B1F33]">Data Stream</span>
              </div>
              <div className="flex items-center space-x-1.5 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Live</span>
              </div>
            </div>

            {/* Backend API */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Server className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-[#0B1F33]">Backend API</span>
              </div>
              <div className="flex items-center space-x-1.5 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Online</span>
              </div>
            </div>

            {/* Database */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Database className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-[#0B1F33]">Database</span>
              </div>
              <div className="flex items-center space-x-1.5 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Recent Events */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Recent Events
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
              Standard ingestion schema compatible with ESP32, Arduino, or embedded gateway.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicesPage;
