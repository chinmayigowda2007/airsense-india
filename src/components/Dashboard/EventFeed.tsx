import React, { useState, useMemo } from 'react';
import { PollutionEvent } from '../../types';
import { 
  Flame, 
  Wind, 
  Users, 
  SearchCode, 
  ChevronRight,
  AlertTriangle,
  Clock,
  MapPin,
  Filter
} from 'lucide-react';

interface EventFeedProps {
  events: PollutionEvent[];
  selectedEventId?: string;
  onSelectEvent: (event: PollutionEvent) => void;
  onInvestigateEvent: (event: PollutionEvent) => void;
}

export const EventFeed: React.FC<EventFeedProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  onInvestigateEvent,
}) => {
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'CRITICAL' | 'INDUSTRIAL' | 'BURNING'>('ALL');

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (feedFilter === 'CRITICAL') return ev.severity === 'Critical';
      if (feedFilter === 'INDUSTRIAL') return ev.type === 'Industrial emission';
      if (feedFilter === 'BURNING') return ev.type === 'Open burning' || ev.type === 'Smoke event';
      return true;
    });
  }, [events, feedFilter]);

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return {
          badge: 'bg-red-500/15 text-red-400 border-red-500/40',
          dot: 'bg-red-500',
        };
      case 'High':
        return {
          badge: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
          dot: 'bg-orange-500',
        };
      case 'Moderate':
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
          dot: 'bg-amber-500',
        };
      default:
        return {
          badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40',
          dot: 'bg-yellow-500',
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080d17] select-none">
      {/* Feed Header */}
      <div className="p-3.5 px-4 bg-[#0a121f] border-b border-slate-800/90 flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Active Incident Queue
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/40">
            {filtered.length} INCIDENTS
          </span>
        </div>

        {/* Quick Segmented Filter Tabs */}
        <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono">
          <button
            onClick={() => setFeedFilter('ALL')}
            className={`py-1 rounded text-center transition ${
              feedFilter === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFeedFilter('CRITICAL')}
            className={`py-1 rounded text-center transition ${
              feedFilter === 'CRITICAL'
                ? 'bg-red-500/20 text-red-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CRITICAL
          </button>
          <button
            onClick={() => setFeedFilter('INDUSTRIAL')}
            className={`py-1 rounded text-center transition ${
              feedFilter === 'INDUSTRIAL'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            STACKS
          </button>
          <button
            onClick={() => setFeedFilter('BURNING')}
            className={`py-1 rounded text-center transition ${
              feedFilter === 'BURNING'
                ? 'bg-amber-500/20 text-amber-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BURNING
          </button>
        </div>
      </div>

      {/* Events Scrollable Incident Stream */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-mono space-y-2">
            <div>No incidents match current filter.</div>
            <button
              onClick={() => setFeedFilter('ALL')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition"
            >
              Show All Incidents
            </button>
          </div>
        ) : (
          filtered.map((ev) => {
            const isSelected = selectedEventId === ev.id;
            const style = getSeverityStyle(ev.severity);

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`p-3.5 transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-cyan-950/30 border-l-2 border-cyan-400'
                    : 'hover:bg-slate-900/60 border-l-2 border-transparent'
                }`}
              >
                {/* Header row: ID, Severity, Time, Provenance Badge */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-cyan-300">{ev.id}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${style.badge}`}
                    >
                      {ev.severity}
                    </span>
                    {ev.isSimulated ? (
                      <span className="text-[8px] font-mono text-slate-400 uppercase px-1 rounded bg-slate-900 border border-slate-800">
                        SIMULATED
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono text-emerald-300 font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-950/90 border border-emerald-500/50 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 tabular-nums">
                    {ev.detectedAt}
                  </span>
                </div>

                {/* Incident Title */}
                <div className="mt-1.5 font-bold text-xs text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                  {ev.title}
                </div>

                {/* Location metadata (Zero-Pill discipline: unboxed with typographic dots) */}
                <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5 truncate font-mono">
                  <span>{ev.city}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="truncate">{ev.ward.split(',')[0]}</span>
                </div>

                {/* Telemetry Numbers Row */}
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <span>
                      AQI Spike: <strong className="text-amber-400 tabular-nums">+{ev.aqiSpikeEstimate}</strong>
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>
                      Conf: <strong className="text-emerald-400 tabular-nums">{ev.aiConfidence}%</strong>
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInvestigateEvent(ev);
                    }}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 hover:text-white border border-cyan-800/50 text-[10px] font-mono transition"
                  >
                    <span>Investigate</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
