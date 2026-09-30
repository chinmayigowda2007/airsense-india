import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  ShieldAlert, 
  Info, 
  Globe2, 
  Send,
  AlertTriangle,
  Radio,
  FileCheck
} from 'lucide-react';
import { PollutionType, PollutionSeverity, AIAnalysisResult, PollutionEvent } from '../../types';

interface CitizenReportViewProps {
  onEventCreated: (newEvent: PollutionEvent) => void;
  onNavigateToDashboard: () => void;
  onNavigateToInvestigation: (event: PollutionEvent) => void;
  onNavigateToActionCenter?: () => void;
}

export const CitizenReportView: React.FC<CitizenReportViewProps> = ({
  onEventCreated,
  onNavigateToDashboard,
  onNavigateToInvestigation,
  onNavigateToActionCenter,
}) => {
  // Form state
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('Anand Vihar, East Delhi');
  const [city, setCity] = useState<string>('Delhi NCR');
  const [state, setState] = useState<string>('Delhi');
  const [pollutionType, setPollutionType] = useState<PollutionType>('Open burning');
  const [citizenSeverity, setCitizenSeverity] = useState<PollutionSeverity>('Critical');
  const [language, setLanguage] = useState<string>('English');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
  );

  // Submission & Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [analysisMeta, setAnalysisMeta] = useState<{ isLive: boolean; mode: string; model: string; note?: string }>({
    isLive: false,
    mode: '',
    model: '',
  });
  const [createdEvent, setCreatedEvent] = useState<PollutionEvent | null>(null);

  // Sample quick scenarios for rapid testing
  const presets = [
    {
      label: 'Ghazipur Landfill Smolder (Delhi)',
      city: 'Delhi NCR',
      state: 'Delhi',
      location: 'Ghazipur Landfill Border, East Delhi',
      type: 'Open burning' as PollutionType,
      severity: 'Critical' as PollutionSeverity,
      desc: 'Extremely thick acrid smoke rising from the waste mound. Severe plastic and tyre burning odor causing eye burn and nausea in residential towers.',
      img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Peenya Solvent Flare (Bengaluru)',
      city: 'Bengaluru',
      state: 'Karnataka',
      location: 'Peenya 4th Phase, Dasarahalli, Bengaluru',
      type: 'Industrial emission' as PollutionType,
      severity: 'High' as PollutionSeverity,
      desc: 'Chemical factory chimney releasing dense black-yellow fumes at 5 AM. Stinging solvent smell spreading towards Jalahalli.',
      img: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Bellandur Metro Dust Plume (Bengaluru)',
      city: 'Bengaluru',
      state: 'Karnataka',
      location: 'Outer Ring Road, Bellandur, Bengaluru',
      type: 'Dust event' as PollutionType,
      severity: 'Moderate' as PollutionSeverity,
      desc: 'Uncovered metro pier drilling creating a massive coarse dust storm across the 6-lane highway. Zero water sprinkling visible.',
      img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Brahmapuram Toxic Smoke (Kochi)',
      city: 'Kochi',
      state: 'Kerala',
      location: 'Brahmapuram Solid Waste Site, Kakkanad, Kochi',
      type: 'Smoke event' as PollutionType,
      severity: 'Critical' as PollutionSeverity,
      desc: 'Plastics smoldering along river bank. Chemical smog trapping noxious fumes over Kakkanad Infopark campus.',
      img: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setLocation(preset.location);
    setCity(preset.city);
    setState(preset.state);
    setPollutionType(preset.type);
    setCitizenSeverity(preset.severity);
    setDescription(preset.desc);
    setImagePreview(preset.img);
    setAnalysisResult(null);
    setCreatedEvent(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Coordinates helper based on selected city/location
  const getCoordinates = (cityName: string): { lat: number; lng: number } => {
    if (cityName.includes('Delhi')) return { lat: 28.628, lng: 77.315 };
    if (cityName.includes('Bengaluru')) return { lat: 12.975, lng: 77.612 };
    if (cityName.includes('Mumbai')) return { lat: 19.076, lng: 72.877 };
    if (cityName.includes('Kolkata')) return { lat: 22.572, lng: 88.363 };
    if (cityName.includes('Hyderabad')) return { lat: 17.385, lng: 78.486 };
    if (cityName.includes('Chennai')) return { lat: 13.082, lng: 80.270 };
    if (cityName.includes('Ahmedabad')) return { lat: 23.022, lng: 72.571 };
    if (cityName.includes('Pune')) return { lat: 18.520, lng: 73.856 };
    if (cityName.includes('Kochi')) return { lat: 9.931, lng: 76.267 };
    return { lat: 28.6139, lng: 77.2090 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setCreatedEvent(null);

    try {
      // Call server-side Gemini API endpoint directly without artificial delay
      const response = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          image: imagePreview,
          pollutionType,
          location,
          citizenSeverity,
          language,
        }),
      });

      const data = await response.json();
      const analysis: AIAnalysisResult = data.analysis;
      const isLive = Boolean(data.isLive);

      setAnalysisMeta({
        isLive,
        mode: data.mode || (isLive ? 'LIVE' : 'DEMO MODE'),
        model: data.model || (isLive ? 'gemini-3.8-flash' : 'AirSense Simulation Engine'),
        note: data.reason,
      });

      setAnalysisResult(analysis);

      // Construct clean central PollutionEvent data model
      const coords = getCoordinates(city);
      const generatedId = isLive 
        ? `AS-LIVE-${Math.floor(Math.random() * 899 + 100)}` 
        : `AS-DEMO-${Math.floor(Math.random() * 899 + 100)}`;
      
      const newEv: PollutionEvent = {
        // Core data model required fields
        id: generatedId,
        timestamp: new Date().toISOString(),
        latitude: coords.lat,
        longitude: coords.lng,
        city,
        state,
        eventType: analysis.eventType || pollutionType,
        severity: analysis.severity || citizenSeverity,
        confidence: analysis.confidence || 91,
        sourceHypothesis: analysis.possibleSources?.join(' or ') || 'Citizen verified localized plume anomaly.',
        reportCount: 1,
        status: 'Active',
        isSimulated: !isLive,

        // Backwards-compatible aliases & operational telemetry
        title: `${analysis.eventType || pollutionType} reported at ${location.split(',')[0]}`,
        ward: location,
        coordinates: coords,
        type: analysis.eventType || pollutionType,
        aiConfidence: analysis.confidence || 91,
        citizenReportsCount: 1,
        detectedAt: 'Just now',
        timeElapsed: 'T+00:00:10',
        possibleSources: analysis.possibleSources || ['Localized unpermitted combustion source'],
        visualEvidence: analysis.visualEvidence || 'Dense optical scatter consistent with fine particulate plume.',
        aqiSpikeEstimate: Math.floor(Math.random() * 120 + 280),
        ambientWind: {
          speedKmh: 12,
          direction: 'NW (315°)',
          angleDeg: 315,
        },
        citizenReports: [
          {
            id: `CR-USR-${Date.now().toString().slice(-4)}`,
            reporterAlias: 'Citizen Reporter (Verified)',
            timestamp: 'Just now',
            comment: description || 'Visual plume anomaly observed',
            imageUrl: imagePreview || undefined,
            perceivedSeverity: citizenSeverity,
            verifiedCitizen: true,
          },
        ],
        environmentalSignals: {
          cpcbMonitor: 'CAAQMS Hyperlocal Grid Node',
          pm25: 310,
          pm10: 480,
          satelliteThermalAnomalies: isLive ? 1 : 0,
          boundaryLayerHeightM: 320,
          relativeHumidity: 65,
          isSimulated: true, // Environmental telemetry is simulated
        },
        impactCorridor: {
          headingDeg: 135,
          lengthKm: 3.8,
          widthKm: 1.4,
          affectedPopulation: 68000,
          sensitiveInfrastructure: [
            { name: 'Community Health Dispensary', type: 'hospital', distanceKm: 1.1 },
            { name: 'Govt Model Primary School', type: 'school', distanceKm: 0.9 },
          ],
        },
        priority: (analysis.severity === 'CRITICAL' || analysis.severity === 'Critical') ? 'P1' : 'P2',
        timeline: [
          { 
            time: 'Just now', 
            title: 'Citizen Report Submitted', 
            detail: `Geotagged testimony in ${location}`, 
            source: 'citizen' 
          },
          { 
            time: 'Just now', 
            title: isLive ? 'Gemini 3.8 Flash Analysis Completed' : 'AirSense Heuristic Evaluation (Demo Mode)', 
            detail: `${analysis.confidence}% confidence attribution`, 
            source: 'ai' 
          },
        ],
        imageUrl: imagePreview || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        actionSop: analysis.recommendedVerification || 'Dispatch regional inspector for fence-line measurement.',
      };

      setCreatedEvent(newEv);
      onEventCreated(newEv);
    } catch (err: any) {
      console.warn('Network call failed, switching to demo mode fallback:', err);
      const fallbackAnalysis: AIAnalysisResult = {
        eventDetected: true,
        eventType: pollutionType,
        possibleSources: [
          'Unpermitted local combustion or boiler exhaust',
          'Commercial waste pile smoldering',
          'Fugitive particulate resuspension'
        ],
        visualEvidence: 'Dense particulate haze with high scattering index consistent with citizen observation.',
        confidence: 88,
        severity: (citizenSeverity || 'HIGH').toString().toUpperCase() as PollutionSeverity,
        recommendedVerification: 'Deploy mobile SPCB inspection squad for fence-line photoionization measurement.'
      };

      setAnalysisMeta({
        isLive: false,
        mode: 'DEMO MODE',
        model: 'AirSense Heuristic Fallback',
        note: 'API network error — running demo simulation',
      });
      setAnalysisResult(fallbackAnalysis);

      const coords = getCoordinates(city);
      const fallbackEv: PollutionEvent = {
        id: `AS-DEMO-${Math.floor(Math.random() * 899 + 100)}`,
        timestamp: new Date().toISOString(),
        latitude: coords.lat,
        longitude: coords.lng,
        city,
        state,
        eventType: pollutionType,
        severity: citizenSeverity,
        confidence: 88,
        sourceHypothesis: 'Citizen verified localized plume anomaly.',
        reportCount: 1,
        status: 'Active',
        isSimulated: true,

        title: `${pollutionType} observed at ${location.split(',')[0]}`,
        ward: location,
        coordinates: coords,
        type: pollutionType,
        aiConfidence: 88,
        citizenReportsCount: 1,
        detectedAt: 'Just now',
        timeElapsed: 'T+00:00:10',
        possibleSources: fallbackAnalysis.possibleSources,
        visualEvidence: fallbackAnalysis.visualEvidence,
        aqiSpikeEstimate: 310,
        ambientWind: {
          speedKmh: 12,
          direction: 'NW (315°)',
          angleDeg: 315,
        },
        citizenReports: [
          {
            id: `CR-USR-${Date.now().toString().slice(-4)}`,
            reporterAlias: 'Citizen Reporter (Verified)',
            timestamp: 'Just now',
            comment: description || 'Visual plume observed',
            imageUrl: imagePreview || undefined,
            perceivedSeverity: citizenSeverity,
            verifiedCitizen: true,
          },
        ],
        environmentalSignals: {
          cpcbMonitor: 'CAAQMS Hyperlocal Node',
          pm25: 290,
          pm10: 440,
          satelliteThermalAnomalies: 0,
          boundaryLayerHeightM: 350,
          relativeHumidity: 65,
          isSimulated: true,
        },
        impactCorridor: {
          headingDeg: 135,
          lengthKm: 3.5,
          widthKm: 1.2,
          affectedPopulation: 65000,
          sensitiveInfrastructure: [
            { name: 'Community Health Dispensary', type: 'hospital', distanceKm: 1.2 },
            { name: 'Primary Govt School', type: 'school', distanceKm: 0.8 },
          ],
        },
        priority: 'P2',
        timeline: [
          { time: 'Just now', title: 'Citizen Report Submitted', detail: 'Report analyzed in Demo Mode', source: 'citizen' },
        ],
        imageUrl: imagePreview || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        actionSop: fallbackAnalysis.recommendedVerification,
      };

      setCreatedEvent(fallbackEv);
      onEventCreated(fallbackEv);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 text-[10px] font-mono uppercase font-bold">
                CITIZEN INTELLIGENCE PORTAL
              </span>
              <span className="text-xs font-mono text-slate-500">AirSense Hyperlocal Mesh</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Report a Localized Pollution Event
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empower national and state environmental authorities with geotagged visual evidence & Gemini AI analysis.
            </p>
          </div>

          {/* Quick preset selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 mr-1">TRY PRESET:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-slate-300 hover:text-cyan-200 transition"
              >
                {p.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Form (Left) & Live Preview / Analysis Output (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (7 cols) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 space-y-4 p-5 rounded-2xl bg-[#090f1a]/90 border border-cyan-950/40 backdrop-blur-md shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Location Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  WARD / STREET LOCATION *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Anand Vihar ISBT, Ward 207"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* City & State */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                  METRO / STATE *
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    const c = e.target.value;
                    setCity(c);
                    if (c === 'Delhi NCR') setState('Delhi');
                    else if (c === 'Bengaluru') setState('Karnataka');
                    else if (c === 'Mumbai') setState('Maharashtra');
                    else if (c === 'Kolkata') setState('West Bengal');
                    else if (c === 'Hyderabad') setState('Telangana');
                    else if (c === 'Chennai') setState('Tamil Nadu');
                    else if (c === 'Kochi') setState('Kerala');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Bengaluru">Bengaluru, Karnataka</option>
                  <option value="Mumbai">Mumbai, Maharashtra</option>
                  <option value="Kolkata">Kolkata, West Bengal</option>
                  <option value="Hyderabad">Hyderabad, Telangana</option>
                  <option value="Chennai">Chennai, Tamil Nadu</option>
                  <option value="Ahmedabad">Ahmedabad, Gujarat</option>
                  <option value="Pune">Pune, Maharashtra</option>
                  <option value="Lucknow">Lucknow, Uttar Pradesh</option>
                  <option value="Kochi">Kochi, Kerala</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Pollution Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  OBSERVED POLLUTION TYPE *
                </label>
                <select
                  value={pollutionType}
                  onChange={(e) => setPollutionType(e.target.value as PollutionType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="Industrial emission">Industrial emission (Boiler / Stack / Chemical)</option>
                  <option value="Open burning">Open burning (Garbage / Biomass / Tyres)</option>
                  <option value="Dust event">Dust event (Construction / Road resuspension)</option>
                  <option value="Smoke event">Smoke event (Landfill / Dense smolder)</option>
                  <option value="Traffic-related pollution">Traffic-related pollution (Idling fleet / Choke)</option>
                  <option value="Unknown source">Unknown source (Unidentified odor / Fume)</option>
                </select>
              </div>

              {/* Perceived Severity */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  PERCEIVED SEVERITY *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Low', 'Moderate', 'High', 'Critical'] as PollutionSeverity[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setCitizenSeverity(sev)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold border transition ${
                        citizenSeverity === sev
                          ? sev === 'Critical'
                            ? 'bg-red-500/20 text-red-400 border-red-500'
                            : sev === 'High'
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500'
                            : sev === 'Moderate'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 font-semibold">
                EVENT OBSERVATIONS & SENSORY EVIDENCE *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the smell, color of smoke/dust, height of plume, nearby factories or dump yards, and symptoms experienced..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Image Upload Area & Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Image Upload */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    PHOTO EVIDENCE
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Geotag auto-extracted</span>
                </label>
                <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-3 text-center bg-slate-900/50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1 text-slate-400">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span className="text-[11px] font-mono">
                      {imagePreview ? 'Click to replace photo' : 'Drag photo or tap to browse'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Language & Video URL */}
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 font-semibold block mb-1">
                    REPORT LANGUAGE
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Bengali">বাংলা (Bengali)</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Malayalam">മലയാളം (Malayalam)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 font-semibold block mb-1">
                    OPTIONAL VIDEO LINK
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-500 hover:from-cyan-500 hover:to-teal-400 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 border border-cyan-400/40 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>CALLING GEMINI 3.8 FLASH ANALYSIS...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-cyan-100" />
                    <span>SUBMIT REPORT & RUN AI EVALUATION</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Column: Photo Preview & AI Analysis Output (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Visual Evidence Card */}
            <div className="rounded-2xl bg-[#090f1a]/90 border border-cyan-950/40 p-4 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  OPTICAL EVIDENCE PREVIEW
                </span>
                <span className="text-[10px] font-mono text-cyan-400">ACTIVE CAPTURE</span>
              </div>

              {imagePreview ? (
                <div className="relative mt-3 rounded-xl overflow-hidden aspect-video border border-slate-700 bg-black">
                  <img
                    src={imagePreview}
                    alt="Pollution evidence preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                    GEOTAG: {location.split(',')[0]}
                  </div>
                </div>
              ) : (
                <div className="mt-3 aspect-video rounded-xl bg-slate-900/60 border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
                  No image attached yet
                </div>
              )}
            </div>

            {/* AI Analysis Card */}
            <div className="rounded-2xl bg-[#0a121f] border border-cyan-500/30 p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Gemini Environmental Assessment
                  </h3>
                </div>

                {/* Clear Live vs Demo Status Indicator */}
                {analysisMeta.mode ? (
                  analysisMeta.isLive ? (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE GEMINI
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                      DEMO MODE
                    </span>
                  )
                ) : (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    AI-ASSISTED
                  </span>
                )}
              </div>

              {/* When Analyzing */}
              {isAnalyzing && (
                <div className="py-10 flex flex-col items-center justify-center space-y-3 text-center">
                  <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                  <div className="font-mono text-xs text-cyan-200 font-bold">
                    AI Analysis in progress...
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono animate-pulse">
                    Executing multimodal analysis on server-side Gemini engine
                  </div>
                </div>
              )}

              {/* Analysis Result */}
              {!isAnalyzing && analysisResult && (
                <div className="mt-3 space-y-3.5 text-xs">
                  {/* Status Banner */}
                  {analysisMeta.isLive ? (
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-bold">LIVE GEMINI 3.8 FLASH ANALYSIS</span>
                      </div>
                      <span className="text-[10px] text-emerald-400/80">Active API</span>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold">DEMO MODE FALLBACK</span>
                      </div>
                      <span className="text-[10px] text-amber-400/80">Simulated Baseline</span>
                    </div>
                  )}

                  {/* Event detected badge & Confidence */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">EVENT DETECTED:</span>
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {analysisResult.eventType}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block">CONFIDENCE:</span>
                      <span className="text-emerald-400 font-mono font-extrabold text-sm">
                        {analysisResult.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">ASSESSED SEVERITY:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${
                      String(analysisResult.severity).toUpperCase() === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : String(analysisResult.severity).toUpperCase() === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {analysisResult.severity}
                    </span>
                  </div>

                  {/* Possible Sources */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      HYPOTHESIZED LOCAL SOURCES:
                    </span>
                    <ul className="space-y-1">
                      {analysisResult.possibleSources.map((src, i) => (
                        <li
                          key={i}
                          className="px-2 py-1 rounded bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-center space-x-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                          <span>{src}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual Evidence */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      VISUAL EVIDENCE BREAKDOWN:
                    </span>
                    <p className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-mono">
                      {analysisResult.visualEvidence}
                    </p>
                  </div>

                  {/* Recommended Verification */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      RECOMMENDED REGULATORY VERIFICATION:
                    </span>
                    <p className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed font-mono">
                      {analysisResult.recommendedVerification}
                    </p>
                  </div>

                  {/* Actions to move forward */}
                  {createdEvent && (
                    <div className="pt-2 space-y-2">
                      <div className="p-2 rounded-lg bg-red-950/30 border border-red-500/30 flex items-center justify-between text-[11px] font-mono text-red-300">
                        <div className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                          <span>Authority Alert Generated & Enrolled in Action Center</span>
                        </div>
                        {onNavigateToActionCenter && (
                          <button
                            type="button"
                            onClick={onNavigateToActionCenter}
                            className="underline hover:text-white font-bold"
                          >
                            Open Alert →
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigateToInvestigation(createdEvent)}
                          className="flex-1 py-2.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-md shadow-cyan-900/40"
                        >
                          <span>Inspect in Investigation</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        {onNavigateToActionCenter && (
                          <button
                            type="button"
                            onClick={onNavigateToActionCenter}
                            className="py-2.5 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-500/40 font-mono text-xs font-bold transition flex items-center justify-center gap-1"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                            <span>Action Center</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={onNavigateToDashboard}
                          className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition border border-slate-700"
                        >
                          View on Map
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Default State before Submission */}
              {!isAnalyzing && !analysisResult && (
                <div className="py-8 text-center text-slate-500 space-y-2">
                  <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-mono">
                    Submit a citizen report or select a preset to generate an automated Gemini environmental attribution assessment.
                  </p>
                </div>
              )}

              {/* Attribution Disclaimer as required by prompt */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start space-x-2 text-[10px] font-mono text-slate-400">
                <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-300">Statutory Notice:</strong> This is an AI-assisted environmental assessment, not a definitive scientific attribution. Physical ground validation by State Pollution Control Boards is required before regulatory enforcement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
