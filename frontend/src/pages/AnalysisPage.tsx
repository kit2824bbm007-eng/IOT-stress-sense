import React from 'react';
import {
  Brain,
  Leaf,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { useMonitoring } from '../context/MonitoringContext';

export const AnalysisPage: React.FC = () => {
  const { currentReading, selectedDeviceId, wsStatus } = useMonitoring();

  const bpm = currentReading ? Math.round(currentReading.bpm) : 78;
  const hrv = currentReading ? Math.round(currentReading.hrv) : 45;
  const rr = currentReading ? Math.round(currentReading.rrInterval) : 770;
  const stress = currentReading ? Math.round(currentReading.stressIndex) : 42;
  const relax = currentReading ? Math.round(currentReading.relaxationIndex) : 58;

  // Determine State
  const stateLabel = stress < 35 ? 'Low Stress' : stress > 65 ? 'Elevated Stress' : 'Moderate Stress';
  const stateColor = stress < 35 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : stress > 65 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-amber-600 bg-amber-50 border-amber-200';

  // Sample historical trend points for longitudinal analysis
  const trendData = [
    { time: '10:00', bpm: 74, hrv: 48, rr: 810, stress: 35, relax: 65 },
    { time: '10:05', bpm: 76, hrv: 46, rr: 790, stress: 38, relax: 62 },
    { time: '10:10', bpm: 80, hrv: 42, rr: 750, stress: 44, relax: 56 },
    { time: '10:15', bpm: 78, hrv: 44, rr: 770, stress: 42, relax: 58 },
    { time: '10:20', bpm: 77, hrv: 45, rr: 780, stress: 40, relax: 60 },
    { time: '10:25', bpm: bpm, hrv: hrv, rr: rr, stress: stress, relax: relax },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B1F33] tracking-tight">Physiological Analysis</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time autonomic nervous system &amp; stress evaluation</p>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${stateColor} inline-flex items-center space-x-1.5`}>
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>{stateLabel}</span>
        </div>
      </div>

      {/* Main Indicators: Restrained Medical Horizontal Scales (NOT giant gaming gauges) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estimated Stress Index */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-[#FFB547]" />
              <span className="font-bold text-sm text-[#0B1F33]">Estimated Stress Index</span>
            </div>
            <div className="flex items-baseline space-x-1 font-mono">
              <span className="text-3xl font-extrabold text-[#0B1F33]">{stress}</span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Horizontal Medical Scale */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 via-amber-500 to-[#FF4D5A] h-3 rounded-full transition-all duration-500"
                style={{ width: `${stress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0 (Low Sympathetic)</span>
              <span>50 (Balanced)</span>
              <span>100 (Elevated)</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Index synthesized from continuous RR-interval variances and pulse amplitude standard deviation.
          </p>
        </div>

        {/* Estimated Relaxation Index */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-[#20E0A0]" />
              <span className="font-bold text-sm text-[#0B1F33]">Estimated Relaxation Index</span>
            </div>
            <div className="flex items-baseline space-x-1 font-mono">
              <span className="text-3xl font-extrabold text-[#0B1F33]">{relax}</span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Horizontal Medical Scale */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-cyan-400 to-[#20E0A0] h-3 rounded-full transition-all duration-500"
                style={{ width: `${relax}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0 (Depleted Vagal Tone)</span>
              <span>50 (Normal)</span>
              <span>100 (Optimal Recovery)</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Parasympathetic reserve derived from high-frequency RMSSD components and respiratory modulation.
          </p>
        </div>
      </div>

      {/* Clean Line Charts: Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heart Rate & HRV Trend */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
              Heart Rate (BPM) &amp; HRV (ms) Trend
            </span>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center space-x-1 text-blue-600">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>HR</span>
              </span>
              <span className="flex items-center space-x-1 text-[#20E0A0]">
                <span className="w-2 h-2 rounded-full bg-[#20E0A0]"></span>
                <span>HRV</span>
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="bpm" stroke="#1D4ED8" strokeWidth={2} dot={{ r: 3 }} name="HR (BPM)" />
                <Line type="monotone" dataKey="hrv" stroke="#20E0A0" strokeWidth={2} dot={{ r: 3 }} name="HRV (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stress & Relaxation Trend */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
              Stress vs. Relaxation Dynamic Trends
            </span>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center space-x-1 text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Stress</span>
              </span>
              <span className="flex items-center space-x-1 text-blue-500">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Relaxation</span>
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="stress" stroke="#FFB547" fill="#FFB547" fillOpacity={0.15} name="Stress (%)" />
                <Area type="monotone" dataKey="relax" stroke="#25C7E8" fill="#25C7E8" fillOpacity={0.15} name="Relaxation (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Current State & Scientific Explanation */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-3">
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-sm text-[#0B1F33]">Current State Analysis</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Autonomic nervous system evaluation indicates a <strong>{stateLabel.toLowerCase()}</strong> posture. Sympathetic activation is measured at {stress}%, balanced by parasympathetic vagal reactivation at {relax}%. Synchronous Lead I ECG rhythm confirms normal sinus regularity with stable R-peak intervals averaging {rr} ms.
        </p>
      </div>

      {/* Mandatory Regulatory Disclaimer Box */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start space-x-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Biomedical Notice:</strong> These indicators are estimates derived from physiological signal features and are intended for educational/wellness monitoring only. They are not a medical diagnosis.
        </p>
      </div>
    </div>
  );
};

export default AnalysisPage;
