import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MonitoringProvider } from './context/MonitoringContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ECGMonitorPage } from './pages/ECGMonitorPage';
import { VitalSignsPage } from './pages/VitalSignsPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { SessionsPage } from './pages/SessionsPage';
import { SessionReportPage } from './pages/SessionReportPage';
import { DevicesPage } from './pages/DevicesPage';
import { SettingsPage } from './pages/SettingsPage';
import { BreathingModePage } from './pages/BreathingModePage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MonitoringProvider>
        <BrowserRouter>
          <Routes>
            {/* Opening / Landing Page with Live Synchronized Heart & Oscilloscope Animations */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Clinical Workstation App Shell */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/overview" element={<DashboardPage />} />
              <Route path="/ecg-monitor" element={<ECGMonitorPage />} />
              <Route path="/live" element={<ECGMonitorPage />} />
              <Route path="/vital-signs" element={<VitalSignsPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/reports" element={<SessionReportPage />} />
              <Route path="/sessions/:id/report" element={<SessionReportPage />} />
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/relaxation" element={<BreathingModePage />} />
              <Route path="/breathing" element={<BreathingModePage />} />
              <Route path="/about" element={<AboutPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MonitoringProvider>
    </ThemeProvider>
  );
};

export default App;
