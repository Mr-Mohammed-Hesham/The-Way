import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'slate';
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  badge,
  onClick
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/80 hover:bg-indigo-50 border-indigo-100',
      iconBg: 'bg-indigo-600 text-white',
      text: 'text-indigo-950',
      glow: 'group-hover:border-indigo-300'
    },
    emerald: {
      bg: 'bg-emerald-50/80 hover:bg-emerald-50 border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
      text: 'text-emerald-950',
      glow: 'group-hover:border-emerald-300'
    },
    amber: {
      bg: 'bg-amber-50/80 hover:bg-amber-50 border-amber-100',
      iconBg: 'bg-amber-500 text-white',
      text: 'text-amber-950',
      glow: 'group-hover:border-amber-300'
    },
    rose: {
      bg: 'bg-rose-50/80 hover:bg-rose-50 border-rose-100',
      iconBg: 'bg-rose-600 text-white',
      text: 'text-rose-950',
      glow: 'group-hover:border-rose-300'
    },
    sky: {
      bg: 'bg-sky-50/80 hover:bg-sky-50 border-sky-100',
      iconBg: 'bg-sky-600 text-white',
      text: 'text-sky-950',
      glow: 'group-hover:border-sky-300'
    },
    purple: {
      bg: 'bg-purple-50/80 hover:bg-purple-50 border-purple-100',
      iconBg: 'bg-purple-600 text-white',
      text: 'text-purple-950',
      glow: 'group-hover:border-purple-300'
    },
    slate: {
      bg: 'bg-slate-50 hover:bg-slate-100/80 border-slate-200',
      iconBg: 'bg-slate-700 text-white',
      text: 'text-slate-900',
      glow: 'group-hover:border-slate-300'
    }
  };

  const scheme = colorMap[color];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`group relative p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <p className={`text-2xl font-black tracking-tight ${scheme.text}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl shadow-xs ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 font-medium truncate">{subtitle}</span>}
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                badge.variant === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : badge.variant === 'warning'
                  ? 'bg-amber-100 text-amber-800'
                  : badge.variant === 'danger'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
