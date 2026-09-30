import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext: string;
  change?: string;
  isPositiveChange?: boolean;
  icon: LucideIcon;
  accentColor: 'cyan' | 'red' | 'amber' | 'emerald';
  badge?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtext,
  change,
  isPositiveChange,
  icon: Icon,
  accentColor,
  badge,
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'red':
        return {
          border: 'border-red-500/30 hover:border-red-500/50',
          bg: 'bg-red-950/20',
          iconBg: 'bg-red-500/20 text-red-400',
          text: 'text-red-400',
        };
      case 'amber':
        return {
          border: 'border-amber-500/30 hover:border-amber-500/50',
          bg: 'bg-amber-950/20',
          iconBg: 'bg-amber-500/20 text-amber-400',
          text: 'text-amber-400',
        };
      case 'emerald':
        return {
          border: 'border-emerald-500/30 hover:border-emerald-500/50',
          bg: 'bg-emerald-950/20',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          text: 'text-emerald-400',
        };
      default:
        return {
          border: 'border-cyan-500/30 hover:border-cyan-500/50',
          bg: 'bg-cyan-950/20',
          iconBg: 'bg-cyan-500/20 text-cyan-300',
          text: 'text-cyan-400',
        };
    }
  };

  const styles = getAccentStyles();

  return (
    <div
      className={`relative p-4 rounded-xl bg-[#090f1a]/80 border ${styles.border} backdrop-blur-md transition-all duration-200 hover:shadow-xl hover:translate-y-[-1px]`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${styles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline space-x-2.5">
        <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </span>
        {badge && (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${styles.bg} ${styles.text} border border-current/20`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate">{subtext}</span>
        {change && (
          <div className="flex items-center space-x-1 font-mono text-[11px] flex-shrink-0">
            {isPositiveChange ? (
              <TrendingUp className="w-3 h-3 text-red-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-emerald-400" />
            )}
            <span className={isPositiveChange ? 'text-red-400' : 'text-emerald-400'}>
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
