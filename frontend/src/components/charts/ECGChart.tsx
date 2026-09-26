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
  const { ecgBuffer, wsStatus } = useMonitoring();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const offsetRef = useRef<number>(0);

  // Synthesize realistic P-QRS-T wave if buffer has few points or for fallback
  const getSimulatedEcgPoint = (t: number) => {
    // Heartbeat cycle period ~ 1.0s (60 bpm) to 0.77s (78 bpm)
    const cycle = (t % 800) / 800; // 0 to 1
    let val = 0;

    // P wave (atrial depolarization: small rounded peak around cycle 0.15)
    if (cycle > 0.10 && cycle < 0.22) {
      val += 0.15 * Math.sin(((cycle - 0.10) / 0.12) * Math.PI);
    }
    // PR segment baseline 0.22 - 0.28

    // Q wave (small downward deflection around 0.29)
    if (cycle >= 0.28 && cycle < 0.31) {
      val -= 0.12 * Math.sin(((cycle - 0.28) / 0.03) * Math.PI);
    }
    // R wave (sharp tall upward ventricular spike 0.31 - 0.35)
    else if (cycle >= 0.31 && cycle < 0.35) {
      val += 1.45 * Math.sin(((cycle - 0.31) / 0.04) * Math.PI);
    }
    // S wave (deep downward deflection 0.35 - 0.38)
    else if (cycle >= 0.35 && cycle < 0.39) {
      val -= 0.35 * Math.sin(((cycle - 0.35) / 0.04) * Math.PI);
    }
    // ST segment baseline 0.39 - 0.48

    // T wave (ventricular repolarization: medium smooth wave 0.48 - 0.65)
    if (cycle >= 0.48 && cycle < 0.66) {
      val += 0.28 * Math.sin(((cycle - 0.48) / 0.18) * Math.PI);
    }

    return val;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!canvas) return;

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

      // Authentic Fine ECG Millimeter Grid
      if (showGrid) {
        // Minor 1mm grid (8px spacing)
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(32, 224, 160, 0.06)';
        for (let x = 0; x < w; x += 8) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 8) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Major 5mm grid (40px spacing)
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = 'rgba(32, 224, 160, 0.14)';
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
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

        // Subtle tick marks
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1;
        [-2, -1, 0, 1, 2].forEach((tick) => {
          const y = centerY - tick * scaleStep;
          ctx.beginPath();
          ctx.moveTo(28, y);
          ctx.lineTo(34, y);
          ctx.stroke();
        });
      }

      // Retrieve or synthesize ECG data points
      let points: number[] = [];
      const data = ecgBuffer;

      if (data && data.length > 20) {
        let minVal = 400;
        let maxVal = 700;
        for (let i = 0; i < data.length; i++) {
          if (data[i] < minVal) minVal = data[i];
          if (data[i] > maxVal) maxVal = data[i];
        }
        const range = Math.max(200, maxVal - minVal);

        points = data.map((d) => {
          const norm = (d - minVal) / range; // 0 to 1
          return (norm - 0.5) * 2; // -1 to +1
        });
      } else {
        // Fallback smooth simulated ECG wave
        if (!isPaused) {
          offsetRef.current += 3.5;
        }
        const totalPoints = 320;
        for (let i = 0; i < totalPoints; i++) {
          const t = i * 4 + offsetRef.current;
          points.push(getSimulatedEcgPoint(t));
        }
      }

      // Draw the ECG Waveform in vivid ECG Green (#20E0A0)
      if (points.length > 1) {
        ctx.save();
        ctx.shadowColor = '#20E0A0';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#20E0A0';
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const startX = showScales ? 36 : 0;
        const availWidth = w - startX;
        const step = availWidth / (points.length - 1);

        // Amplitude factor (standard 10 mm/mV)
        let ampFactor = 70;
        if (amplitude === '5 mm/mV') ampFactor = 40;
        if (amplitude === '20 mm/mV') ampFactor = 110;

        for (let i = 0; i < points.length; i++) {
          const x = startX + i * step;
          const y = centerY - points[i] * ampFactor;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();

        // Bright sweeping pulse bead at current end
        const lastX = w - 2;
        const lastVal = points[points.length - 1];
        const lastY = centerY - lastVal * ampFactor;

        ctx.beginPath();
        ctx.arc(lastX, lastY, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#20E0A0';
        ctx.shadowBlur = 12;
        ctx.fill();
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
  }, [ecgBuffer, showGrid, showScales, amplitude, isPaused]);

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
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-[#FF4D5A] font-bold border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D5A] animate-ping"></span>
              <span>LIVE</span>
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
    </div>
  );
};

export default ECGChart;
