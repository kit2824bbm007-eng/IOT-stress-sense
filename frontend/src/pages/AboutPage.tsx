import React from 'react';
import {
  Heart,
  Activity,
  Layers,
  Cpu,
  Database,
  Radio,
  Monitor,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GitBranch
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-925 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            Product Identity &amp; Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            StressSense
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mt-0.5">
            Real-Time Stress &amp; Relaxation Monitoring
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          An end-to-end, hardware-independent biomedical telemetry platform designed to acquire electrocardiogram (ECG) Lead II waveforms to estimate autonomic nervous system stress and relaxation states continuously.
        </p>
      </div>

      {/* End-to-End System Architecture Flow */}
      <div className="bg-white dark:bg-slate-925 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            Data Pipeline Topology
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            Hardware-Independent Telemetry Bus
          </h2>
        </div>

        <div className="p-6 rounded-2xl bg-[#060a12] border border-slate-800 text-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center font-mono">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] text-teal-400 font-bold uppercase block">1. Sensors</span>
              <p className="text-xs text-white font-semibold">AD8232 ECG Sensor</p>
              <p className="text-[10px] text-slate-400">Lead II Biomedical ECG</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] text-sky-400 font-bold uppercase block">2. IoT Controller</span>
              <p className="text-xs text-white font-semibold">Generic Node / Sim</p>
              <p className="text-[10px] text-slate-400">Arduino, ESP32, or Simulator</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] text-indigo-400 font-bold uppercase block">3. Ingestion &amp; DB</span>
              <p className="text-xs text-white font-semibold">Spring Boot 3 + Postgres</p>
              <p className="text-[10px] text-slate-400">StressAnalysisService &amp; JPA</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">4. WebSocket Client</span>
              <p className="text-xs text-white font-semibold">React Vite Oscilloscopes</p>
              <p className="text-[10px] text-slate-400">250 SPS Live Canvas Streams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor & Algorithmic Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-925 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-teal-500" />
            <span>Electrocardiogram Lead II</span>
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Measures electrical conduction across cardiac tissue. The algorithm extracts the sharp QRS ventricular
            depolarization to calculate the R-R interval. Successive difference root mean square (RMSSD) quantifies
            Heart Rate Variability, reflecting parasympathetic autonomic tone.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-925 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Autonomic Tone &amp; Stress Analysis</span>
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Synthesizes heart rate and heart rate variability from consecutive R-peak intervals. Lower RMSSD values signal
            sympathetic arousal (elevated stress), while elevated RMSSD values indicate robust parasympathetic tone and physiological relaxation.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-center">
        <p className="text-xs text-slate-400 leading-relaxed italic">
          &ldquo;Stress and relaxation values are estimated from physiological signal features and are not intended for medical diagnosis.&rdquo;
        </p>
      </div>
    </div>
  );
};
