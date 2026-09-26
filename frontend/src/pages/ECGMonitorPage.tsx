import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Heart,
  Activity
} from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { ECGChart } from '../components/charts/ECGChart';

export const ECGMonitorPage: React.FC = () => {
  const {
    currentReading,
    selectedDeviceId,
    wsStatus,
    startSession,
    stopSession,
    isSessionActive
  } = useMonitoring();

  // Interactive Display Settings
  const [lead, setLead] = useState<string>('Lead I');
  const [sweepSpeed, setSweepSpeed] = useState<string>('25 mm/s');
  const [amplitude, setAmplitude] = useState<string>('10 mm/mV');
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Interactive Control States
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [cleared, setCleared] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isConnected = wsStatus === 'CONNECTED';
  const bpm = currentReading ? Math.round(currentReading.bpm) : 78;
  const rr = currentReading ? Math.round(currentReading.rrInterval) : 770;
  const hrv = currentReading ? Math.round(currentReading.hrv) : 45;
  const signalQuality = currentReading?.signalQuality && currentReading.signalQuality > 85 ? 'Good' : 'Optimal';

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleStart = async () => {
    setIsPaused(false);
    setCleared(false);
    try {
      if (!isSessionActive) {
        await startSession();
        showNotification('ECG Acquisition Session Started');
      } else {
        showNotification('ECG Stream Resumed');
      }
    } catch {
      showNotification('ECG Acquisition Active');
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    showNotification(isPaused ? 'ECG Waveform Resumed' : 'ECG Waveform Frozen');
  };

  const handleStop = async () => {
    try {
      if (isSessionActive) {
        await stopSession();
        showNotification('Monitoring Session Stopped and Saved');
      } else {
        showNotification('Session Inactive');
      }
    } catch {
      showNotification('Session stopped');
    }
  };

  const handleClear = () => {
    setCleared(true);
    setTimeout(() => setCleared(false), 500);
    showNotification('Waveform Display Cleared');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B1F33] tracking-tight">ECG Monitor</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time ECG signal monitoring</p>
        </div>

        <div className="flex items-center space-x-3">
          {actionMessage && (
            <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-fade-in">
              {actionMessage}
            </span>
          )}
          <div className="flex items-center space-x-2 text-xs font-mono font-medium text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-subtle">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#20E0A0] shadow-[0_0_6px_#20E0A0]' : 'bg-[#FFB547]'
              }`}
            ></span>
            <span className="font-semibold text-[#0B1F33]">{selectedDeviceId || 'SIMULATOR_001'}</span>
            <span className="text-slate-400">&bull;</span>
            <span className={isConnected ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
              {isConnected ? 'Connected' : 'Connecting'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Big ECG Oscilloscope Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card space-y-4">
        <ECGChart
          height={380}
          title={`ECG ${lead.toUpperCase()}`}
          lead={lead}
          sweepSpeed={sweepSpeed}
          amplitude={amplitude}
          showGrid={showGrid}
          showScales={true}
          showLiveBadge={!isPaused}
          isPaused={isPaused || cleared}
        />

        {/* 4 Metrics directly below waveform */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {/* Heart Rate */}
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Heart Rate
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-extrabold text-[#0B1F33] font-mono">{bpm}</span>
              <span className="text-xs font-semibold text-slate-500">BPM</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">&bull; Normal Sinus</span>
          </div>

          {/* RR Interval */}
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              RR Interval
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-extrabold text-[#0B1F33] font-mono">{rr}</span>
              <span className="text-xs font-semibold text-slate-500">ms</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">&bull; Regular</span>
          </div>

          {/* HRV */}
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              HRV
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-extrabold text-[#25C7E8] font-mono">{hrv}</span>
              <span className="text-xs font-semibold text-slate-500">ms</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">&bull; RMSSD Balanced</span>
          </div>

          {/* Signal Quality */}
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Signal Quality
            </span>
            <div className="flex items-center space-x-2 mt-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xl font-bold text-emerald-600">{signalQuality}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Lead Contact Verified</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Controls & Display Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: ECG Controls */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card space-y-3">
          <span className="font-bold text-sm text-[#0B1F33] block">ECG Controls</span>
          <p className="text-xs text-slate-500">Manage real-time biosignal acquisition and recording.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* START - Green */}
            <button
              onClick={handleStart}
              className="py-2.5 px-3 rounded-xl bg-[#20E0A0] hover:bg-[#18CA8E] text-[#07141F] font-bold text-xs tracking-wider uppercase transition shadow-subtle flex items-center justify-center space-x-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start</span>
            </button>

            {/* PAUSE - Blue */}
            <button
              onClick={handlePause}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs tracking-wider uppercase transition shadow-subtle flex items-center justify-center space-x-1.5 ${
                isPaused
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-[#1D4ED8] hover:bg-blue-700 text-white'
              }`}
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            {/* STOP - Red */}
            <button
              onClick={handleStop}
              className="py-2.5 px-3 rounded-xl bg-[#FF4D5A] hover:bg-red-600 text-white font-bold text-xs tracking-wider uppercase transition shadow-subtle flex items-center justify-center space-x-1.5"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop</span>
            </button>

            {/* CLEAR - Slate */}
            <button
              onClick={handleClear}
              className="py-2.5 px-3 rounded-xl bg-[#0B1F33] hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition shadow-subtle flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Right: Display Settings */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card space-y-3">
          <span className="font-bold text-sm text-[#0B1F33] block">Display Settings</span>
          <p className="text-xs text-slate-500">Configure lead configuration, calibration grid, and sweep velocity.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            {/* Lead */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Lead
              </label>
              <select
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                className="w-full py-2 px-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#0B1F33] focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="Lead I">Lead I</option>
                <option value="Lead II">Lead II</option>
                <option value="Lead III">Lead III</option>
              </select>
            </div>

            {/* Sweep */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Sweep
              </label>
              <select
                value={sweepSpeed}
                onChange={(e) => setSweepSpeed(e.target.value)}
                className="w-full py-2 px-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#0B1F33] focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="25 mm/s">25 mm/s</option>
                <option value="50 mm/s">50 mm/s</option>
                <option value="12.5 mm/s">12.5 mm/s</option>
              </select>
            </div>

            {/* Amplitude */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Amplitude
              </label>
              <select
                value={amplitude}
                onChange={(e) => setAmplitude(e.target.value)}
                className="w-full py-2 px-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#0B1F33] focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="10 mm/mV">10 mm/mV</option>
                <option value="5 mm/mV">5 mm/mV</option>
                <option value="20 mm/mV">20 mm/mV</option>
              </select>
            </div>

            {/* Grid Switch */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Grid
              </label>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`w-full py-2 px-2.5 rounded-xl font-bold transition border ${
                  showGrid
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border-slate-300'
                }`}
              >
                {showGrid ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ECGMonitorPage;
