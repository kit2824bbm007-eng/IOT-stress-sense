package com.stresssense.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "monitoring_sessions")
public class MonitoringSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false, length = 64)
    private String deviceId;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // ACTIVE, PAUSED, COMPLETED

    @Column(name = "average_bpm")
    private Double averageBpm;

    @Column(name = "min_bpm")
    private Double minBpm;

    @Column(name = "max_bpm")
    private Double maxBpm;

    @Column(name = "average_hrv")
    private Double averageHrv;

    @Column(name = "average_stress")
    private Double averageStress;

    @Column(name = "average_relaxation")
    private Double averageRelaxation;

    public MonitoringSession() {
    }

    public MonitoringSession(String deviceId) {
        this.deviceId = deviceId;
        this.startTime = LocalDateTime.now();
        this.status = "ACTIVE";
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
}
