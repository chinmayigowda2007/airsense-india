import React, { useState } from 'react';
import { PollutionEvent } from '../../types';
import { IndiaMap } from '../Map/IndiaMap';
import { 
  Sparkles, 
  MapPin, 
  Wind, 
  Users, 
  ShieldAlert, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface InvestigationWorkspaceProps {
  events: PollutionEvent[];
  selectedEvent: PollutionEvent;
  onSelectEvent: (event: PollutionEvent) => void;
  onNavigateToForecast: (event: PollutionEvent) => void;
  onNavigateToActionCenter: () => void;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onNavigateToForecast,
  onNavigateToActionCenter,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'timeline'>('evidence');

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'High':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'Moderate':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-5 overflow-y-auto custom-scrollbar space-y-4">
      {/* Top Event Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#090f1a] border border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono font-semibold text-white">
              INVESTIGATION WORKSPACE:
            </span>
          </div>

          <select
            value={selectedEvent.id}
            onChange={(e) => {
              const target = events.find((ev) => ev.id === e.target.value);
              if (target) onSelectEvent(target);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 font-medium focus:outline-none focus:border-cyan-500"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                [{ev.id}] {ev.city} - {ev.title.slice(0, 36)}...
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateToForecast(selectedEvent)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition flex items-center gap-1.5"
          >
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dispersion Forecast</span>
          </button>
          <button
            onClick={onNavigateToActionCenter}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-red-300 text-xs font-mono transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Authority Action SOP</span>
          </button>
        </div>
      </div>

      {/* 3-Column Layout: Left (Event & Citizen Evidence), Center (Map & Signals), Right (Gemini Intelligence) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Event Summary & Citizen Evidence (3 cols) */}
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          {/* Summary Card */}
          <div className="p-4 rounded-xl bg-[#090f1a] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-semibold text-cyan-300">
                  {selectedEvent.id}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-slate-400 border border-slate-700">
                  {selectedEvent.isSimulated ? 'SIMULATED' : 'LIVE'}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${getSeverityStyle(selectedEvent.severity)}`}>
                {selectedEvent.severity}
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-white leading-snug">
                {selectedEvent.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span>{selectedEvent.ward}, {selectedEvent.city}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="bg-slate-900/60 p-2 rounded">
                <span className="text-slate-500 block text-[10px]">DETECTED</span>
                <span className="text-slate-200 font-semibold">{selectedEvent.detectedAt}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded">
                <span className="text-slate-500 block text-[10px]">AI CONFIDENCE</span>
                <span className="text-emerald-400 font-semibold">{selectedEvent.aiConfidence}%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">
                INITIAL HYPOTHESIS:
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {selectedEvent.sourceHypothesis}
              </p>
            </div>
          </div>

          {/* Citizen Evidence Card */}
          <div className="p-4 rounded-xl bg-[#090f1a] border border-slate-800/80 space-y-3 flex-1">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Citizen Evidence ({selectedEvent.citizenReportsCount})
              </span>
              <span className="text-[10px] font-mono text-emerald-400">GPS Verified</span>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-800 aspect-video relative">
              <img
                src={selectedEvent.imageUrl}
                alt="Citizen evidence photo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {selectedEvent.citizenReports.map((cr) => (
                <div
                  key={cr.id}
                  className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-cyan-300 font-semibold">{cr.reporterAlias}</span>
                    <span className="text-slate-500">{cr.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug">
                    "{cr.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Map & Signals (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          <div className="p-1 rounded-xl bg-[#090f1a] border border-slate-800/80 relative min-h-[380px] flex-1">
            <IndiaMap
              events={[selectedEvent]}
              selectedEventId={selectedEvent.id}
              onSelectEvent={onSelectEvent}
              height="h-[380px]"
            />
          </div>

          {/* Environmental Evidence Layer & Timeline Tabs */}
          <div className="p-4 rounded-xl bg-[#090f1a] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
                    activeTab === 'evidence'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Environmental Signals
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
                    activeTab === 'timeline'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Evidence Timeline ({selectedEvent.timeline.length})
                </button>
              </div>
            </div>

            {activeTab === 'evidence' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">PM2.5</span>
                  <span className="text-sm font-semibold text-red-400">
                    {selectedEvent.environmentalSignals.pm25} µg/m³
                  </span>
                  <span className="text-[9px] text-slate-400 block truncate">
                    {selectedEvent.environmentalSignals.cpcbMonitor.split(' ')[0]}
                  </span>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">PM10</span>
                  <span className="text-sm font-semibold text-amber-400">
                    {selectedEvent.environmentalSignals.pm10} µg/m³
                  </span>
                  <span className="text-[9px] text-slate-400 block">Coarse fraction</span>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">WIND</span>
                  <span className="text-sm font-semibold text-cyan-300">
                    {selectedEvent.ambientWind.speedKmh} km/h
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    {selectedEvent.ambientWind.direction}
                  </span>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">HOT-PIXELS</span>
                  <span className="text-sm font-semibold text-orange-400">
                    {selectedEvent.environmentalSignals.satelliteThermalAnomalies} FIRMS
                  </span>
                  <span className="text-[9px] text-slate-400 block">VIIRS</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pt-1">
                {selectedEvent.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2.5 text-xs pb-2 border-b border-slate-800/60 last:border-0"
                  >
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-cyan-400 flex-shrink-0">
                      {item.time}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200 text-[11px]">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: "Gemini Intelligence" Deep Attribution (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-[#090f1a] border border-slate-800/80 space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                  Gemini Intelligence Synthesis
                </h3>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                {selectedEvent.isSimulated ? 'SCENARIO MODEL' : 'LIVE GEMINI 3.8'}
              </span>
            </div>

            {/* 1. Visual Analysis */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-300 font-semibold uppercase">
                1. Visual Spectrum & Plume Morphology
              </span>
              <p className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-[11px] text-slate-300 font-mono leading-relaxed">
                {selectedEvent.visualEvidence}
              </p>
            </div>

            {/* 2. Report Interpretation */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-300 font-semibold uppercase">
                2. Citizen Consensus
              </span>
              <p className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-[11px] text-slate-300 font-mono leading-relaxed">
                Correlated with {selectedEvent.citizenReportsCount} reports. Consensus highlights eye irritation and smoke odor within 1.8km radius.
              </p>
            </div>

            {/* 3. Evidence Correlation */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-300 font-semibold uppercase">
                3. Multi-Sensor Evidence
              </span>
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-[11px] text-slate-300 font-mono space-y-1">
                <div>• Sensor Spike: +{selectedEvent.aqiSpikeEstimate} µg/m³ anomaly</div>
                <div>• Satellite Thermal: {selectedEvent.environmentalSignals.satelliteThermalAnomalies} VIIRS anomalies</div>
                <div>• Wind Heading: {selectedEvent.ambientWind.direction} @ {selectedEvent.ambientWind.speedKmh} km/h</div>
              </div>
            </div>

            {/* 4. Probable Sources */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-300 font-semibold uppercase">
                4. Hypothesized Micro-Sources
              </span>
              <div className="space-y-1">
                {selectedEvent.possibleSources.map((src, i) => (
                  <div
                    key={i}
                    className="p-1.5 px-2 rounded bg-cyan-950/20 border border-cyan-900/40 text-[11px] text-cyan-200 font-mono"
                  >
                    #{i + 1}: {src}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Recommended Next Action */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                5. Recommended SOP Action
              </span>
              <p className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200 font-mono leading-relaxed">
                {selectedEvent.actionSop}
              </p>
            </div>

            {/* Scientific Attribution Disclaimer */}
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                AirSense India models probable source attributions using multi-sensor heuristics and visual LLM reasoning. Scientific verification remains under jurisdiction of SPCB/CPCB authorities.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
