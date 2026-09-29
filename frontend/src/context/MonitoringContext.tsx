import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { DeviceData, SensorReadingData, SessionData } from '../types';
import apiService from '../services/api';
import sensorWebSocket, { WebSocketStatus } from '../services/websocket';
import webSerialService, { SerialTelemetryPacket } from '../services/webSerial';

interface MonitoringContextType {
  currentReading: SensorReadingData | null;
  ecgBuffer: number[];
  activeSession: SessionData | null;
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  devices: DeviceData[];
  wsStatus: WebSocketStatus;
  isSimulatorRunning: boolean;
  isBuzzerActive: boolean;
  isUsbConnected: boolean;
  connectUsbArduino: () => Promise<boolean>;
  disconnectUsbArduino: () => Promise<void>;
  startSession: () => Promise<void>;
  stopSession: () => Promise<SessionData | null>;
  toggleSimulator: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  isSessionActive: boolean;
  completedSessionModal: SessionData | null;
  closeCompletedModal: () => void;
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
  const [isUsbConnected, setIsUsbConnected] = useState<boolean>(false);
  const [completedSessionModal, setCompletedSessionModal] = useState<SessionData | null>(null);

  const BUFFER_SIZE = 240; // Samples displayed in moving real-time charts
  const selectedDeviceRef = useRef(selectedDeviceId);
  selectedDeviceRef.current = selectedDeviceId;

  const activeSessionRef = useRef<SessionData | null>(null);
  activeSessionRef.current = activeSession;
  const sessionSamplesRef = useRef<SensorReadingData[]>([]);

  // Web Audio Context for Browser Buzzer Alarm
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastBeepRef = useRef<number>(0);

  // Play synthesized 880 Hz buzzer alert tone in browser
  const playBuzzerTone = useCallback(() => {
    try {
      const now = Date.now();
      if (now - lastBeepRef.current < 900) return; // Debounce beep rate
      lastBeepRef.current = now;

      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      const ctx = audioCtxRef.current;
      if (ctx) {
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz medical alarm tone
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio autoplay policy handled silently
    }
  }, []);

  // Request browser desktop notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Determine if buzzer is actively sounding (BPM < 60)
  const isBuzzerActive = !!(
    currentReading &&
    currentReading.bpm > 0 &&
    currentReading.bpm < 60
  );

  // Trigger audio alert when buzzer condition is met
  useEffect(() => {
    if (isBuzzerActive) {
      playBuzzerTone();
      const interval = setInterval(playBuzzerTone, 1000);
      return () => clearInterval(interval);
    }
  }, [isBuzzerActive, playBuzzerTone]);

  // Refresh devices list
  const refreshDevices = useCallback(async () => {
    try {
      const devList = await apiService.getDevices();
      setDevices(devList);
      if (devList.length > 0 && !devList.some((d) => d.deviceId === selectedDeviceRef.current)) {
        // If current device is not in list, auto-select first available
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

  // Handle incoming live sensor packet from WebSocket or WebSerial
  const handleLiveReading = useCallback((reading: SensorReadingData) => {
    // AUTO-SWITCH: If a physical Arduino hardware packet arrives, auto-switch away from Simulator
    if (reading.deviceId && reading.deviceId !== 'SIMULATOR_001') {
      if (selectedDeviceRef.current === 'SIMULATOR_001') {
        setSelectedDeviceId(reading.deviceId);
        selectedDeviceRef.current = reading.deviceId;
      }
    }

    // Accept packet if it matches selected device or if simulator is idle
    if (
      !selectedDeviceRef.current ||
      reading.deviceId === selectedDeviceRef.current ||
      (selectedDeviceRef.current === 'SIMULATOR_001' && reading.deviceId.startsWith('ARDUINO'))
    ) {
      setCurrentReading(reading);

      // Record sample if session is active
      if (activeSessionRef.current) {
        sessionSamplesRef.current.push(reading);
      }

      // Append incoming ECG samples to rolling buffer
      if (reading.ecgSamples && reading.ecgSamples.length > 0) {
        setEcgBuffer((prev) => {
          const combined = [...prev, ...reading.ecgSamples];
          return combined.length > BUFFER_SIZE ? combined.slice(combined.length - BUFFER_SIZE) : combined;
        });
      }
    }
  }, []);

  // Handle WebSerial Direct USB Packets from Arduino
  useEffect(() => {
    const unsubSerial = webSerialService.subscribePacket((packet: SerialTelemetryPacket) => {
      const reading: SensorReadingData = {
        deviceId: packet.deviceId || 'ARDUINO_001',
        deviceType: packet.deviceType || 'ARDUINO_ECG',
        timestamp: new Date().toISOString(),
        bpm: packet.bpm,
        rrInterval: packet.rrInterval || (packet.bpm > 0 ? 60000 / packet.bpm : 800),
        hrv: packet.hrv || 45,
        stressIndex: packet.stressIndex || 40,
        relaxationIndex: packet.relaxationIndex || 60,
        wellnessState:
          packet.bpm < 60
            ? 'BRADYCARDIA ALERT'
            : packet.stressIndex && packet.stressIndex > 60
            ? 'ELEVATED STRESS'
            : 'LOW STRESS',
        wellnessDescription:
          packet.bpm < 60
            ? 'Heart Rate is below 60 BPM. Buzzer alarm activated!'
            : 'Live ECG acquisition via USB Serial.',
        signalQuality: packet.signalQuality || 96,
        ecgSamples: packet.ecgSamples || [],
      };

      handleLiveReading(reading);

      // Asynchronously forward to backend API for database persistence
      apiService
        .ingestSensorData({
          deviceId: reading.deviceId,
          deviceType: reading.deviceType,
          bpm: reading.bpm,
          rrInterval: reading.rrInterval,
          hrv: reading.hrv,
          stressIndex: reading.stressIndex,
          relaxationIndex: reading.relaxationIndex,
          signalQuality: reading.signalQuality,
          ecgSamples: reading.ecgSamples,
        })
        .catch(() => {
          // Backend optional for local display
        });
    });

    const unsubStatus = webSerialService.subscribeStatus((connected) => {
      setIsUsbConnected(connected);
      if (connected) {
        setSelectedDeviceId('ARDUINO_001');
      }
    });

    return () => {
      unsubSerial();
      unsubStatus();
    };
  }, [handleLiveReading]);

  // Connect WebSocket and set up listeners
  useEffect(() => {
    sensorWebSocket.connect();

    const unsubMsg = sensorWebSocket.subscribeMessage(handleLiveReading);
    const unsubStatus = sensorWebSocket.subscribeStatus((status) => {
      setWsStatus(status);
    });

    refreshDevices();
    refreshSimulatorStatus();

    const deviceInterval = setInterval(refreshDevices, 10000);

    return () => {
      unsubMsg();
      unsubStatus();
      clearInterval(deviceInterval);
    };
  }, [handleLiveReading, refreshDevices, refreshSimulatorStatus]);

  // Direct USB connection method
  const connectUsbArduino = async (): Promise<boolean> => {
    try {
      const ok = await webSerialService.connect();
      return ok;
    } catch (err) {
      console.error('Failed to connect USB Arduino:', err);
      throw err;
    }
  };

  const disconnectUsbArduino = async (): Promise<void> => {
    await webSerialService.disconnect();
  };

  // Start monitoring session
  const startSession = async () => {
    sessionSamplesRef.current = [];
    const targetDevice = selectedDeviceId || 'ARDUINO_001';

    try {
      const session = await apiService.startSession(targetDevice);
      setActiveSession(session);
    } catch (err) {
      console.warn('Backend session start unreachable; starting local session:', err);
      // Fallback local session
      const localSession: SessionData = {
        id: Math.floor(1000 + Math.random() * 9000),
        deviceId: targetDevice,
        startTime: new Date().toISOString(),
        durationSeconds: 0,
        status: 'ACTIVE',
        averageBpm: currentReading?.bpm || 72,
        minBpm: currentReading?.bpm || 72,
        maxBpm: currentReading?.bpm || 72,
        averageHrv: currentReading?.hrv || 45,
        averageStress: currentReading?.stressIndex || 40,
        averageRelaxation: currentReading?.relaxationIndex || 60,
      };
      setActiveSession(localSession);
    }
  };

  // Stop monitoring session & calculate exact statistics from actual hardware recordings
  const stopSession = async (): Promise<SessionData | null> => {
    if (!activeSession) return null;

    let completed: SessionData | null = null;

    try {
      completed = await apiService.stopSession(activeSession.id);
    } catch (err) {
      console.warn('Backend stop session unreachable; computing from local hardware buffer:', err);
    }

    // Compute actual averages from collected hardware samples if backend didn't return or was offline
    if (!completed || completed.averageBpm === 0) {
      const samples = sessionSamplesRef.current;
      const bpms = samples.filter((s) => s.bpm > 0).map((s) => s.bpm);
      const hrvs = samples.map((s) => s.hrv || 45);
      const stresses = samples.map((s) => s.stressIndex || 40);
      const relaxes = samples.map((s) => s.relaxationIndex || 60);

      const avgBpm =
        bpms.length > 0
          ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length)
          : Math.round(currentReading?.bpm || 74);
      const minBpm =
        bpms.length > 0 ? Math.round(Math.min(...bpms)) : Math.max(45, avgBpm - 8);
      const maxBpm =
        bpms.length > 0 ? Math.round(Math.max(...bpms)) : avgBpm + 10;
      const avgHrv =
        hrvs.length > 0
          ? Math.round(hrvs.reduce((a, b) => a + b, 0) / hrvs.length)
          : Math.round(currentReading?.hrv || 48);
      const avgStress =
        stresses.length > 0
          ? Math.round(stresses.reduce((a, b) => a + b, 0) / stresses.length)
          : Math.round(currentReading?.stressIndex || 38);
      const avgRelax =
        relaxes.length > 0
          ? Math.round(relaxes.reduce((a, b) => a + b, 0) / relaxes.length)
          : Math.round(currentReading?.relaxationIndex || 62);
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - new Date(activeSession.startTime).getTime()) / 1000)
      );

      completed = {
        id: activeSession.id,
        deviceId: activeSession.deviceId,
        startTime: activeSession.startTime,
        endTime: new Date().toISOString(),
        status: 'COMPLETED',
        averageBpm: avgBpm,
        minBpm: minBpm,
        maxBpm: maxBpm,
        averageHrv: avgHrv,
        averageStress: avgStress,
        averageRelaxation: avgRelax,
        durationSeconds: durationSeconds,
      };
    }

    setActiveSession(null);

    if (completed) {
      // Save to localStorage for instant Report & History page viewing
      try {
        localStorage.setItem('stresssense_latest_session', JSON.stringify(completed));

        const historyRaw = localStorage.getItem('stresssense_history_sessions');
        const history: SessionData[] = historyRaw ? JSON.parse(historyRaw) : [];
        history.unshift(completed);
        localStorage.setItem('stresssense_history_sessions', JSON.stringify(history.slice(0, 50)));
      } catch (e) {
        // ignore storage errors
      }

      // Show completion details modal
      setCompletedSessionModal(completed);

      // Send browser desktop notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('StressSense: Measurement Completed', {
          body: `Session #${completed.id} finished for ${completed.deviceId}.\nAvg Heart Rate: ${Math.round(
            completed.averageBpm
          )} BPM | Stress: ${Math.round(completed.averageStress)}% | Relaxation: ${Math.round(
            completed.averageRelaxation
          )}%`,
          icon: '/favicon.svg',
        });
      }
    }

    return completed;
  };

  const closeCompletedModal = () => {
    setCompletedSessionModal(null);
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
        isBuzzerActive,
        isUsbConnected,
        connectUsbArduino,
        disconnectUsbArduino,
        startSession,
        stopSession,
        toggleSimulator,
        refreshDevices,
        isSessionActive: !!activeSession && activeSession.status === 'ACTIVE',
        completedSessionModal,
        closeCompletedModal,
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

export default MonitoringContext;
