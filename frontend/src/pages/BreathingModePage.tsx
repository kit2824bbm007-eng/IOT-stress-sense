import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Activity,
  Brain,
  Leaf,
  Wind,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';

type Phase = 'INHALE' | 'HOLD' | 'EXHALE';

export const BreathingModePage: React.FC = () => {
  const { currentReading } = useMonitoring();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('INHALE');
  const [countdown, setCountdown] = useState<number>(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          // Switch phases according to clinical 4-4-6 paced breathing
          if (phase === 'INHALE') {
            setPhase('HOLD');
            return 4;
          } else if (phase === 'HOLD') {
            setPhase('EXHALE');
            return 6;
          } else {
            setPhase('INHALE');
            return 4;
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const bpm = currentReading ? Math.round(currentReading.bpm) : 78;
  const hrv = currentReading ? Math.round(currentReading.hrv) : 45;
  const stress = currentReading ? Math.round(currentReading.stressIndex) : 42;
  const relax = currentReading ? Math.round(currentReading.relaxationIndex) : 58;

  // Sphere expansion scale based on breathing phase
  const getScaleClass = () => {
    if (phase === 'INHALE') return 'scale-110 shadow-[0_0_80px_rgba(37,199,232,0.45)]';
    if (phase === 'HOLD') return 'scale-110 shadow-[0_0_70px_rgba(32,224,160,0.45)]';
    return 'scale-90 shadow-[0_0_40px_rgba(37,199,232,0.25)]';
  };

  const getBorderColor = () => {
    if (phase === 'INHALE') return 'border-[#25C7E8] text-[#25C7E8]';
    if (phase === 'HOLD') return 'border-[#20E0A0] text-[#20E0A0]';
    return 'border-blue-400 text-blue-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0B1F33] tracking-tight">Guided Relaxation</h1>
        <p className="text-xs text-slate-500 mt-0.5">Breathing exercise for stress relief</p>
      </div>

      {/* Main Calm Dark Monitoring Panel */}
      <div className="bg-[#07141F] rounded-3xl p-8 sm:p-12 border border-[#152E4A] shadow-xl text-white relative overflow-hidden flex flex-col justify-between min-h-[580px]">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[#25C7E8]/10 blur-[130px] pointer-events-none"></div>

        {/* Center Section: Breathing Circle + Right Breathing Cycle Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-6 relative z-10">
          {/* Left/Center: Large Breathing Circle (8 cols) */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center">
            <div
              className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 ${getBorderColor()} flex flex-col items-center justify-center transition-all duration-1000 ease-in-out bg-[#0B1F33]/60 backdrop-blur-md ${getScaleClass()}`}
            >
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-300 mb-1">
                {phase}
              </span>
              <span className="text-6xl sm:text-7xl font-extrabold font-mono text-white tracking-tight">
                {countdown}
              </span>
              <span className="text-xs font-mono text-slate-400 mt-1">seconds</span>
            </div>
          </div>

          {/* Right: Breathing Cycle Guide Card (4 cols) */}
          <div className="lg:col-span-4 bg-[#0B1F33] border border-[#152E4A] rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Breathing Cycle
            </span>

            <div className="space-y-2.5 text-xs font-mono">
              {/* Inhale */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                  phase === 'INHALE'
                    ? 'border-[#25C7E8] bg-[#25C7E8]/10 text-white font-bold'
                    : 'border-[#152E4A] text-slate-400 bg-[#07141F]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#25C7E8]/20 text-[#25C7E8] flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Inhale</span>
                </div>
                <span>4 seconds</span>
              </div>

              {/* Hold */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                  phase === 'HOLD'
                    ? 'border-[#20E0A0] bg-[#20E0A0]/10 text-white font-bold'
                    : 'border-[#152E4A] text-slate-400 bg-[#07141F]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#20E0A0]/20 text-[#20E0A0] flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Hold</span>
                </div>
                <span>4 seconds</span>
              </div>

              {/* Exhale */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                  phase === 'EXHALE'
                    ? 'border-blue-400 bg-blue-500/10 text-white font-bold'
                    : 'border-[#152E4A] text-slate-400 bg-[#07141F]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Exhale</span>
                </div>
                <span>6 seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Live Metrics + End Session Button */}
        <div className="relative z-10 pt-6 border-t border-[#152E4A] flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Live Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            <div className="p-3 rounded-xl bg-[#0B1F33] border border-[#152E4A] flex items-center space-x-3">
              <Heart className="w-4 h-4 fill-current text-[#FF4D5A]" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Heart Rate</span>
                <span className="text-base font-extrabold text-white font-mono">{bpm} BPM</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B1F33] border border-[#152E4A] flex items-center space-x-3">
              <Activity className="w-4 h-4 text-[#20E0A0]" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">HRV</span>
                <span className="text-base font-extrabold text-[#20E0A0] font-mono">{hrv} ms</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B1F33] border border-[#152E4A] flex items-center space-x-3">
              <Brain className="w-4 h-4 text-[#FFB547]" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Stress Index</span>
                <span className="text-base font-extrabold text-[#FFB547] font-mono">{stress}%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B1F33] border border-[#152E4A] flex items-center space-x-3">
              <Leaf className="w-4 h-4 text-[#25C7E8]" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Relaxation</span>
                <span className="text-base font-extrabold text-[#25C7E8] font-mono">{relax}%</span>
              </div>
            </div>
          </div>

          {/* End Session Red Button */}
          <div className="flex justify-center md:justify-end">
            <button
              onClick={() => navigate('/')}
              className="py-2.5 px-6 rounded-xl bg-[#FF4D5A] hover:bg-red-600 text-white font-bold text-xs tracking-wider uppercase transition shadow-subtle flex items-center space-x-2"
            >
              <span>End Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreathingModePage;
