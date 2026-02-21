'use client';

import { Session } from '@/types/attendance';
import { formatMinutes } from '@/lib/attendance';
import { ArrowRight } from 'lucide-react';

interface SessionTimelineProps {
    sessions: Session[];
    isCurrentlyInside: boolean;
}

export default function SessionTimeline({ sessions, isCurrentlyInside }: SessionTimelineProps) {
    if (sessions.length === 0) return null;

    return (
        <div className="w-full space-y-2">
            <h3 className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Today's Sessions</h3>
            {sessions.map((s, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="font-mono text-sm text-white font-semibold">{s.inTime}</span>
                        <ArrowRight size={14} className="text-slate-500" />
                        {s.outTime ? (
                            <span className="font-mono text-sm text-rose-300 font-semibold">{s.outTime}</span>
                        ) : (
                            <span className="font-mono text-sm text-amber-400 font-semibold animate-pulse">Now</span>
                        )}
                    </div>
                    {s.outTime ? (
                        <span className="text-xs text-slate-400 bg-slate-700/60 px-2.5 py-1 rounded-full">
                            {formatMinutes(s.durationMinutes)}
                        </span>
                    ) : (
                        <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                            In Office
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
