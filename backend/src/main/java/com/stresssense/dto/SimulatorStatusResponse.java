package com.stresssense.dto;

public class SimulatorStatusResponse {

    private boolean running;
    private long intervalMs;
    private String deviceId;
    private String deviceType;
    private long totalPacketsGenerated;

    public SimulatorStatusResponse() {
    }

    public SimulatorStatusResponse(boolean running, long intervalMs, String deviceId, String deviceType, long totalPacketsGenerated) {
        this.running = running;
        this.intervalMs = intervalMs;
        this.deviceId = deviceId;
        this.deviceType = deviceType;
        this.totalPacketsGenerated = totalPacketsGenerated;
    }

    public boolean isRunning() {
        return running;
    }

    public void setRunning(boolean running) {
        this.running = running;
    }

    public long getIntervalMs() {
        return intervalMs;
    }

    public void setIntervalMs(long intervalMs) {
        this.intervalMs = intervalMs;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }

    public long getTotalPacketsGenerated() {
        return totalPacketsGenerated;
    }

    public void setTotalPacketsGenerated(long totalPacketsGenerated) {
        this.totalPacketsGenerated = totalPacketsGenerated;
    }
}
