import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

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

        <main className="flex-1 p-6 sm:p-7 max-w-[1600px] w-full mx-auto space-y-6">
          <Outlet />
        </main>

        <footer className="py-4 px-8 border-t border-[#E2E8F0] text-center text-xs text-slate-400 font-mono no-print">
          StressSense &bull; ECG &amp; Physiological Monitoring System &bull; Research &amp; Educational Prototype &bull; Not for Medical Diagnosis
        </footer>
      </div>
    </div>
  );
};
