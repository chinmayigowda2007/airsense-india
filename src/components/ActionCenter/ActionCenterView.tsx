import React, { useState } from 'react';
import { AuthorityAlert, PollutionEvent } from '../../types';
import { 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Send
} from 'lucide-react';
import { 
  getPriorityCode, 
  isAlertResolved, 
  isAlertAcknowledged, 
  isAlertPending 
} from '../../utils/alertWorkflow';

interface ActionCenterViewProps {
  alerts: AuthorityAlert[];
  onUpdateAlertStatus: (alertId: string, newStatus: AuthorityAlert['status']) => void;
  onInvestigateEventId: (eventId: string) => void;
  events: PollutionEvent[];
}

export const ActionCenterView: React.FC<ActionCenterViewProps> = ({
  alerts,
  onUpdateAlertStatus,
  onInvestigateEventId,
  events,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNotify = (alert: AuthorityAlert) => {
    showToast(`Advisory dispatched to ${alert.city || 'District'} Task Force.`);
    if (isAlertPending(alert.status)) {
      onUpdateAlertStatus(alert.id, 'ACKNOWLEDGED');
    }
  };

  const p1Count = alerts.filter(
    (a) => getPriorityCode(a.priority) === 'P1' && !isAlertResolved(a.status)
  ).length;

  const p2Count = alerts.filter(
    (a) => getPriorityCode(a.priority) === 'P2' && !isAlertResolved(a.status)
  ).length;

  const resolvedCount = alerts.filter(
    (a) => isAlertResolved(a.status)
  ).length;

  const filteredAlerts = alerts.filter((alt) => {
    if (filterPriority !== 'ALL') {
      const code = getPriorityCode(alt.priority);
      if (code !== filterPriority) return false;
    }
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'PENDING' && !isAlertPending(alt.status)) return false;
      if (filterStatus === 'ACKNOWLEDGED' && !isAlertAcknowledged(alt.status)) return false;
      if (filterStatus === 'RESOLVED' && !isAlertResolved(alt.status)) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 p-4 md:p-5 overflow-y-auto custom-scrollbar space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3 rounded-lg bg-slate-900 border border-cyan-400 text-white shadow-xl font-mono text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-[#090f1a] border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-500/15 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-white">
                Authority Action & Dispatch Center
              </h2>
              <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-red-950/70 text-red-300 border border-red-800/50">
                CPCB / SPCB PROTOCOL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              National operations queue for acute pollution spikes and regulatory dispatches.
            </p>
          </div>
        </div>

        {/* Priority Counters */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-2.5 py-1 rounded-md bg-red-950/40 border border-red-500/30 text-red-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>P1 Critical: {p1Count}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-orange-950/40 border border-orange-500/30 text-orange-300">
            <span>P2 High: {p2Count}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <span>Resolved: {resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="p-2.5 rounded-xl bg-[#090f1a] border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">PRIORITY:</span>
          {['ALL', 'P1', 'P2', 'P3'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-0.5 rounded transition ${
                filterPriority === p
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">STATUS:</span>
          {['ALL', 'PENDING', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-0.5 rounded transition ${
                filterStatus === st
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-mono text-xs rounded-xl bg-[#090f1a] border border-slate-800/80">
            No authority alerts found for current criteria.
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isResolved = isAlertResolved(alt.status);
            const isPending = isAlertPending(alt.status);
            const priorityCode = getPriorityCode(alt.priority);

            return (
              <div
                key={alt.id}
                className={`p-4 rounded-xl border transition-colors ${
                  priorityCode === 'P1'
                    ? 'bg-[#0b101a] border-red-500/30'
                    : 'bg-[#090f1a] border-slate-800/80'
                } ${isResolved ? 'opacity-65' : ''}`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        priorityCode === 'P1'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/40'
                          : priorityCode === 'P2'
                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/40'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {alt.priority}
                    </span>

                    <span className="font-semibold text-cyan-300">{alt.id}</span>

                    {alt.eventId && (
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                        {alt.eventId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {alt.timestamp || (alt.createdAt ? new Date(alt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent')}
                    </span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-semibold uppercase ${
                        isPending
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : alt.status?.toUpperCase() === 'ACKNOWLEDGED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {alt.status}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="mt-2.5 flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-semibold text-sm text-white">
                      {alt.title || alt.event}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{alt.location}</span>
                    </p>
                    <p className="text-xs text-slate-300 pt-1">
                      <strong className="text-slate-400 font-mono text-[11px]">IMPACT:</strong> {alt.potentialImpact}
                    </p>
                    <p className="text-xs text-slate-300">
                      <strong className="text-cyan-400 font-mono text-[11px]">RECOMMENDED SOP:</strong> {alt.recommendedAction}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap md:flex-col gap-1.5 flex-shrink-0 pt-2 md:pt-0">
                    {alt.eventId && (
                      <button
                        onClick={() => onInvestigateEventId(alt.eventId)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition flex items-center justify-center gap-1"
                      >
                        Investigate Event
                      </button>
                    )}

                    {!isResolved && (
                      <>
                        <button
                          onClick={() => handleNotify(alt)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium transition flex items-center justify-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch Alert</span>
                        </button>

                        <button
                          onClick={() => onUpdateAlertStatus(alt.id, 'RESOLVED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium transition flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Mark Resolved</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
