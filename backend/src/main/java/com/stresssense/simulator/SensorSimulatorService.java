package com.stresssense.simulator;

import com.stresssense.dto.SensorDataRequest;
import com.stresssense.dto.SimulatorStatusResponse;
import com.stresssense.service.SensorDataService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class SensorSimulatorService {

    private static final Logger logger = LoggerFactory.getLogger(SensorSimulatorService.class);

    @Value("${simulation.enabled:true}")
    private boolean initialEnabled;

    @Value("${simulation.interval-ms:500}")
    private long intervalMs;

    @Value("${simulation.device-id:SIMULATOR_001}")
    private String deviceId;

    @Value("${simulation.device-type:SIMULATOR}")
    private String deviceType;

    private final SensorDataService sensorDataService;
    private final ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
    private ScheduledFuture<?> scheduledTask;

    private final AtomicBoolean running = new AtomicBoolean(false);
    private final AtomicLong packetsCount = new AtomicLong(0);

    // Continuous time tracker for smooth phase continuity
    private double simTimeSeconds = 0.0;
    private final Random random = new Random();

    public SensorSimulatorService(SensorDataService sensorDataService) {
        this.sensorDataService = sensorDataService;
    }

    @PostConstruct
    public void init() {
        if (initialEnabled) {
            logger.info("Auto-starting Sensor Simulator for device '{}' (interval: {} ms)", deviceId, intervalMs);
            startSimulator();
        }
    }

    @PreDestroy
    public void cleanup() {
        stopSimulator();
        executorService.shutdown();
    }

    public synchronized boolean startSimulator() {
        if (running.get()) {
            return false;
        }
        running.set(true);
        scheduledTask = executorService.scheduleAtFixedRate(this::generateAndSendReading, 100, intervalMs, TimeUnit.MILLISECONDS);
        logger.info("Sensor simulator started successfully.");
        return true;
    }

    public synchronized boolean stopSimulator() {
        if (!running.get()) {
            return false;
        }
        running.set(false);
        if (scheduledTask != null) {
            scheduledTask.cancel(false);
            scheduledTask = null;
        }
        logger.info("Sensor simulator stopped.");
        return true;
    }

    public SimulatorStatusResponse getStatus() {
        return new SimulatorStatusResponse(
                running.get(),
                intervalMs,
                deviceId,
                deviceType,
                packetsCount.get()
        );
    }

    /**
     * Generate synthetic physiological signals and publish through standard Sensor API pipeline.
     */
    private void generateAndSendReading() {
        try {
            // Simulated respiration cycle (0.2 Hz = 5 second breathing cycle) for Respiratory Sinus Arrhythmia (RSA)
            double respirationPhase = 2 * Math.PI * 0.2 * simTimeSeconds;
            double rsaModulation = Math.sin(respirationPhase);

            // Physiological heart rate dynamics: base 74 BPM with ± 5 BPM respiration modulation + subtle drift
            double currentBpm = Math.round((74.0 + (5.0 * rsaModulation) + (random.nextDouble() * 2.0 - 1.0)) * 10.0) / 10.0;
            double currentHrv = Math.round((46.0 + (7.0 * rsaModulation) + (random.nextDouble() * 3.0 - 1.5)) * 10.0) / 10.0;
            double currentRr = Math.round((60000.0 / currentBpm) * 10.0) / 10.0;

            // Generate high-resolution waveform window for live chart visualization (180 samples)
            int sampleCount = 180;
            double sampleRate = 250.0; // 250 Hz sample rate
            double dt = 1.0 / sampleRate;

            List<Double> ecgSamples = new ArrayList<>(sampleCount);
            List<Double> pulseSamples = new ArrayList<>(sampleCount);

            double cyclePeriod = 60.0 / currentBpm;

            for (int i = 0; i < sampleCount; i++) {
                double t = simTimeSeconds + (i * dt);
                double phase = (t % cyclePeriod) / cyclePeriod; // 0.0 to 1.0 within cardiac cycle

                // --- Physiological ECG Synthetic Model (Sum of Gaussian Envelopes) ---
                // P wave: center 0.16, width 0.035, amp 0.18
                double pWave = 0.18 * Math.exp(-Math.pow((phase - 0.16) / 0.035, 2));
                // Q wave: center 0.28, width 0.015, amp -0.15
                double qWave = -0.15 * Math.exp(-Math.pow((phase - 0.28) / 0.015, 2));
                // R wave: center 0.32, width 0.018, amp 1.30
                double rWave = 1.30 * Math.exp(-Math.pow((phase - 0.32) / 0.018, 2));
                // S wave: center 0.36, width 0.018, amp -0.32
                double sWave = -0.32 * Math.exp(-Math.pow((phase - 0.36) / 0.018, 2));
                // T wave: center 0.58, width 0.065, amp 0.36
                double tWave = 0.36 * Math.exp(-Math.pow((phase - 0.58) / 0.065, 2));

                double ecgNorm = pWave + qWave + rWave + sWave + tWave;
                // Baseline wander + micro-noise
                double baselineWander = 0.03 * Math.sin(2 * Math.PI * 0.15 * t);
                double noise = (random.nextDouble() - 0.5) * 0.02;

                // Scale to typical 10-bit ADC integer values centered around 512 (e.g. 350 - 850)
                double ecgValue = Math.round((512.0 + (ecgNorm + baselineWander + noise) * 220.0) * 10.0) / 10.0;
                ecgSamples.add(ecgValue);

                // --- Physiological Pulse / PPG Photoplethysmogram Model ---
                // Systolic wave: center 0.35, width 0.08, amp 0.85
                double sysWave = 0.85 * Math.exp(-Math.pow((phase - 0.35) / 0.08, 2));
                // Dicrotic notch and diastolic wave: center 0.54, width 0.06, amp 0.32
                double dicWave = 0.32 * Math.exp(-Math.pow((phase - 0.54) / 0.06, 2));
                double ppgNorm = sysWave + dicWave;
                double ppgNoise = (random.nextDouble() - 0.5) * 0.015;

                // Scale to typical optical PPG ADC range (e.g. 300 - 650)
                double ppgValue = Math.round((320.0 + (ppgNorm + ppgNoise) * 260.0) * 10.0) / 10.0;
                pulseSamples.add(ppgValue);
            }

            // Advance simulation clock for next cycle
            simTimeSeconds += (intervalMs / 1000.0);

            // Construct standard sensor payload
            SensorDataRequest request = new SensorDataRequest();
            request.setDeviceId(deviceId);
            request.setDeviceType(deviceType);
            request.setTimestamp(LocalDateTime.now());
            request.setBpm(currentBpm);
            request.setRrInterval(currentRr);
            request.setHrv(currentHrv);
            request.setSignalQuality(98.5);
            request.setEcgSamples(ecgSamples);
            request.setPulseSamples(pulseSamples);

            // Pass through standard processing pipeline
            sensorDataService.processAndSaveSensorData(request);
            packetsCount.incrementAndGet();

        } catch (Exception e) {
            logger.error("Error in sensor simulator execution loop", e);
        }
    }
}
