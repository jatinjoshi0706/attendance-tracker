'use client';
import { useEffect, useState } from 'react';

export default function LiveClock() {
    const [time, setTime] = useState('');

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <span className="font-mono text-sm text-slate-400 tracking-widest">
            {time}
        </span>
    );
}
