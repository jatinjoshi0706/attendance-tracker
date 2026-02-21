'use client';

import { LogEntry } from '@/types/attendance';
import { LogIn, LogOut, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PunchFormProps {
    date: string;
    nextType: 'in' | 'out';
    onAdd: (entry: LogEntry) => void;
    onDelete: (id: string) => void;
    logs: LogEntry[];
}

export default function PunchForm({ date, nextType, onAdd, onDelete, logs }: PunchFormProps) {
    const [time, setTime] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [overrideType, setOverrideType] = useState<'in' | 'out' | null>(null);

    // Reset override when nextType changes (e.g. after adding a log)
    useEffect(() => { setOverrideType(null); }, [nextType]);

    const activeType = overrideType ?? nextType;
    const isLogin = activeType === 'in';

    // Auto-set current time when panel opens
    useEffect(() => {
        if (showAdvanced) {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            setTime(`${hh}:${mm}`);
        }
    }, [showAdvanced]);

    const handleQuickPunch = () => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hh}:${mm}`;
        submitEntry(activeType, currentTime);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!time) { setError('Please select a time.'); return; }
        submitEntry(activeType, time);
    };

    const submitEntry = (type: 'in' | 'out', t: string) => {
        setError('');
        const lastLog = logs[logs.length - 1];
        const newTs = new Date(`${date}T${t}:00`).getTime();
        if (lastLog && newTs <= lastLog.timestamp) {
            setError('Time must be after the last entry.');
            return;
        }
        const entry: LogEntry = {
            id: `${Date.now()}-${Math.random()}`,
            type,
            time: t,
            timestamp: newTs,
        };
        onAdd(entry);
        setTime('');
        setShowAdvanced(false);
        setOverrideType(null);
        setSuccess(type === 'in' ? 'Entry logged ✓' : 'Exit logged ✓');
        setTimeout(() => setSuccess(''), 2500);
    };

    return (
        <div className="w-full space-y-4">

            {/* ── Main Action Card ── */}
            <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${isLogin
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-rose-500/5 border-rose-500/30'
                }`}>
                {/* Glow blob */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${isLogin ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                <div className="relative p-5 space-y-4">
                    {/* Status label */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isLogin ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                                {isLogin ? 'Currently Outside' : 'Currently Inside'}
                            </span>
                        </div>
                        {/* Type override tabs */}
                        <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5">
                            <button
                                type="button"
                                onClick={() => setOverrideType('in')}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${activeType === 'in' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                In
                            </button>
                            <button
                                type="button"
                                onClick={() => setOverrideType('out')}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${activeType === 'out' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Out
                            </button>
                        </div>
                    </div>

                    {/* Big punch button */}
                    <button
                        onClick={handleQuickPunch}
                        className={`w-full flex items-center justify-center gap-3 py-5 rounded-xl font-bold text-lg transition-all duration-200 active:scale-[0.97] shadow-lg ${isLogin
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 text-white'
                            : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40 text-white'
                            }`}
                    >
                        {isLogin ? <LogIn size={22} /> : <LogOut size={22} />}
                        {isLogin ? 'Mark Entry (Now)' : 'Mark Exit (Now)'}
                    </button>

                    {/* Success flash */}
                    {success && (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm animate-pulse">
                            <CheckCircle2 size={15} /> {success}
                        </div>
                    )}

                    {/* Manual time toggle */}
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <Clock size={12} />
                        {showAdvanced ? 'Hide manual time entry' : 'Enter a specific time instead'}
                    </button>

                    {/* Manual time form */}
                    {showAdvanced && (
                        <form onSubmit={handleManualSubmit} className="flex gap-2 pt-1 animate-in slide-in-from-top-2 duration-200">
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => { setTime(e.target.value); setError(''); }}
                                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                            />
                            <button
                                type="submit"
                                className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-95 ${isLogin ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-rose-700 hover:bg-rose-600'}`}
                            >
                                Log
                            </button>
                        </form>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-rose-400 text-xs">
                            <AlertCircle size={13} /> {error}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Log List ── */}
            {logs.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold px-1">Today's Log</p>
                    {logs.map((log, i) => (
                        <div
                            key={log.id}
                            className="group flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {/* Step number */}
                                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {i + 1}
                                </span>
                                <div className={`flex items-center gap-1.5 text-sm font-semibold ${log.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {log.type === 'in' ? <LogIn size={13} /> : <LogOut size={13} />}
                                    {log.type === 'in' ? 'Entry' : 'Exit'}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-sm font-bold text-white">{log.time}</span>
                                <button
                                    onClick={() => onDelete(log.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all"
                                    title="Delete"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {logs.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-slate-600">
                    <LogIn size={28} className="opacity-30" />
                    <p className="text-sm">No entries yet today.</p>
                    <p className="text-xs text-slate-700">Press the button above to log your first entry.</p>
                </div>
            )}
        </div>
    );
}
