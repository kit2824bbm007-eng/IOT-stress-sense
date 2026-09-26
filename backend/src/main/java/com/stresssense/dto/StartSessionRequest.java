package com.stresssense.dto;

import jakarta.validation.constraints.NotBlank;

public class StartSessionRequest {

    @NotBlank(message = "deviceId is required")
    private String deviceId;

    public StartSessionRequest() {
    }

    public StartSessionRequest(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
}
