'use client';

import { DayRecord } from '@/types/attendance';
import { buildSessions, calcCompletedMinutes, formatMinutes, REQUIRED_MINUTES } from '@/lib/attendance';
import { format, parseISO } from 'date-fns';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface HistoryCardProps {
    record: DayRecord;
    requiredMinutes: number;
}

export default function HistoryCard({ record, requiredMinutes }: HistoryCardProps) {
    const sessions = buildSessions(record.logs);
    const total = calcCompletedMinutes(sessions);
    const isFull = total >= requiredMinutes;
    const pct = Math.min(100, Math.round((total / requiredMinutes) * 100));

    let dateLabel = record.date;
    try {
        dateLabel = format(parseISO(record.date), 'EEE, dd MMM yyyy');
    } catch { }

    return (
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-white font-semibold text-sm">{dateLabel}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                        {sessions.length} session{sessions.length !== 1 ? 's' : ''} &middot; {formatMinutes(total)} in office
                    </p>
                </div>
                {isFull ? (
                    <CheckCircle size={22} className="text-emerald-400" />
                ) : total === 0 ? (
                    <XCircle size={22} className="text-slate-600" />
                ) : (
                    <Clock size={22} className="text-amber-400" />
                )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${isFull ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 text-right">{pct}% of 8 hr</p>
        </div>
    );
}
