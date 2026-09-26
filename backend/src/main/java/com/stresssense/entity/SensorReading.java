package com.stresssense.entity;

import com.stresssense.util.DoubleListConverter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sensor_readings", indexes = {
    @Index(name = "idx_reading_device_time", columnList = "device_id, timestamp"),
    @Index(name = "idx_reading_session", columnList = "session_id")
})
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false, length = 64)
    private String deviceId;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "bpm", nullable = false)
    private Double bpm;

    @Column(name = "rr_interval", nullable = false)
    private Double rrInterval;

    @Column(name = "hrv", nullable = false)
    private Double hrv;

    @Column(name = "stress_index", nullable = false)
    private Double stressIndex;

    @Column(name = "relaxation_index", nullable = false)
    private Double relaxationIndex;

    @Column(name = "signal_quality", nullable = false)
    private Double signalQuality;

    @Convert(converter = DoubleListConverter.class)
    @Column(name = "ecg_samples", columnDefinition = "TEXT")
    private List<Double> ecgSamples = new ArrayList<>();

    @Convert(converter = DoubleListConverter.class)
    @Column(name = "pulse_samples", columnDefinition = "TEXT")
    private List<Double> pulseSamples = new ArrayList<>();

    public SensorReading() {
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

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Double getBpm() {
        return bpm;
    }

    public void setBpm(Double bpm) {
        this.bpm = bpm;
    }

    public Double getRrInterval() {
        return rrInterval;
    }

    public void setRrInterval(Double rrInterval) {
        this.rrInterval = rrInterval;
    }

    public Double getHrv() {
        return hrv;
    }

    public void setHrv(Double hrv) {
        this.hrv = hrv;
    }

    public Double getStressIndex() {
        return stressIndex;
    }

    public void setStressIndex(Double stressIndex) {
        this.stressIndex = stressIndex;
    }

    public Double getRelaxationIndex() {
        return relaxationIndex;
    }

    public void setRelaxationIndex(Double relaxationIndex) {
        this.relaxationIndex = relaxationIndex;
    }

    public Double getSignalQuality() {
        return signalQuality;
    }

    public void setSignalQuality(Double signalQuality) {
        this.signalQuality = signalQuality;
    }

    public List<Double> getEcgSamples() {
        return ecgSamples;
    }

    public void setEcgSamples(List<Double> ecgSamples) {
        this.ecgSamples = ecgSamples;
    }

    public List<Double> getPulseSamples() {
        return pulseSamples;
    }

    public void setPulseSamples(List<Double> pulseSamples) {
        this.pulseSamples = pulseSamples;
    }
}
