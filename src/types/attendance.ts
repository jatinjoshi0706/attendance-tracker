export interface LogEntry {
    id: string;
    type: 'in' | 'out';
    time: string; // "HH:mm" format
    timestamp: number; // unix ms for the given date + time
}

export interface DayRecord {
    date: string; // "YYYY-MM-DD"
    logs: LogEntry[];
}

export interface Session {
    inTime: string;
    outTime: string | null; // null if currently inside
    durationMinutes: number; // 0 if still open
}
