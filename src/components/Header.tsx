import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Play, 
  Activity, 
  Clock, 
  Menu,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  onOpenDemo: () => void;
  activeAlertCount: number;
  onNavigateToActionCenter: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDemo,
  activeAlertCount,
  onNavigateToActionCenter,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [engineStatus, setEngineStatus] = useState<{ isLive: boolean; mode: string }>({
    isLive: false,
    mode: 'CHECKING',
  });

  useEffect(() => {
    // Check server status
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setEngineStatus({
          isLive: Boolean(data.isLive),
          mode: data.mode || (data.isLive ? 'LIVE' : 'DEMO MODE'),
        });
      })
      .catch(() => {
        setEngineStatus({ isLive: false, mode: 'DEMO MODE' });
      });

    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
      };
      setIstTime(new Intl.DateTimeFormat('en-IN', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 px-4 md:px-6 bg-[#080d16] border-b border-cyan-950/60 backdrop-blur-xl flex items-center justify-between z-30 sticky top-0 flex-shrink-0 select-none">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
            title="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
          <Activity className="w-4 h-4" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-base font-bold tracking-tight text-white font-sans">
            AirSense <span className="text-cyan-400">India</span>
          </span>
          <span className="hidden sm:inline text-[11px] font-mono text-slate-500 font-normal">
            National Environmental Intelligence
          </span>
        </div>
      </div>

      {/* Zone 2: Mission Telemetry & System Transparency Status */}
      <div className="hidden md:flex items-center space-x-3 font-mono text-xs">
        {/* Gemini Engine Connectivity Badge */}
        {engineStatus.isLive ? (
          <div 
            title="Gemini 3.8 Flash model connected with server-side API key"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE: Gemini Connected</span>
          </div>
        ) : (
          <div 
            title="Certified fallback simulation engine active"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 font-semibold"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>DEMO MODE (Heuristics)</span>
          </div>
        )}

        {/* Telemetry Transparency Badge */}
        <div 
          title="Environmental telemetry (CAAQMS & VIIRS) is simulated for demonstration"
          className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400"
        >
          <span className="text-amber-400 font-bold">SIMULATED</span>
          <span>Telemetry</span>
        </div>

        {/* Global Search */}
        <div className="relative w-56">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search city, ward, ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>
      </div>

      {/* Zone 3: Actions & Clock */}
      <div className="flex items-center space-x-3">
        {/* IST Clock */}
        <div className="hidden lg:flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 pr-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="tabular-nums">{istTime || 'IST ACTIVE'}</span>
        </div>

        {/* Authority Alert Button */}
        <button
          onClick={onNavigateToActionCenter}
          title="Authority Action Center"
          className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 transition"
        >
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg animate-pulse font-mono">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* Demo Simulation Launch Button */}
        <button
          onClick={onOpenDemo}
          className="group inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-500 hover:from-cyan-500 hover:to-teal-400 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-950/40 border border-cyan-400/40 transition hover:scale-[1.01] active:scale-[0.99]"
        >
          <Play className="w-3 h-3 fill-current text-cyan-100 group-hover:scale-110 transition-transform" />
          <span>Demo Simulation</span>
        </button>
      </div>
    </header>
  );
};
