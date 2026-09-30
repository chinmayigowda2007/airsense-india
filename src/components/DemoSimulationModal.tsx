import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Wind, 
  ShieldAlert, 
  ArrowRight, 
  X, 
  Loader2,
  Users,
  Camera,
  Activity,
  Flame
} from 'lucide-react';
import { PollutionEvent, AuthorityAlert } from '../types';

interface DemoSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: PollutionEvent) => void;
  onAlertCreated: (alert: AuthorityAlert) => void;
  onNavigateToEvent: (event: PollutionEvent) => void;
  onNavigateToActionCenter: () => void;
}

export const DemoSimulationModal: React.FC<DemoSimulationModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  onAlertCreated,
  onNavigateToEvent,
  onNavigateToActionCenter,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [simulatedEvent, setSimulatedEvent] = useState<PollutionEvent | null>(null);

  // Define the 5-step crisis sequence in Okhla Phase II / Delhi
  const steps = [
    {
      step: 1,
      title: 'Citizen Report Ingestion',
      desc: 'High-density plume photos and sensory testimonies uploaded by citizens in Okhla Phase II, Delhi.',
      icon: Users,
    },
    {
      step: 2,
      title: 'Gemini 3.8 Flash Neural Analysis',
      desc: 'AI extracts visual smoke opacity index (88%), correlates with CAAQMS PM2.5 spike (+310 µg/m³), and classifies source.',
      icon: Sparkles,
    },
    {
      step: 3,
      title: 'Event Creation & Map Pinning',
      desc: 'Critical event registered on Bharat Environmental Mesh with real-time coordinate triangulation.',
      icon: MapPin,
    },
    {
      step: 4,
      title: 'Dispersion Corridor Projection',
      desc: 'Ambient wind vector (13 km/h NW) models a 4.2 km exposure corridor threatening Holy Family Hospital & Jamia campus.',
      icon: Wind,
    },
    {
      step: 5,
      title: 'Authority Emergency Alert Dispatched',
      desc: 'P1 Critical Action alert pushed to Delhi Pollution Control Committee (DPCC) & South Delhi Emergency Squad.',
      icon: ShieldAlert,
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) return;

    if (currentStep < 5) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 2600);
      return () => clearTimeout(timer);
    } else if (currentStep === 5 && !simulatedEvent) {
      // Create the live event
      const newEvent: PollutionEvent = {
        id: `AS-DEMO-${Math.floor(Math.random() * 89 + 10)}`,
        timestamp: new Date().toISOString(),
        latitude: 28.5355,
        longitude: 77.2712,
        city: 'Delhi NCR',
        state: 'Delhi',
        eventType: 'Open burning',
        severity: 'Critical',
        confidence: 97,
        sourceHypothesis: 'Open combustion of hazardous chemical packaging drums and rubber scrap along railway siding.',
        reportCount: 19,
        status: 'Active',
        isSimulated: true,

        title: 'Okhla Phase II Chemical Waste Pyrolysis & Open Fire',
        ward: 'Okhla Industrial Area Phase II, South East Delhi',
        coordinates: { lat: 28.5355, lng: 77.2712 },
        type: 'Open burning',
        aiConfidence: 97,
        detectedAt: 'Just now (Simulated Demo)',
        timeElapsed: 'T+00:00:10',
        possibleSources: [
          'Informal drum cleaning solvent residue combustion',
          'Polymer scrap pyrolysis in vacant industrial plot',
        ],
        visualEvidence: 'Dense pitch-black plume with concentrated soot fraction. Boundary layer trapping caused severe ground-level fogging over Maa Anandmayee Marg.',
        aqiSpikeEstimate: 460,
        ambientWind: {
          speedKmh: 13,
          direction: 'NW (315°)',
          angleDeg: 315,
        },
        citizenReportsCount: 19,
        citizenReports: [
          {
            id: 'CR-SIM-01',
            reporterAlias: 'Okhla_Factory_Owner',
            timestamp: 'Just now',
            comment: 'Dense black smoke completely blinding traffic on flyover. Intense burnt solvent smell.',
            perceivedSeverity: 'Critical',
            verifiedCitizen: true,
          },
        ],
        environmentalSignals: {
          cpcbMonitor: 'CAAQMS Okhla Phase II Node',
          pm25: 395,
          pm10: 620,
          no2: 84,
          so2: 56,
          satelliteThermalAnomalies: 3,
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
            { name: 'Jamia Millia Islamia University', type: 'school', distanceKm: 2.1 },
            { name: 'Harkesh Nagar Metro Station', type: 'transport', distanceKm: 0.8 },
          ],
        },
        priority: 'P1',
        timeline: [
          { time: 'Just now', title: 'Citizen Report Cluster', detail: '19 geotagged photo reports submitted in Okhla', source: 'citizen' },
          { time: 'Just now', title: 'Gemini 3.8 Flash Synthesis', detail: '97% confidence source attribution generated', source: 'ai' },
          { time: 'Just now', title: 'P1 Emergency SOP Dispatched', detail: 'DPCC Flying Squad notified', source: 'authority' },
        ],
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        actionSop: 'Dispatch DPCC South Task Force and Fire Station Okhla. Seal property gates and initiate spot seizure.',
      };

      const newAlert: AuthorityAlert = {
        id: `ALT-DEMO-${newEvent.id.replace('AS-DEMO-', '')}`,
        eventId: newEvent.id,
        priority: 'P1 - EMERGENCY',
        title: newEvent.title,
        event: newEvent.title,
        city: 'Delhi NCR',
        location: 'Okhla Phase II, South East Delhi',
        eventType: newEvent.type,
        confidence: newEvent.aiConfidence,
        potentialImpact: '110,000 residents; high threat to Holy Family Hospital & Jamia Campus',
        recommendedAction: newEvent.actionSop,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        timestamp: 'Just now',
        isSimulated: true,
      };

      setSimulatedEvent(newEvent);
      onEventCreated(newEvent);
      onAlertCreated(newAlert);
    }
  }, [isOpen, currentStep, isAutoPlaying, simulatedEvent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-[#090f1a] border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 px-6 bg-[#0a121e] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-mono tracking-tight text-white flex items-center gap-2">
                AirSense India — Live End-to-End Simulation Runner
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Judge Demonstration: Citizen Report → Gemini AI → Map Corridors → Authority Action
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Step Progress Tracker */}
          <div className="grid grid-cols-5 gap-2">
            {steps.map((st) => {
              const isPast = currentStep > st.step;
              const isCurrent = currentStep === st.step;
              const Icon = st.icon;

              return (
                <div
                  key={st.step}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition-all ${
                    isCurrent
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : isPast
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isCurrent ? 'text-cyan-300 animate-bounce' : 'text-slate-500'}`} />
                    )}
                  </div>
                  <div className="font-bold text-[10px] truncate">STEP {st.step}</div>
                  <div className="text-[9px] text-slate-400 truncate">{st.title.split(' ')[0]}</div>
                </div>
              );
            })}
          </div>

          {/* Active Step Visual Showcase */}
          <div className="p-5 rounded-2xl bg-[#0d1624] border border-cyan-500/30 relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                CURRENT PIPELINE STAGE: STEP {currentStep} of 5
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                {isAutoPlaying ? 'AUTOMATED SEQUENCE ACTIVE' : 'MANUAL PAUSED'}
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                {steps[currentStep - 1].title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 font-mono leading-relaxed">
                {steps[currentStep - 1].desc}
              </p>
            </div>

            {/* Live Visual Indicators for current step */}
            {currentStep === 1 && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">19 Citizen Observations Registered</span>
                <span className="text-cyan-300 font-bold">Okhla Phase II, South Delhi</span>
              </div>
            )}

            {currentStep === 2 && (
              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 font-mono text-xs space-y-1">
                <div className="text-emerald-400 font-bold">Gemini 3.8 Flash Analysis Output:</div>
                <div className="text-slate-300 text-[11px]">• Event Type: Open hazardous burning</div>
                <div className="text-slate-300 text-[11px]">• Confidence Score: 97%</div>
                <div className="text-slate-300 text-[11px]">• Probable Source: Drum cleaning solvent pyrolysis</div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">New Hotspot Marker Added to National Grid:</span>
                <span className="text-red-400 font-bold">AS-DEL-OKHLA (CRITICAL)</span>
              </div>
            )}

            {currentStep === 4 && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-1">
                <div className="text-amber-400 font-bold">4.2 km Corridor Mapped:</div>
                <div className="text-slate-300 text-[11px]">Receptors: Holy Family Hospital (1.6km), Jamia Campus (2.1km)</div>
                <div className="text-slate-300 text-[11px]">Estimated Population Impacted: 110,000 residents</div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/50 font-mono text-xs space-y-2">
                <div className="text-red-400 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>P1 Priority Emergency Action Generated!</span>
                </div>
                <div className="text-slate-200 text-[11px]">
                  Dispatch instructions generated for DPCC & East Delhi Fire Command. Event and Alert are now live in the application state.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 px-6 bg-[#0a121e] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {isAutoPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setSimulatedEvent(null);
                setIsAutoPlaying(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Restart Demo
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {simulatedEvent ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToEvent(simulatedEvent);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center gap-1.5"
                >
                  <span>Open Investigation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToActionCenter();
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition"
                >
                  View in Action Center
                </button>
              </>
            ) : (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 5))}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition"
              >
                Next Step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
