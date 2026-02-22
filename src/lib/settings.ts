export interface ShiftConfig {
    requiredMinutes: number;
    workingDays: number[]; // 0 for Sunday, 1 for Monday, etc.
    halfDayThresholdMinutes: number;
    notificationsEnabled: boolean;
    arrivalReminderEnabled: boolean;
    geofenceTransitionNotificationsEnabled: boolean;
    endOfDayReminderEnabled: boolean;
    endOfDayReminderTime: string; // "HH:mm"
}

const SETTINGS_KEY = 'attendance_settings';

const DEFAULT_SETTINGS: ShiftConfig = {
    requiredMinutes: 8 * 60,
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    halfDayThresholdMinutes: 4 * 60,
    notificationsEnabled: false,
    arrivalReminderEnabled: true,
    geofenceTransitionNotificationsEnabled: true,
    endOfDayReminderEnabled: true,
    endOfDayReminderTime: '18:00',
};

export function getShiftConfig(): ShiftConfig {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveShiftConfig(config: ShiftConfig): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(config));
}
