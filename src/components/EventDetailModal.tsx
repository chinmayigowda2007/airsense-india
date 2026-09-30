import React from 'react';
import { PollutionEvent } from '../types';
import { 
  X, 
  MapPin, 
  Clock, 
  Wind, 
  Activity, 
  Users, 
  Sparkles, 
  ShieldAlert, 
  Building2, 
  AlertTriangle,
  ArrowRight,
  Share2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface EventDetailModalProps {
  event: PollutionEvent | null;
  onClose: () => void;
  onInvestigate: (event: PollutionEvent) => void;
  onForecast: (event: PollutionEvent) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onInvestigate,
  onForecast,
}) => {
  if (!event) return null;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-[#090f1a] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-[#0a121e] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-bold text-cyan-300">
              {event.id}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getSeverityBadge(
                event.severity
              )}`}
            >
              {event.severity} SEVERITY
            </span>
            {event.isSimulated ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-slate-900 text-slate-400 border-slate-700">
                SIMULATED DATA
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-emerald-950 text-emerald-300 border-emerald-500/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE CITIZEN EVENT
              </span>
            )}
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
              {event.type}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
          {/* Title & Coordinates banner */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
                {event.title}
              </h2>
              <div className="mt-1 flex items-center space-x-2 text-slate-400 font-mono text-xs">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>{event.ward}, {event.city}, {event.state}</span>
                <span>•</span>
                <span>GPS: {event.coordinates.lat.toFixed(4)}°N, {event.coordinates.lng.toFixed(4)}°E</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs self-start">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                {event.detectedAt}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold">
                AI CONF: {event.aiConfidence}%
              </span>
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">EST. AQI SPIKE</span>
              <span className="text-lg font-bold text-amber-400">+{event.aqiSpikeEstimate} µg/m³</span>
              <span className="text-[9px] text-slate-400">Localized anomaly</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">WIND VECTOR</span>
              <span className="text-lg font-bold text-cyan-300">{event.ambientWind.speedKmh} km/h</span>
              <span className="text-[9px] text-slate-400">{event.ambientWind.direction}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">POPULATION EXPOSED</span>
              <span className="text-lg font-bold text-white">
                {(event.impactCorridor.affectedPopulation / 1000).toFixed(0)}K
              </span>
              <span className="text-[9px] text-slate-400">Within corridor</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">CITIZEN EVIDENCE</span>
              <span className="text-lg font-bold text-emerald-400">{event.citizenReportsCount}</span>
              <span className="text-[9px] text-slate-400">Geotagged reports</span>
            </div>
          </div>

          {/* 2-Column Details: Left (AI Attribution & Sources), Right (Visual & Environmental Evidence) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Card: AI Source Hypothesis */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>AI SOURCE ATTRIBUTION HYPOTHESIS</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                {event.sourceHypothesis}
              </p>

              <div>
                <span className="text-[10px] text-slate-500 block mb-1">PROBABLE LOCAL SOURCES:</span>
                <ul className="space-y-1">
                  {event.possibleSources.map((s, idx) => (
                    <li key={idx} className="p-1.5 rounded bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Card: Optical & Environmental Telemetry */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <Activity className="w-4 h-4" />
                  <span>OPTICAL & SENSOR TELEMETRY</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                  SIMULATED SENSORS
                </span>
              </div>

              <div className="rounded-lg overflow-hidden aspect-video border border-slate-800 relative">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-[10px] text-slate-300 leading-relaxed">
                {event.visualEvidence}
              </p>
            </div>
          </div>

          {/* Impacted Sensitive Infrastructure */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 font-mono">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              DOWNWIND SENSITIVE INFRASTRUCTURE IN POTENTIAL IMPACT CORRIDOR
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {event.impactCorridor.sensitiveInfrastructure.map((inf, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] flex items-center justify-between"
                >
                  <span className="text-slate-300 truncate max-w-[130px]">{inf.name}</span>
                  <span className="text-cyan-400 text-[10px] font-bold">{inf.distanceKm} km</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended SOP Action */}
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs font-mono">
            <span className="text-red-400 font-bold block mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              RECOMMENDED REGULATORY SOP:
            </span>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              {event.actionSop}
            </p>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-5 py-3.5 bg-[#0a121e] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition"
          >
            Close Inspector
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onForecast(event);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold transition flex items-center gap-1.5 border border-cyan-800/40"
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Dispersion Forecast</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onInvestigate(event);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-950/50"
            >
              <span>Deep Investigation Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
