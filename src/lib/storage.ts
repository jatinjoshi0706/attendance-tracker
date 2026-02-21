import { DayRecord, LogEntry } from '@/types/attendance';

const STORAGE_KEY = 'attendance_records';

export function getAllRecords(): DayRecord[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function getRecord(date: string): DayRecord {
    const all = getAllRecords();
    return all.find((r) => r.date === date) ?? { date, logs: [] };
}

export function saveRecord(record: DayRecord): void {
    const all = getAllRecords().filter((r) => r.date !== record.date);
    all.push(record);
    all.sort((a, b) => b.date.localeCompare(a.date));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function addLog(date: string, entry: LogEntry): DayRecord {
    const record = getRecord(date);
    record.logs.push(entry);
    record.logs.sort((a, b) => a.timestamp - b.timestamp);
    saveRecord(record);
    return record;
}

export function deleteLog(date: string, id: string): DayRecord {
    const record = getRecord(date);
    record.logs = record.logs.filter((l) => l.id !== id);
    saveRecord(record);
    return record;
}

export function getHistory(): DayRecord[] {
    const today = new Date().toISOString().slice(0, 10);
    return getAllRecords().filter((r) => r.date !== today);
}
