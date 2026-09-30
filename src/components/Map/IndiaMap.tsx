import React, { useState, useEffect, useMemo } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow,
  useMap,
  useApiLoadingStatus,
  APILoadingStatus 
} from '@vis.gl/react-google-maps';
import { PollutionEvent, PollutionSeverity } from '../../types';
import { 
  AlertTriangle, 
  Wind, 
  Users, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';

export interface CitizenMapReport {
  id: string;
  eventId: string;
  reporterAlias: string;
  timestamp: string;
  comment: string;
  imageUrl?: string;
  perceivedSeverity: PollutionSeverity;
  verifiedCitizen: boolean;
  latitude: number;
  longitude: number;
  locationName: string;
  pollutionType: string;
  aiAnalysisStatus: 'Verified by AI' | 'Correlated with CAAQMS' | 'Pending Review';
  isSimulated: boolean;
}

interface IndiaMapProps {
  events: PollutionEvent[];
  selectedEventId?: string;
  onSelectEvent: (event: PollutionEvent) => void;
  showCorridors?: boolean;
  activeLayers?: {
    wind: boolean;
    thermal: boolean;
    sensitive: boolean;
    satelliteGrid: boolean;
    clusters: boolean;
  };
  forecastStep?: 'now' | '+1h' | '+3h' | '+6h';
  height?: string;
  interactive?: boolean;
  onInvestigateEvent?: (event: PollutionEvent) => void;
}

// Center of India and default zoom
const INDIA_CENTER = { lat: 21.7679, lng: 78.8718 };
const DEFAULT_ZOOM = 5;

// Severity helper
export const getSeverityColorHex = (severity: string): string => {
  const s = (severity || '').toUpperCase();
  switch (s) {
    case 'CRITICAL':
      return '#ef4444'; // Red
    case 'HIGH':
      return '#f97316'; // Orange
    case 'MODERATE':
      return '#f59e0b'; // Amber
    case 'LOW':
    default:
      return '#eab308'; // Yellow
  }
};

export const normalizeSeverity = (severity: string): 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' => {
  const s = (severity || '').toUpperCase();
  if (s === 'CRITICAL') return 'CRITICAL';
  if (s === 'HIGH') return 'HIGH';
  if (s === 'MODERATE') return 'MODERATE';
  return 'LOW';
};

// Sub-component for Google Maps Polylines & Polygons (Dispersion trajectory & plume cone)
interface ForecastDispersionOverlayProps {
  selectedEvent: PollutionEvent | undefined;
  forecastStep?: 'now' | '+1h' | '+3h' | '+6h';
  showCorridors?: boolean;
}

const ForecastDispersionOverlay: React.FC<ForecastDispersionOverlayProps> = ({
  selectedEvent,
  forecastStep = 'now',
  showCorridors = true,
}) => {
  const map = useMap();
  const polygonRef = React.useRef<google.maps.Polygon | null>(null);
  const polylineRef = React.useRef<google.maps.Polyline | null>(null);
  const receptorMarkersRef = React.useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    // Cleanup previous shapes
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    receptorMarkersRef.current.forEach((m) => m.setMap(null));
    receptorMarkersRef.current = [];

    if (!map || !selectedEvent || !showCorridors) return;

    const lat = selectedEvent.latitude ?? selectedEvent.coordinates?.lat;
    const lng = selectedEvent.longitude ?? selectedEvent.coordinates?.lng;
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return;
    }

    const factor = forecastStep === 'now' ? 1.0 : forecastStep === '+1h' ? 1.4 : forecastStep === '+3h' ? 2.1 : 3.2;
    const corridorLengthKm = (selectedEvent.impactCorridor?.lengthKm || 4.0) * factor;
    const corridorWidthKm = (selectedEvent.impactCorridor?.widthKm || 1.5) * Math.sqrt(factor);
    const headingDeg = selectedEvent.impactCorridor?.headingDeg ?? selectedEvent.ambientWind?.angleDeg ?? 135;

    const radHeading = (headingDeg * Math.PI) / 180;
    const dLat = (corridorLengthKm / 111) * Math.cos(radHeading);
    const dLng = (corridorLengthKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(radHeading);
    const endPoint = { lat: lat + dLat, lng: lng + dLng };

    const perpHeading = radHeading + Math.PI / 2;
    const halfWidthKm = corridorWidthKm / 2;
    const perpDLat = (halfWidthKm / 111) * Math.cos(perpHeading);
    const perpDLng = (halfWidthKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(perpHeading);

    const leftCorner = { lat: endPoint.lat + perpDLat, lng: endPoint.lng + perpDLng };
    const rightCorner = { lat: endPoint.lat - perpDLat, lng: endPoint.lng - perpDLng };
    const color = getSeverityColorHex(selectedEvent.severity);

    // 1. Dispersion Polygon (Affected Plume Cone)
    const plumePolygon = new google.maps.Polygon({
      paths: [{ lat, lng }, leftCorner, endPoint, rightCorner],
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 1.5,
      fillColor: color,
      fillOpacity: 0.18,
      map,
      clickable: false,
    });
    polygonRef.current = plumePolygon;

    // 2. Trajectory Central Line
    const trajectoryLine = new google.maps.Polyline({
      path: [{ lat, lng }, endPoint],
      geodesic: true,
      strokeColor: '#38bdf8',
      strokeOpacity: 0.85,
      strokeWeight: 2,
      map,
      clickable: false,
    });
    polylineRef.current = trajectoryLine;

    // 3. Sensitive Receptors / Infrastructure within affected corridor
    if (selectedEvent.impactCorridor?.sensitiveInfrastructure?.length) {
      selectedEvent.impactCorridor.sensitiveInfrastructure.forEach((sens, idx) => {
        const offsetDist = sens.distanceKm || 1.2;
        const sensAngle = radHeading + (idx % 2 === 0 ? 0.35 : -0.35);
        const sLat = lat + (offsetDist / 111) * Math.cos(sensAngle);
        const sLng = lng + (offsetDist / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(sensAngle);

        const receptorMarker = new google.maps.Marker({
          position: { lat: sLat, lng: sLng },
          map,
          title: `${sens.name} (${sens.type}, ${sens.distanceKm}km)`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 4,
            fillColor: '#818cf8',
            fillOpacity: 0.9,
            strokeColor: '#090f19',
            strokeWeight: 1,
          },
        });
        receptorMarkersRef.current.push(receptorMarker);
      });
    }

    return () => {
      if (polygonRef.current) polygonRef.current.setMap(null);
      if (polylineRef.current) polylineRef.current.setMap(null);
      receptorMarkersRef.current.forEach((m) => m.setMap(null));
      receptorMarkersRef.current = [];
    };
  }, [map, selectedEvent, forecastStep, showCorridors]);

  return null;
};

// Map Controller for Center / Recenter
const MapRecenterController: React.FC<{
  targetCoords?: { lat: number; lng: number } | null;
  triggerReset?: number;
}> = ({ targetCoords, triggerReset }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (triggerReset) {
      map.setCenter(INDIA_CENTER);
      map.setZoom(DEFAULT_ZOOM);
    }
  }, [map, triggerReset]);

  useEffect(() => {
    if (!map || !targetCoords) return;
    if (
      typeof targetCoords.lat === 'number' && 
      typeof targetCoords.lng === 'number' && 
      !isNaN(targetCoords.lat) && 
      !isNaN(targetCoords.lng)
    ) {
      map.panTo(targetCoords);
      const currentZoom = map.getZoom() || DEFAULT_ZOOM;
      if (currentZoom < 7) {
        map.setZoom(8);
      }
    }
  }, [map, targetCoords]);

  return null;
};

// Internal diagnostics monitor inside the APIProvider
const MapLoadingDiagnostic: React.FC<{
  apiKey: string;
  onStatusChange?: (status: APILoadingStatus) => void;
}> = ({ apiKey, onStatusChange }) => {
  const status = useApiLoadingStatus();

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="absolute inset-0 z-40 bg-[#060a12]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-slate-200">
        <div className="p-5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-300 max-w-lg shadow-2xl flex flex-col items-center">
          <AlertTriangle className="w-10 h-10 mb-3 text-red-400" />
          <h3 className="text-sm font-bold font-mono tracking-wider text-red-200">
            Google Maps API Loading Error: {status}
          </h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            The Google Maps JavaScript API script failed authentication or rejected the request.
          </p>
          <div className="mt-3 w-full bg-slate-950/90 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-left space-y-1 text-slate-400">
            <div><span className="text-slate-500">API Key:</span> <span className="text-cyan-300">{apiKey ? `${apiKey.slice(0, 10)}...${apiKey.slice(-4)}` : 'MISSING'}</span></div>
            <div><span className="text-slate-500">Loader Status:</span> <span className="text-red-400 font-bold">{status}</span></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export const IndiaMap: React.FC<IndiaMapProps> = ({
  events = [],
  selectedEventId,
  onSelectEvent,
  showCorridors = true,
  forecastStep = 'now',
  height = 'h-full min-h-[500px]',
  interactive = true,
  onInvestigateEvent,
}) => {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  const [selectedMarkerEvent, setSelectedMarkerEvent] = useState<PollutionEvent | null>(null);
  const [selectedCitizenReport, setSelectedCitizenReport] = useState<CitizenMapReport | null>(null);
  const [showCitizenReports, setShowCitizenReports] = useState<boolean>(true);
  const [showDispersionForecast, setShowDispersionForecast] = useState<boolean>(showCorridors);
  const [recenterCount, setRecenterCount] = useState<number>(0);
  const [activeLayerFilter, setActiveLayerFilter] = useState<'ALL' | 'CRITICAL_HIGH' | 'OPEN_BURNING' | 'INDUSTRIAL'>('ALL');
  
  // Real-time diagnostic state
  const [, setApiLoadStatus] = useState<APILoadingStatus>(APILoadingStatus.NOT_LOADED);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [authFailureDetected, setAuthFailureDetected] = useState<boolean>(false);
  const [windowErrorDetected, setWindowErrorDetected] = useState<string | null>(null);

  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.error('Google Maps JavaScript API authFailure');
      setAuthFailureDetected(true);
    };

    const handleWindowError = (e: ErrorEvent) => {
      if (e.message && (e.message.includes('Google Maps') || e.message.includes('google.maps'))) {
        setWindowErrorDetected(e.message);
      }
    };

    window.addEventListener('error', handleWindowError);
    return () => {
      window.removeEventListener('error', handleWindowError);
    };
  }, []);

  // Currently focused event
  const currentEvent = useMemo(() => {
    if (selectedEventId) {
      return events.find((e) => e.id === selectedEventId);
    }
    return events[0] || null;
  }, [events, selectedEventId]);

  // Extract citizen reports from events with synthetic coordinates offset for clear map visualization
  const citizenReports: CitizenMapReport[] = useMemo(() => {
    const list: CitizenMapReport[] = [];
    events.forEach((ev) => {
      const baseLat = ev.latitude ?? ev.coordinates?.lat;
      const baseLng = ev.longitude ?? ev.coordinates?.lng;
      if (typeof baseLat !== 'number' || typeof baseLng !== 'number') return;

      if (ev.citizenReports && ev.citizenReports.length > 0) {
        ev.citizenReports.forEach((cr, idx) => {
          const angle = (idx * 1.8 + 0.6);
          const dist = 0.012 + (idx * 0.008);
          const cLat = baseLat + Math.cos(angle) * dist;
          const cLng = baseLng + Math.sin(angle) * dist;

          list.push({
            id: cr.id || `CR-${ev.id}-${idx}`,
            eventId: ev.id,
            reporterAlias: cr.reporterAlias || 'Citizen Observer',
            timestamp: cr.timestamp || '20m ago',
            comment: cr.comment || 'Smoke and particulate anomaly observed.',
            imageUrl: cr.imageUrl,
            perceivedSeverity: cr.perceivedSeverity || ev.severity,
            verifiedCitizen: cr.verifiedCitizen ?? true,
            latitude: cLat,
            longitude: cLng,
            locationName: `${ev.ward || ev.city} Sector ${idx + 1}`,
            pollutionType: ev.eventType || ev.type,
            aiAnalysisStatus: idx === 0 ? 'Verified by AI' : 'Correlated with CAAQMS',
            isSimulated: ev.isSimulated ?? true,
          });
        });
      }
    });
    return list;
  }, [events]);

  // Filter events based on tactical filter
  const displayedEvents = useMemo(() => {
    return events.filter((ev) => {
      const lat = ev.latitude ?? ev.coordinates?.lat;
      const lng = ev.longitude ?? ev.coordinates?.lng;
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        return false;
      }
      if (activeLayerFilter === 'CRITICAL_HIGH') {
        return ev.severity === 'Critical' || ev.severity === 'High';
      }
      if (activeLayerFilter === 'OPEN_BURNING') {
        return ev.eventType === 'Open burning' || ev.type === 'Open burning';
      }
      if (activeLayerFilter === 'INDUSTRIAL') {
        return ev.eventType === 'Industrial emission' || ev.type === 'Industrial emission';
      }
      return true;
    });
  }, [events, activeLayerFilter]);

  useEffect(() => {
    if (selectedEventId) {
      const found = events.find((e) => e.id === selectedEventId);
      if (found) {
        setSelectedMarkerEvent(found);
      }
    }
  }, [selectedEventId, events]);

  const handleMarkerClick = (ev: PollutionEvent) => {
    setSelectedMarkerEvent(ev);
    setSelectedCitizenReport(null);
    onSelectEvent(ev);
  };

  const handleCitizenReportClick = (cr: CitizenMapReport) => {
    setSelectedCitizenReport(cr);
    const parentEvent = events.find((e) => e.id === cr.eventId);
    if (parentEvent) {
      setSelectedMarkerEvent(parentEvent);
      onSelectEvent(parentEvent);
    }
  };

  if (!apiKey) {
    return (
      <div className={`relative w-full ${height} bg-[#060a12] border border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 text-center text-slate-200`}>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 max-w-md flex flex-col items-center">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <h3 className="text-sm font-semibold">Google Maps API Key Not Configured</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Please configure <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[11px]">VITE_GOOGLE_MAPS_API_KEY</code> in your environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${height} bg-[#060a12] rounded-xl overflow-hidden select-none flex flex-col`}>
      {/* Discreet Map Controls & Status (Top) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#0a121e]/90 border border-slate-800/80 backdrop-blur-md text-[11px] font-mono text-slate-300 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="font-semibold text-white">{displayedEvents.length} Hotspots</span>
          {showCitizenReports && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{citizenReports.length} Reports</span>
            </>
          )}
        </div>
      </div>

      {/* Top Right Discreet Quick Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5">
        <div className="flex items-center bg-[#0a121e]/90 border border-slate-800/80 rounded-md p-1 space-x-1 shadow-sm backdrop-blur-md">
          <button
            onClick={() => setShowCitizenReports(!showCitizenReports)}
            title="Toggle Citizen Reports"
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-1 ${
              showCitizenReports 
                ? 'bg-amber-500/15 text-amber-300 font-medium' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">Citizen Reports</span>
          </button>

          <button
            onClick={() => setShowDispersionForecast(!showDispersionForecast)}
            title="Toggle Dispersion Overlay"
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-1 ${
              showDispersionForecast 
                ? 'bg-cyan-500/15 text-cyan-300 font-medium' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3 h-3" />
            <span className="hidden sm:inline">Forecast Plume</span>
          </button>

          <select
            value={activeLayerFilter}
            onChange={(e) => setActiveLayerFilter(e.target.value as any)}
            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="CRITICAL_HIGH">Critical / High</option>
            <option value="OPEN_BURNING">Open Burning</option>
            <option value="INDUSTRIAL">Industrial Emission</option>
          </select>

          <button
            onClick={() => setRecenterCount((c) => c + 1)}
            title="Recenter Map"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Diagnostic Warning if needed */}
      {(authFailureDetected || apiErrorMessage || windowErrorDetected) && (
        <div className="absolute top-12 left-3 right-3 z-30 p-2.5 rounded-lg bg-red-950/90 border border-red-500/50 text-red-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>Map Notice: {authFailureDetected ? 'Key authentication failed' : (apiErrorMessage || windowErrorDetected)}</span>
          </div>
          <button 
            onClick={() => { setAuthFailureDetected(false); setApiErrorMessage(null); setWindowErrorDetected(null); }}
            className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Real Interactive Google Map */}
      <div className="flex-1 w-full h-full relative">
        <APIProvider 
          apiKey={apiKey}
          onError={(err: unknown) => {
            setApiErrorMessage(err instanceof Error ? err.message : String(err));
          }}
          onLoad={() => {
            setApiErrorMessage(null);
          }}
        >
          <MapLoadingDiagnostic apiKey={apiKey} onStatusChange={setApiLoadStatus} />

          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={INDIA_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            gestureHandling={interactive ? 'auto' : 'none'}
            disableDefaultUI={false}
            zoomControl={interactive}
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
            className="w-full h-full"
          >
            {/* Recenter controller */}
            <MapRecenterController
              triggerReset={recenterCount}
              targetCoords={
                currentEvent
                  ? {
                      lat: currentEvent.latitude ?? currentEvent.coordinates?.lat,
                      lng: currentEvent.longitude ?? currentEvent.coordinates?.lng,
                    }
                  : null
              }
            />

            {/* Simulated Forecast Trajectory & Dispersion Plume Cone */}
            {showDispersionForecast && (
              <ForecastDispersionOverlay
                selectedEvent={currentEvent}
                forecastStep={forecastStep}
                showCorridors={showDispersionForecast}
              />
            )}

            {/* Pollution Event Markers */}
            {displayedEvents.map((ev) => {
              const lat = ev.latitude ?? ev.coordinates?.lat;
              const lng = ev.longitude ?? ev.coordinates?.lng;
              if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
                return null;
              }

              const isSelected = selectedEventId === ev.id;
              const color = getSeverityColorHex(ev.severity);

              return (
                <AdvancedMarker
                  key={`event-marker-${ev.id}`}
                  position={{ lat, lng }}
                  onClick={() => handleMarkerClick(ev)}
                  title={`${ev.title} (${ev.severity})`}
                >
                  <div className="relative group cursor-pointer transition-transform duration-150 hover:scale-110">
                    <div
                      className={`relative flex items-center justify-center rounded-full shadow-md ${
                        isSelected 
                          ? 'w-7 h-7 ring-2 ring-cyan-400 ring-offset-1 ring-offset-[#060a12]' 
                          : 'w-5 h-5'
                      }`}
                      style={{
                        backgroundColor: '#090f1a',
                        border: `2px solid ${color}`,
                      }}
                    >
                      <span
                        className="rounded-full"
                        style={{
                          width: isSelected ? '8px' : '6px',
                          height: isSelected ? '8px' : '6px',
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Citizen Report Markers */}
            {showCitizenReports && citizenReports.map((cr) => {
              const isSelected = selectedCitizenReport?.id === cr.id;
              return (
                <AdvancedMarker
                  key={`citizen-report-${cr.id}`}
                  position={{ lat: cr.latitude, lng: cr.longitude }}
                  onClick={() => handleCitizenReportClick(cr)}
                  title={`Citizen Report: ${cr.reporterAlias}`}
                >
                  <div className="relative group cursor-pointer transition-transform duration-150 hover:scale-110">
                    <div 
                      className={`w-4 h-4 rounded-full flex items-center justify-center shadow-md ${
                        isSelected ? 'bg-amber-400 border border-white' : 'bg-amber-500/90 border border-amber-300'
                      }`}
                    >
                      <Users className="w-2 h-2 text-black" />
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Compact InfoWindow for Clicked Event */}
            {selectedMarkerEvent && (
              <InfoWindow
                position={{
                  lat: selectedMarkerEvent.latitude ?? selectedMarkerEvent.coordinates?.lat,
                  lng: selectedMarkerEvent.longitude ?? selectedMarkerEvent.coordinates?.lng,
                }}
                onCloseClick={() => setSelectedMarkerEvent(null)}
                headerContent={
                  <div className="flex items-center justify-between w-full pr-3 text-xs font-mono font-semibold">
                    <span className="text-white">{selectedMarkerEvent.id}</span>
                    <span 
                      className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold"
                      style={{
                        backgroundColor: `${getSeverityColorHex(selectedMarkerEvent.severity)}20`,
                        color: getSeverityColorHex(selectedMarkerEvent.severity),
                      }}
                    >
                      {selectedMarkerEvent.severity}
                    </span>
                  </div>
                }
              >
                <div className="max-w-[240px] p-1 font-sans text-slate-100 text-xs">
                  <div className="font-semibold text-xs text-white leading-tight">
                    {selectedMarkerEvent.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {selectedMarkerEvent.ward || selectedMarkerEvent.city}
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-2 py-1.5 border-y border-slate-800 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block">AI CONFIDENCE</span>
                      <span className="text-emerald-400 font-semibold">
                        {selectedMarkerEvent.confidence ?? selectedMarkerEvent.aiConfidence}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">STATUS</span>
                      <span className="text-slate-300 font-semibold">{selectedMarkerEvent.status}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectEvent(selectedMarkerEvent);
                      if (onInvestigateEvent) {
                        onInvestigateEvent(selectedMarkerEvent);
                      }
                    }}
                    className="w-full py-1.5 px-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-200" />
                    <span>Investigate</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </InfoWindow>
            )}

            {/* InfoWindow for Clicked Citizen Report */}
            {selectedCitizenReport && (
              <InfoWindow
                position={{
                  lat: selectedCitizenReport.latitude,
                  lng: selectedCitizenReport.longitude,
                }}
                onCloseClick={() => setSelectedCitizenReport(null)}
                headerContent={
                  <div className="flex items-center justify-between w-full pr-3 text-xs font-mono font-medium text-amber-400">
                    <span>Citizen Report</span>
                    <span className="text-[10px] text-slate-400">{selectedCitizenReport.timestamp}</span>
                  </div>
                }
              >
                <div className="max-w-[230px] p-1 font-sans text-slate-100 text-xs">
                  <div className="font-medium text-white text-[11px]">
                    {selectedCitizenReport.reporterAlias}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {selectedCitizenReport.locationName}
                  </div>
                  <p className="mt-1.5 text-slate-300 text-[11px] bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    "{selectedCitizenReport.comment}"
                  </p>
                  <div className="mt-1.5 text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>STATUS:</span>
                    <span className="text-emerald-400">{selectedCitizenReport.aiAnalysisStatus}</span>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Unobtrusive, Single Horizontal Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0a121e]/90 border border-slate-800/80 text-[10px] font-mono backdrop-blur-md text-slate-400 shadow-sm">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 font-semibold">SEVERITY:</span>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-300">Critical</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-slate-300">High</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-300">Mod</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-slate-300">Low</span>
          </div>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          <span>Report</span>
        </div>

        <div className="flex items-center space-x-1">
          <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
          <span>Plume</span>
        </div>

        <span className="text-slate-700">|</span>

        <span className="text-slate-500">SIMULATED FORECAST</span>
      </div>
    </div>
  );
};
