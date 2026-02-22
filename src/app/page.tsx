'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { DayRecord, LogEntry } from '@/types/attendance';
import { addLog, deleteLog, getRecord } from '@/lib/storage';
import {
  buildSessions,
  calcLiveMinutes,
  getStatus,
  isCurrentlyInside,
  nextLogType,
  formatMinutes,
} from '@/lib/attendance';
import { getOfficeLocation, OfficeLocation } from '@/lib/geo';
import { getShiftConfig, ShiftConfig } from '@/lib/settings';
import { useGeofence } from '@/hooks/useGeofence';
import { useReminders } from '@/hooks/useReminders';
import StatusRing from '@/components/StatusRing';
import PunchForm from '@/components/PunchForm';
import SessionTimeline from '@/components/SessionTimeline';
import OfficeSetup from '@/components/OfficeSetup';
import GeofenceAlert from '@/components/GeofenceAlert';
import ShiftSettings from '@/components/ShiftSettings';
import { CalendarDays, MapPin, TrendingUp, Settings } from 'lucide-react';

const TODAY = new Date().toISOString().slice(0, 10);

type Tab = 'today' | 'location' | 'settings';

export default function DashboardPage() {
  const [record, setRecord] = useState<DayRecord>({ date: TODAY, logs: [] });
  const [nowMs, setNowMs] = useState(Date.now());
  const [office, setOffice] = useState<OfficeLocation | null>(null);
  const [config, setConfig] = useState<ShiftConfig>(getShiftConfig());
  const [showAlert, setShowAlert] = useState(false);
  const [alertDist, setAlertDist] = useState(0);
  const [tab, setTab] = useState<Tab>('today');

  // cooldown so we don't spam the alert
  const alertCooldownRef = useRef(false);

  useEffect(() => {
    setRecord(getRecord(TODAY));
    setOffice(getOfficeLocation());
    setConfig(getShiftConfig());
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const sessions = buildSessions(record.logs);
  const liveMin = calcLiveMinutes(sessions, nowMs, TODAY);
  const inside = isCurrentlyInside(sessions);
  const requiredMinutes = config.requiredMinutes;
  const status = getStatus(liveMin, inside, requiredMinutes);
  const nt = nextLogType(record);
  const extraTime = Math.max(0, liveMin - requiredMinutes);
  const remaining = Math.max(0, requiredMinutes - liveMin);
  const pct = Math.min(100, Math.round((liveMin / requiredMinutes) * 100));

  // ── Geofence ──
  const handleLeave = useCallback(() => {
    if (config.notificationsEnabled && config.geofenceTransitionNotificationsEnabled) {
      new Notification('🚶 Leaving Office', {
        body: "You've moved outside the office geofence.",
        icon: '/favicon.ico',
      });
    }

    if (!inside || alertCooldownRef.current) return;
    alertCooldownRef.current = true;
    setShowAlert(true);
    setTimeout(() => { alertCooldownRef.current = false; }, 10 * 60 * 1000);
  }, [inside, config]);

  const handleReturn = useCallback(() => {
    if (config.notificationsEnabled && config.geofenceTransitionNotificationsEnabled) {
      new Notification('🏢 Back at Office', {
        body: "You've returned to the office geofence.",
        icon: '/favicon.ico',
      });
    }
    setShowAlert(false);
  }, [config]);

  const { status: geoStatus, distanceMetres } = useGeofence({
    office,
    onLeave: handleLeave,
    onReturn: handleReturn,
  });

  // ── Reminders ──
  useReminders({
    config,
    status: inside ? 'inside' : 'outside',
    isInsideOffice: geoStatus === 'inside',
    logsCount: record.logs.length,
  });

  useEffect(() => {
    if (distanceMetres !== null) setAlertDist(distanceMetres);
  }, [distanceMetres]);

  // ── Handlers ──
  const handleAdd = useCallback((entry: LogEntry) => {
    const updated = addLog(TODAY, entry);
    setRecord({ ...updated });
  }, []);

  const handleDelete = useCallback((id: string) => {
    const updated = deleteLog(TODAY, id);
    setRecord({ ...updated });
  }, []);

  const handleAlertExit = useCallback(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const t = `${hh}:${mm}`;
    const entry: LogEntry = {
      id: `${Date.now()}-geo`,
      type: 'out',
      time: t,
      timestamp: now.getTime(),
    };
    handleAdd(entry);
    setShowAlert(false);
  }, [handleAdd]);

  const todayLabel = format(new Date(), 'EEEE, dd MMM yyyy');

  const geoBadge = () => {
    if (!office) return null;
    if (geoStatus === 'inside') return (
      <span className="text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> In Radius
      </span>
    );
    if (geoStatus === 'outside') return (
      <span className="text-rose-400 text-[10px] font-semibold bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" /> {distanceMetres}m away
      </span>
    );
    return null;
  };

  return (
    <>
      {showAlert && (
        <GeofenceAlert
          distanceMetres={alertDist}
          onMarkExit={handleAlertExit}
          onDismiss={() => setShowAlert(false)}
        />
      )}

      <div className="flex flex-col gap-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <CalendarDays size={15} />
            <span>{todayLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            {geoBadge()}
            {status === 'full' && (
              <span className="text-emerald-400 font-semibold text-xs px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">✓ Full Day</span>
            )}
            {status === 'inprogress' && (
              <span className="text-amber-400 font-semibold text-xs px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full animate-pulse">⏱ In Progress</span>
            )}
            {status === 'short' && record.logs.length > 0 && (
              <span className="text-rose-400 font-semibold text-xs px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full">✗ Incomplete</span>
            )}
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center gap-5">
          <StatusRing liveMinutes={liveMin} status={status} requiredMinutes={requiredMinutes} />
          <div className="w-full grid grid-cols-3 divide-x divide-slate-800 pt-2 border-t border-slate-800">
            <div className="flex flex-col items-center gap-0.5 px-2">
              <span className="text-xs text-slate-500">Sessions</span>
              <span className="text-lg font-bold text-white">{sessions.length}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-2">
              <span className="text-xs text-slate-500">{status === 'full' ? 'Extra' : 'Remaining'}</span>
              <span className={`text-lg font-bold ${status === 'full' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {status === 'full' ? `+${formatMinutes(extraTime)}` : formatMinutes(remaining)}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-2">
              <span className="text-xs text-slate-500">Progress</span>
              <span className="text-lg font-bold text-white">{pct}%</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${status === 'full' ? 'bg-emerald-500' : status === 'inprogress' ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {inside && status !== 'full' && (
            <p className="text-sm text-amber-300/80 text-center">
              You&apos;re inside the office. Stay for <span className="font-bold text-amber-300">{formatMinutes(remaining)}</span> more to complete your shift.
            </p>
          )}
          {status === 'full' && (
            <p className="text-sm text-emerald-400/80 text-center">
              🎉 Full shift completed! You&apos;ve put in <span className="font-bold text-emerald-400">{formatMinutes(liveMin)}</span> today.
            </p>
          )}
          {!inside && status === 'short' && record.logs.length > 0 && (
            <p className="text-sm text-rose-400/80 text-center">
              You need <span className="font-bold text-rose-300">{formatMinutes(remaining)}</span> more. Log back in when you return.
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setTab('today')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'today' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <TrendingUp size={14} /> Today
          </button>
          <button
            onClick={() => setTab('location')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'location' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <MapPin size={14} /> Office
            {!office && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Settings size={14} /> Settings
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'today' && (
          <>
            <PunchForm
              date={TODAY}
              nextType={nt}
              logs={record.logs}
              onAdd={handleAdd}
              onDelete={handleDelete}
            />
            {sessions.length > 0 && (
              <SessionTimeline sessions={sessions} isCurrentlyInside={inside} />
            )}
          </>
        )}

        {tab === 'location' && (
          <OfficeSetup
            office={office}
            onSaved={(loc) => { setOffice(loc); setTab('today'); }}
            onCleared={() => setOffice(null)}
          />
        )}

        {tab === 'settings' && (
          <ShiftSettings
            config={config}
            onSaved={(next) => { setConfig(next); setTab('today'); }}
          />
        )}
      </div>
    </>
  );
}
