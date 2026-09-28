import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Activity,
  Brain,
  Leaf
} from 'lucide-react';
import apiService from '../services/api';
import { SessionReportData } from '../types';
import { ECGChart } from '../components/charts/ECGChart';

export const SessionReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SessionReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ecg' | 'analysis'>('overview');

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const sessionId = id ? parseInt(id, 10) : 3;
        const data = await apiService.getSessionReport(sessionId);
        setReport(data);
      } catch (err) {
        console.warn('Using demo report fallback:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const session = report?.session || {
    id: id ? parseInt(id, 10) : 3,
    deviceId: 'SIMULATOR_001',
    startTime: '2026-09-25T10:12:00',
    durationSeconds: 332,
    averageBpm: 78,
    minBpm: 65,
    maxBpm: 92,
    averageHrv: 45,
    averageStress: 42,
    averageRelaxation: 58,
    status: 'COMPLETED' as const,
  };

  return (
    <div className="space-y-6">
      {/* Header & Export PDF button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link to="/sessions" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0B1F33] tracking-tight">Session Report</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-6">Detailed analysis of your monitoring session</p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs tracking-wider transition shadow-sm flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Session Info Banner */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-card flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Session ID</span>
          <span className="font-extrabold text-base text-[#0B1F33]">Session #{String(session.id).padStart(4, '0')}</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
          <span className="font-bold text-slate-700">25 September 2026</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Start Time</span>
          <span className="font-bold text-slate-700">10:12 AM</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
          <span className="font-bold text-slate-700">5m 32s</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Device</span>
          <span className="font-bold text-slate-700">{session.deviceId || 'SIMULATOR_001'}</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Completed
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] space-x-6 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'overview'
              ? 'border-[#1D4ED8] text-[#1D4ED8]'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('ecg')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'ecg'
              ? 'border-[#1D4ED8] text-[#1D4ED8]'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          ECG Analysis
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'analysis'
              ? 'border-[#1D4ED8] text-[#1D4ED8]'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          Physiological Analysis
        </button>
      </div>

      {/* Main Grid: Left Key Metrics, Right Trend Oscilloscopes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Key Metrics */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card space-y-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Key Metrics
          </span>

          {/* Average Heart Rate */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Average Heart Rate
            </span>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-baseline space-x-1.5 font-mono">
                <span className="text-3xl font-extrabold text-[#0B1F33]">{session.averageBpm}</span>
                <span className="text-xs text-slate-400 font-semibold">BPM</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 text-right">
                <span>Min: {session.minBpm} BPM</span>
                <span className="block">Max: {session.maxBpm} BPM</span>
              </div>
            </div>
          </div>

          {/* Average HRV */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Average HRV
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1 font-mono">
              <span className="text-3xl font-extrabold text-[#25C7E8]">{session.averageHrv}</span>
              <span className="text-xs text-slate-400 font-semibold">ms</span>
            </div>
          </div>

          {/* Average Stress */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Average Stress
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1 font-mono">
              <span className="text-3xl font-extrabold text-amber-500">{session.averageStress}%</span>
            </div>
          </div>

          {/* Average Relaxation */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Average Relaxation
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1 font-mono">
              <span className="text-3xl font-extrabold text-[#20E0A0]">{session.averageRelaxation}%</span>
            </div>
          </div>

          {/* Signal Quality */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Signal Quality
            </span>
            <div className="flex items-center space-x-2 text-sm font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Good</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Clean signal throughout session</p>
          </div>
        </div>

        {/* Right Column: ECG Trend */}
        <div className="lg:col-span-2 space-y-5">
          {/* ECG Signal Trend */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  ECG Lead II Signal Trend
                </span>
                <span className="text-[11px] text-slate-400">Continuous 250 SPS biomedical acquisition trace</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Lead II (AD8232)</span>
            </div>
            <ECGChart height={220} title="ECG LEAD II TREND" lead="Lead II" showLiveBadge={false} />
          </div>

          {/* Report Medical Disclaimer Banner */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start space-x-3 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              The displayed stress and relaxation indicators are biomedical telemetry estimates and are not intended for medical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionReportPage;
