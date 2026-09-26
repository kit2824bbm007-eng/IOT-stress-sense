package com.stresssense.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Modular service for physiological signal analysis and wellness estimation.
 * Calculates Estimated Stress Index and Estimated Relaxation Index based on
 * Heart Rate (BPM), Heart Rate Variability (HRV / RMSSD), and RR interval dynamics.
 *
 * NOTE: This is an educational wellness-monitoring prototype and does not provide
 * medical diagnosis.
 */
@Service
public class StressAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(StressAnalysisService.class);

    public static final String DISCLAIMER = "This system is an educational wellness-monitoring prototype. " +
            "Stress and relaxation values are estimated from physiological signal features and are not intended for medical diagnosis.";

    public static class StressAnalysisResult {
        private final double stressIndex;
        private final double relaxationIndex;
        private final String wellnessState;
        private final String wellnessDescription;
        private final double signalQuality;

        public StressAnalysisResult(double stressIndex, double relaxationIndex, String wellnessState, String wellnessDescription, double signalQuality) {
            this.stressIndex = stressIndex;
            this.relaxationIndex = relaxationIndex;
            this.wellnessState = wellnessState;
            this.wellnessDescription = wellnessDescription;
            this.signalQuality = signalQuality;
        }

        public double getStressIndex() {
            return stressIndex;
        }

        public double getRelaxationIndex() {
            return relaxationIndex;
        }

        public String getWellnessState() {
            return wellnessState;
        }

        public String getWellnessDescription() {
            return wellnessDescription;
        }

        public double getSignalQuality() {
            return signalQuality;
        }
    }

    /**
     * Compute stress and relaxation indices from physiological features.
     *
     * @param bpm Heart rate in beats per minute
     * @param hrv Heart rate variability (RMSSD/SDNN in milliseconds)
     * @param rrInterval Mean RR interval in milliseconds
     * @param ecgSamples Raw ECG waveform samples
     * @param pulseSamples Raw Pulse/PPG waveform samples
     * @return StressAnalysisResult with indices, state, and description
     */
    public StressAnalysisResult analyze(Double bpm, Double hrv, Double rrInterval, List<Double> ecgSamples, List<Double> pulseSamples) {
        double safeBpm = (bpm != null && bpm > 30.0 && bpm < 220.0) ? bpm : 75.0;
        double safeHrv = (hrv != null && hrv >= 0.0) ? hrv : 45.0;
        double safeRr = (rrInterval != null && rrInterval > 200.0) ? rrInterval : (60000.0 / safeBpm);

        // 1. Heart Rate Stress Factor (0 - 100)
        // Resting baseline ~ 60 BPM (low stress); > 95 BPM elevates stress score
        double hrStressFactor;
        if (safeBpm <= 60.0) {
            hrStressFactor = Math.max(5.0, (safeBpm - 45.0) / 15.0 * 20.0);
        } else if (safeBpm <= 85.0) {
            hrStressFactor = 20.0 + ((safeBpm - 60.0) / 25.0) * 35.0; // 20 - 55
        } else if (safeBpm <= 115.0) {
            hrStressFactor = 55.0 + ((safeBpm - 85.0) / 30.0) * 30.0; // 55 - 85
        } else {
            hrStressFactor = Math.min(100.0, 85.0 + ((safeBpm - 115.0) / 35.0) * 15.0);
        }

        // 2. HRV Stress Factor (0 - 100)
        // Higher HRV (> 55 ms) indicates high parasympathetic (vagal) tone / relaxation.
        // Lower HRV (< 25 ms) indicates sympathetic arousal / stress.
        double hrvStressFactor;
        if (safeHrv >= 70.0) {
            hrvStressFactor = Math.max(5.0, 20.0 - ((safeHrv - 70.0) / 30.0) * 15.0);
        } else if (safeHrv >= 40.0) {
            hrvStressFactor = 20.0 + ((70.0 - safeHrv) / 30.0) * 30.0; // 20 - 50
        } else if (safeHrv >= 20.0) {
            hrvStressFactor = 50.0 + ((40.0 - safeHrv) / 20.0) * 30.0; // 50 - 80
        } else {
            hrvStressFactor = Math.min(100.0, 80.0 + ((20.0 - safeHrv) / 20.0) * 20.0);
        }

        // 3. RR Interval Consistency Factor
        // Expected RR for safeBpm is 60000 / safeBpm. Ratio check gives rhythm stability
        double expectedRr = 60000.0 / safeBpm;
        double rrDiscrepancy = Math.abs(safeRr - expectedRr) / expectedRr;
        double rrStressAdjustment = Math.min(10.0, rrDiscrepancy * 25.0);

        // 4. Combined Estimated Stress Index (Weighted: 55% HRV, 40% HR, 5% RR discrepancy)
        double rawStress = (0.55 * hrvStressFactor) + (0.40 * hrStressFactor) + rrStressAdjustment;
        double estimatedStress = Math.round(Math.min(100.0, Math.max(0.0, rawStress)) * 10.0) / 10.0;

        // 5. Estimated Relaxation Index (Complementary physiological parasympathetic reflection)
        double rawRelaxation = 100.0 - estimatedStress;
        // Subtle boost if HRV is exceptionally resilient
        if (safeHrv > 50.0) {
            rawRelaxation = Math.min(100.0, rawRelaxation + 2.5);
        }
        double estimatedRelaxation = Math.round(Math.min(100.0, Math.max(0.0, rawRelaxation)) * 10.0) / 10.0;

        // 6. Signal Quality Calculation
        double signalQuality = calculateSignalQuality(ecgSamples, pulseSamples);

        // 7. Wellness State Classification
        String wellnessState;
        String wellnessDescription;

        if (estimatedStress < 35.0) {
            wellnessState = "LOW STRESS";
            wellnessDescription = "Physiological signals reflect optimal autonomic balance and high parasympathetic tone. System indicates a relaxed, restorative state.";
        } else if (estimatedStress <= 65.0) {
            wellnessState = "MODERATE STRESS";
            wellnessDescription = "Estimated stress is currently moderate based on the available physiological signal features.";
        } else {
            wellnessState = "ELEVATED STRESS";
            wellnessDescription = "Physiological signals indicate elevated sympathetic nervous system arousal with reduced heart rate variability. Consider a guided breathing pause.";
        }

        return new StressAnalysisResult(estimatedStress, estimatedRelaxation, wellnessState, wellnessDescription, signalQuality);
    }

    /**
     * Estimates signal quality (0 - 100%) from waveform samples amplitude and continuity.
     */
    public double calculateSignalQuality(List<Double> ecgSamples, List<Double> pulseSamples) {
        if ((ecgSamples == null || ecgSamples.isEmpty()) && (pulseSamples == null || pulseSamples.isEmpty())) {
            return 85.0; // Baseline default
        }

        double score = 96.0;
        if (ecgSamples != null && !ecgSamples.isEmpty()) {
            double min = Double.MAX_VALUE;
            double max = -Double.MAX_VALUE;
            for (Double v : ecgSamples) {
                if (v != null) {
                    if (v < min) min = v;
                    if (v > max) max = v;
                }
            }
            double dynamicRange = max - min;
            if (dynamicRange < 50.0 || dynamicRange > 2000.0) {
                score -= 6.0;
            }
        }

        if (pulseSamples != null && !pulseSamples.isEmpty()) {
            double min = Double.MAX_VALUE;
            double max = -Double.MAX_VALUE;
            for (Double v : pulseSamples) {
                if (v != null) {
                    if (v < min) min = v;
                    if (v > max) max = v;
                }
            }
            double dynamicRange = max - min;
            if (dynamicRange < 30.0) {
                score -= 4.0;
            }
        }

        return Math.round(Math.min(99.5, Math.max(50.0, score)) * 10.0) / 10.0;
    }
}
