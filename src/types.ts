export type PollutionSeverity = 
  | 'Low' 
  | 'Moderate' 
  | 'High' 
  | 'Critical' 
  | 'LOW' 
  | 'MODERATE' 
  | 'HIGH' 
  | 'CRITICAL';

export type PollutionType =
  | 'Industrial emission'
  | 'Open burning'
  | 'Dust event'
  | 'Smoke event'
  | 'Traffic-related pollution'
  | 'Unknown source';

export type EventStatus =
  | 'Active'
  | 'Under Investigation'
  | 'Dispatched'
  | 'Acknowledged'
  | 'Resolved';

export type AlertPriority = 
  | 'P1 - EMERGENCY'
  | 'P2 - HIGH'
  | 'P3 - MONITOR'
  | 'P4 - INFORMATION'
  | 'P1'
  | 'P2'
  | 'P3'
  | 'P4';

export type AlertStatus =
  | 'PENDING'
  | 'ACKNOWLEDGED'
  | 'RESOLVED'
  | 'Pending'
  | 'Acknowledged'
  | 'Investigating'
  | 'Dispatched'
  | 'Resolved';

export interface SensitiveInfrastructure {
  name: string;
  type: 'hospital' | 'school' | 'residential' | 'lake' | 'transport';
  distanceKm: number;
}

export interface CitizenReportSummary {
  id: string;
  reporterAlias: string;
  timestamp: string;
  comment: string;
  imageUrl?: string;
  perceivedSeverity: PollutionSeverity;
  verifiedCitizen: boolean;
}

/**
 * Clean central data model for citizen reports
 */
export interface CitizenReport {
  id: string;
  reporterAlias: string;
  timestamp: string;
  comment: string;
  imageUrl?: string;
  videoUrl?: string;
  perceivedSeverity: PollutionSeverity;
  verifiedCitizen: boolean;
  location: string;
  city: string;
  state: string;
  language?: string;
  isSimulated?: boolean;
}

export interface EnvironmentalSignals {
  cpcbMonitor: string;
  pm25: number; // in µg/m³
  pm10: number; // in µg/m³
  no2?: number;
  so2?: number;
  satelliteThermalAnomalies: number; // count of FIRMS pixels
  boundaryLayerHeightM: number;
  relativeHumidity: number;
  isSimulated?: boolean;
}

export interface ImpactCorridor {
  headingDeg: number; // wind angle in degrees
  lengthKm: number;
  widthKm: number;
  affectedPopulation: number;
  sensitiveInfrastructure: SensitiveInfrastructure[];
}

export interface TimelineEvent {
  time: string;
  title: string;
  detail: string;
  source: 'citizen' | 'satellite' | 'sensor' | 'ai' | 'authority';
}

/**
 * Clean central data model for pollution events
 * Each event strictly contains:
 * id, timestamp, latitude, longitude, city, state, eventType, severity,
 * confidence, sourceHypothesis, reportCount, status, isSimulated.
 */
export interface PollutionEvent {
  // Required core model fields
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  eventType: PollutionType;
  severity: PollutionSeverity;
  confidence: number;
  sourceHypothesis: string;
  reportCount: number;
  status: EventStatus;
  isSimulated: boolean;

  // Backwards-compatible aliases and operational telemetry used across UI
  title: string;
  ward: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: PollutionType; // Synced with eventType
  aiConfidence: number; // Synced with confidence
  citizenReportsCount: number; // Synced with reportCount
  detectedAt: string;
  timeElapsed: string;
  possibleSources: string[];
  visualEvidence: string;
  aqiSpikeEstimate: number;
  ambientWind: {
    speedKmh: number;
    direction: string;
    angleDeg: number;
  };
  citizenReports: CitizenReportSummary[];
  environmentalSignals: EnvironmentalSignals;
  impactCorridor: ImpactCorridor;
  priority: AlertPriority;
  timeline: TimelineEvent[];
  imageUrl: string;
  actionSop: string;
}

/**
 * Clean central data model for pollution forecasts
 */
export interface PollutionForecast {
  id: string;
  eventId: string;
  city: string;
  state: string;
  generatedAt: string;
  windHeadingDeg: number;
  windSpeedKmh: number;
  dispersionLengthKm: number;
  dispersionWidthKm: number;
  forecastHours: number;
  expectedAqiTraps: {
    hour: number;
    aqi: number;
    riskZone: string;
  }[];
  isSimulated: boolean;
}

/**
 * Clean central data model for authority alerts
 */
export interface AuthorityAlert {
  id: string;
  eventId: string;
  priority: AlertPriority;
  title: string;
  location: string;
  eventType: PollutionType;
  confidence: number;
  potentialImpact: string;
  recommendedAction: string;
  status: AlertStatus;
  createdAt: string;
  isSimulated: boolean;

  // Backwards-compatible aliases
  city?: string;
  event?: string;
  timestamp?: string;
}

export interface AIAnalysisResult {
  eventDetected: boolean;
  eventType: PollutionType;
  visualEvidence: string;
  possibleSources: string[];
  severity: PollutionSeverity;
  confidence: number;
  recommendedVerification: string;
}

export interface FilterState {
  state: string;
  eventType: string;
  severity: string;
  timeRange: string;
  searchQuery: string;
}

export type SimulationPhase = 
  | 'idle'
  | 'citizen_report'
  | 'image_analysis'
  | 'gemini_assessment'
  | 'event_created'
  | 'hotspot_map'
  | 'environmental_evidence'
  | 'movement_corridor'
  | 'authority_alert'
  | 'complete';

export interface SimulationState {
  isActive: boolean;
  phase: SimulationPhase;
  phaseIndex: number; // 1 to 8
  elapsedSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  simulatedEvent?: PollutionEvent;
  simulatedAlert?: AuthorityAlert;
}
