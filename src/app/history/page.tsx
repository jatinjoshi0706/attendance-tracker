'use client';

import { useEffect, useState } from 'react';
import { DayRecord } from '@/types/attendance';
import { getHistory } from '@/lib/storage';
import { getShiftConfig } from '@/lib/settings';
import HistoryCard from '@/components/HistoryCard';
import { History, Inbox } from 'lucide-react';

export default function HistoryPage() {
    const [records, setRecords] = useState<DayRecord[]>([]);
    const [requiredMinutes, setRequiredMinutes] = useState(8 * 60);

    useEffect(() => {
        setRecords(getHistory());
        setRequiredMinutes(getShiftConfig().requiredMinutes);
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
                <History size={18} className="text-indigo-400" />
                <h1 className="text-lg font-bold text-white">Attendance History</h1>
            </div>

            {records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                    <Inbox size={40} className="opacity-30" />
                    <p className="text-sm">No past records yet.</p>
                    <p className="text-xs text-slate-600">Your history will appear here after your first day.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {records.map((r) => (
                        <HistoryCard key={r.date} record={r} requiredMinutes={requiredMinutes} />
                    ))}
                </div>
            )}
        </div>
    );
}
