'use client';

import { LogOut, MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GeofenceAlertProps {
    /** Distance in metres from office when alert fires */
    distanceMetres: number;
    onMarkExit: () => void;
    onDismiss: () => void;
}

export default function GeofenceAlert({ distanceMetres, onMarkExit, onDismiss }: GeofenceAlertProps) {
    const [visible, setVisible] = useState(false);

    // Animate in
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, []);

    const handleExit = () => {
        onMarkExit();
        onDismiss();
    };

    const handleNo = () => {
        onDismiss();
    };

    return (
        /* Full-screen backdrop */
        <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 ${visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}>

            {/* Card */}
            <div className={`w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-900/20 transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>

                {/* Top strip */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <MapPin size={14} className="text-amber-400" />
                        </div>
                        <span className="text-sm font-semibold text-white">Left the Office?</span>
                    </div>
                    <button onClick={handleNo} className="text-slate-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-5 space-y-4">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        📍 You appear to be <span className="font-bold text-amber-300">{distanceMetres} m</span> away from your office.
                        <br /><br />
                        Did you step out? Would you like to mark your <span className="font-bold text-rose-300">Exit</span> now?
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={handleNo}
                            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all active:scale-95"
                        >
                            No, I'm still in
                        </button>
                        <button
                            onClick={handleExit}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-all active:scale-95"
                        >
                            <LogOut size={15} /> Yes, Mark Exit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
