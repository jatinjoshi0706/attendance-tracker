'use client';

import { useEffect, useRef } from 'react';
import { ShiftConfig } from '@/lib/settings';

interface UseRemindersOptions {
    config: ShiftConfig;
    status: 'inside' | 'outside' | 'unknown';
    isInsideOffice: boolean; // physical location check
    logsCount: number;
}

export function useReminders({ config, status, isInsideOffice, logsCount }: UseRemindersOptions) {
    const arrivalAlertedRef = useRef<string | null>(null);
    const endOfDayAlertedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!config.notificationsEnabled) return;

        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
            return;
        }

        const today = new Date().toISOString().slice(0, 10);

        // ── Arrival Reminder ──
        // If inside office but haven't logged in yet today
        if (
            config.arrivalReminderEnabled &&
            isInsideOffice &&
            logsCount === 0 &&
            arrivalAlertedRef.current !== today
        ) {
            new Notification('🏢 Office Arrival', {
                body: "You've arrived at the office! Don't forget to mark your entry.",
                icon: '/favicon.ico',
            });
            arrivalAlertedRef.current = today;
        }

        // ── End of Day Reminder ──
        if (config.endOfDayReminderEnabled && endOfDayAlertedRef.current !== today) {
            const now = new Date();
            const [h, m] = config.endOfDayReminderTime.split(':').map(Number);
            const reminderTime = new Date();
            reminderTime.setHours(h, m, 0, 0);

            // If it's passed the reminder time and still at office (or haven't finished shift)
            if (now >= reminderTime) {
                new Notification('⌛ Day Summary', {
                    body: "It's time for your end-of-day check! Don't forget to mark your final exit.",
                    icon: '/favicon.ico',
                });
                endOfDayAlertedRef.current = today;
            }
        }
    }, [config, status, isInsideOffice, logsCount]);
}
