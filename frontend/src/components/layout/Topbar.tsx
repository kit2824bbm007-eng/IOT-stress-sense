import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bell,
  Moon,
  Sun,
  User,
  Activity
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useMonitoring } from '../../context/MonitoringContext';

export const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { wsStatus, selectedDeviceId, isSessionActive } = useMonitoring();
  const location = useLocation();

  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timePart = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentDateTime(`${datePart}  ${timePart}`);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/':
        return 'Overview';
      case '/ecg-monitor':
      case '/live':
        return 'ECG Monitor';
      case '/vital-signs':
        return 'Vital Signs';
      case '/analysis':
        return 'Physiological Analysis';
      case '/sessions':
        return 'Monitoring Sessions';
      case '/reports':
        return 'Session Report';
      case '/devices':
        return 'Device Monitor';
      case '/settings':
        return 'Settings';
      case '/relaxation':
      case '/breathing':
        return 'Guided Relaxation';
      default:
        if (pathname.includes('/report')) {
          return 'Session Report';
        }
        return 'StressSense';
    }
  };

  const isWsConnected = wsStatus === 'CONNECTED';
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="h-16 border-b border-[#E2E8F0] bg-white sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between shadow-subtle">
      {/* Page Title & Active Status */}
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-bold text-[#0B1F33] tracking-tight">
          {pageTitle}
        </h1>
        {isSessionActive && (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-600">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Recording Session</span>
          </span>
        )}
      </div>

      {/* Top Header Right items matching reference image */}
      <div className="flex items-center space-x-5">
        {/* Device Status Badge */}
        <div className="flex items-center space-x-2 text-xs font-mono font-medium text-slate-700 bg-[#F4F7FA] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
          <span
            className={`w-2 h-2 rounded-full ${
              isWsConnected ? 'bg-[#20E0A0] shadow-[0_0_6px_#20E0A0]' : 'bg-[#FFB547]'
            }`}
          ></span>
          <span className="font-semibold text-[#0B1F33]">{selectedDeviceId || 'SIMULATOR_001'}</span>
          <span className="text-slate-400">&bull;</span>
          <span className={isWsConnected ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
            {isWsConnected ? 'Connected' : 'Connecting'}
          </span>
        </div>

        {/* Date & Time: 25 Sep 2026 10:24 AM */}
        <div className="hidden md:flex items-center text-xs font-mono text-slate-500 font-medium tracking-tight">
          {currentDateTime || '25 Sep 2026 10:24 AM'}
        </div>

        {/* Theme Toggle (subtle) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={`Theme: ${theme}`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#1D4ED8]"></span>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#0B1F33] text-white flex items-center justify-center font-semibold text-xs shadow-sm">
            <User className="w-4 h-4 text-slate-200" />
          </div>
        </div>
      </div>
    </header>
  );
};
