import React, { useState } from 'react';
import { 
  Settings, 
  Globe2, 
  Bell, 
  Layers, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Check, 
  Sparkles,
  Info,
  Radio,
  ExternalLink,
  Flame,
  Wind
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [language, setLanguage] = useState<string>('English');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [p1OnlyAlerts, setP1OnlyAlerts] = useState<boolean>(false);
  const [soundEffects, setSoundEffects] = useState<boolean>(true);
  const [layerWind, setLayerWind] = useState<boolean>(true);
  const [layerThermal, setLayerThermal] = useState<boolean>(true);
  const [layerSensitive, setLayerSensitive] = useState<boolean>(true);
  const [layerSatelliteGrid, setLayerSatelliteGrid] = useState<boolean>(true);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Toast */}
        {savedToast && (
          <div className="fixed top-20 right-6 z-50 p-3 px-4 rounded-xl bg-cyan-900/90 border border-cyan-400 text-white font-mono text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-cyan-300" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        {/* Header */}
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 text-[10px] font-mono uppercase font-bold">
              SYSTEM CONFIGURATION
            </span>
            <span className="text-xs font-mono text-slate-500">AirSense India Intelligence Engine</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
            Platform Settings & AI Governance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure telemetry ingest layers, authority alerts, data feeds, and examine Gemini AI transparency schemas.
          </p>
        </div>

        {/* 1. Localization & Display */}
        <div className="p-5 rounded-2xl bg-[#090f1a]/90 border border-cyan-950/40 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <h3>Language & Regional Preferences</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1.5 font-bold">
                OPERATIONAL LANGUAGE
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="English">English (National Standard)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada - Karnataka)</option>
                <option value="Tamil">தமிழ் (Tamil - Tamil Nadu)</option>
                <option value="Bengali">বাংলা (Bengali - West Bengal)</option>
                <option value="Marathi">मराठी (Marathi - Maharashtra)</option>
                <option value="Telugu">తెలుగు (Telugu - Telangana & AP)</option>
                <option value="Malayalam">മലയാളം (Malayalam - Kerala)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 font-bold">
                GEOGRAPHIC COORDINATE FORMAT
              </label>
              <select
                defaultValue="DECIMAL"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="DECIMAL">Decimal Degrees (WGS84 28.6258°N, 77.3292°E)</option>
                <option value="DMS">Degrees, Minutes, Seconds (28°37′32″N, 77°19′45″E)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Notification Protocols */}
        <div className="p-5 rounded-2xl bg-[#090f1a]/90 border border-cyan-950/40 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <Bell className="w-4 h-4 text-red-400" />
            <h3>Authority Alert Protocols</h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-slate-200 font-bold block">Instant P1 Critical Emergency Broadcasts</span>
                <span className="text-[11px] text-slate-500">Trigger immediate task force notifications when AI flags severe hazard</span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-slate-200 font-bold block">Filter to P1 Emergencies Only</span>
                <span className="text-[11px] text-slate-500">Silence standard P2/P3 municipal notices on primary dashboard</span>
              </div>
              <input
                type="checkbox"
                checked={p1OnlyAlerts}
                onChange={(e) => setP1OnlyAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>
          </div>
        </div>

        {/* 3. Map Layers */}
        <div className="p-5 rounded-2xl bg-[#090f1a]/90 border border-cyan-950/40 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3>Default Map Intelligence Layers</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-300">Surface Wind Vector Streamlines</span>
              <input
                type="checkbox"
                checked={layerWind}
                onChange={(e) => setLayerWind(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-300">NASA FIRMS Thermal Radiance Pixels</span>
              <input
                type="checkbox"
                checked={layerThermal}
                onChange={(e) => setLayerThermal(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-300">Sensitive Infrastructure Proximity (Hospitals/Schools)</span>
              <input
                type="checkbox"
                checked={layerSensitive}
                onChange={(e) => setLayerSensitive(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-300">Bharat Tactical Coordinate Graticule</span>
              <input
                type="checkbox"
                checked={layerSatelliteGrid}
                onChange={(e) => setLayerSatelliteGrid(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>
          </div>
        </div>

        {/* 4. Data Sources Telemetry */}
        <div className="p-5 rounded-2xl bg-[#090f1a]/90 border border-cyan-950/40 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3>Integrated Environmental Data Sources</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">CPCB CAAQMS Network</span>
                <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40">SIMULATED BASELINE</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                462 continuous ambient air monitoring stations reporting 15-minute PM2.5, PM10, SO2, NO2 (simulated telemetry baseline for demonstration).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">NASA VIIRS / MODIS FIRMS</span>
                <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40">SIMULATED HEURISTICS</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                375m active thermal anomalies for stubble and landfill ignition detection (simulated radiance counts).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Copernicus Sentinel-5P</span>
                <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40">SIMULATED ORBIT</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tropospheric NO2 and Carbon Monoxide total vertical column density index.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Citizen Crowdsource Mesh</span>
                <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50">LIVE INGESTION</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Geotagged smartphone photography, visual plume stratification, and olfactory reports processed through Gemini AI.
              </p>
            </div>
          </div>
        </div>

        {/* 5. AI Transparency & Model Provenance */}
        <div className="p-5 rounded-2xl bg-[#0a121f] border border-cyan-500/40 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3>Gemini 3.8 Flash AI Model Provenance & Transparency</h3>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              GOVERNANCE COMPLIANT
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono text-slate-300 leading-relaxed">
            <p>
              AirSense India leverages <strong className="text-white">Gemini 3.8 Flash</strong> through secure server-side execution. The model processes citizen testimonies, multi-spectral image pixels, local meteorology, and nearby industrial zoning vectors.
            </p>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1.5">
              <div className="text-cyan-300 font-bold">Structured Schema Enforcement:</div>
              <div className="text-slate-400">
                • <code>eventDetected</code> (boolean) | <code>eventType</code> (Industrial, Open burning, Dust, Smoke, Traffic, Unknown)
              </div>
              <div className="text-slate-400">
                • <code>possibleSources</code> (probabilistic local micro-sources) | <code>confidence</code> (1-100 score)
              </div>
              <div className="text-slate-400">
                • <code>visualEvidence</code> (plume opacity, color spectrum) | <code>recommendedVerification</code> (regulatory SOP)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-amber-100">Scientific Attribution Disclaimer:</strong> Model inferences represent probabilistic hypotheses constructed to assist rapid environmental triage. They do not constitute formal judicial attribution or replace regulatory stack emissions audits.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-950/50 transition"
          >
            Save Configuration Changes
          </button>
        </div>
      </div>
    </div>
  );
};
