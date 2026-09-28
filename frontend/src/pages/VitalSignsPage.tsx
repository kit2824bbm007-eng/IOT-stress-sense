import React from 'react';
import {
  Heart,
  Activity,
  Brain,
  Leaf,
  CheckCircle2,
  Signal,
  Radio
} from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { ECGChart } from '../components/charts/ECGChart';

export const VitalSignsPage: React.FC = () => {
  const { currentReading, selectedDeviceId, wsStatus } = useMonitoring();

  const isConnected = wsStatus === 'CONNECTED';
  const bpm = currentReading ? Math.round(currentReading.bpm) : 78;
  const hrv = currentReading ? Math.round(currentReading.hrv) : 45;
  const rr = currentReading ? Math.round(currentReading.rrInterval) : 770;
  const stress = currentReading ? Math.round(currentReading.stressIndex) : 42;
  const relax = currentReading ? Math.round(currentReading.relaxationIndex) : 58;
  const signalQuality = currentReading?.signalQuality && currentReading.signalQuality > 85 ? 'Good' : 'Optimal';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B1F33] tracking-tight">Vital Signs</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time physiological measurements</p>
        </div>

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

      {/* Top 4 Medical Instrument Cards with Mini Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Heart Rate */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Heart Rate</span>
              <Heart className="w-4 h-4 fill-current text-[#FF4D5A]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-[#0B1F33] font-mono">{bpm}</span>
              <span className="text-xs font-semibold text-slate-400">BPM</span>
            </div>
            <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Normal</span>
            </div>
          </div>

          {/* Mini Sparkline SVG */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <svg className="w-full h-8 stroke-[#FF4D5A] fill-none" viewBox="0 0 200 40">
              <path
                d="M0,20 L30,20 L35,16 L40,20 L45,20 L50,10 L55,30 L60,4 L65,24 L70,20 L85,20 L95,16 L105,20 L130,20 L135,16 L140,20 L145,20 L150,10 L155,30 L160,4 L165,24 L170,20 L200,20"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* ECG Rhythm / QRS Interval */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">ECG Rhythm (Lead II)</span>
              <Activity className="w-4 h-4 text-[#20E0A0]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-[#0B1F33] font-mono">Sinus</span>
              <span className="text-xs font-semibold text-slate-400">Rhythm</span>
            </div>
            <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Optimal Synchrony</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <svg className="w-full h-8 stroke-[#20E0A0] fill-none" viewBox="0 0 200 40">
              <path
                d="M0,20 L30,20 L38,15 L45,20 L52,20 L58,7 L64,33 L70,2 L76,26 L82,20 L100,20 L110,15 L120,20 L138,20 L144,7 L150,33 L156,2 L162,26 L168,20 L200,20"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* HRV */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">HRV</span>
              <Activity className="w-4 h-4 text-[#20E0A0]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-[#0B1F33] font-mono">{hrv}</span>
              <span className="text-xs font-semibold text-slate-400">ms</span>
            </div>
            <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Stable</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <svg className="w-full h-8 stroke-[#20E0A0] fill-none" viewBox="0 0 200 40">
              <path
                d="M0,20 L25,12 L50,26 L75,10 L100,22 L125,15 L150,28 L175,14 L200,20"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* RR Interval */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">RR Interval</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-[#0B1F33] font-mono">{rr}</span>
              <span className="text-xs font-semibold text-slate-400">ms</span>
            </div>
            <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Stable</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <svg className="w-full h-8 stroke-blue-500 fill-none" viewBox="0 0 200 40">
              <path
                d="M0,20 L30,20 L40,14 L50,20 L80,20 L90,24 L100,20 L130,20 L140,16 L150,20 L180,20 L200,20"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Middle Row: 3 Medical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Signal Quality Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Signal Quality</span>
            <Signal className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <div>
              <span className="text-2xl font-extrabold text-[#0B1F33]">{signalQuality}</span>
              <p className="text-xs text-slate-500">Clean signal detected &bull; Low Noise</p>
            </div>
          </div>
        </div>

        {/* Stress Index Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Stress Index</span>
            <Brain className="w-4 h-4 text-[#FFB547]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#0B1F33] font-mono">{stress}%</span>
            <span className="text-xs font-semibold text-amber-600">Moderate</span>
          </div>
          {/* Horizontal Progress Bar */}
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${stress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>0% Low</span>
            <span>50%</span>
            <span>100% High</span>
          </div>
        </div>

        {/* Relaxation Index Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Relaxation Index</span>
            <Leaf className="w-4 h-4 text-[#20E0A0]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#0B1F33] font-mono">{relax}%</span>
            <span className="text-xs font-semibold text-emerald-600">Good</span>
          </div>
          {/* Horizontal Progress Bar */}
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-cyan-400 to-[#20E0A0] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${relax}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>0% Depleted</span>
            <span>50%</span>
            <span>100% Optimal</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Live ECG Oscilloscope Panel */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-sm text-[#0B1F33] block">Live ECG Oscilloscope</span>
            <p className="text-xs text-slate-400">Continuous Lead II biosignal telemetry &bull; 250 SPS &bull; 25 mm/s standard sweep</p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-semibold">Lead II</span>
            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">25 mm/s</span>
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">10 mm/mV</span>
          </div>
        </div>

        <div>
          <ECGChart
            height={220}
            title="ECG (Lead II - AD8232)"
            lead="Lead II"
            sweepSpeed="25 mm/s"
            amplitude="10 mm/mV"
            showGrid={true}
            showScales={true}
            showLiveBadge={true}
          />
        </div>
      </div>
    </div>
  );
};

export default VitalSignsPage;
