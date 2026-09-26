package com.stresssense.controller;

import com.stresssense.dto.ApiResponse;
import com.stresssense.dto.SessionReportResponse;
import com.stresssense.dto.SessionResponse;
import com.stresssense.dto.StartSessionRequest;
import com.stresssense.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/session")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    /**
     * Start a new monitoring session for a device.
     */
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<SessionResponse>> startSession(@Valid @RequestBody StartSessionRequest request) {
        SessionResponse response = sessionService.startSession(request.getDeviceId());
        return ResponseEntity.ok(ApiResponse.ok("Monitoring session started", response));
    }

    /**
     * Stop and complete an active monitoring session.
     */
    @PostMapping("/{sessionId}/stop")
    public ResponseEntity<ApiResponse<SessionResponse>> stopSession(@PathVariable Long sessionId) {
        SessionResponse response = sessionService.stopSession(sessionId);
        return ResponseEntity.ok(ApiResponse.ok("Monitoring session completed and saved", response));
    }

    /**
     * Get details of a specific session.
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSession(@PathVariable Long sessionId) {
        SessionResponse response = sessionService.getSession(sessionId);
        return ResponseEntity.ok(ApiResponse.ok("Session details retrieved", response));
    }

    /**
     * Get detailed session report with trends, readings, and key observations.
     */
    @GetMapping("/{sessionId}/report")
    public ResponseEntity<ApiResponse<SessionReportResponse>> getSessionReport(@PathVariable Long sessionId) {
        SessionReportResponse response = sessionService.getSessionReport(sessionId);
        return ResponseEntity.ok(ApiResponse.ok("Session report generated successfully", response));
    }

    /**
     * Get all monitoring sessions (for history view).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getAllSessions(
            @RequestParam(required = false) String deviceId) {
        List<SessionResponse> list = (deviceId != null && !deviceId.isBlank()) ?
                sessionService.getSessionsByDevice(deviceId) :
                sessionService.getAllSessions();
        return ResponseEntity.ok(ApiResponse.ok("Sessions list retrieved", list));
    }
}
