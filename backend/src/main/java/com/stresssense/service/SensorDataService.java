package com.stresssense.service;

import com.stresssense.dto.SensorDataRequest;
import com.stresssense.dto.SensorDataResponse;
import com.stresssense.entity.MonitoringSession;
import com.stresssense.entity.SensorReading;
import com.stresssense.repository.SensorReadingRepository;
import com.stresssense.websocket.SensorWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SensorDataService {

    private static final Logger logger = LoggerFactory.getLogger(SensorDataService.class);

    private final SensorReadingRepository readingRepository;
    private final DeviceService deviceService;
    private final SessionService sessionService;
    private final StressAnalysisService stressAnalysisService;
    private final SensorWebSocketHandler webSocketHandler;

    public SensorDataService(SensorReadingRepository readingRepository,
                             DeviceService deviceService,
                             @Lazy SessionService sessionService,
                             StressAnalysisService stressAnalysisService,
                             SensorWebSocketHandler webSocketHandler) {
        this.readingRepository = readingRepository;
        this.deviceService = deviceService;
        this.sessionService = sessionService;
        this.stressAnalysisService = stressAnalysisService;
        this.webSocketHandler = webSocketHandler;
    }

    @Transactional
    public SensorDataResponse processAndSaveSensorData(SensorDataRequest request) {
        String deviceId = request.getDeviceId();
        String deviceType = request.getDeviceType() != null ? request.getDeviceType() : "IOT_CONTROLLER";

        // Update or register device
        deviceService.updateDeviceLastSeen(deviceId, deviceType);

        // Calculate stress & relaxation indices using modular service
        StressAnalysisService.StressAnalysisResult analysis = stressAnalysisService.analyze(
                request.getBpm(),
                request.getHrv(),
                request.getRrInterval(),
                request.getEcgSamples()
        );

        double computedBpm = request.getBpm() != null ? request.getBpm() : 75.0;
        double computedRr = request.getRrInterval() != null ? request.getRrInterval() : (60000.0 / computedBpm);
        double computedHrv = request.getHrv() != null ? request.getHrv() : 45.0;
        double stressIndex = request.getStressIndex() != null ? request.getStressIndex() : analysis.getStressIndex();
        double relaxationIndex = request.getRelaxationIndex() != null ? request.getRelaxationIndex() : analysis.getRelaxationIndex();
        double signalQuality = request.getSignalQuality() != null ? request.getSignalQuality() : analysis.getSignalQuality();

        // Check for active monitoring session
        Optional<MonitoringSession> activeSession = sessionService.getActiveSession(deviceId);
        Long sessionId = activeSession.map(MonitoringSession::getId).orElse(null);

        // Build entity and persist
        SensorReading reading = new SensorReading();
        reading.setDeviceId(deviceId);
        reading.setSessionId(sessionId);
        reading.setTimestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now());
        reading.setBpm(computedBpm);
        reading.setRrInterval(computedRr);
        reading.setHrv(computedHrv);
        reading.setStressIndex(stressIndex);
        reading.setRelaxationIndex(relaxationIndex);
        reading.setSignalQuality(signalQuality);
        reading.setEcgSamples(request.getEcgSamples());

        SensorReading saved = readingRepository.save(reading);

        // Update active session running metrics if applicable
        if (sessionId != null) {
            sessionService.updateActiveSessionMetrics(deviceId, computedBpm, computedHrv, stressIndex, relaxationIndex);
        }

        // Map to response DTO
        SensorDataResponse response = mapToDto(saved);
        response.setDeviceType(deviceType);
        response.setWellnessState(analysis.getWellnessState());
        response.setWellnessDescription(analysis.getWellnessDescription());

        // Broadcast to WebSocket clients
        webSocketHandler.broadcastReading(response);

        return response;
    }

    @Transactional(readOnly = true)
    public SensorDataResponse getLatestSensorData(String deviceId) {
        return readingRepository.findFirstByDeviceIdOrderByTimestampDesc(deviceId)
                .map(this::mapToDto)
                .orElseGet(() -> {
                    // Return initialized baseline if no readings exist yet
                    SensorDataResponse fallback = new SensorDataResponse();
                    fallback.setDeviceId(deviceId);
                    fallback.setDeviceType("SIMULATOR");
                    fallback.setTimestamp(LocalDateTime.now());
                    fallback.setBpm(73.5);
                    fallback.setRrInterval(816.0);
                    fallback.setHrv(48.0);
                    fallback.setStressIndex(38.0);
                    fallback.setRelaxationIndex(62.0);
                    fallback.setWellnessState("LOW STRESS");
                    fallback.setWellnessDescription("Physiological signals reflect optimal autonomic balance and high parasympathetic tone.");
                    fallback.setSignalQuality(98.0);
                    return fallback;
                });
    }

    @Transactional(readOnly = true)
    public List<SensorDataResponse> getSensorHistory(String deviceId, int limit) {
        int safeLimit = Math.min(limit > 0 ? limit : 50, 200);
        List<SensorReading> list = readingRepository.findRecentByDeviceId(deviceId, safeLimit);
        // Reverse so chronological ascending for charts
        Collections.reverse(list);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SensorDataResponse mapToDto(SensorReading reading) {
        SensorDataResponse dto = new SensorDataResponse();
        dto.setId(reading.getId());
        dto.setDeviceId(reading.getDeviceId());
        dto.setSessionId(reading.getSessionId());
        dto.setTimestamp(reading.getTimestamp());
        dto.setBpm(reading.getBpm());
        dto.setRrInterval(reading.getRrInterval());
        dto.setHrv(reading.getHrv());
        dto.setStressIndex(reading.getStressIndex());
        dto.setRelaxationIndex(reading.getRelaxationIndex());
        dto.setSignalQuality(reading.getSignalQuality());
        dto.setEcgSamples(reading.getEcgSamples());

        // Wellness state interpretation
        if (reading.getStressIndex() != null) {
            if (reading.getStressIndex() < 35.0) {
                dto.setWellnessState("LOW STRESS");
                dto.setWellnessDescription("Physiological signals reflect optimal autonomic balance and high parasympathetic tone.");
            } else if (reading.getStressIndex() <= 65.0) {
                dto.setWellnessState("MODERATE STRESS");
                dto.setWellnessDescription("Estimated stress is currently moderate based on the available physiological signal features.");
            } else {
                dto.setWellnessState("ELEVATED STRESS");
                dto.setWellnessDescription("Physiological signals indicate elevated sympathetic nervous system arousal.");
            }
        }
        return dto;
    }
}
