import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Sliders,
  Clock,
  ArrowRight,
  Lock,
  Mail,
  Heart
} from 'lucide-react';
import { StressSenseLogo } from '../components/common/StressSenseLogo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('clinician@stresssense.health');
  const [password, setPassword] = useState('demo1234');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate('/');
    }, 350);
  };

  const handleDemoAccess = () => {
    setLoading(true);
    setTimeout(() => {
      navigate('/');
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans antialiased">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E2E8F0] flex flex-col md:flex-row min-h-[640px]">
        {/* LEFT SIDE: Dark Navy Medical Illustration & Branding */}
        <div className="w-full md:w-1/2 bg-[#07141F] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#20E0A0]/10 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-[#FF4D5A]/10 blur-[100px] pointer-events-none"></div>

          {/* Background Realistic ECG Waveform Graphic */}
          <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none select-none overflow-hidden">
            <svg className="w-[800px] h-[300px] stroke-[#20E0A0] fill-none" viewBox="0 0 800 200">
              <path
                d="M0,100 L120,100 L135,90 L145,100 L170,100 L185,75 L200,165 L215,20 L230,120 L245,100 L280,100 L305,80 L335,100 L400,100 L415,90 L425,100 L450,100 L465,75 L480,165 L495,20 L510,120 L525,100 L560,100 L585,80 L615,100 L800,100"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <StressSenseLogo size={34} />
              <span className="font-extrabold text-2xl tracking-tight text-white">
                StressSense
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
              ECG &amp; Physiological<br />Monitoring System
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed max-w-sm">
              Real-time autonomic nervous system and cardiac rhythm acquisition with synchronous Lead I electrocardiogram and optical photoplethysmogram telemetry.
            </p>
          </div>

          {/* Center Heart / Cardiac Illustration Box */}
          <div className="relative z-10 my-8 p-5 rounded-2xl bg-[#0B1F33]/80 border border-[#152E4A] backdrop-blur-md">
            <div className="flex items-center space-x-3 text-xs text-[#20E0A0] font-mono mb-2">
              <span className="w-2 h-2 rounded-full bg-[#20E0A0] animate-pulse"></span>
              <span>CONTINUOUS BIOMETRIC TELEMETRY &bull; 250 SPS</span>
            </div>

            <svg className="w-full h-16 stroke-[#20E0A0] fill-none" viewBox="0 0 500 70">
              <path
                d="M0,35 L60,35 L70,30 L80,35 L95,35 L105,20 L115,60 L125,5 L135,45 L145,35 L170,35 L185,25 L210,35 L260,35 L270,30 L280,35 L295,35 L305,20 L315,60 L325,5 L335,45 L345,35 L370,35 L385,25 L410,35 L500,35"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-[#152E4A]">
              <span>P-Wave: Atrial</span>
              <span className="text-white font-semibold">QRS: Ventricular Depolarization</span>
              <span>T-Wave: Repolarization</span>
            </div>
          </div>

          {/* Four Feature Indicators */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[#0B1F33] border border-[#152E4A] text-center">
              <Activity className="w-4 h-4 text-[#20E0A0] mx-auto mb-1.5" />
              <span className="text-[11px] font-semibold text-slate-200 block">ECG Monitoring</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0B1F33] border border-[#152E4A] text-center">
              <Heart className="w-4 h-4 text-[#25C7E8] mx-auto mb-1.5" />
              <span className="text-[11px] font-semibold text-slate-200 block">HRV &amp; RMSSD</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0B1F33] border border-[#152E4A] text-center">
              <Sliders className="w-4 h-4 text-[#FFB547] mx-auto mb-1.5" />
              <span className="text-[11px] font-semibold text-slate-200 block">Stress Estimation</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0B1F33] border border-[#152E4A] text-center">
              <Clock className="w-4 h-4 text-[#20E0A0] mx-auto mb-1.5" />
              <span className="text-[11px] font-semibold text-slate-200 block">Real-time Stream</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Clean White Login Card */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex items-center justify-center bg-white">
          <div className="w-full max-w-sm space-y-6">
            {/* Header Icon */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1D4ED8] mx-auto mb-3 shadow-subtle">
                <Heart className="w-6 h-6 fill-current text-[#1D4ED8]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0B1F33] tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-500 mt-1">Sign in to continue monitoring</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#CBD5E1] text-[#1D4ED8] focus:ring-[#1D4ED8]"
                  />
                  <span>Remember me</span>
                </label>

                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[#1D4ED8] font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs tracking-wider transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#E2E8F0] w-full"></div>
              <span className="bg-white px-3 text-[11px] text-slate-400 font-medium">or</span>
            </div>

            {/* Continue with Demo Mode Button */}
            <button
              onClick={handleDemoAccess}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-subtle"
            >
              <span>Continue with Demo Mode</span>
            </button>

            {/* Educational Disclaimer */}
            <p className="text-[10px] text-slate-400 text-center leading-relaxed pt-2">
              Educational prototype for physiological monitoring.<br />
              Not for medical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
