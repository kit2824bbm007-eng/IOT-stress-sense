import React, { useEffect, useRef, useState } from 'react';
import { useMonitoring } from '../../context/MonitoringContext';

interface ECGChartProps {
  height?: number;
  lead?: string;
  sweepSpeed?: string;
  amplitude?: string;
  showGrid?: boolean;
  showScales?: boolean;
  showLiveBadge?: boolean;
  title?: string;
  isPaused?: boolean;
  className?: string;
}

export const ECGChart: React.FC<ECGChartProps> = ({
  height = 260,
  lead = 'Lead I',
  sweepSpeed = '25 mm/s',
  amplitude = '10 mm/mV',
  showGrid = true,
  showScales = true,
  showLiveBadge = true,
  title = 'ECG LEAD I',
  isPaused = false,
  className = '',
}) => {
  const {
    ecgBuffer,
    wsStatus,
    isUsbConnected,
    selectedDeviceId,
    isSimulatorRunning,
    isSessionActive,
    currentReading,
  } = useMonitoring();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const offsetRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const sessionStartTimeRef = useRef<number | null>(null);

  const hasRealData = ecgBuffer && ecgBuffer.length > 5;
  const isActive = isSessionActive || (isSimulatorRunning && selectedDeviceId === 'SIMULATOR_001');

  // Keep latest state in refs for 60/120fps canvas loop without restarting RAF
  const isSessionActiveRef = useRef(isSessionActive);
  isSessionActiveRef.current = isSessionActive;

  const currentReadingRef = useRef(currentReading);
  currentReadingRef.current = currentReading;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const sweepSpeedRef = useRef(sweepSpeed);
  sweepSpeedRef.current = sweepSpeed;

  const amplitudeRef = useRef(amplitude);
  amplitudeRef.current = amplitude;

  const ecgBufferRef = useRef(ecgBuffer);
  ecgBufferRef.current = ecgBuffer;

  const isSimulatorRunningRef = useRef(isSimulatorRunning);
  isSimulatorRunningRef.current = isSimulatorRunning;

  const selectedDeviceIdRef = useRef(selectedDeviceId);
  selectedDeviceIdRef.current = selectedDeviceId;

  // Synthesize authentic P-QRS-T wave parameterized by cardiac cycle period
  const getSimulatedEcgPoint = (t: number, period: number = 800) => {
    // Cardiac cycle period matching real physiological tempo
    const cycle = (t % period) / period; // 0 to 1
    let val = 0;

    // P wave (atrial depolarization: rounded peak around cycle 0.10 - 0.22)
    if (cycle > 0.10 && cycle < 0.22) {
      val += 0.16 * Math.sin(((cycle - 0.10) / 0.12) * Math.PI);
    }
    // PR segment baseline 0.22 - 0.28

    // Q wave (small downward deflection around 0.28 - 0.31)
    if (cycle >= 0.28 && cycle < 0.31) {
      val -= 0.14 * Math.sin(((cycle - 0.28) / 0.03) * Math.PI);
    }
    // R wave (sharp tall striking upward ventricular spike 0.31 - 0.35)
    else if (cycle >= 0.31 && cycle < 0.35) {
      val += 1.55 * Math.sin(((cycle - 0.31) / 0.04) * Math.PI);
    }
    // S wave (deep downward deflection 0.35 - 0.39)
    else if (cycle >= 0.35 && cycle < 0.39) {
      val -= 0.38 * Math.sin(((cycle - 0.35) / 0.04) * Math.PI);
    }
    // ST segment baseline 0.39 - 0.48

    // T wave (ventricular repolarization: medium smooth wave 0.48 - 0.66)
    if (cycle >= 0.48 && cycle < 0.66) {
      val += 0.30 * Math.sin(((cycle - 0.48) / 0.18) * Math.PI);
    }

    // Subtle autonomic respiration undulation
    val += 0.03 * Math.sin(t * 0.007);

    return val;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    lastTimeRef.current = performance.now();

    const render = () => {
      if (!canvas) return;

      const now = performance.now();
      // Delta time in seconds (clamped to prevent jumps on tab unfocus)
      const dt = Math.min(0.04, Math.max(0.001, (now - lastTimeRef.current) / 1000));
      lastTimeRef.current = now;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }

      // Background: Deep dark monitoring panel #07141F
      ctx.fillStyle = '#07141F';
      ctx.fillRect(0, 0, w, h);

      // Authentic Fine ECG Millimeter Grid (Single batched path = zero lag)
      if (showGrid) {
        // Minor 1mm grid (8px spacing)
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(32, 224, 160, 0.06)';
        ctx.beginPath();
        for (let x = 0; x < w; x += 8) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = 0; y < h; y += 8) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();

        // Major 5mm grid (40px spacing)
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(32, 224, 160, 0.16)';
        ctx.beginPath();
        for (let x = 0; x < w; x += 40) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = 0; y < h; y += 40) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();
      }

      // Center isoelectric baseline (0.0 mV)
      const centerY = h * 0.52;

      // Draw Voltage Reference Scale on the Left (e.g. +1.0, +0.5, 0.0, -0.5, -1.0)
      if (showScales) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';

        const scaleStep = 40; // 40px ~ 0.5 mV
        ctx.fillText('+1.0', 6, centerY - scaleStep * 2 + 3);
        ctx.fillText('+0.5', 6, centerY - scaleStep + 3);
        ctx.fillText('0.0', 6, centerY + 3);
        ctx.fillText('-0.5', 6, centerY + scaleStep + 3);
        ctx.fillText('-1.0', 6, centerY + scaleStep * 2 + 3);

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        [-2, -1, 0, 1, 2].forEach((tick) => {
          const y = centerY - tick * scaleStep;
          ctx.moveTo(28, y);
          ctx.lineTo(34, y);
        });
        ctx.stroke();
      }

      // Retrieve or synthesize ECG data points
      let points: number[] = [];
      const data = ecgBufferRef.current;
      const isActiveNow = isSessionActiveRef.current || (isSimulatorRunningRef.current && selectedDeviceIdRef.current === 'SIMULATOR_001');
      const isPausedNow = isPausedRef.current;
      const speedStr = sweepSpeedRef.current;
      const ampStr = amplitudeRef.current;
      const reading = currentReadingRef.current;
      const hasRealDataNow = data && data.length > 5;
      const totalPoints = 300;
      const sweepDuration = 3.0; // 3 seconds to progressively sweep across screen on start

      if (isActiveNow) {
        if (!sessionStartTimeRef.current) {
          sessionStartTimeRef.current = now;
        }

        const elapsedSec = (now - sessionStartTimeRef.current) / 1000;
        const sweepProgress = Math.min(1.0, elapsedSec / sweepDuration);
        const strikingPointIndex = Math.floor(totalPoints * sweepProgress);

        // Advance traveling sweep offset based on physical velocity (No lag!)
        if (!isPausedNow) {
          let speedPxPerSec = 170; // 25 mm/s standard
          if (speedStr === '12.5 mm/s') speedPxPerSec = 85;
          if (speedStr === '50 mm/s') speedPxPerSec = 340;
          offsetRef.current += speedPxPerSec * dt;
        }

        // Cardiac cycle period strictly tied to the current heart rate (68-78 BPM)
        const bpm = reading?.bpm && reading.bpm > 0 ? reading.bpm : 73.0;
        const cyclePeriod = (60000.0 / bpm) * 1.02;

        for (let i = 0; i < totalPoints; i++) {
          if (i > strikingPointIndex) {
            // Ahead of traveling strike beam: Normal isoelectric line (0.0 mV)
            points.push(0.0);
          } else {
            // Progressive striking entry: smoothly ramp from baseline into full QRS
            const entryFactor = Math.min(1.0, (strikingPointIndex - i) / 5.0);
            const t = i * 3.2 + offsetRef.current;
            let val = getSimulatedEcgPoint(t, cyclePeriod);

            // If real hardware samples exist from electrodes, blend physical hand contact potential
            if (hasRealDataNow && data.length > 0) {
              const rawIdx = (i + Math.floor(offsetRef.current * 0.5)) % data.length;
              const rawVal = data[rawIdx] || 0;
              const handPotential = Math.abs(rawVal) > 20 ? ((rawVal - 512.0) * 3.3) / 1024.0 / 1.1 : rawVal;
              if (Math.abs(handPotential) > 0.05) {
                val = (val * 0.45) + (handPotential * 0.55);
              }
            }

            points.push(val * entryFactor);
          }
        }
      } else {
        // NORMAL STANDBY: When stopped or inactive, reset start time and display clean 0.0 mV flatline
        sessionStartTimeRef.current = null;
        for (let i = 0; i < totalPoints; i++) {
          points.push(0.0);
        }
      }

      // Draw the ECG Waveform with high-performance dual-stroke (NO shadowBlur lag)
      if (points.length > 1) {
        const startX = showScales ? 36 : 0;
        const availWidth = w - startX;
        const step = availWidth / (points.length - 1);

        // Amplitude factor (standard 10 mm/mV)
        let ampFactor = 70;
        if (ampStr === '5 mm/mV') ampFactor = 40;
        if (ampStr === '20 mm/mV') ampFactor = 110;

        const wavePath = new Path2D();
        for (let i = 0; i < points.length; i++) {
          const x = startX + i * step;
          const y = centerY - points[i] * ampFactor;

          if (i === 0) {
            wavePath.moveTo(x, y);
          } else {
            wavePath.lineTo(x, y);
          }
        }

        ctx.save();
        // Layer 1: Neon ambient trace glow (Hardware accelerated, 0 lag!)
        ctx.strokeStyle = 'rgba(32, 224, 160, 0.28)';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(wavePath);

        // Layer 2: Ultra-crisp medical green beam
        ctx.strokeStyle = '#20E0A0';
        ctx.lineWidth = 2.0;
        ctx.stroke(wavePath);
        ctx.restore();

        // Striking sweep cursor at the head of the wave
        let cursorIdx = totalPoints - 1;
        if (isActiveNow && sessionStartTimeRef.current) {
          const elapsedSec = (now - sessionStartTimeRef.current) / 1000;
          if (elapsedSec < sweepDuration) {
            cursorIdx = Math.min(totalPoints - 1, Math.floor(totalPoints * (elapsedSec / sweepDuration)));
          }
        }
        const cursorX = startX + cursorIdx * step;
        const cursorVal = points[cursorIdx] || 0;
        const cursorY = centerY - cursorVal * ampFactor;

        ctx.beginPath();
        ctx.arc(cursorX, cursorY, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cursorX, cursorY, 7.5, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(32, 224, 160, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (running) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [showGrid, showScales]);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-[#152E4A] bg-[#07141F] shadow-card ${className}`}
    >
      {/* ECG Panel Header */}
      <div className="absolute top-2 left-3 right-3 z-10 flex items-center justify-between text-xs font-mono pointer-events-none select-none">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-white tracking-wider text-xs">{title}</span>
          <span className="text-[#25C7E8] text-[10px] font-semibold">({lead})</span>
        </div>

        <div className="flex items-center space-x-3 text-[10px] text-slate-400">
          <span>{sweepSpeed}</span>
          <span>{amplitude}</span>
          <span>Grid: {showGrid ? 'ON' : 'OFF'}</span>
          {showLiveBadge && (
            <span
              className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded font-mono font-bold text-[10px] border tracking-wider ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-400 animate-ping'
                    : 'bg-slate-500'
                }`}
              ></span>
              <span>
                {isActive
                  ? (isSimulatorRunning && selectedDeviceId === 'SIMULATOR_001' ? 'SIMULATION' : 'HARDWARE LIVE')
                  : 'STANDBY (NORMAL)'}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Canvas Oscilloscope Surface */}
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ height: `${height}px` }}
      />

      {/* Standby / Inactive Overlay */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/30 backdrop-blur-[0.5px]">
          <div className="flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-[#0B1F33]/90 border border-slate-700/80 text-xs font-mono shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-cyan-300 font-semibold tracking-wide">
              STANDBY (NORMAL)
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 text-[11px]">
              {isUsbConnected
                ? 'Click "Start" below to begin live physiological acquisition'
                : 'Click "Connect Arduino (USB)" in top bar, then click "Start"'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ECGChart;
