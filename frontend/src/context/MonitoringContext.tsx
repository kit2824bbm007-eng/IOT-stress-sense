import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { DeviceData, SensorReadingData, SessionData } from '../types';
import apiService from '../services/api';
import sensorWebSocket, { WebSocketStatus } from '../services/websocket';

interface MonitoringContextType {
  currentReading: SensorReadingData | null;
  ecgBuffer: number[];
  activeSession: SessionData | null;
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  devices: DeviceData[];
  wsStatus: WebSocketStatus;
  isSimulatorRunning: boolean;
  startSession: () => Promise<void>;
  stopSession: () => Promise<SessionData | null>;
  toggleSimulator: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  isSessionActive: boolean;
}

const DEFAULT_READING: SensorReadingData = {
  deviceId: 'SIMULATOR_001',
  deviceType: 'SIMULATOR',
  timestamp: new Date().toISOString(),
  bpm: 74,
  rrInterval: 810,
  hrv: 48,
  stressIndex: 38,
  relaxationIndex: 62,
  wellnessState: 'LOW STRESS',
  wellnessDescription: 'Physiological signals reflect optimal autonomic balance and high parasympathetic tone.',
  signalQuality: 98,
  ecgSamples: [],
};

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentReading, setCurrentReading] = useState<SensorReadingData | null>(DEFAULT_READING);
  const [ecgBuffer, setEcgBuffer] = useState<number[]>([]);
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('SIMULATOR_001');
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('DISCONNECTED');
  const [isSimulatorRunning, setIsSimulatorRunning] = useState<boolean>(true);

  const BUFFER_SIZE = 240; // Samples displayed in moving real-time charts
  const selectedDeviceRef = useRef(selectedDeviceId);
  selectedDeviceRef.current = selectedDeviceId;

  // Refresh devices list
  const refreshDevices = useCallback(async () => {
    try {
      const devList = await apiService.getDevices();
      setDevices(devList);
      if (devList.length > 0 && !devList.some(d => d.deviceId === selectedDeviceRef.current)) {
        setSelectedDeviceId(devList[0].deviceId);
      }
    } catch (err) {
      console.warn('Failed to fetch devices:', err);
    }
  }, []);

  // Fetch initial simulator status
  const refreshSimulatorStatus = useCallback(async () => {
    try {
      const status = await apiService.getSimulatorStatus();
      setIsSimulatorRunning(status.running);
    } catch (err) {
      console.warn('Failed to query simulator status:', err);
    }
  }, []);

  // Handle incoming live sensor packet from WebSocket
  const handleLiveReading = useCallback((reading: SensorReadingData) => {
    // If packet matches currently monitored device or if no device is explicitly chosen
    if (!selectedDeviceRef.current || reading.deviceId === selectedDeviceRef.current) {
      setCurrentReading(reading);

      // Append incoming ECG samples to rolling buffer
      if (reading.ecgSamples && reading.ecgSamples.length > 0) {
        setEcgBuffer((prev) => {
          const combined = [...prev, ...reading.ecgSamples];
          return combined.length > BUFFER_SIZE ? combined.slice(combined.length - BUFFER_SIZE) : combined;
        });
      }
    }
  }, []);

  // Connect WebSocket and set up listeners
  useEffect(() => {
    sensorWebSocket.connect();

    const unsubMsg = sensorWebSocket.subscribeMessage(handleLiveReading);
    const unsubStatus = sensorWebSocket.subscribeStatus((status) => {
      setWsStatus(status);
    });

    refreshDevices();
    refreshSimulatorStatus();

    // Check device list periodically (every 10s)
    const deviceInterval = setInterval(refreshDevices, 10000);

    return () => {
      unsubMsg();
      unsubStatus();
      clearInterval(deviceInterval);
    };
  }, [handleLiveReading, refreshDevices, refreshSimulatorStatus]);

  // Start monitoring session
  const startSession = async () => {
    try {
      const session = await apiService.startSession(selectedDeviceId);
      setActiveSession(session);
    } catch (err) {
      console.error('Failed to start session:', err);
      throw err;
    }
  };

  // Stop monitoring session
  const stopSession = async (): Promise<SessionData | null> => {
    if (!activeSession) return null;
    try {
      const completed = await apiService.stopSession(activeSession.id);
      setActiveSession(null);
      return completed;
    } catch (err) {
      console.error('Failed to stop session:', err);
      throw err;
    }
  };

  // Toggle simulator
  const toggleSimulator = async () => {
    try {
      if (isSimulatorRunning) {
        const res = await apiService.stopSimulator();
        setIsSimulatorRunning(res.running);
      } else {
        const res = await apiService.startSimulator();
        setIsSimulatorRunning(res.running);
      }
    } catch (err) {
      console.error('Failed to toggle simulator:', err);
    }
  };

  return (
    <MonitoringContext.Provider
      value={{
        currentReading,
        ecgBuffer,
        activeSession,
        selectedDeviceId,
        setSelectedDeviceId,
        devices,
        wsStatus,
        isSimulatorRunning,
        startSession,
        stopSession,
        toggleSimulator,
        refreshDevices,
        isSessionActive: !!activeSession && activeSession.status === 'ACTIVE',
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = (): MonitoringContextType => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};
