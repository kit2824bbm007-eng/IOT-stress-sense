import axios from 'axios';
import {
  ApiResponse,
  DeviceData,
  SensorReadingData,
  SessionData,
  SessionReportData,
  SimulatorStatusData
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const apiService = {
  // Sensor APIs
  getLatestSensorData: async (deviceId: string): Promise<SensorReadingData> => {
    const res = await apiClient.get<ApiResponse<SensorReadingData>>(`/sensor/latest/${deviceId}`);
    return res.data.data;
  },

  getSensorHistory: async (deviceId: string, limit: number = 50): Promise<SensorReadingData[]> => {
    const res = await apiClient.get<ApiResponse<SensorReadingData[]>>(`/sensor/history/${deviceId}?limit=${limit}`);
    return res.data.data;
  },

  ingestSensorData: async (payload: Partial<SensorReadingData>): Promise<SensorReadingData> => {
    const res = await apiClient.post<ApiResponse<SensorReadingData>>('/sensor/data', payload);
    return res.data.data;
  },

  // Session APIs
  startSession: async (deviceId: string): Promise<SessionData> => {
    const res = await apiClient.post<ApiResponse<SessionData>>('/session/start', { deviceId });
    return res.data.data;
  },

  stopSession: async (sessionId: number): Promise<SessionData> => {
    const res = await apiClient.post<ApiResponse<SessionData>>(`/session/${sessionId}/stop`);
    return res.data.data;
  },

  getSession: async (sessionId: number): Promise<SessionData> => {
    const res = await apiClient.get<ApiResponse<SessionData>>(`/session/${sessionId}`);
    return res.data.data;
  },

  getSessionReport: async (sessionId: number): Promise<SessionReportData> => {
    const res = await apiClient.get<ApiResponse<SessionReportData>>(`/session/${sessionId}/report`);
    return res.data.data;
  },

  getAllSessions: async (deviceId?: string): Promise<SessionData[]> => {
    const url = deviceId ? `/session?deviceId=${encodeURIComponent(deviceId)}` : '/session';
    const res = await apiClient.get<ApiResponse<SessionData[]>>(url);
    return res.data.data;
  },

  // Device APIs
  getDevices: async (): Promise<DeviceData[]> => {
    const res = await apiClient.get<ApiResponse<DeviceData[]>>('/devices');
    return res.data.data;
  },

  getDevice: async (deviceId: string): Promise<DeviceData> => {
    const res = await apiClient.get<ApiResponse<DeviceData>>(`/devices/${deviceId}`);
    return res.data.data;
  },

  // Simulator APIs
  startSimulator: async (): Promise<SimulatorStatusData> => {
    const res = await apiClient.post<ApiResponse<SimulatorStatusData>>('/simulator/start');
    return res.data.data;
  },

  stopSimulator: async (): Promise<SimulatorStatusData> => {
    const res = await apiClient.post<ApiResponse<SimulatorStatusData>>('/simulator/stop');
    return res.data.data;
  },

  getSimulatorStatus: async (): Promise<SimulatorStatusData> => {
    const res = await apiClient.get<ApiResponse<SimulatorStatusData>>('/simulator/status');
    return res.data.data;
  },

  // Health
  getHealth: async (): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>>>('/health');
    return res.data.data;
  },
};

export default apiService;
