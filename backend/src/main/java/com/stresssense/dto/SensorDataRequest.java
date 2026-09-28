package com.stresssense.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SensorDataRequest {

    @NotBlank(message = "deviceId is required")
    private String deviceId;

    private String deviceType;

    private LocalDateTime timestamp;

    private Double bpm;

    private Double rrInterval;

    private Double hrv;

    private Double stressIndex;

    private Double relaxationIndex;

    private Double signalQuality;

    private List<Double> ecgSamples = new ArrayList<>();

    public SensorDataRequest() {
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
        this.ecgSamples = ecgSamples != null ? ecgSamples : new ArrayList<>();
    }
}
