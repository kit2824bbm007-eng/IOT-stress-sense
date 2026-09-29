import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Activity,
  Brain,
  Leaf,
  CheckCircle2,
  ArrowRight,
  Wifi,
  Radio,
  Clock
} from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { ECGChart } from '../components/charts/ECGChart';

export const DashboardPage: React.FC = () => {
  const {
    currentReading,
    wsStatus,
    selectedDeviceId,
    isSessionActive,
    isSimulatorRunning,
    isUsbConnected,
    connectUsbArduino,
    disconnectUsbArduino,
  } = useMonitoring();

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

  const isConnected = wsStatus === 'CONNECTED' || isUsbConnected;
  const isHardware = isUsbConnected || (selectedDeviceId && selectedDeviceId.startsWith('ARDUINO'));
  const isAcquiring = isSessionActive || (isSimulatorRunning && selectedDeviceId === 'SIMULATOR_001');
  const bpm = isAcquiring && currentReading && currentReading.bpm > 0 ? Math.round(currentReading.bpm) : '--';
  const hrv = isAcquiring && currentReading && currentReading.hrv ? Math.round(currentReading.hrv) : '--';
  const rr = isAcquiring && currentReading && currentReading.rrInterval ? Math.round(currentReading.rrInterval) : '--';
  const stress = isAcquiring && currentReading && currentReading.stressIndex !== undefined ? Math.round(currentReading.stressIndex) : '--';
  const relax = isAcquiring && currentReading && currentReading.relaxationIndex !== undefined ? Math.round(currentReading.relaxationIndex) : '--';
  const signalQuality = isAcquiring ? (currentReading?.signalQuality && currentReading.signalQuality > 85 ? 'Good' : 'Optimal') : 'Standby';

  const recentSessions = [
    { id: '#0001', date: '25 Sep 2026', time: '10:12 AM', duration: '5m 32s', status: 'Moderate', level: '42%', color: 'amber' },
    { id: '#0002', date: '24 Sep 2026', time: '04:18 PM', duration: '8m 21s', status: 'Low', level: '28%', color: 'emerald' },
    { id: '#0003', date: '23 Sep 2026', time: '11:05 AM', duration: '6m 15s', status: 'Moderate', level: '45%', color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Status Banner */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0B1F33] tracking-tight">Biomedical HUD</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time physiological stress & ECG telemetry</p>
        </div>

        {/* Status Badges & Quick Hardware Connect */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hardware Connect Quick Toggle Button */}
          <button
            onClick={handleUsbToggle}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition border shadow-subtle ${
              isUsbConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isUsbConnected ? 'text-emerald-600 animate-pulse' : 'text-white'}`} />
            <span>{isUsbConnected ? 'Arduino USB Live' : 'Connect Arduino (USB)'}</span>
          </button>

          {/* Device Connected */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#F4F7FA] border border-[#E2E8F0] text-xs">
            <span className={`w-2 h-2 rounded-full ${isHardware ? 'bg-[#20E0A0] shadow-[0_0_6px_#20E0A0]' : 'bg-[#FFB547]'}`}></span>
            <span className="text-slate-500 font-medium">Source:</span>
            <span className="font-semibold text-[#0B1F33] font-mono">{selectedDeviceId || (isUsbConnected ? 'ARDUINO_001' : 'SIMULATOR_001')}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isHardware ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isHardware ? 'HARDWARE' : 'SIMULATOR'}
            </span>
          </div>

          {/* Live Data */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#F4F7FA] border border-[#E2E8F0] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#25C7E8] shadow-[0_0_6px_#25C7E8]"></span>
            <span className="text-slate-500 font-medium">Stream:</span>
            <span className="font-semibold text-blue-600">{isConnected ? 'Receiving' : 'Standby'}</span>
          </div>

          {/* Session Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#F4F7FA] border border-[#E2E8F0] text-xs">
            <span className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-[#20E0A0]' : 'bg-[#FFB547]'}`}></span>
            <span className="text-slate-500 font-medium">Session</span>
            <span className="font-semibold text-[#0B1F33]">{isSessionActive ? 'Active' : 'Not Started'}</span>
          </div>
        </div>
      </div>

      {/* Main ECG Section (Large ECG Preview + Right Stats) */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left 3 cols: ECG Oscilloscope Panel */}
          <div className="lg:col-span-3">
            <ECGChart
              height={260}
              title="ECG PREVIEW (Lead I)"
              lead="Lead I"
              sweepSpeed="25 mm/s"
              amplitude="10 mm/mV"
              showGrid={true}
              showScales={true}
              showLiveBadge={true}
            />
          </div>

          {/* Right 1 col: Heart Rate & Signal Quality Card */}
          <div className="flex flex-col justify-between space-y-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Heart Rate
                </span>
                <Heart className="w-4 h-4 fill-current text-[#FF4D5A]" />
              </div>

              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-[#0B1F33] font-mono tracking-tight">
                  {bpm}
                </span>
                <span className="text-xs font-semibold text-slate-500">BPM</span>
              </div>

              <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Normal</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Signal Quality
              </span>
              <div className="flex items-center space-x-2 text-sm font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>{signalQuality}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Clean lead contact &bull; SNR &gt; 24dB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Six Medical Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Heart Rate */}
        <div className="bg-white rounded-xl p-3.5 border border-[#E2E8F0] shadow-subtle hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Heart Rate</span>
            <Heart className="w-3.5 h-3.5 fill-current text-[#FF4D5A]" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-[#0B1F33] font-mono">{bpm}</span>
            <span className="text-[10px] text-slate-400 font-semibold">BPM</span>
          </div>
          <div className="mt-1 text-[10px] font-semibold text-emerald-600 flex items-center space-x-1">
            <span>●</span>
            <span>Normal</span>
          </div>
        </div>

        {/* HRV */}
        <div className="bg-white rounded-xl p-3.5 border border-[#E2E8F0] shadow-subtle hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">HRV</span>
            <Activity className="w-3.5 h-3.5 text-[#25C7E8]" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-[#0B1F33] font-mono">{hrv}</span>
            <span className="text-[10px] text-slate-400 font-semibold">ms</span>
          </div>
          <div className="mt-1 text-[10px] font-semibold text-emerald-600 flex items-center space-x-1">
            <span>●</span>
            <span>Stable</span>
          </div>
        </div>

        {/* RR Interval */}
        <div className="bg-white rounded-xl p-3.5 border border-[#E2E8F0] shadow-subtle hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">RR Interval</span>
            <Activity className="w-3.5 h-3.5 text-[#20E0A0]" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-[#0B1F33] font-mono">{rr}</span>
            <span className="text-[10px] text-slate-400 font-semibold">ms</span>
          </div>
          <div className="mt-1 text-[10px] font-semibold text-emerald-600 flex items-center space-x-1">
            <span>●</span>
            <span>Stable</span>
          </div>
        </div>

        {/* ECG Signal Quality */}
        <div className="bg-white rounded-xl p-3.5 border border-[#E2E8F0] shadow-subtle hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Signal Quality</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-[#0B1F33] font-mono">{signalQuality}</span>
          </div>
          <div className="mt-1 text-[10px] font-semibold text-emerald-600 flex items-center space-x-1">
            <span>●</span>
            <span>Lead II Clean</span>
          </div>
        </div>

        {/* Stress Index */}
        <div className="bg-white rounded-xl p-3.5 border border-[#E2E8F0] shadow-subtle hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Stress Index</span>
            <Brain className="w-3.5 h-3.5 text-[#FFB547]" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-[#0B1F33] font-mono">{stress}%</span>
          </div>
          <div className="mt-1 text-[10px] font-semibold text-amber-600 flex items-center space-x-1">
            <span>●</span>
            <span>Moderate</span>
          </div>
        </div>

        {/* Relaxation Index */}
        <div className="bg-white rounded-xl p-3.5 border border-[#E2E8F0] shadow-subtle hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Relaxation</span>
            <Leaf className="w-3.5 h-3.5 text-[#20E0A0]" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-[#0B1F33] font-mono">{relax}%</span>
          </div>
          <div className="mt-1 text-[10px] font-semibold text-emerald-600 flex items-center space-x-1">
            <span>●</span>
            <span>Good</span>
          </div>
        </div>
      </div>

      {/* Bottom Section (2 cards: ECG Rhythm Preview + Recent Sessions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ECG Rhythm Preview */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#0B1F33]">ECG Lead II Rhythm</span>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="font-bold text-[#0B1F33]">{bpm} BPM</span>
              <span className="text-emerald-600 font-semibold">&bull; Quality: {signalQuality}</span>
            </div>
          </div>

          <ECGChart height={170} title="ECG LEAD II SIGNAL" lead="Lead II" showLiveBadge={true} />
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-[#0B1F33]">Recent Sessions</span>
              <Link
                to="/sessions"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {recentSessions.map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 font-mono">
                    <span className="font-bold text-slate-800">{s.id}</span>
                    <span className="text-slate-500">{s.date}</span>
                    <span className="text-slate-400">{s.time}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-slate-500 font-mono text-xs">{s.duration}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        s.color === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${s.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {s.status} {s.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500">
            <span>Continuous Lead II ECG Sensor Stream (AD8232)</span>
            <Link to="/ecg-monitor" className="text-blue-600 font-semibold hover:underline">
              Launch Full ECG Monitor &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
