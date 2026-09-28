import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Activity,
  Brain,
  BarChart3,
  Radio,
  Zap,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Sun,
  User,
  Play
} from 'lucide-react';
import { StressSenseLogo } from '../components/common/StressSenseLogo';
import { useMonitoring } from '../context/MonitoringContext';
import { useTheme } from '../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const { currentReading } = useMonitoring();
  const { toggleTheme } = useTheme();

  // Shared Master Physiological Clock & Heartbeat State
  const [bpm, setBpm] = useState<number>(78);
  const [hrvValue, setHrvValue] = useState<number>(45);
  const [rrInterval, setRrInterval] = useState<number>(770);
  const [isBeating, setIsBeating] = useState<boolean>(false);

  // Subtle Mouse Parallax Offsets (restrained: ±6px for torso/heart, ±3px for panels)
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas Refs
  const bottomWaveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation Loop Ref
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  // Handle subtle mouse parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const { innerWidth, innerHeight } = window;
    const normX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
    const normY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1

    setMouseOffset({
      x: normX * 6,
      y: normY * 6,
    });
  };

  // Master Synchronized Biosignal Generator Functions
  // 1. ECG Point Generator based on cycle phase (0 to 1)
  const getEcgPoint = (phase: number): number => {
    // P-wave (atrial depolarization: phase 0.12 - 0.22)
    if (phase >= 0.12 && phase < 0.22) {
      return 0.16 * Math.sin(((phase - 0.12) / 0.10) * Math.PI);
    }
    // Q-wave (septal deflection: phase 0.28 - 0.31)
    if (phase >= 0.28 && phase < 0.31) {
      return -0.16 * Math.sin(((phase - 0.28) / 0.03) * Math.PI);
    }
    // R-peak (sharp ventricular depolarization spike: phase 0.31 - 0.35)
    if (phase >= 0.31 && phase < 0.35) {
      return 1.52 * Math.sin(((phase - 0.31) / 0.04) * Math.PI);
    }
    // S-wave (deep downward deflection: phase 0.35 - 0.39)
    if (phase >= 0.35 && phase < 0.39) {
      return -0.38 * Math.sin(((phase - 0.35) / 0.04) * Math.PI);
    }
    // T-wave (ventricular repolarization: phase 0.48 - 0.66)
    if (phase >= 0.48 && phase < 0.66) {
      return 0.32 * Math.sin(((phase - 0.48) / 0.18) * Math.PI);
    }
    return 0; // Isoelectric baseline
  };

  // Master Synchronized Animation Loop (60 FPS)
  useEffect(() => {
    let running = true;
    let lastBeatLogged = 0;

    const baseBpm = currentReading ? Math.round(currentReading.bpm) : 78;

    const render = () => {
      const now = performance.now();
      const elapsed = now - startTimeRef.current;

      // Heartbeat interval in ms: 60000 / 78 ≈ 769.23 ms
      const beatInterval = 60000 / baseBpm;
      const currentCyclePhase = (elapsed % beatInterval) / beatInterval; // 0 to 1
      const currentBeatIndex = Math.floor(elapsed / beatInterval);

      // Entrance animation draw-in ramp:
      // Bottom wave draws in from 1.6s to 2.2s
      const bottomDrawRamp = Math.min(1, Math.max(0, (elapsed - 1600) / 600));

      // Trigger synchronized heart contraction during R-peak window (phase 0.31 - 0.44)
      if (elapsed > 1200) {
        if (currentCyclePhase >= 0.30 && currentCyclePhase <= 0.45) {
          setIsBeating(true);
        } else {
          setIsBeating(false);
        }
      }

      // Live subtle physiological fluctuations every few beats
      if (currentBeatIndex !== lastBeatLogged) {
        lastBeatLogged = currentBeatIndex;
        if (currentBeatIndex % 5 === 0) {
          const delta = (currentBeatIndex % 10 === 0 ? 1 : -1);
          setBpm(baseBpm + delta);
          setHrvValue(45 + (delta > 0 ? 1 : -1));
          setRrInterval(Math.round(60000 / (baseBpm + delta)));
        }
      }



      // ==========================================
      // 3. Render Large Bottom Flowing ECG Waveform
      // ==========================================
      const bottomCanvas = bottomWaveCanvasRef.current;
      if (bottomCanvas) {
        const ctx = bottomCanvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          const rect = bottomCanvas.getBoundingClientRect();
          const w = rect.width;
          const h = rect.height;

          if (bottomCanvas.width !== Math.round(w * dpr) || bottomCanvas.height !== Math.round(h * dpr)) {
            bottomCanvas.width = Math.round(w * dpr);
            bottomCanvas.height = Math.round(h * dpr);
            ctx.scale(dpr, dpr);
          }

          ctx.clearRect(0, 0, w, h);

          if (bottomDrawRamp > 0) {
            const flowSpeed = 0.14;
            const flowOffset = elapsed * flowSpeed;
            const centerY = h * 0.54;
            const amp = (h * 0.44) * bottomDrawRamp;

            ctx.save();
            ctx.shadowColor = '#00E5FF';
            ctx.shadowBlur = 14;
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.88)';
            ctx.lineWidth = 2.4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            for (let x = 0; x <= w; x += 4) {
              const t = (flowOffset + x) / flowSpeed;
              const phase = (t % (beatInterval * 1.35)) / (beatInterval * 1.35);
              const val = getEcgPoint(phase);
              const y = centerY - val * amp;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // ==========================================
      // 4. Subtle Medical Energy Particles Layer
      // ==========================================
      const partCanvas = particleCanvasRef.current;
      if (partCanvas) {
        const ctx = partCanvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          const rect = partCanvas.getBoundingClientRect();
          const w = rect.width;
          const h = rect.height;

          if (partCanvas.width !== Math.round(w * dpr) || partCanvas.height !== Math.round(h * dpr)) {
            partCanvas.width = Math.round(w * dpr);
            partCanvas.height = Math.round(h * dpr);
            ctx.scale(dpr, dpr);
          }

          ctx.clearRect(0, 0, w, h);

          // 20 subtle floating particles orbiting around heart
          const centerX = w * 0.59 + mouseOffset.x * 0.3;
          const centerY = h * 0.47 + mouseOffset.y * 0.3;
          const numParticles = 20;

          for (let i = 0; i < numParticles; i++) {
            const angle = (elapsed * 0.00035 * (i % 2 === 0 ? 1 : -1)) + (i * (Math.PI * 2 / numParticles));
            const radius = 80 + (i * 7) % 70;
            const px = centerX + Math.cos(angle) * (radius * 1.4);
            const py = centerY + Math.sin(angle) * (radius * 0.95);

            const alpha = 0.15 + 0.2 * Math.sin(elapsed * 0.002 + i);

            ctx.beginPath();
            ctx.arc(px, py, 1.2 + (i % 2) * 0.5, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
            ctx.shadowColor = '#00E5FF';
            ctx.shadowBlur = 6;
            ctx.fill();
          }
        }
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
  }, [currentReading, mouseOffset]);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#060B14] text-white selection:bg-[#00E5FF] selection:text-black font-sans relative overflow-x-hidden antialiased"
    >
      {/* ======================================================== */}
      {/* BACKGROUND LAYER (0-0.5s fade in)                        */}
      {/* ======================================================== */}
      <div className="absolute inset-0 seq-bg pointer-events-none z-0">
        {/* Deep navy vignette & ambient illumination */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(10,32,60,0.7),rgba(6,11,20,1))]"></div>

        {/* Ambient cyan illumination from reference image */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>

        {/* 3D Perspective Grid Floor at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-96 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 229, 255, 0.18) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 229, 255, 0.18) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: 'perspective(600px) rotateX(68deg)',
            transformOrigin: 'bottom center',
          }}
        ></div>
      </div>

      {/* Floating particles canvas layer */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* ======================================================== */}
      {/* TOP NAVIGATION BAR (0.5-1.0s appear)                     */}
      {/* ======================================================== */}
      <header className="relative z-30 max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between seq-nav">
        {/* Left: StressSense Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <StressSenseLogo size={32} />
          <div className="flex items-baseline">
            <span className="font-extrabold text-2xl tracking-tight text-white">Stress</span>
            <span className="font-extrabold text-2xl tracking-tight text-[#00E5FF]">Sense</span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-9 text-sm font-medium text-slate-300">
          <Link to="/" className="text-white relative py-1">
            <span>Home</span>
            {/* Active cyan pill underline indicator */}
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#00E5FF] rounded-full shadow-[0_0_10px_#00E5FF]"></span>
          </Link>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <Link to="/ecg-monitor" className="hover:text-white transition-colors">Modules</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
        </nav>

        {/* Right: Theme Toggle & Login Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="w-12 h-7 rounded-full border border-slate-700 bg-slate-900/90 flex items-center justify-between px-1.5 text-slate-400 hover:text-white transition-all shadow-inner"
            title="Toggle theme"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="w-4 h-4 rounded-full bg-slate-700 shadow-sm"></span>
          </button>

          <Link
            to="/login"
            className="px-5 py-2 rounded-full border border-slate-700 hover:border-slate-500 bg-slate-900/70 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-all flex items-center space-x-2 shadow-sm"
          >
            <User className="w-3.5 h-3.5" />
            <span>Login</span>
          </Link>
        </div>
      </header>

      {/* ======================================================== */}
      {/* HERO SECTION CONTAINER                                   */}
      {/* ======================================================== */}
      <section className="relative z-20 max-w-[1440px] mx-auto px-6 lg:px-12 pt-2 pb-16 min-h-[calc(100vh-160px)] flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          
          {/* ---------------------------------------------------- */}
          {/* LEFT HERO AREA: Copy, CTA Buttons, 4 Feature Boxes   */}
          {/* ---------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-6 z-20 seq-hero-heading">
            {/* Small eyebrow text */}
            <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-slate-400 font-semibold flex items-center space-x-2">
              <span>REAL-TIME &bull; NON-INVASIVE &bull; INTELLIGENT &bull; IOT ENABLED</span>
            </div>

            {/* StressSense Heading */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none">
                <span className="text-white">Stress</span>
                <span className="text-[#00E5FF]">Sense</span>
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
                ECG &amp; Physiological Monitoring System
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Real-time monitoring of ECG signals with AI-driven stress and relaxation analysis. An IoT-based solution for intelligent wellness monitoring.
            </p>

            {/* Two Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Start Monitoring Button */}
              <Link
                to="/ecg-monitor"
                className="px-7 py-3 rounded-full bg-gradient-to-r from-[#0091FF] to-[#00E5FF] hover:from-[#0077D6] hover:to-[#00CBE6] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_24px_rgba(0,229,255,0.45)] flex items-center space-x-2 transform hover:-translate-y-0.5"
              >
                <span>Start Monitoring</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Explore Features Button */}
              <a
                href="#features"
                className="px-7 py-3 rounded-full border border-slate-600 hover:border-slate-400 bg-slate-900/60 hover:bg-slate-800/80 text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center space-x-2"
              >
                <Play className="w-3.5 h-3.5 fill-current text-slate-300" />
                <span>Explore Features</span>
              </a>
            </div>

            {/* FOUR Horizontal Feature Boxes (Exact match to reference image) */}
            <div className="grid grid-cols-4 gap-3 pt-4">
              {/* Box 1: ECG Monitoring */}
              <div className="p-3.5 rounded-2xl bg-[#071322]/80 border border-[#20E0A0]/30 backdrop-blur-md text-center hover:border-[#20E0A0]/60 transition-all group shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-[#20E0A0]/10 border border-[#20E0A0]/20 flex items-center justify-center text-[#20E0A0] mx-auto mb-2.5 shadow-[0_0_12px_rgba(32,224,160,0.2)] group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-semibold text-slate-200 leading-tight">
                  <div>ECG</div>
                  <div>Monitoring</div>
                </div>
              </div>

              {/* Box 2: HRV & RMSSD Analysis */}
              <div className="p-3.5 rounded-2xl bg-[#071322]/80 border border-[#00E5FF]/30 backdrop-blur-md text-center hover:border-[#00E5FF]/60 transition-all group shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] mx-auto mb-2.5 shadow-[0_0_12px_rgba(0,229,255,0.2)] group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-semibold text-slate-200 leading-tight">
                  <div>HRV &amp;</div>
                  <div>RMSSD</div>
                </div>
              </div>

              {/* Box 3: Stress Estimation */}
              <div className="p-3.5 rounded-2xl bg-[#071322]/80 border border-purple-500/30 backdrop-blur-md text-center hover:border-purple-500/60 transition-all group shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-2.5 shadow-[0_0_12px_rgba(168,85,247,0.2)] group-hover:scale-105 transition-transform">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-semibold text-slate-200 leading-tight">
                  <div>Stress</div>
                  <div>Estimation</div>
                </div>
              </div>

              {/* Box 4: Real-time Visualization */}
              <div className="p-3.5 rounded-2xl bg-[#071322]/80 border border-amber-500/30 backdrop-blur-md text-center hover:border-amber-500/60 transition-all group shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-2.5 shadow-[0_0_12px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-semibold text-slate-200 leading-tight">
                  <div>Real-time</div>
                  <div>Visualization</div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* RIGHT HERO AREA: Translucent Torso + Living Heart    */}
          {/* + Right-aligned Monitoring Cards                     */}
          {/* ---------------------------------------------------- */}
          {/* ---------------------------------------------------- */}
          {/* RIGHT HERO AREA: Frameless Human Body + Beating Heart*/}
          {/* ---------------------------------------------------- */}
          <div className="lg:col-span-7 relative min-h-[580px] flex items-center justify-center overflow-visible">
            
            {/* Frameless Medical/Anatomical Human Body Visual */}
            <div
              className="relative w-full max-w-[680px] h-[560px] flex items-center justify-center pointer-events-none select-none seq-heart"
              style={{
                transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
                transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.4, 1)',
              }}
            >
              {/* Torso image with soft radial vignette mask to eliminate ANY rectangular edge or frame */}
              <div 
                className="relative w-full h-full flex items-center justify-center overflow-visible"
                style={{
                  WebkitMaskImage: 'radial-gradient(ellipse 75% 72% at 50% 48%, black 45%, transparent 92%)',
                  maskImage: 'radial-gradient(ellipse 75% 72% at 50% 48%, black 45%, transparent 92%)',
                }}
              >
                {/* Pure Frameless Human Torso Transparent PNG */}
                <img
                  src="/torso_frameless.png"
                  alt="Translucent Human Cardiovascular Torso"
                  className="w-full h-full object-contain pointer-events-none select-none filter brightness-110 drop-shadow-[0_0_35px_rgba(0,229,255,0.18)]"
                />

                {/* LIVING BEATING HEART: Perfectly frameless, aligned in the chest cavity */}
                <div
                  className="absolute pointer-events-none z-10 animate-heartbeat flex items-center justify-center"
                  style={{
                    left: '59.56%',
                    top: '47.46%',
                    width: '96px',
                    height: '126px',
                  }}
                >
                  {/* Isolated frameless glowing heart PNG */}
                  <img
                    src="/heart_frameless.png"
                    alt="Living Anatomical Heart"
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* BOTTOM FLOWING CYAN ECG WAVEFORM                       */}
        {/* ------------------------------------------------------ */}
        <div className="relative w-full h-20 mt-8 mb-2 overflow-hidden pointer-events-none">
          <canvas
            ref={bottomWaveCanvasRef}
            className="w-full h-full block"
          />
        </div>

        {/* ------------------------------------------------------ */}
        {/* SCROLL TO EXPLORE INDICATOR                            */}
        {/* ------------------------------------------------------ */}
        <div className="flex flex-col items-center justify-center pt-1">
          <a
            href="#features"
            className="group flex flex-col items-center space-y-1.5 text-[11px] font-mono tracking-widest text-slate-400 hover:text-white transition-colors"
          >
            {/* Mouse Outline with moving scroll wheel */}
            <div className="w-5 h-8 rounded-full border-2 border-slate-600 flex items-start justify-center p-1 group-hover:border-[#00E5FF] transition-colors">
              <span className="w-1 h-2 rounded-full bg-[#00E5FF] animate-bounce"></span>
            </div>
            <span>Scroll to Explore</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-slate-400 group-hover:text-[#00E5FF]" />
          </a>
        </div>
      </section>

      {/* ======================================================== */}
      {/* BOTTOM FEATURE STRIP                                     */}
      {/* ======================================================== */}
      <section id="features" className="relative z-20 border-t border-[#152E4A]/80 bg-[#07141F]/80 backdrop-blur-md py-8 px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* IoT Enabled */}
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#00E5FF] shrink-0 mt-0.5">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">IoT Enabled</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Connects with IoT controllers (Arduino / ESP32 / etc.)
              </p>
            </div>
          </div>

          {/* Real-time Data */}
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#00E5FF] shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Real-time Data</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuous ECG Lead II signal monitoring
              </p>
            </div>
          </div>

          {/* Intelligent Analysis */}
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Intelligent Analysis</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Estimates stress and relaxation from physiological signals
              </p>
            </div>
          </div>

          {/* Educational Prototype */}
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Educational Prototype</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                For academic and research purposes. Not for medical diagnosis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* HOW IT WORKS / MODULES PREVIEW SECTION                   */}
      {/* ======================================================== */}
      <section id="how-it-works" className="relative z-20 py-16 px-6 lg:px-12 max-w-[1440px] mx-auto border-t border-[#152E4A]/40 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#00E5FF] font-bold">
            ARCHITECTURE &bull; HARDWARE AGNOSTIC
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            End-to-End Physiological Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A continuous synchronous signal acquisition pipeline from physical sensors through embedded IoT controllers into real-time autonomic nervous system evaluations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#071322]/80 border border-[#152E4A] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#20E0A0]/10 text-[#20E0A0] flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-white">ECG Signal Ingestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acquires Lead II AD8232 electrocardiogram analog voltages at 250 samples per second with high-resolution analog front-end filtering.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#071322]/80 border border-[#152E4A] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-white">Autonomic Feature Synthesis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects R-peak timing intervals, computes Root Mean Square of Successive Differences (RMSSD), and estimates sympathetic vs. parasympathetic tone.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#071322]/80 border border-[#152E4A] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-white">Clinical Workstation HUD</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Streams synchronized biosignal frames over WebSocket buses into digital patient monitoring oscilloscopes with recording controls and session reports.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            to="/ecg-monitor"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#0077D6] hover:bg-[#0091FF] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,145,255,0.4)]"
          >
            <span>Launch Clinical Workstation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-[#152E4A] py-6 px-6 text-center text-xs text-slate-500 font-mono">
        StressSense &bull; ECG &amp; Physiological Monitoring System &bull; Research &amp; Educational Prototype &bull; Not for Medical Diagnosis
      </footer>
    </div>
  );
};

export default LandingPage;
