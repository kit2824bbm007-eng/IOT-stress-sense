import React, { useEffect, useRef } from 'react';
import { useMonitoring } from '../../context/MonitoringContext';

interface PulseChartProps {
  height?: number;
  title?: string;
  showLiveBadge?: boolean;
  className?: string;
}

export const PulseChart: React.FC<PulseChartProps> = ({
  height = 200,
  title = 'PPG / PULSE SIGNAL',
  showLiveBadge = true,
  className = '',
}) => {
  const { pulseBuffer } = useMonitoring();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const offsetRef = useRef<number>(0);

  // Synthesize realistic arterial PPG wave: systolic upstroke, systolic peak, dicrotic notch, diastolic wave
  const getSimulatedPpgPoint = (t: number) => {
    const cycle = (t % 800) / 800; // 0 to 1
    let val = 0;

    // Rapid systolic upstroke
    if (cycle >= 0.05 && cycle < 0.22) {
      val = Math.sin(((cycle - 0.05) / 0.17) * (Math.PI / 2));
    }
    // Systolic decline into dicrotic notch
    else if (cycle >= 0.22 && cycle < 0.38) {
      val = 1.0 - 0.55 * Math.sin(((cycle - 0.22) / 0.16) * (Math.PI / 2));
    }
    // Dicrotic notch reflection wave
    else if (cycle >= 0.38 && cycle < 0.52) {
      val = 0.45 + 0.18 * Math.sin(((cycle - 0.38) / 0.14) * Math.PI);
    }
    // Diastolic runoff decay to baseline
    else if (cycle >= 0.52 && cycle < 0.90) {
      val = 0.45 * Math.exp(-((cycle - 0.52) / 0.25) * 2.2);
    } else {
      val = 0.04;
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

      // Fine PPG Grid lines
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = 'rgba(37, 199, 232, 0.06)';
      for (let x = 0; x < w; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Major grid lines
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = 'rgba(37, 199, 232, 0.12)';
      for (let x = 0; x < w; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Get real or simulated PPG samples
      let points: number[] = [];
      const data = pulseBuffer;

      if (data && data.length > 20) {
        let minVal = 300;
        let maxVal = 650;
        for (let i = 0; i < data.length; i++) {
          if (data[i] < minVal) minVal = data[i];
          if (data[i] > maxVal) maxVal = data[i];
        }
        const range = Math.max(160, maxVal - minVal);
        points = data.map((d) => (d - minVal) / range);
      } else {
        offsetRef.current += 3.2;
        const totalPoints = 280;
        for (let i = 0; i < totalPoints; i++) {
          const t = i * 4 + offsetRef.current;
          points.push(getSimulatedPpgPoint(t));
        }
      }

      if (points.length > 1) {
        const step = w / (points.length - 1);
        const topMargin = h * 0.18;
        const botMargin = h * 0.12;
        const usableHeight = h - topMargin - botMargin;

        // Area fill under PPG curve
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let i = 0; i < points.length; i++) {
          const x = i * step;
          const y = h - botMargin - points[i] * usableHeight;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();

        const fillGradient = ctx.createLinearGradient(0, topMargin, 0, h);
        fillGradient.addColorStop(0, 'rgba(37, 199, 232, 0.22)');
        fillGradient.addColorStop(1, 'rgba(37, 199, 232, 0.01)');
        ctx.fillStyle = fillGradient;
        ctx.fill();

        // Stroke line in vivid PPG Cyan #25C7E8
        ctx.save();
        ctx.shadowColor = '#25C7E8';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#25C7E8';
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const x = i * step;
          const y = h - botMargin - points[i] * usableHeight;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        // Sweeping leading point bead
        const lastX = w - 2;
        const lastVal = points[points.length - 1];
        const lastY = h - botMargin - lastVal * usableHeight;

        ctx.beginPath();
        ctx.arc(lastX, lastY, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#25C7E8';
        ctx.shadowBlur = 10;
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
  }, [pulseBuffer]);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-[#152E4A] bg-[#07141F] shadow-card ${className}`}
    >
      {/* Header bar */}
      <div className="absolute top-2 left-3 right-3 z-10 flex items-center justify-between text-xs font-mono pointer-events-none select-none">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-white tracking-wider text-xs">{title}</span>
          <span className="text-[#25C7E8] text-[10px] font-semibold">(Infrared Optical)</span>
        </div>

        {showLiveBadge && (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-[#FF4D5A] font-bold border border-rose-500/30 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D5A] animate-ping"></span>
            <span>LIVE</span>
          </span>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};

export default PulseChart;
