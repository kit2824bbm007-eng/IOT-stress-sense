package com.stresssense.controller;

import com.stresssense.dto.ApiResponse;
import com.stresssense.dto.DeviceDto;
import com.stresssense.service.DeviceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    /**
     * Get all registered devices (both physical IoT controllers and simulators).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DeviceDto>>> getAllDevices() {
        List<DeviceDto> devices = deviceService.getAllDevices();
        return ResponseEntity.ok(ApiResponse.ok("Devices list retrieved", devices));
    }

    /**
     * Get single device details by deviceId.
     */
    @GetMapping("/{deviceId}")
    public ResponseEntity<ApiResponse<DeviceDto>> getDeviceById(@PathVariable String deviceId) {
        DeviceDto device = deviceService.getDeviceById(deviceId);
        return ResponseEntity.ok(ApiResponse.ok("Device details retrieved", device));
    }
}
