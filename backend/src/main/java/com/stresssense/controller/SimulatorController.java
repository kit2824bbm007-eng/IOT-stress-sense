package com.stresssense.controller;

import com.stresssense.dto.ApiResponse;
import com.stresssense.dto.SimulatorStatusResponse;
import com.stresssense.simulator.SensorSimulatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulator")
public class SimulatorController {

    private final SensorSimulatorService simulatorService;

    public SimulatorController(SensorSimulatorService simulatorService) {
        this.simulatorService = simulatorService;
    }

    /**
     * Start the background physiological sensor simulator.
     */
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<SimulatorStatusResponse>> startSimulator() {
        boolean started = simulatorService.startSimulator();
        SimulatorStatusResponse status = simulatorService.getStatus();
        String message = started ? "Simulator started successfully" : "Simulator was already running";
        return ResponseEntity.ok(ApiResponse.ok(message, status));
    }

    /**
     * Stop the background physiological sensor simulator.
     */
    @PostMapping("/stop")
    public ResponseEntity<ApiResponse<SimulatorStatusResponse>> stopSimulator() {
        boolean stopped = simulatorService.stopSimulator();
        SimulatorStatusResponse status = simulatorService.getStatus();
        String message = stopped ? "Simulator stopped successfully" : "Simulator was not running";
        return ResponseEntity.ok(ApiResponse.ok(message, status));
    }

    /**
     * Get current status of the sensor simulator.
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<SimulatorStatusResponse>> getSimulatorStatus() {
        SimulatorStatusResponse status = simulatorService.getStatus();
        return ResponseEntity.ok(ApiResponse.ok("Simulator status retrieved", status));
    }
}
