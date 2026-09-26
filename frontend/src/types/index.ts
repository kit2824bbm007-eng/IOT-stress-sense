export type WellnessState = 'LOW STRESS' | 'MODERATE STRESS' | 'ELEVATED STRESS';

export interface SensorReadingData {
  id?: number;
  deviceId: string;
  deviceType?: string;
  sessionId?: number | null;
  timestamp: string;
  bpm: number;
  rrInterval: number;
  hrv: number;
  stressIndex: number;
  relaxationIndex: number;
  wellnessState?: WellnessState;
  wellnessDescription?: string;
  signalQuality: number;
  ecgSamples: number[];
  pulseSamples: number[];
}

export interface DeviceData {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  status: 'ONLINE' | 'OFFLINE';
  lastSeen: string;
  createdAt: string;
  dataRate: string;
}

export interface SessionData {
  id: number;
  deviceId: string;
  startTime: string;
  endTime?: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  averageBpm: number;
  minBpm: number;
  maxBpm: number;
  averageHrv: number;
  averageStress: number;
  averageRelaxation: number;
  durationSeconds: number;
}

export interface SessionReportData {
  session: SessionData;
  readings: SensorReadingData[];
  keyObservations: string[];
  disclaimer: string;
}

export interface SimulatorStatusData {
  running: boolean;
  intervalMs: number;
  deviceId: string;
  deviceType: string;
  totalPacketsGenerated: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
