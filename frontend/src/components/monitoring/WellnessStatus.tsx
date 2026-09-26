import React from 'react';
import { WellnessState } from '../../types';

interface WellnessStatusProps {
  state?: WellnessState;
  description?: string;
  stressIndex: number;
}

export const WellnessStatus: React.FC<WellnessStatusProps> = ({
  state = 'MODERATE STRESS',
  description,
  stressIndex,
}) => {
  let stateTitle = 'Moderate';
  let badgeColor = 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-900/60';
  let dotColor = 'bg-amber-500';

  if (stressIndex < 35 || state === 'LOW STRESS') {
    stateTitle = 'Optimal (Relaxed)';
    badgeColor = 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-900/60';
    dotColor = 'bg-emerald-500';
  } else if (stressIndex > 65 || state === 'ELEVATED STRESS') {
    stateTitle = 'Elevated Stress';
    badgeColor = 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-900/60';
    dotColor = 'bg-rose-500';
  }

  const defaultDesc =
    stressIndex < 35
      ? 'Your estimated stress indicator is currently within the optimal recovery range with robust heart rate variability reserves.'
      : stressIndex > 65
      ? 'Your physiological telemetry reflects sustained sympathetic activation with lowered variability. A short respiration pause is recommended.'
      : 'Your estimated stress indicator is currently within the moderate range based on the available physiological signal features.';

  return (
    <div className="bg-white dark:bg-slate-925 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1 max-w-2xl">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Current Physiological State
          </span>
          <span className="h-2 w-2 rounded-full inline-block bg-slate-300 dark:bg-slate-700"></span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {stateTitle}
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {description || defaultDesc}
        </p>
      </div>

      <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold shrink-0 ${badgeColor}`}>
        {stressIndex}% Estimated Stress
      </div>
    </div>
  );
};
