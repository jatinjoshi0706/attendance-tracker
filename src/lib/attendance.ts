import { DayRecord, LogEntry, Session } from '@/types/attendance';

export const REQUIRED_MINUTES = 8 * 60; // 480

/** Convert "HH:mm" on a given date string to a timestamp (ms) */
export function timeToTimestamp(date: string, time: string): number {
    return new Date(`${date}T${time}:00`).getTime();
}

/** Format minutes to  "X hr Y min" */
export function formatMinutes(mins: number): string {
    const m = Math.max(0, Math.round(mins));
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h === 0) return `${min} min`;
    if (min === 0) return `${h} hr`;
    return `${h} hr ${min} min`;
}

/** Format minutes to "HH:MM" clock style */
export function formatClock(mins: number): string {
    const m = Math.max(0, Math.round(mins));
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/** Format minutes (with fractional seconds) to "HH:MM:SS" clock style */
export function formatClockWithSeconds(mins: number): string {
    const totalSeconds = Math.max(0, Math.floor(mins * 60));
    const h = Math.floor(totalSeconds / 3600);
    const min = Math.floor((totalSeconds % 3600) / 60);
    const sec = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Build sessions from an ordered list of logs.
 * Consecutive "in" or "out" records are handled gracefully.
 */
export function buildSessions(logs: LogEntry[]): Session[] {
    const sessions: Session[] = [];
    let lastIn: LogEntry | null = null;

    for (const log of logs) {
        if (log.type === 'in') {
            // If there's already an open "in", close it implicitly
            if (lastIn) {
                sessions.push({ inTime: lastIn.time, outTime: null, durationMinutes: 0 });
            }
            lastIn = log;
        } else if (log.type === 'out' && lastIn) {
            const durMs = log.timestamp - lastIn.timestamp;
            sessions.push({
                inTime: lastIn.time,
                outTime: log.time,
                durationMinutes: Math.max(0, durMs / 60000),
            });
            lastIn = null;
        }
    }

    // Still inside
    if (lastIn) {
        sessions.push({ inTime: lastIn.time, outTime: null, durationMinutes: 0 });
    }

    return sessions;
}

/**
 * Total completed in-office minutes (does NOT count open session).
 */
export function calcCompletedMinutes(sessions: Session[]): number {
    return sessions.reduce((acc, s) => acc + (s.outTime ? s.durationMinutes : 0), 0);
}

/**
 * Live in-office minutes including the currently open session (if any).
 */
export function calcLiveMinutes(sessions: Session[], nowMs: number, date: string): number {
    const completed = calcCompletedMinutes(sessions);
    const open = sessions.find((s) => !s.outTime);
    if (!open) return completed;
    const openStart = timeToTimestamp(date, open.inTime);
    const liveDur = Math.max(0, (nowMs - openStart) / 60000);
    return completed + liveDur;
}

export function isCurrentlyInside(sessions: Session[]): boolean {
    return sessions.some((s) => !s.outTime);
}

export function getStatus(liveMinutes: number, isInside: boolean, requiredMinutes: number): 'full' | 'inprogress' | 'short' {
    if (liveMinutes >= requiredMinutes) return 'full';
    if (isInside) return 'inprogress';
    return 'short';
}

export function nextLogType(record: DayRecord): 'in' | 'out' {
    const last = record.logs[record.logs.length - 1];
    if (!last || last.type === 'out') return 'in';
    return 'out';
}
