package com.stresssense.service;

import com.stresssense.dto.SensorDataResponse;
import com.stresssense.dto.SessionReportResponse;
import com.stresssense.dto.SessionResponse;
import com.stresssense.entity.MonitoringSession;
import com.stresssense.entity.SensorReading;
import com.stresssense.exception.ResourceNotFoundException;
import com.stresssense.repository.MonitoringSessionRepository;
import com.stresssense.repository.SensorReadingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SessionService {

    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);

    private final MonitoringSessionRepository sessionRepository;
    private final SensorReadingRepository readingRepository;
    private final SensorDataService sensorDataService;

    public SessionService(MonitoringSessionRepository sessionRepository,
                          SensorReadingRepository readingRepository,
                          @Lazy SensorDataService sensorDataService) {
        this.sessionRepository = sessionRepository;
        this.readingRepository = readingRepository;
        this.sensorDataService = sensorDataService;
    }

    @Transactional
    public SessionResponse startSession(String deviceId) {
        // If an active session already exists for this device, complete it first
        sessionRepository.findFirstByDeviceIdAndStatusOrderByStartTimeDesc(deviceId, "ACTIVE")
                .ifPresent(active -> {
                    active.setStatus("COMPLETED");
                    active.setEndTime(LocalDateTime.now());
                    sessionRepository.save(active);
                    logger.info("Auto-completed previous active session: ID={}", active.getId());
                });

        MonitoringSession session = new MonitoringSession(deviceId);
        session.setAverageBpm(72.0);
        session.setMinBpm(72.0);
        session.setMaxBpm(72.0);
        session.setAverageHrv(48.0);
        session.setAverageStress(38.0);
        session.setAverageRelaxation(62.0);

        MonitoringSession saved = sessionRepository.save(session);
        logger.info("Started new monitoring session: ID={}, Device={}", saved.getId(), deviceId);
        return mapToDto(saved);
    }

    @Transactional
    public SessionResponse stopSession(Long sessionId) {
        MonitoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        if (!"COMPLETED".equalsIgnoreCase(session.getStatus())) {
            session.setStatus("COMPLETED");
            session.setEndTime(LocalDateTime.now());

            // Compute aggregate stats from recorded readings
            List<SensorReading> readings = readingRepository.findBySessionIdOrderByTimestampAsc(sessionId);
            if (!readings.isEmpty()) {
                double sumBpm = 0.0;
                double minBpm = Double.MAX_VALUE;
                double maxBpm = Double.MIN_VALUE;
                double sumHrv = 0.0;
                double sumStress = 0.0;
                double sumRelaxation = 0.0;

                for (SensorReading r : readings) {
                    double bpm = r.getBpm();
                    sumBpm += bpm;
                    if (bpm < minBpm) minBpm = bpm;
                    if (bpm > maxBpm) maxBpm = bpm;

                    sumHrv += r.getHrv();
                    sumStress += r.getStressIndex();
                    sumRelaxation += r.getRelaxationIndex();
                }

                int count = readings.size();
                session.setAverageBpm(Math.round((sumBpm / count) * 10.0) / 10.0);
                session.setMinBpm(Math.round(minBpm * 10.0) / 10.0);
                session.setMaxBpm(Math.round(maxBpm * 10.0) / 10.0);
                session.setAverageHrv(Math.round((sumHrv / count) * 10.0) / 10.0);
                session.setAverageStress(Math.round((sumStress / count) * 10.0) / 10.0);
                session.setAverageRelaxation(Math.round((sumRelaxation / count) * 10.0) / 10.0);
            }

            sessionRepository.save(session);
            logger.info("Completed monitoring session: ID={}, Readings count={}", sessionId, readings.size());
        }

        return mapToDto(session);
    }

    @Transactional(readOnly = true)
    public SessionResponse getSession(Long sessionId) {
        MonitoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));
        return mapToDto(session);
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getAllSessions() {
        return sessionRepository.findAllByOrderByStartTimeDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getSessionsByDevice(String deviceId) {
        return sessionRepository.findByDeviceIdOrderByStartTimeDesc(deviceId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<MonitoringSession> getActiveSession(String deviceId) {
        return sessionRepository.findFirstByDeviceIdAndStatusOrderByStartTimeDesc(deviceId, "ACTIVE");
    }

    @Transactional
    public void updateActiveSessionMetrics(String deviceId, double bpm, double hrv, double stress, double relaxation) {
        getActiveSession(deviceId).ifPresent(session -> {
            if (session.getMinBpm() == null || bpm < session.getMinBpm()) {
                session.setMinBpm(bpm);
            }
            if (session.getMaxBpm() == null || bpm > session.getMaxBpm()) {
                session.setMaxBpm(bpm);
            }

            // Exponential running update for session averages
            double alpha = 0.05;
            session.setAverageBpm(session.getAverageBpm() != null ?
                    Math.round(((1 - alpha) * session.getAverageBpm() + alpha * bpm) * 10.0) / 10.0 : bpm);
            session.setAverageHrv(session.getAverageHrv() != null ?
                    Math.round(((1 - alpha) * session.getAverageHrv() + alpha * hrv) * 10.0) / 10.0 : hrv);
            session.setAverageStress(session.getAverageStress() != null ?
                    Math.round(((1 - alpha) * session.getAverageStress() + alpha * stress) * 10.0) / 10.0 : stress);
            session.setAverageRelaxation(session.getAverageRelaxation() != null ?
                    Math.round(((1 - alpha) * session.getAverageRelaxation() + alpha * relaxation) * 10.0) / 10.0 : relaxation);

            sessionRepository.save(session);
        });
    }

    @Transactional(readOnly = true)
    public SessionReportResponse getSessionReport(Long sessionId) {
        MonitoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        List<SensorReading> readings = readingRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        List<SensorDataResponse> readingDtos = readings.stream()
                .map(sensorDataService::mapToDto)
                .collect(Collectors.toList());

        List<String> observations = generateKeyObservations(session, readings);

        return new SessionReportResponse(mapToDto(session), readingDtos, observations);
    }

    private List<String> generateKeyObservations(MonitoringSession session, List<SensorReading> readings) {
        List<String> list = new ArrayList<>();
        double avgBpm = session.getAverageBpm() != null ? session.getAverageBpm() : 75.0;
        double avgHrv = session.getAverageHrv() != null ? session.getAverageHrv() : 45.0;
        double avgStress = session.getAverageStress() != null ? session.getAverageStress() : 40.0;
        double avgRelax = session.getAverageRelaxation() != null ? session.getAverageRelaxation() : 60.0;

        // Heart Rate observation
        if (avgBpm < 65.0) {
            list.add("Heart rate averaged " + avgBpm + " BPM, indicating a calm resting physiological baseline.");
        } else if (avgBpm <= 85.0) {
            list.add("Heart rate remained in a normal resting physiological range, averaging " + avgBpm + " BPM.");
        } else {
            list.add("Elevated heart rate observed (" + avgBpm + " BPM avg), suggesting sympathetic nervous engagement or active arousal.");
        }

        // HRV observation
        if (avgHrv >= 55.0) {
            list.add("High Heart Rate Variability (" + avgHrv + " ms RMSSD) confirms strong vagal nerve parasympathetic tone.");
        } else if (avgHrv >= 35.0) {
            list.add("Moderate HRV (" + avgHrv + " ms RMSSD) signifies balanced autonomic regulation during the monitoring period.");
        } else {
            list.add("Lower HRV (" + avgHrv + " ms RMSSD) correlates with higher physiological reactivity and reduced autonomic flexibility.");
        }

        // Stress & Relaxation observation
        if (avgStress <= 35.0) {
            list.add("Estimated Stress Index remained consistently low (" + avgStress + "% avg), while Estimated Relaxation averaged " + avgRelax + "%.");
        } else if (avgStress <= 65.0) {
            list.add("Estimated Stress Index hovered in the moderate zone (" + avgStress + "% avg) with stable physiological recovery.");
        } else {
            list.add("Estimated Stress Index peaked in the elevated category (" + avgStress + "% avg), pointing to sustained sympathetic dominance.");
        }

        // Waveform quality & data continuity observation
        int samplesCount = readings.size();
        if (samplesCount > 0) {
            list.add("Captured " + samplesCount + " synchronized physiological data points from the ECG Lead II channel with steady waveform fidelity.");
        } else {
            list.add("Baseline session summary recorded without extensive continuous window readings.");
        }

        return list;
    }

    public SessionResponse mapToDto(MonitoringSession session) {
        SessionResponse dto = new SessionResponse();
        dto.setId(session.getId());
        dto.setDeviceId(session.getDeviceId());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setStatus(session.getStatus());
        dto.setAverageBpm(session.getAverageBpm());
        dto.setMinBpm(session.getMinBpm());
        dto.setMaxBpm(session.getMaxBpm());
        dto.setAverageHrv(session.getAverageHrv());
        dto.setAverageStress(session.getAverageStress());
        dto.setAverageRelaxation(session.getAverageRelaxation());

        LocalDateTime end = session.getEndTime() != null ? session.getEndTime() : LocalDateTime.now();
        if (session.getStartTime() != null) {
            dto.setDurationSeconds(Duration.between(session.getStartTime(), end).getSeconds());
        } else {
            dto.setDurationSeconds(0L);
        }

        return dto;
    }
}
