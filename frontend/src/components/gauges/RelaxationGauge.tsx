import React from 'react';

interface RelaxationGaugeProps {
  value: number; // 0 to 100
}

export const RelaxationGauge: React.FC<RelaxationGaugeProps> = ({ value }) => {
  const safeVal = Math.min(100, Math.max(0, Math.round(value)));

  const radius = 78;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const arcDegree = 240;
  const arcLength = (arcDegree / 360) * circumference;
  const strokeDashoffset = arcLength - (safeVal / 100) * arcLength;

  let stateLabel = 'GOOD';
  let strokeColor = '#0ea5e9'; // sky
  let badgeColor = 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-900/60';

  if (safeVal >= 65) {
    stateLabel = 'OPTIMAL';
    strokeColor = '#14b8a6'; // teal
    badgeColor = 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-200/80 dark:border-teal-900/60';
  } else if (safeVal < 35) {
    stateLabel = 'LOW';
    strokeColor = '#f59e0b'; // amber
    badgeColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-900/60';
  }

  return (
    <div className="bg-white dark:bg-slate-925 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between items-center text-center transition-all">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
          Estimated Relaxation
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
          {stateLabel}
        </span>
      </div>

      {/* Radial Visualization */}
      <div className="relative my-3 w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-[210deg]" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            className="text-slate-100 dark:text-slate-800/80"
            strokeLinecap="round"
          />

          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {safeVal}
            </span>
            <span className="text-base font-semibold text-slate-400 dark:text-slate-500 ml-1">
              %
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
            Parasympathetic
          </span>
        </div>

        {/* Minimal Scale Markers */}
        <span className="absolute bottom-2 left-6 text-[10px] font-mono text-slate-400/80">0</span>
        <span className="absolute top-2 text-[10px] font-mono text-slate-400/80">50</span>
        <span className="absolute bottom-2 right-6 text-[10px] font-mono text-slate-400/80">100</span>
      </div>

      {/* Footnote */}
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 max-w-[240px] leading-relaxed">
        Estimated vagal modulation based on heart rate variability dynamics.
      </p>
    </div>
  );
};
