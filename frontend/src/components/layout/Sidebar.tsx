import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Activity,
  HeartPulse,
  TrendingUp,
  Clock,
  FileText,
  Cpu,
  Settings,
  Wind,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { StressSenseLogo } from '../common/StressSenseLogo';
import { useMonitoring } from '../../context/MonitoringContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { wsStatus, selectedDeviceId } = useMonitoring();

  const navLinks = [
    { name: 'Home Landing', path: '/', icon: Home },
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'ECG Monitor', path: '/ecg-monitor', icon: Activity },
    { name: 'Vital Signs', path: '/vital-signs', icon: HeartPulse },
    { name: 'Analysis', path: '/analysis', icon: TrendingUp },
    { name: 'Sessions', path: '/sessions', icon: Clock },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Devices', path: '/devices', icon: Cpu },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Guided Relaxation', path: '/relaxation', icon: Wind },
  ];

  const isConnected = wsStatus === 'CONNECTED';

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-[#0B1F33] text-slate-300 border-r border-[#152E4A] flex flex-col justify-between ${
        collapsed ? 'w-18' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#152E4A]">
          <NavLink to="/" className="flex items-center space-x-3 overflow-hidden">
            <StressSenseLogo size={28} />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-base tracking-tight text-white leading-none">
                  StressSense
                </span>
                <span className="text-[10px] text-slate-400 font-normal tracking-wide mt-1">
                  Physiological Monitoring
                </span>
              </div>
            )}
          </NavLink>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#152E4A] transition"
            aria-label="Toggle Navigation"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 px-2 space-y-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#102A45] text-[#25C7E8] font-semibold border-l-4 border-[#25C7E8] shadow-sm'
                    : 'text-slate-300 hover:bg-[#152E4A]/80 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-[#25C7E8]" />
              {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Connection Status */}
      <div className="p-3 border-t border-[#152E4A]">
        {!collapsed ? (
          <div className="bg-[#07141F] rounded-xl p-2.5 border border-[#152E4A] flex items-center space-x-2.5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isConnected ? 'bg-[#20E0A0] shadow-[0_0_8px_#20E0A0]' : 'bg-[#FFB547]'
              }`}
            ></span>
            <div className="truncate">
              <p className="text-[11px] font-mono font-semibold text-white truncate">
                {selectedDeviceId || 'SIMULATOR_001'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isConnected ? '● Connected' : 'Connecting...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-[#20E0A0] shadow-[0_0_8px_#20E0A0]' : 'bg-[#FFB547]'
              }`}
            ></span>
          </div>
        )}
      </div>
    </aside>
  );
};
