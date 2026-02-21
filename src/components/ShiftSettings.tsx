'use client';

import { ShiftConfig, saveShiftConfig } from '@/lib/settings';
import { Settings, Clock, Calendar, Bell, Check, Save } from 'lucide-react';
import { useState } from 'react';

interface ShiftSettingsProps {
    config: ShiftConfig;
    onSaved: (config: ShiftConfig) => void;
}

export default function ShiftSettings({ config, onSaved }: ShiftSettingsProps) {
    const [localConfig, setLocalConfig] = useState<ShiftConfig>(config);
    const [success, setSuccess] = useState(false);

    const days = [
        { label: 'S', value: 0 },
        { label: 'M', value: 1 },
        { label: 'T', value: 2 },
        { label: 'W', value: 3 },
        { label: 'T', value: 4 },
        { label: 'F', value: 5 },
        { label: 'S', value: 6 },
    ];

    const toggleDay = (day: number) => {
        const next = localConfig.workingDays.includes(day)
            ? localConfig.workingDays.filter((d) => d !== day)
            : [...localConfig.workingDays, day].sort();
        setLocalConfig({ ...localConfig, workingDays: next });
    };

    const handleSave = () => {
        // Request notification permission if enabling
        if (localConfig.notificationsEnabled && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
        saveShiftConfig(localConfig);
        onSaved(localConfig);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
    };

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
                <Settings size={15} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white">Shift Configuration</span>
            </div>

            <div className="p-5 space-y-6">
                {/* Required Hours */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Daily Required Hours</label>
                        <span className="text-indigo-400 font-bold">{(localConfig.requiredMinutes / 60).toFixed(1)} hrs</span>
                    </div>
                    <input
                        type="range"
                        min={60}
                        max={720}
                        step={15}
                        value={localConfig.requiredMinutes}
                        onChange={(e) => setLocalConfig({ ...localConfig, requiredMinutes: Number(e.target.value) })}
                        className="w-full accent-indigo-500"
                    />
                </div>

                {/* Working Days */}
                <div className="space-y-3">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} /> Working Days
                    </label>
                    <div className="flex justify-between gap-1">
                        {days.map((d) => (
                            <button
                                key={d.value}
                                onClick={() => toggleDay(d.value)}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all border ${localConfig.workingDays.includes(d.value)
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications */}
                <div className="space-y-4 pt-2 border-t border-slate-800">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-widest flex items-center gap-2">
                        <Bell size={12} /> Smart Reminders
                    </label>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">Enable Notifications</span>
                            <button
                                onClick={() => setLocalConfig({ ...localConfig, notificationsEnabled: !localConfig.notificationsEnabled })}
                                className={`w-10 h-5 rounded-full transition-colors relative ${localConfig.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localConfig.notificationsEnabled ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>

                        {localConfig.notificationsEnabled && (
                            <div className="space-y-3 pl-2 border-l-2 border-slate-800 animate-in slide-in-from-left-2 duration-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">Arrival Reminder</span>
                                    <input
                                        type="checkbox"
                                        checked={localConfig.arrivalReminderEnabled}
                                        onChange={(e) => setLocalConfig({ ...localConfig, arrivalReminderEnabled: e.target.checked })}
                                        className="accent-indigo-500"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">End of Day Nudge</span>
                                    <input
                                        type="checkbox"
                                        checked={localConfig.endOfDayReminderEnabled}
                                        onChange={(e) => setLocalConfig({ ...localConfig, endOfDayReminderEnabled: e.target.checked })}
                                        className="accent-indigo-500"
                                    />
                                </div>
                                {localConfig.endOfDayReminderEnabled && (
                                    <div className="flex items-center justify-between pl-4">
                                        <span className="text-xs text-slate-500 italic">Reminder Time</span>
                                        <input
                                            type="time"
                                            value={localConfig.endOfDayReminderTime}
                                            onChange={(e) => setLocalConfig({ ...localConfig, endOfDayReminderTime: e.target.value })}
                                            className="bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1 outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95 group shadow-lg shadow-indigo-900/10"
                >
                    {success ? (
                        <><Check size={18} /> Settings Saved</>
                    ) : (
                        <><Save size={18} /> Save Configuration</>
                    )}
                </button>
            </div>
        </div>
    );
}
