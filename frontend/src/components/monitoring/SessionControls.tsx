import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Square, Timer } from 'lucide-react';
import { useMonitoring } from '../../context/MonitoringContext';

export const SessionControls: React.FC = () => {
  const { activeSession, isSessionActive, startSession, stopSession, selectedDeviceId } = useMonitoring();
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: number | null = null;
    if (isSessionActive && !isPaused) {
      interval = window.setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else if (!isSessionActive) {
      setSecondsElapsed(0);
      setIsPaused(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, isPaused]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await startSession();
      setSecondsElapsed(0);
      setIsPaused(false);
    } catch (err) {
      console.error('Error starting session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleStop = async () => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const completed = await stopSession();
      if (completed) {
        navigate(`/sessions/${completed.id}/report`);
      }
    } catch (err) {
      console.error('Error stopping session:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-925 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Timer & Session State */}
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
          <Timer className="w-5 h-5 text-teal-500" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Session Duration
            </span>
            {isSessionActive && (
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold border border-rose-200/60 dark:border-rose-900/60">
                REC #{activeSession?.id}
              </span>
            )}
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatTimer(secondsElapsed)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {isSessionActive ? (isPaused ? '(Paused)' : `(${selectedDeviceId})`) : '(Ready)'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
        {!isSessionActive ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-semibold text-xs tracking-wider uppercase transition shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Session</span>
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              disabled={loading}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition border ${
                isPaused
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              )}
            </button>

            <button
              onClick={handleStop}
              disabled={loading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop &amp; Report</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
