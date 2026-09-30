import React, { useState } from 'react';
import { PollutionEvent } from '../../types';
import { IndiaMap } from '../Map/IndiaMap';
import { 
  Wind, 
  Clock, 
  Users, 
  AlertTriangle, 
  ChevronRight
} from 'lucide-react';

interface ForecastViewProps {
  events: PollutionEvent[];
  selectedEvent: PollutionEvent;
  onSelectEvent: (event: PollutionEvent) => void;
  onNavigateToActionCenter: () => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onNavigateToActionCenter,
}) => {
  const [forecastStep, setForecastStep] = useState<'now' | '+1h' | '+3h' | '+6h'>('now');

  // Multiplier for exposure stats
  const factor = forecastStep === 'now' ? 1.0 : forecastStep === '+1h' ? 1.4 : forecastStep === '+3h' ? 2.1 : 3.2;

  const affectedPopulation = Math.round(selectedEvent.impactCorridor.affectedPopulation * factor);
  const corridorDistance = (selectedEvent.impactCorridor.lengthKm * factor).toFixed(1);
  const corridorWidth = (selectedEvent.impactCorridor.widthKm * Math.sqrt(factor)).toFixed(1);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-5 overflow-y-auto custom-scrollbar space-y-4">
      {/* Top Header & Event Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#090f1a] border border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-300">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                Geospatial Dispersion Forecast
              </span>
              <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-amber-950/70 text-amber-300 border border-amber-500/30">
                SIMULATED ADVECTION MODEL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Downwind plume trajectory projection based on ambient meteorological vectors.
            </p>
          </div>
        </div>

        {/* Event selector */}
        <select
          value={selectedEvent.id}
          onChange={(e) => {
            const ev = events.find((item) => item.id === e.target.value);
            if (ev) onSelectEvent(ev);
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 font-medium focus:outline-none focus:border-cyan-500"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              [{ev.id}] {ev.city} - {ev.title.slice(0, 35)}...
            </option>
          ))}
        </select>
      </div>

      {/* Main Grid: Forecast Map (Left/Center) & Timeline Controls / Impact Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Map View (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Map canvas */}
          <div className="flex-1 rounded-xl overflow-hidden border border-slate-800/80 relative min-h-[460px]">
            <IndiaMap
              events={[selectedEvent]}
              selectedEventId={selectedEvent.id}
              onSelectEvent={onSelectEvent}
              forecastStep={forecastStep}
              showCorridors={true}
              height="h-full min-h-[460px]"
            />
          </div>

          {/* Interactive Timeline Scrubber Buttons */}
          <div className="p-3 rounded-xl bg-[#090f1a] border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 font-semibold">Timeline Projection:</span>
            </div>

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1 font-mono text-xs">
              {(['now', '+1h', '+3h', '+6h'] as const).map((step) => {
                const isCurrent = forecastStep === step;
                return (
                  <button
                    key={step}
                    onClick={() => setForecastStep(step)}
                    className={`px-3 py-1 rounded-md font-semibold transition flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{step.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Corridor Horizon: <strong className="text-cyan-300">{corridorDistance} km</strong>
            </div>
          </div>
        </div>

        {/* Right Impact Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Meteorological Signal Metrics */}
          <div className="p-4 rounded-xl bg-[#090f1a] border border-slate-800/80 space-y-3">
            <span className="text-xs font-mono font-semibold text-slate-300 uppercase block pb-1 border-b border-slate-800">
              Meteorological Vectors
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">WIND DIRECTION</span>
                <span className="text-sm font-semibold text-cyan-300">
                  {selectedEvent.ambientWind.direction}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Angle {selectedEvent.ambientWind.angleDeg}°
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">WIND SPEED</span>
                <span className="text-sm font-semibold text-cyan-300">
                  {selectedEvent.ambientWind.speedKmh} km/h
                </span>
                <span className="text-[9px] text-slate-400 block">Surface anemometer</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">BOUNDARY LAYER</span>
                <span className="text-sm font-semibold text-amber-400">
                  {selectedEvent.environmentalSignals.boundaryLayerHeightM} m
                </span>
                <span className="text-[9px] text-slate-400 block">Inversion cap</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">RELATIVE HUMIDITY</span>
                <span className="text-sm font-semibold text-cyan-300">
                  {selectedEvent.environmentalSignals.relativeHumidity}%
                </span>
                <span className="text-[9px] text-slate-400 block">Atmospheric moisture</span>
              </div>
            </div>
          </div>

          {/* Exposure Corridor Details */}
          <div className="p-4 rounded-xl bg-[#090f1a] border border-slate-800/80 space-y-3">
            <span className="text-xs font-mono font-semibold text-slate-300 uppercase block pb-1 border-b border-slate-800">
              Downwind Exposure Projection ({forecastStep})
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">Receptor Population:</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {affectedPopulation.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Plume Footprint:</span>
                <span className="text-sm font-semibold text-cyan-300">
                  {corridorDistance} km × {corridorWidth} km
                </span>
              </div>
            </div>

            {/* Downwind Sensitive Infrastructure */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Sensitive Facilities in Corridor
              </span>
              <div className="space-y-1">
                {selectedEvent.impactCorridor.sensitiveInfrastructure.map((sens, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-300"
                  >
                    <span className="truncate pr-2">{sens.name}</span>
                    <span className="text-indigo-300 text-[10px] flex-shrink-0">
                      {sens.distanceKm} km
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onNavigateToActionCenter}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-red-300 font-mono text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Proceed to Authority Action Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
