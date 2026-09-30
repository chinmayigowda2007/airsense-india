import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Camera, 
  Scan, 
  Sparkles, 
  MapPin, 
  Radio, 
  Wind, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ExternalLink,
  Activity,
  Layers,
  Clock
} from 'lucide-react';
import { PollutionEvent, AuthorityAlert, SimulationPhase, SimulationState } from '../../types';

interface LiveSimulationControllerProps {
  simulationState: SimulationState;
  onUpdateState: (newState: SimulationState) => void;
  onStopSimulation: () => void;
  onEventCreated: (event: PollutionEvent) => void;
  onAlertCreated: (alert: AuthorityAlert) => void;
  onInspectEvent: (event: PollutionEvent) => void;
  onNavigateToActionCenter: () => void;
  onNavigateToForecast: (event: PollutionEvent) => void;
}

export const LiveSimulationController: React.FC<LiveSimulationControllerProps> = ({
  simulationState,
  onUpdateState,
  onStopSimulation,
  onEventCreated,
  onAlertCreated,
  onInspectEvent,
  onNavigateToActionCenter,
  onNavigateToForecast,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesized Simulated Event definition
  const simulatedEventTemplate: PollutionEvent = {
    id: 'AS-SIM-2026-DEL',
    timestamp: new Date().toISOString(),
    latitude: 28.5355,
    longitude: 77.2712,
    city: 'Delhi NCR',
    state: 'Delhi',
    eventType: 'Open burning',
    severity: 'Critical',
    confidence: 97,
    sourceHypothesis: 'Open combustion of hazardous chemical packaging drums and rubber scrap along railway siding.',
    reportCount: 24,
    status: 'Active',
    isSimulated: true,

    title: 'Okhla Phase II Chemical Waste Pyrolysis & Open Fire',
    ward: 'Okhla Industrial Area Phase II, South East Delhi',
    coordinates: { lat: 28.5355, lng: 77.2712 },
    type: 'Open burning',
    aiConfidence: 97,
    detectedAt: 'Live Simulated Stream',
    timeElapsed: 'T+00:00:15',
    possibleSources: [
      'Informal drum cleaning solvent residue combustion',
      'Polymer scrap pyrolysis in vacant industrial plot',
      'Discarded synthetic tyre retread smolder',
    ],
    visualEvidence: 'Dense pitch-black plume with concentrated soot fraction. Boundary layer trapping causing severe ground-level opacity across Maa Anandmayee Marg.',
    aqiSpikeEstimate: 460,
    ambientWind: {
      speedKmh: 14,
      direction: 'NW (315°)',
      angleDeg: 315,
    },
    citizenReportsCount: 24,
    citizenReports: [
      {
        id: 'CR-SIM-01',
        reporterAlias: 'Okhla_Industrial_Commuter',
        timestamp: 'Live simulated ping',
        comment: 'Dense black smoke completely blinding traffic on flyover. Intense burnt solvent smell.',
        perceivedSeverity: 'Critical',
        verifiedCitizen: true,
      },
      {
        id: 'CR-SIM-02',
        reporterAlias: 'Kalkaji_Resident_Watch',
        timestamp: 'Live simulated ping',
        comment: 'Pungent chemical smog drifting into residential apartments. Immediate eye stinging.',
        perceivedSeverity: 'Critical',
        verifiedCitizen: true,
      },
    ],
    environmentalSignals: {
      cpcbMonitor: 'CAAQMS Okhla Phase II (Simulated Node)',
      pm25: 395,
      pm10: 620,
      no2: 84,
      so2: 56,
      satelliteThermalAnomalies: 4,
      boundaryLayerHeightM: 270,
      relativeHumidity: 70,
    },
    impactCorridor: {
      headingDeg: 135,
      lengthKm: 4.2,
      widthKm: 1.5,
      affectedPopulation: 110000,
      sensitiveInfrastructure: [
        { name: 'Holy Family Hospital Okhla', type: 'hospital', distanceKm: 1.6 },
        { name: 'Jamia Millia Islamia Campus', type: 'school', distanceKm: 2.1 },
        { name: 'Harkesh Nagar Metro Station', type: 'transport', distanceKm: 0.8 },
      ],
    },
    priority: 'P1',
    timeline: [
      { time: 'T+00:00', title: 'Citizen Reports Ingested', detail: '24 geotagged photo reports in Okhla', source: 'citizen' },
      { time: 'T+00:10', title: 'Gemini 3.8 Flash Synthesis', detail: '97% confidence source attribution generated', source: 'ai' },
      { time: 'T+00:25', title: 'Multi-Sensor Spikes Correlated', detail: 'CAAQMS PM2.5 jumped +310 µg/m³', source: 'sensor' },
      { time: 'T+00:35', title: 'P1 Emergency SOP Dispatched', detail: 'DPCC Flying Squad & Fire alerted', source: 'authority' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    actionSop: 'Dispatch DPCC South Task Force and Fire Station Okhla. Seal property gates and initiate spot seizure.',
  };

  const simulatedAlertTemplate: AuthorityAlert = {
    id: 'ALT-SIM-DEL-01',
    eventId: 'AS-SIM-2026-DEL',
    priority: 'P1 - EMERGENCY',
    title: 'Okhla Phase II Chemical Waste Pyrolysis & Open Fire',
    event: 'Okhla Phase II Chemical Waste Pyrolysis & Open Fire',
    city: 'Delhi NCR',
    location: 'Okhla Phase II, South East Delhi',
    eventType: 'Open burning',
    confidence: 97,
    potentialImpact: '110,000 residents; high threat to Holy Family Hospital & Jamia Campus',
    recommendedAction: 'Dispatch DPCC South Task Force and Fire Station Okhla. Seal property gates and initiate spot seizure.',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    timestamp: 'Live simulated alert',
    isSimulated: true,
  };

  // Phase Definitions for the 40-second flow
  const phases: {
    phase: SimulationPhase;
    index: number;
    title: string;
    subtitle: string;
    startSecond: number;
    duration: number;
    icon: any;
    color: string;
  }[] = [
    {
      phase: 'citizen_report',
      index: 1,
      title: '1. Citizen Report Ingestion',
      subtitle: 'Geotagged observation and photos received from Okhla Phase II',
      startSecond: 0,
      duration: 5,
      icon: Camera,
      color: 'text-amber-400',
    },
    {
      phase: 'image_analysis',
      index: 2,
      title: '2. Optical & Plume Image Analysis',
      subtitle: 'Scanning multi-spectral smoke opacity index (89.4%) and particulate stratification',
      startSecond: 5,
      duration: 5,
      icon: Scan,
      color: 'text-cyan-400',
    },
    {
      phase: 'gemini_assessment',
      index: 3,
      title: '3. Gemini 3.8 Flash AI Assessment',
      subtitle: 'Neural classification: 97% confidence hazardous solvent drum pyrolysis',
      startSecond: 10,
      duration: 6,
      icon: Sparkles,
      color: 'text-teal-300',
    },
    {
      phase: 'event_created',
      index: 4,
      title: '4. Critical Event Enrolled in Register',
      subtitle: 'Enrolling AS-SIM-2026-DEL into National Environmental Mesh',
      startSecond: 16,
      duration: 5,
      icon: CheckCircle2,
      color: 'text-emerald-400',
    },
    {
      phase: 'hotspot_map',
      index: 5,
      title: '5. Hotspot Appears on National Map',
      subtitle: 'Pulsing critical radar beacon anchored at 28.5355°N, 77.2712°E',
      startSecond: 21,
      duration: 5,
      icon: MapPin,
      color: 'text-red-400',
    },
    {
      phase: 'environmental_evidence',
      index: 6,
      title: '6. Environmental Sensor Evidence Correlated',
      subtitle: 'CAAQMS PM2.5 spike (+310 µg/m³) & VIIRS 4-pixel thermal anomaly confirmed',
      startSecond: 26,
      duration: 5,
      icon: Radio,
      color: 'text-orange-400',
    },
    {
      phase: 'movement_corridor',
      index: 7,
      title: '7. Potential Movement Corridor Projected',
      subtitle: 'Downwind Gaussian corridor (NW 315° · 4.2 km) threatening Holy Family Hospital',
      startSecond: 31,
      duration: 5,
      icon: Wind,
      color: 'text-indigo-400',
    },
    {
      phase: 'authority_alert',
      index: 8,
      title: '8. Authority Emergency SOP Alert Generated',
      subtitle: 'P1 Emergency dispatch pushed to DPCC & East Delhi Fire Command',
      startSecond: 36,
      duration: 6,
      icon: ShieldAlert,
      color: 'text-red-500',
    },
  ];

  // Timer runner
  useEffect(() => {
    if (!simulationState.isActive || simulationState.isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const nextSecond = simulationState.elapsedSeconds + 1;

      if (nextSecond >= 42) {
        // Complete state
        onUpdateState({
          ...simulationState,
          phase: 'complete',
          phaseIndex: 8,
          elapsedSeconds: 42,
          isPaused: true,
          simulatedEvent: simulatedEventTemplate,
          simulatedAlert: simulatedAlertTemplate,
        });
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      // Find current phase
      const currentPhaseDef = [...phases].reverse().find((p) => nextSecond >= p.startSecond) || phases[0];

      // Side-effects when reaching specific phases
      if (currentPhaseDef.phase === 'event_created' && !simulationState.simulatedEvent) {
        onEventCreated(simulatedEventTemplate);
      }
      if (currentPhaseDef.phase === 'authority_alert' && !simulationState.simulatedAlert) {
        onAlertCreated(simulatedAlertTemplate);
      }

      onUpdateState({
        ...simulationState,
        phase: currentPhaseDef.phase,
        phaseIndex: currentPhaseDef.index,
        elapsedSeconds: nextSecond,
        simulatedEvent: simulatedEventTemplate,
        simulatedAlert: simulatedAlertTemplate,
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [simulationState]);

  // Jump to specific step
  const handleJumpToPhase = (index: number) => {
    const target = phases[index - 1];
    if (target) {
      if (target.phase === 'event_created' || index >= 4) {
        onEventCreated(simulatedEventTemplate);
      }
      if (target.phase === 'authority_alert' || index >= 8) {
        onAlertCreated(simulatedAlertTemplate);
      }

      onUpdateState({
        ...simulationState,
        phase: target.phase,
        phaseIndex: target.index,
        elapsedSeconds: target.startSecond,
        simulatedEvent: simulatedEventTemplate,
        simulatedAlert: simulatedAlertTemplate,
      });
    }
  };

  const currentPhaseDef = phases.find((p) => p.phase === simulationState.phase) || phases[0];
  const CurrentIcon = currentPhaseDef.icon;
  const progressPercent = Math.min((simulationState.elapsedSeconds / 42) * 100, 100);

  return (
    <div className="fixed top-16 left-0 right-0 z-40 pointer-events-none px-4 flex flex-col items-center">
      {/* 1. Main Compact Live Simulation Floating Indicator Bar */}
      <div 
        className="pointer-events-auto w-full max-w-4xl bg-[#091120]/95 border border-cyan-400/60 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden text-white transition-all duration-200"
      >
        {/* Progress Bar Ribbon */}
        <div className="w-full bg-slate-950 h-1 relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-red-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Compact Bar Row */}
        <div className="p-3 px-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          {/* Left: Live Beacon & Current Phase Title */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-red-950/80 border border-red-500/60 text-red-300 font-bold text-[10px] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>LIVE SIMULATION</span>
            </div>

            <div className="flex items-center space-x-2 truncate">
              <CurrentIcon className={`w-4 h-4 ${currentPhaseDef.color} flex-shrink-0`} />
              <span className="font-bold text-white truncate text-xs">
                {currentPhaseDef.title}
              </span>
              <span className="text-slate-500 hidden sm:inline">·</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline truncate max-w-xs">
                {currentPhaseDef.subtitle}
              </span>
            </div>
          </div>

          {/* Right: Timer, Interactive Controls & Toggle Drawer */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Time Elapsed */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 font-bold tabular-nums">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>T+00:{simulationState.elapsedSeconds.toString().padStart(2, '0')} / 42s</span>
            </div>

            {/* Prev step */}
            <button
              onClick={() => handleJumpToPhase(Math.max(simulationState.phaseIndex - 1, 1))}
              disabled={simulationState.phaseIndex <= 1}
              title="Previous Phase"
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 border border-slate-800 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => onUpdateState({ ...simulationState, isPaused: !simulationState.isPaused })}
              title={simulationState.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
              className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow"
            >
              {simulationState.isPaused ? (
                <Play className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Pause className="w-3.5 h-3.5 fill-current" />
              )}
            </button>

            {/* Next step */}
            <button
              onClick={() => handleJumpToPhase(Math.min(simulationState.phaseIndex + 1, 8))}
              disabled={simulationState.phaseIndex >= 8}
              title="Next Phase"
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 border border-slate-800 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Restart */}
            <button
              onClick={() => handleJumpToPhase(1)}
              title="Restart Simulation"
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Expand / Collapse Drawer */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 transition"
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </button>

            {/* Close */}
            <button
              onClick={onStopSimulation}
              title="Exit Simulation"
              className="p-1 rounded text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Expandable Phase Details Drawer */}
        {isExpanded && (
          <div className="p-4 bg-[#070d18] border-t border-slate-800/90 font-mono text-xs space-y-3">
            {/* Step Navigation Dots Bar */}
            <div className="grid grid-cols-8 gap-1.5">
              {phases.map((p) => {
                const isPast = simulationState.phaseIndex > p.index;
                const isCurrent = simulationState.phaseIndex === p.index;

                return (
                  <button
                    key={p.index}
                    onClick={() => handleJumpToPhase(p.index)}
                    className={`py-1.5 px-1 rounded text-center transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold shadow'
                        : isPast
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50'
                        : 'bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <div className="text-[9px] font-bold">P{p.index}</div>
                    <div className="text-[8px] truncate hidden md:block">{p.title.split(' ')[1]}</div>
                  </button>
                );
              })}
            </div>

            {/* Live Telemetry Viewport for Current Phase */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              {/* Evidence Media & Scanlines (Left 4 cols) */}
              <div className="md:col-span-4 relative rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black">
                <img
                  src={simulatedEventTemplate.imageUrl}
                  alt="Simulated Evidence"
                  className="w-full h-full object-cover"
                />

                {/* Laser scan animation when in image analysis phase */}
                {simulationState.phaseIndex === 2 && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-1 bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-[scan_2s_linear_infinite]" />
                    <div className="absolute inset-0 border-2 border-dashed border-cyan-400/70 m-2 rounded" />
                    <span className="absolute bottom-1 right-2 text-[8px] bg-black/80 px-1.5 py-0.5 rounded text-cyan-300">
                      OCR / OPACITY: 89.4%
                    </span>
                  </div>
                )}

                {/* Hotspot marker on map indicator */}
                {simulationState.phaseIndex >= 5 && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-950/90 border border-red-500 text-[8px] text-red-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    <span>PINNED: 28.5355°N, 77.2712°E</span>
                  </div>
                )}
              </div>

              {/* Dynamic Phase Output (Center & Right 8 cols) */}
              <div className="md:col-span-8 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <CurrentIcon className={`w-3.5 h-3.5 ${currentPhaseDef.color}`} />
                      {currentPhaseDef.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      SIMULATED DATASET
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-300 leading-relaxed">
                    {currentPhaseDef.subtitle}
                  </p>
                </div>

                {/* Phase-specific telemetry snippet */}
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[10px] space-y-1">
                  {simulationState.phaseIndex === 1 && (
                    <div className="text-slate-300">
                      • Reported by: <strong>Verified Citizen Watch #402</strong> · Okhla Phase II
                      <br />
                      • Testimony: "Dense black smoke blinding flyover; acrid burnt solvent stench."
                    </div>
                  )}

                  {simulationState.phaseIndex === 2 && (
                    <div className="text-cyan-200">
                      • Optical Density Index: <strong>89.4% Opacity</strong> · High-extinction soot column
                      <br />
                      • Boundary Layer Height: <strong>270 meters</strong> (thermal inversion capping)
                    </div>
                  )}

                  {simulationState.phaseIndex === 3 && (
                    <div className="text-teal-200">
                      • Gemini Hypothesis: <strong>Chemical drum wash & scrap tyre pyrolysis</strong>
                      <br />
                      • Confidence: <strong>97% Probabilistic Attribution</strong> · SPCB Flying Squad SOP
                    </div>
                  )}

                  {simulationState.phaseIndex === 4 && (
                    <div className="text-emerald-300">
                      • Registered Incident ID: <strong>AS-SIM-2026-DEL</strong> (Critical Tier)
                      <br />
                      • Enrolled into National Environmental Registry & CPCB CAAQMS Mesh
                    </div>
                  )}

                  {simulationState.phaseIndex === 5 && (
                    <div className="text-red-300">
                      • Hotspot illuminated on National Dashboard radar with glowing concentric rings
                      <br />
                      • Micro-label anchored at Okhla Phase II industrial polygon
                    </div>
                  )}

                  {simulationState.phaseIndex === 6 && (
                    <div className="text-orange-300">
                      • CPCB Sensor Spike: <strong>PM2.5: 395 µg/m³ · PM10: 620 µg/m³</strong> (+310 µg delta)
                      <br />
                      • VIIRS Thermal Sensor: <strong>4 High-radiance active fire anomaly pixels</strong>
                    </div>
                  )}

                  {simulationState.phaseIndex === 7 && (
                    <div className="text-indigo-200">
                      • Gaussian Dispersion Plume: <strong>NW 315° @ 14 km/h · 4.2 km corridor</strong>
                      <br />
                      • Receptors in Path: <strong>Holy Family Hospital (1.6km) · Jamia Millia (2.1km)</strong>
                    </div>
                  )}

                  {simulationState.phaseIndex >= 8 && (
                    <div className="text-red-300">
                      • P1 Authority Alert Generated: <strong>ALT-SIM-DEL-01</strong>
                      <br />
                      • Dispatched to: <strong>DPCC Flying Squad & South Delhi Fire Command</strong>
                    </div>
                  )}
                </div>

                {/* Action Shortcuts Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center space-x-1.5 text-[9px] text-slate-500">
                    <Info className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    <span>Demo mode uses calibrated synthetic telemetry for evaluation.</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onInspectEvent(simulatedEventTemplate)}
                      className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold transition"
                    >
                      Investigate Plume
                    </button>
                    <button
                      onClick={() => onNavigateToForecast(simulatedEventTemplate)}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[10px] transition"
                    >
                      Forecast Cone
                    </button>
                    <button
                      onClick={onNavigateToActionCenter}
                      className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[10px] font-bold transition"
                    >
                      Action SOP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
