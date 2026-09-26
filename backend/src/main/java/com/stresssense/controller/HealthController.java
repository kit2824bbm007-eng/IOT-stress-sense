package com.stresssense.controller;

import com.stresssense.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "StressSense Backend");
        health.put("version", "1.0.0");
        health.put("timestamp", LocalDateTime.now());
        health.put("message", "Real-Time Stress & Relaxation Monitoring System is operational");
        return ResponseEntity.ok(ApiResponse.ok("System healthy", health));
    }
}
