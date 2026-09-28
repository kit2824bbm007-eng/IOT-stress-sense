import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useMonitoring } from '../../context/MonitoringContext';
import { AlertTriangle, CheckCircle2, Heart, Activity, Brain, Leaf, Clock, X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isBuzzerActive, currentReading, completedSessionModal, closeCompletedModal } = useMonitoring();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#0B1F33] flex flex-col font-sans transition-colors duration-200">
      {/* Dark Navy Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'ml-18' : 'ml-60'
        }`}
      >
        <Topbar />

        {/* Global Bradycardia Buzzer Alert Banner (Triggered when BPM < 60) */}
        {isBuzzerActive && (
          <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-6 py-3 flex items-center justify-between shadow-md z-20">
            <div className="flex items-center space-x-3 text-xs sm:text-sm font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 animate-pulse" />
              <span>
                ⚠️ BRADYCARDIA ALERT: Heart Rate is {Math.round(currentReading?.bpm || 0)} BPM (&lt; 60 BPM)! Hardware Buzzer Sounding on Pin D8!
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-black/30 font-semibold border border-white/20">
                BUZZER ACTIVE
              </span>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 sm:p-7 max-w-[1600px] w-full mx-auto space-y-6">
          <Outlet />
        </main>

        <footer className="py-4 px-8 border-t border-[#E2E8F0] text-center text-xs text-slate-400 font-mono no-print">
          StressSense &bull; ECG &amp; Physiological Monitoring System &bull; Research &amp; Educational Prototype &bull; Not for Medical Diagnosis
        </footer>
      </div>

      {/* Measurement Finished Summary Modal */}
      {completedSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#0B1F33]">Measurement Complete!</h3>
                  <p className="text-xs text-slate-500">Session #{completedSessionModal.id} has finished recording.</p>
                </div>
              </div>
              <button
                onClick={closeCompletedModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3.5 my-6">
              {/* Avg Heart Rate */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold mb-1">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Avg Heart Rate</span>
                </div>
                <div className="flex items-baseline space-x-1 font-mono">
                  <span className="text-2xl font-extrabold text-[#0B1F33]">
                    {Math.round(completedSessionModal.averageBpm)}
                  </span>
                  <span className="text-xs text-slate-400">BPM</span>
                </div>
              </div>

              {/* Avg HRV */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold mb-1">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  <span>Average HRV</span>
                </div>
                <div className="flex items-baseline space-x-1 font-mono">
                  <span className="text-2xl font-extrabold text-[#0B1F33]">
                    {Math.round(completedSessionModal.averageHrv)}
                  </span>
                  <span className="text-xs text-slate-400">ms</span>
                </div>
              </div>

              {/* Stress Index */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold mb-1">
                  <Brain className="w-4 h-4 text-amber-500" />
                  <span>Stress Level</span>
                </div>
                <div className="flex items-baseline space-x-1 font-mono">
                  <span className="text-2xl font-extrabold text-[#0B1F33]">
                    {Math.round(completedSessionModal.averageStress)}%
                  </span>
                  <span className="text-xs text-amber-600 font-sans font-semibold">
                    {completedSessionModal.averageStress > 60 ? 'High' : 'Moderate'}
                  </span>
                </div>
              </div>

              {/* Relaxation Index */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold mb-1">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  <span>Relaxation</span>
                </div>
                <div className="flex items-baseline space-x-1 font-mono">
                  <span className="text-2xl font-extrabold text-[#0B1F33]">
                    {Math.round(completedSessionModal.averageRelaxation)}%
                  </span>
                  <span className="text-xs text-emerald-600 font-sans font-semibold">Good</span>
                </div>
              </div>
            </div>

            {/* Observations Banner */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 leading-relaxed mb-6">
              <span className="font-bold block mb-0.5">Clinical Telemetry Observation:</span>
              {completedSessionModal.averageStress > 60
                ? 'Elevated stress dynamics observed during this recording. Recommend guided relaxation pacing.'
                : 'Physiological signals successfully recorded across AD8232 Lead II channel. Autonomic tone exhibits healthy cardiovascular adaptability.'}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  closeCompletedModal();
                  navigate('/reports');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md text-center"
              >
                View Full Session Report
              </button>
              <button
                onClick={closeCompletedModal}
                className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
