import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bell,
  Moon,
  Sun,
  User,
  Activity,
  Cpu,
  Radio,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useMonitoring } from '../../context/MonitoringContext';

export const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    wsStatus,
    selectedDeviceId,
    isSessionActive,
    isUsbConnected,
    connectUsbArduino,
    disconnectUsbArduino,
    isBuzzerActive
  } = useMonitoring();
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
        return 'Guided Relaxation';
      case '/about':
        return 'About StressSense';
      default:
        return 'StressSense HUD';
    }
  };

  const pageTitle = getPageTitle(location.pathname);
  const isWsConnected = wsStatus === 'CONNECTED';

  const handleUsbToggle = async () => {
    if (isUsbConnected) {
      await disconnectUsbArduino();
    } else {
      try {
        await connectUsbArduino();
      } catch (e: any) {
        alert(e.message || 'Could not connect to USB serial device.');
      }
    }
  };

  return (
    <header className="h-16 border-b border-[#E2E8F0] bg-white sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between shadow-subtle">
      {/* Page Title & Active Status */}
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-bold text-[#0B1F33] tracking-tight">
          {pageTitle}
        </h1>
        {isSessionActive && (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-600">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Recording Session</span>
          </span>
        )}
        {isBuzzerActive && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-100 border border-red-300 text-[11px] font-bold text-red-700 animate-pulse">
            <Volume2 className="w-3.5 h-3.5 text-red-600" />
            <span>BUZZER ON (&lt;60 BPM)</span>
          </span>
        )}
      </div>

      {/* Top Header Right items */}
      <div className="flex items-center space-x-4 sm:space-x-5">
        {/* Connect Arduino USB Hardware Button */}
        <button
          onClick={handleUsbToggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition border ${
            isUsbConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-sm'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-subtle'
          }`}
          title={isUsbConnected ? 'Click to Disconnect Arduino USB' : 'Click to connect Arduino via USB port'}
        >
          {isUsbConnected ? (
            <>
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Arduino USB Live</span>
            </>
          ) : (
            <>
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Connect Arduino (USB)</span>
            </>
          )}
        </button>

        {/* Device Status Badge */}
        <div className="flex items-center space-x-2 text-xs font-mono font-medium text-slate-700 bg-[#F4F7FA] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
          <span
            className={`w-2 h-2 rounded-full ${
              isWsConnected || isUsbConnected ? 'bg-[#20E0A0] shadow-[0_0_6px_#20E0A0]' : 'bg-[#FFB547]'
            }`}
          ></span>
          <span className="font-semibold text-[#0B1F33]">{selectedDeviceId || 'SIMULATOR_001'}</span>
          <span className="text-slate-400">&bull;</span>
          <span className={isWsConnected || isUsbConnected ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
            {isUsbConnected ? 'Hardware Live' : isWsConnected ? 'Connected' : 'Connecting'}
          </span>
        </div>

        {/* Date & Time */}
        <div className="hidden lg:flex items-center text-xs font-mono text-slate-500 font-medium tracking-tight">
          {currentDateTime || '25 Sep 2026 10:24 AM'}
        </div>

        {/* Theme Toggle */}
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
