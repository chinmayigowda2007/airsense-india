import React, { useMemo } from 'react';
import { PollutionEvent, FilterState } from '../../types';
import { IndiaMap } from '../Map/IndiaMap';
import { EventFeed } from './EventFeed';
import { 
  Flame, 
  AlertTriangle, 
  Users, 
  RotateCcw
} from 'lucide-react';

interface NationalDashboardProps {
  events: PollutionEvent[];
  selectedEventId?: string;
  onSelectEvent: (event: PollutionEvent) => void;
  onInvestigateEvent: (event: PollutionEvent) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const NationalDashboard: React.FC<NationalDashboardProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  onInvestigateEvent,
  filters,
  onFilterChange,
}) => {
  // Apply filtering
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // State filter
      if (filters.state !== 'ALL' && ev.state !== filters.state) {
        return false;
      }
      // Event Type filter
      if (filters.eventType !== 'ALL' && ev.type !== filters.eventType) {
        return false;
      }
      // Severity filter
      if (filters.severity !== 'ALL' && ev.severity !== filters.severity) {
        return false;
      }
      // Search query filter
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchCity = ev.city.toLowerCase().includes(q);
        const matchWard = ev.ward.toLowerCase().includes(q);
        const matchId = ev.id.toLowerCase().includes(q);
        const matchType = ev.type.toLowerCase().includes(q);
        if (!matchTitle && !matchCity && !matchWard && !matchId && !matchType) {
          return false;
        }
      }
      return true;
    });
  }, [events, filters]);

  // Compute live KPIs
  const totalActive = events.length;
  const highRiskCount = events.filter(
    (e) => e.severity === 'Critical' || e.severity === 'High'
  ).length;
  const totalCitizenReports = events.reduce(
    (acc, e) => acc + e.citizenReportsCount,
    0
  );

  // States list
  const stateOptions = [
    { id: 'ALL', label: 'All India' },
    { id: 'Delhi', label: 'Delhi NCR' },
    { id: 'Karnataka', label: 'Karnataka' },
    { id: 'Maharashtra', label: 'Maharashtra' },
    { id: 'West Bengal', label: 'West Bengal' },
    { id: 'Telangana', label: 'Telangana' },
    { id: 'Tamil Nadu', label: 'Tamil Nadu' },
    { id: 'Gujarat', label: 'Gujarat' },
    { id: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { id: 'Kerala', label: 'Kerala' },
  ];

  const typeOptions = [
    'ALL',
    'Industrial emission',
    'Open burning',
    'Dust event',
    'Smoke event',
    'Traffic-related pollution',
    'Unknown source',
  ];

  const severityOptions = ['ALL', 'Critical', 'High', 'Moderate', 'Low'];

  const resetFilters = () => {
    onFilterChange({
      state: 'ALL',
      eventType: 'ALL',
      severity: 'ALL',
      timeRange: '24H',
      searchQuery: '',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#060a12] text-slate-100">
      {/* 1. Calm, Single-Tier Operational Ribbon */}
      <section className="px-5 py-2.5 bg-[#090f1a] border-b border-slate-800/80 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Key Indicators */}
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-slate-400">Active Hotspots:</span>
              <span className="font-semibold text-white font-mono">{totalActive}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-slate-400">Critical / High (P1):</span>
              <span className="font-semibold text-red-400 font-mono">{highRiskCount}</span>
            </div>

            <div className="hidden sm:flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-400">Citizen Observations:</span>
              <span className="font-semibold text-slate-200 font-mono">{totalCitizenReports}</span>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={filters.state}
              onChange={(e) => onFilterChange({ ...filters, state: e.target.value })}
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            >
              {stateOptions.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>

            <select
              value={filters.eventType}
              onChange={(e) => onFilterChange({ ...filters, eventType: e.target.value })}
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            >
              <option value="ALL">All Types</option>
              {typeOptions.filter((t) => t !== 'ALL').map((typ) => (
                <option key={typ} value={typ}>
                  {typ}
                </option>
              ))}
            </select>

            <select
              value={filters.severity}
              onChange={(e) => onFilterChange({ ...filters, severity: e.target.value })}
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            >
              <option value="ALL">All Severities</option>
              {severityOptions.filter((s) => s !== 'ALL').map((sev) => (
                <option key={sev} value={sev}>
                  {sev}
                </option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Workspace: Dominant Map (70%+) + Clean Incident Feed (30%) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
        {/* Dominant Map Stage */}
        <div className="flex-1 flex flex-col h-full min-h-[480px] rounded-xl overflow-hidden relative border border-slate-800/80 shadow-md">
          <IndiaMap
            events={filteredEvents}
            selectedEventId={selectedEventId}
            onSelectEvent={onSelectEvent}
            onInvestigateEvent={onInvestigateEvent}
            height="h-full w-full"
            interactive={true}
          />
        </div>

        {/* Supporting Operational Incident Queue */}
        <div className="w-full lg:w-96 flex-shrink-0 h-full flex flex-col rounded-xl overflow-hidden border border-slate-800/80 bg-[#080d17] shadow-md">
          <EventFeed
            events={filteredEvents}
            selectedEventId={selectedEventId}
            onSelectEvent={onSelectEvent}
            onInvestigateEvent={onInvestigateEvent}
          />
        </div>
      </div>
    </div>
  );
};
