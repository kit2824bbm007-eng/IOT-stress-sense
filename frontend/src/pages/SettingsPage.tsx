import React, { useState } from 'react';
import {
  Sliders,
  Moon,
  Sun,
  Monitor,
  Activity,
  Server,
  Database,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useMonitoring } from '../context/MonitoringContext';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { isSimulatorRunning, toggleSimulator, wsStatus, currentReading } = useMonitoring();

  // Tab State
  const [activeTab, setActiveTab] = useState<'general' | 'display' | 'monitoring' | 'data' | 'system'>('general');

  // Interactive Settings State
  const [compactMode, setCompactMode] = useState<boolean>(false);
  const [animations, setAnimations] = useState<boolean>(true);
  const [ecgGrid, setEcgGrid] = useState<boolean>(true);
  const [sweepSpeed, setSweepSpeed] = useState<string>('25 mm/s');
  const [amplitude, setAmplitude] = useState<string>('10 mm/mV');
  const [lead, setLead] = useState<string>('Lead I');
  const [ecgPoints, setEcgPoints] = useState<number>(300);
  const [autoReconnect, setAutoReconnect] = useState<boolean>(true);
  const [saveRawData, setSaveRawData] = useState<boolean>(true);
  const [enableNotifications, setEnableNotifications] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0B1F33] tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure application preferences</p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-[#E2E8F0] space-x-6 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'general' ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent hover:text-slate-800'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('display')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'display' ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Display
        </button>
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'monitoring' ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Monitoring
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'data' ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent hover:text-slate-800'
          }`}
        >
          Data
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'system' ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent hover:text-slate-800'
          }`}
        >
          System
        </button>
      </div>

      {/* 2x2 Grid of Medical Setting Cards matching reference image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Appearance */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block pb-2 border-b border-slate-100">
            Appearance
          </span>

          <div className="space-y-4 text-xs">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Theme</span>
              <div className="flex rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-0.5">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    theme === 'light' ? 'bg-[#1D4ED8] text-white shadow-subtle' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    theme === 'dark' ? 'bg-[#1D4ED8] text-white shadow-subtle' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Color Scheme */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Color Scheme</span>
              <span className="font-mono text-slate-600 bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                Medical Blue
              </span>
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Compact Mode</span>
              <button
                onClick={() => setCompactMode(!compactMode)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  compactMode ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    compactMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Animations */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Animations</span>
              <button
                onClick={() => setAnimations(!animations)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  animations ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    animations ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Display Settings */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block pb-2 border-b border-slate-100">
            Display Settings
          </span>

          <div className="space-y-3.5 text-xs">
            {/* ECG Grid */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">ECG Grid</span>
              <button
                onClick={() => setEcgGrid(!ecgGrid)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  ecgGrid ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    ecgGrid ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Sweep Speed */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Sweep Speed</span>
              <select
                value={sweepSpeed}
                onChange={(e) => setSweepSpeed(e.target.value)}
                className="py-1 px-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-slate-800 font-medium focus:outline-none"
              >
                <option value="25 mm/s">25 mm/s</option>
                <option value="50 mm/s">50 mm/s</option>
                <option value="12.5 mm/s">12.5 mm/s</option>
              </select>
            </div>

            {/* Amplitude */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Amplitude</span>
              <select
                value={amplitude}
                onChange={(e) => setAmplitude(e.target.value)}
                className="py-1 px-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-slate-800 font-medium focus:outline-none"
              >
                <option value="10 mm/mV">10 mm/mV</option>
                <option value="5 mm/mV">5 mm/mV</option>
                <option value="20 mm/mV">20 mm/mV</option>
              </select>
            </div>

            {/* Lead */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Lead</span>
              <select
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                className="py-1 px-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-slate-800 font-medium focus:outline-none"
              >
                <option value="Lead I">Lead I</option>
                <option value="Lead II">Lead II</option>
                <option value="Lead III">Lead III</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Monitoring Settings */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block pb-2 border-b border-slate-100">
            Monitoring Settings
          </span>

          <div className="space-y-4 text-xs">
            {/* ECG Display Points */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">ECG Display Points</span>
              <span className="font-mono text-slate-800 font-bold bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                {ecgPoints}
              </span>
            </div>

            {/* ECG Sample Rate */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">ECG Sample Rate</span>
              <span className="font-mono text-slate-800 font-bold bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                250 Hz
              </span>
            </div>

            {/* Auto Reconnect */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Auto Reconnect</span>
              <button
                onClick={() => setAutoReconnect(!autoReconnect)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  autoReconnect ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    autoReconnect ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Biosignal Generator Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div>
                <span className="font-semibold text-slate-700 block">Synthetic Biosignal Simulator</span>
                <span className="text-[10px] text-slate-400">250 SPS internal generation loop</span>
              </div>
              <button
                onClick={toggleSimulator}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  isSimulatorRunning
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {isSimulatorRunning ? 'Pause Loop' : 'Start Loop'}
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Data Settings */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block pb-2 border-b border-slate-100">
            Data Settings
          </span>

          <div className="space-y-4 text-xs">
            {/* Refresh Rate */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Refresh Rate</span>
              <span className="font-mono text-slate-800 font-bold bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                2 readings/sec
              </span>
            </div>

            {/* Save Raw Data */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Save Raw Data</span>
              <button
                onClick={() => setSaveRawData(!saveRawData)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  saveRawData ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    saveRawData ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Enable Notifications */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Enable Notifications</span>
              <button
                onClick={() => setEnableNotifications(!enableNotifications)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  enableNotifications ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    enableNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Database Persistence Info */}
            <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              PostgreSQL 17 &bull; Table: sensor_readings &bull; Session auto-commit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
