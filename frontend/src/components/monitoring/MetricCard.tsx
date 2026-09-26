import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  supporting?: string;
  statusBadge?: string;
  statusColor?: 'emerald' | 'amber' | 'rose' | 'sky' | 'slate';
  icon?: LucideIcon;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  supporting,
  statusBadge,
  statusColor = 'slate',
  icon: Icon,
}) => {
  const badgeClasses = {
    emerald: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60',
    amber: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/60',
    rose: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800/60',
    sky: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-800/60',
    slate: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80',
  }[statusColor];

  return (
    <div className="bg-white dark:bg-slate-925 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      {/* Top Label & Icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
          {label}
        </span>
        {Icon && (
          <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline space-x-1.5 my-1">
        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono">
            {unit}
          </span>
        )}
      </div>

      {/* Supporting text & Status Badge */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
        <span className="text-slate-500 dark:text-slate-400 truncate">
          {supporting || 'Continuous Telemetry'}
        </span>
        {statusBadge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
            {statusBadge}
          </span>
        )}
      </div>
    </div>
  );
};
