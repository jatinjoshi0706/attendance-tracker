'use client';

import { formatClockWithSeconds, formatMinutes, REQUIRED_MINUTES } from '@/lib/attendance';
import { useEffect, useRef } from 'react';

interface StatusRingProps {
    liveMinutes: number;
    status: 'full' | 'inprogress' | 'short';
    requiredMinutes: number;
}

export default function StatusRing({ liveMinutes, status, requiredMinutes }: StatusRingProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const size = 220;
    const stroke = 16;
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const pct = Math.min(1, liveMinutes / requiredMinutes);

    const color =
        status === 'full' ? '#22c55e' : status === 'inprogress' ? '#f59e0b' : '#ef4444';

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, size, size);
        const cx = size / 2;
        const cy = size / 2;
        const start = -Math.PI / 2;

        // Track
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = stroke;
        ctx.stroke();

        // Progress
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, start + pct * 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = stroke;
        ctx.lineCap = 'round';
        ctx.stroke();
    }, [pct, color]);

    const remaining = Math.max(0, requiredMinutes - liveMinutes);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <canvas ref={canvasRef} width={size} height={size} className="absolute inset-0" />
            <div className="flex flex-col items-center z-10">
                <span className="text-3xl font-bold font-mono text-white tracking-tight">{formatClockWithSeconds(liveMinutes)}</span>
                <span className="text-sm text-slate-400 mt-1">in office</span>
                {status !== 'full' && (
                    <span className="text-xs mt-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300">
                        {formatMinutes(remaining)} left
                    </span>
                )}
                {status === 'full' && (
                    <span className="text-xs mt-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                        ✓ Full Day
                    </span>
                )}
            </div>
        </div>
    );
}
