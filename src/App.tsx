import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { NationalDashboard } from './components/Dashboard/NationalDashboard';
import { CitizenReportView } from './components/Report/CitizenReportView';
import { InvestigationWorkspace } from './components/Investigation/InvestigationWorkspace';
import { ForecastView } from './components/Forecast/ForecastView';
import { ActionCenterView } from './components/ActionCenter/ActionCenterView';
import { SettingsView } from './components/SettingsView';
import { EventDetailModal } from './components/EventDetailModal';
import { DemoSimulationModal } from './components/DemoSimulationModal';
import { LiveSimulationController } from './components/Simulation/LiveSimulationController';
import { INITIAL_EVENTS, INITIAL_ALERTS } from './data/mockEvents';
import { PollutionEvent, AuthorityAlert, FilterState, SimulationState, PollutionForecast } from './types';
import { 
  createForecastForEvent, 
  createAlertForEvent, 
  isAlertResolved 
} from './utils/alertWorkflow';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [events, setEvents] = useState<PollutionEvent[]>(INITIAL_EVENTS);
  const [alerts, setAlerts] = useState<AuthorityAlert[]>(INITIAL_ALERTS);
  const [, setForecasts] = useState<PollutionForecast[]>(() =>
    INITIAL_EVENTS.map(createForecastForEvent)
  );
  const [selectedEventId, setSelectedEventId] = useState<string>('AS-DEL-01');
  const [modalEvent, setModalEvent] = useState<PollutionEvent | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Live Simulation Interactive State (30-45s demonstration flow)
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isActive: false,
    phase: 'idle',
    phaseIndex: 1,
    elapsedSeconds: 0,
    totalSeconds: 42,
    isPaused: false,
  });

  // Global search & filters
  const [filters, setFilters] = useState<FilterState>({
    state: 'ALL',
    eventType: 'ALL',
    severity: 'ALL',
    timeRange: '24H',
    searchQuery: '',
  });

  // Selected event object for workspace & forecast
  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Pending alerts count (real-time from shared state)
  const pendingAlertsCount = alerts.filter(
    (a) => !isAlertResolved(a.status)
  ).length;

  // Handler to start the interactive live simulation
  const handleStartSimulation = () => {
    setCurrentTab('dashboard');
    setSimulationState({
      isActive: true,
      phase: 'citizen_report',
      phaseIndex: 1,
      elapsedSeconds: 0,
      totalSeconds: 42,
      isPaused: false,
    });
  };

  const handleStopSimulation = () => {
    setSimulationState((prev) => ({
      ...prev,
      isActive: false,
      isPaused: true,
    }));
  };

  // Handler when user clicks an event on map or feed
  const handleSelectEvent = (event: PollutionEvent) => {
    setSelectedEventId(event.id);
    setModalEvent(event);
  };

  // Handler to jump straight into investigation
  const handleInvestigateEvent = (event: PollutionEvent) => {
    setSelectedEventId(event.id);
    setModalEvent(null);
    setCurrentTab('investigation');
  };

  // Handler to jump straight into forecast
  const handleForecastEvent = (event: PollutionEvent) => {
    setSelectedEventId(event.id);
    setModalEvent(null);
    setCurrentTab('forecast');
  };

  // REQUIRED DATA FLOW:
  // Citizen Report -> Gemini Analysis -> Create Event -> Create Forecast -> CREATE AUTHORITY ALERT -> Action Center
  const handleEventCreated = (newEvent: PollutionEvent) => {
    // 1. Create and store forecast
    const forecast = createForecastForEvent(newEvent);
    setForecasts((prev) => {
      if (prev.some((f) => f.eventId === newEvent.id)) return prev;
      return [forecast, ...prev];
    });

    // 2. Automatically create associated authority alert using exact event.id
    const newAlert = createAlertForEvent(newEvent, forecast);
    setAlerts((prev) => {
      // Prevent duplicate alert if the same event is re-rendered
      if (prev.some((a) => a.eventId === newEvent.id || a.id === newAlert.id)) {
        return prev;
      }
      return [newAlert, ...prev];
    });

    // 3. Store event in shared state
    setEvents((prev) => {
      if (prev.some((e) => e.id === newEvent.id)) return prev;
      return [newEvent, ...prev];
    });

    setSelectedEventId(newEvent.id);
  };

  // Handler when an alert is directly provided (e.g., from simulation controller)
  const handleAlertCreated = (newAlert: AuthorityAlert) => {
    setAlerts((prev) => {
      if (prev.some((a) => a.eventId === newAlert.eventId || a.id === newAlert.id)) return prev;
      return [newAlert, ...prev];
    });
  };

  // Handler to update alert status (Acknowledge, Investigate, Resolve)
  const handleUpdateAlertStatus = (
    alertId: string,
    newStatus: AuthorityAlert['status']
  ) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
    );

    // If resolved, also mark corresponding event status as resolved
    if (newStatus === 'RESOLVED' || newStatus === 'Resolved') {
      const targetAlert = alerts.find((a) => a.id === alertId);
      if (targetAlert) {
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === targetAlert.eventId ? { ...ev, status: 'Resolved' } : ev
          )
        );
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#060a12] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Application Header */}
      <Header
        onOpenDemo={handleStartSimulation}
        activeAlertCount={pendingAlertsCount}
        onNavigateToActionCenter={() => setCurrentTab('action_center')}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Compact Floating "LIVE SIMULATION" Indicator Bar (Active during 30-45s demonstration) */}
      {simulationState.isActive && (
        <LiveSimulationController
          simulationState={simulationState}
          onUpdateState={setSimulationState}
          onStopSimulation={handleStopSimulation}
          onEventCreated={handleEventCreated}
          onAlertCreated={handleAlertCreated}
          onInspectEvent={handleInvestigateEvent}
          onNavigateToActionCenter={() => setCurrentTab('action_center')}
          onNavigateToForecast={handleForecastEvent}
        />
      )}

      {/* Main Workspace Body: Sidebar + Active Screen */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          pendingAlertsCount={pendingAlertsCount}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#060a12] relative">
          {currentTab === 'dashboard' && (
            <NationalDashboard
              events={events}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
              onInvestigateEvent={handleInvestigateEvent}
              filters={filters}
              onFilterChange={setFilters}
            />
          )}

          {currentTab === 'report' && (
            <CitizenReportView
              onEventCreated={handleEventCreated}
              onNavigateToDashboard={() => setCurrentTab('dashboard')}
              onNavigateToInvestigation={handleInvestigateEvent}
              onNavigateToActionCenter={() => setCurrentTab('action_center')}
            />
          )}

          {currentTab === 'investigation' && (
            <InvestigationWorkspace
              events={events}
              selectedEvent={currentEvent}
              onSelectEvent={(ev) => setSelectedEventId(ev.id)}
              onNavigateToForecast={handleForecastEvent}
              onNavigateToActionCenter={() => setCurrentTab('action_center')}
            />
          )}

          {currentTab === 'forecast' && (
            <ForecastView
              events={events}
              selectedEvent={currentEvent}
              onSelectEvent={(ev) => setSelectedEventId(ev.id)}
              onNavigateToActionCenter={() => setCurrentTab('action_center')}
            />
          )}

          {currentTab === 'action_center' && (
            <ActionCenterView
              alerts={alerts}
              onUpdateAlertStatus={handleUpdateAlertStatus}
              onInvestigateEventId={(eventId) => {
                const target = events.find((e) => e.id === eventId);
                if (target) {
                  setSelectedEventId(target.id);
                  setCurrentTab('investigation');
                }
              }}
              events={events}
            />
          )}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Event Detail Modal (when clicking an event on map or feed) */}
      <EventDetailModal
        event={modalEvent}
        onClose={() => setModalEvent(null)}
        onInvestigate={handleInvestigateEvent}
        onForecast={handleForecastEvent}
      />

      {/* Optional Fullscreen Modal runner */}
      <DemoSimulationModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onEventCreated={handleEventCreated}
        onAlertCreated={handleAlertCreated}
        onNavigateToEvent={handleInvestigateEvent}
        onNavigateToActionCenter={() => {
          setIsDemoModalOpen(false);
          setCurrentTab('action_center');
        }}
      />
    </div>
  );
}
