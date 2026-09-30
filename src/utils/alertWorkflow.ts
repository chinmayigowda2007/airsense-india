import { 
  PollutionEvent, 
  PollutionForecast, 
  AuthorityAlert, 
  AlertPriority, 
  AlertStatus 
} from '../types';

/**
 * Priority Mapping strictly required:
 * CRITICAL → P1 - EMERGENCY
 * HIGH → P2 - HIGH
 * MODERATE → P3 - MONITOR
 * LOW → P4 - INFORMATION
 */
export const mapSeverityToPriority = (severity: string): AlertPriority => {
  const s = (severity || '').toUpperCase().trim();
  if (s === 'CRITICAL' || s === 'P1') return 'P1 - EMERGENCY';
  if (s === 'HIGH' || s === 'P2') return 'P2 - HIGH';
  if (s === 'MODERATE' || s === 'P3') return 'P3 - MONITOR';
  return 'P4 - INFORMATION';
};

/**
 * Extract normalized short priority code (P1, P2, P3, P4)
 */
export const getPriorityCode = (priority: string): 'P1' | 'P2' | 'P3' | 'P4' => {
  if (!priority) return 'P3';
  const p = priority.toUpperCase();
  if (p.startsWith('P1')) return 'P1';
  if (p.startsWith('P2')) return 'P2';
  if (p.startsWith('P3')) return 'P3';
  return 'P4';
};

/**
 * Clean Forecast synthesis from PollutionEvent
 */
export const createForecastForEvent = (event: PollutionEvent): PollutionForecast => {
  const dispersionLength = event.impactCorridor?.lengthKm || 3.8;
  const dispersionWidth = event.impactCorridor?.widthKm || 1.4;
  const heading = event.ambientWind?.angleDeg ?? event.impactCorridor?.headingDeg ?? 315;
  const windSpeed = event.ambientWind?.speedKmh ?? 12;

  return {
    id: `FC-${event.id}`,
    eventId: event.id,
    city: event.city,
    state: event.state,
    generatedAt: new Date().toISOString(),
    windHeadingDeg: heading,
    windSpeedKmh: windSpeed,
    dispersionLengthKm: dispersionLength,
    dispersionWidthKm: dispersionWidth,
    forecastHours: 6,
    expectedAqiTraps: [
      { 
        hour: 1, 
        aqi: event.aqiSpikeEstimate || 320, 
        riskZone: `${event.ward} (Immediate Receptor Zone)` 
      },
      { 
        hour: 3, 
        aqi: Math.round((event.aqiSpikeEstimate || 320) * 0.82), 
        riskZone: `Downwind Corridor ${heading}° (${event.ambientWind?.direction || 'NW'})` 
      },
      { 
        hour: 6, 
        aqi: Math.round((event.aqiSpikeEstimate || 320) * 0.60), 
        riskZone: `Outer Atmospheric Dispersion Perimeter` 
      },
    ],
    isSimulated: event.isSimulated,
  };
};

/**
 * Clean Authority Alert synthesis from PollutionEvent + PollutionForecast
 * Follows exact required structure:
 * {
 *   id: unique ID,
 *   eventId: event.id,
 *   priority: derived from event.severity,
 *   title: event title,
 *   location: event location,
 *   eventType: event.eventType,
 *   confidence: event.confidence,
 *   potentialImpact: calculated/displayed from forecast if available,
 *   recommendedAction: appropriate verification/action text,
 *   status: "PENDING",
 *   createdAt: current timestamp,
 *   isSimulated: event.isSimulated
 * }
 */
export const createAlertForEvent = (
  event: PollutionEvent,
  forecast?: PollutionForecast
): AuthorityAlert => {
  const priority = mapSeverityToPriority(event.severity);
  const location = `${event.ward}, ${event.city}`;
  const now = new Date().toISOString();
  
  // Clean unique ID based on event id
  const rawId = event.id.replace(/^(AS|CR|ALT)-/g, '');
  const uniqueAlertId = `ALT-${rawId}-${Date.now().toString().slice(-4)}`;

  // Calculate potential impact from forecast & corridor
  const popStr = event.impactCorridor?.affectedPopulation
    ? `${(event.impactCorridor.affectedPopulation / 1000).toFixed(0)}K residents`
    : '65K residents';

  const sensitive = event.impactCorridor?.sensitiveInfrastructure || [];
  const sensitiveStr = sensitive.length > 0
    ? ` Threat to ${sensitive.map((s) => s.name).join(', ')}.`
    : '';

  const potentialImpact = forecast
    ? `${popStr} exposed across ${forecast.dispersionLengthKm}km plume corridor heading ${forecast.windHeadingDeg}° (${event.ambientWind?.direction || 'downwind'}).${sensitiveStr}`
    : `${popStr} in direct downwind receptor zone with localized AQI spike +${event.aqiSpikeEstimate || 290} µg/m³.${sensitiveStr}`;

  const recommendedAction = 
    event.actionSop ||
    (priority.startsWith('P1')
      ? 'Emergency dispatch: Mobilize regional task force, notify district administration, and activate mist bowsers.'
      : 'Issue stop-work/containment advisory and deploy mobile sensor surveillance squad within 2 hours.');

  return {
    id: uniqueAlertId,
    eventId: event.id,
    priority,
    title: event.title,
    event: event.title, // alias for backwards compatibility
    location,
    city: event.city,
    eventType: event.eventType || event.type,
    confidence: event.confidence ?? event.aiConfidence ?? 91,
    potentialImpact,
    recommendedAction,
    status: 'PENDING',
    createdAt: now,
    timestamp: 'Just now', // relative display alias
    isSimulated: event.isSimulated,
  };
};

/**
 * Normalized status checkers
 */
export const isAlertResolved = (status: string | undefined): boolean => {
  if (!status) return false;
  const s = status.toUpperCase();
  return s === 'RESOLVED';
};

export const isAlertAcknowledged = (status: string | undefined): boolean => {
  if (!status) return false;
  const s = status.toUpperCase();
  return s === 'ACKNOWLEDGED' || s === 'INVESTIGATING' || s === 'DISPATCHED';
};

export const isAlertPending = (status: string | undefined): boolean => {
  if (!status) return true;
  const s = status.toUpperCase();
  return s === 'PENDING';
};
