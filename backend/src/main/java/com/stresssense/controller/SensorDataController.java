package com.stresssense.controller;

import com.stresssense.dto.ApiResponse;
import com.stresssense.dto.SensorDataRequest;
import com.stresssense.dto.SensorDataResponse;
import com.stresssense.service.SensorDataService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensor")
public class SensorDataController {

    private final SensorDataService sensorDataService;

    public SensorDataController(SensorDataService sensorDataService) {
        this.sensorDataService = sensorDataService;
    }

    /**
     * Hardware-independent endpoint for ingesting sensor readings.
     * Compatible with Simulator, Arduino, ESP32, or any IoT controller.
     */
    @PostMapping("/data")
    public ResponseEntity<ApiResponse<SensorDataResponse>> ingestSensorData(@Valid @RequestBody SensorDataRequest request) {
        SensorDataResponse response = sensorDataService.processAndSaveSensorData(request);
        return ResponseEntity.ok(ApiResponse.ok("Sensor data ingested successfully", response));
    }

    /**
     * Get the latest sensor reading for a specific device.
     */
    @GetMapping("/latest/{deviceId}")
    public ResponseEntity<ApiResponse<SensorDataResponse>> getLatestSensorData(@PathVariable String deviceId) {
        SensorDataResponse response = sensorDataService.getLatestSensorData(deviceId);
        return ResponseEntity.ok(ApiResponse.ok("Latest sensor data retrieved", response));
    }

    /**
     * Get historical sensor readings for trend analysis and chart initialization.
     */
    @GetMapping("/history/{deviceId}")
    public ResponseEntity<ApiResponse<List<SensorDataResponse>>> getSensorHistory(
            @PathVariable String deviceId,
            @RequestParam(defaultValue = "50") int limit) {
        List<SensorDataResponse> history = sensorDataService.getSensorHistory(deviceId, limit);
        return ResponseEntity.ok(ApiResponse.ok("Sensor history retrieved", history));
    }
}
