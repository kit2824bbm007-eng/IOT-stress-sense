package com.stresssense.dto;

import java.time.LocalDateTime;

public class SessionResponse {

    private Long id;
    private String deviceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private Double averageBpm;
    private Double minBpm;
    private Double maxBpm;
    private Double averageHrv;
    private Double averageStress;
    private Double averageRelaxation;
    private Long durationSeconds;

    public SessionResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getAverageBpm() {
        return averageBpm;
    }

    public void setAverageBpm(Double averageBpm) {
        this.averageBpm = averageBpm;
    }

    public Double getMinBpm() {
        return minBpm;
    }

    public void setMinBpm(Double minBpm) {
        this.minBpm = minBpm;
    }

    public Double getMaxBpm() {
        return maxBpm;
    }

    public void setMaxBpm(Double maxBpm) {
        this.maxBpm = maxBpm;
    }

    public Double getAverageHrv() {
        return averageHrv;
    }

    public void setAverageHrv(Double averageHrv) {
        this.averageHrv = averageHrv;
    }

    public Double getAverageStress() {
        return averageStress;
    }

    public void setAverageStress(Double averageStress) {
        this.averageStress = averageStress;
    }

    public Double getAverageRelaxation() {
        return averageRelaxation;
    }

    public void setAverageRelaxation(Double averageRelaxation) {
        this.averageRelaxation = averageRelaxation;
    }

    public Long getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
}
