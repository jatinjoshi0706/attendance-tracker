'use client';

import { OfficeLocation, saveOfficeLocation, clearOfficeLocation } from '@/lib/geo';
import { MapPin, Navigation, Trash2, Check, Loader2, AlertTriangle, KeyRound } from 'lucide-react';
import { useState } from 'react';

interface OfficeSetupProps {
    office: OfficeLocation | null;
    onSaved: (loc: OfficeLocation) => void;
    onCleared: () => void;
}

type Step = 'auto' | 'manual';

export default function OfficeSetup({ office, onSaved, onCleared }: OfficeSetupProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [radius, setRadius] = useState(office?.radius ?? 150);
    const [name, setName] = useState(office?.name ?? 'My Office');
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState<Step>('auto');

    // Manual coords
    const [manualLat, setManualLat] = useState('');
    const [manualLng, setManualLng] = useState('');

    const saveAndNotify = (lat: number, lng: number) => {
        const loc: OfficeLocation = { lat, lng, name: name || 'My Office', radius };
        saveOfficeLocation(loc);
        onSaved(loc);
        setLoading(false);
        setError('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    /** Try low-accuracy first (WiFi/IP), fall back to even lower if that fails */
    const captureAuto = () => {
        setLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        const tryLowAccuracy = () => {
            navigator.geolocation.getCurrentPosition(
                (pos) => saveAndNotify(pos.coords.latitude, pos.coords.longitude),
                (err) => {
                    setLoading(false);
                    if (err.code === err.PERMISSION_DENIED) {
                        setError('Location permission denied. Please click the 🔒 icon in your browser address bar and allow location access, then try again.');
                    } else {
                        setError('Could not get your location automatically. Use "Enter Manually" below to paste coordinates from Google Maps.');
                    }
                },
                { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 }
            );
        };

        // First try high-accuracy (GPS), fall back to low-accuracy on failure
        navigator.geolocation.getCurrentPosition(
            (pos) => saveAndNotify(pos.coords.latitude, pos.coords.longitude),
            () => tryLowAccuracy(),   // silently retry with low accuracy
            { enableHighAccuracy: true, timeout: 8_000 }
        );
    };

    const captureManual = () => {
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
            setError('Please enter valid latitude (−90 to 90) and longitude (−180 to 180).');
            return;
        }
        setError('');
        saveAndNotify(lat, lng);
    };

    const handleClear = () => { clearOfficeLocation(); onCleared(); };

    const RadiusSlider = () => (
        <div className="space-y-2">
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-widest">
                Geofence Radius: <span className="text-white">{radius} m</span>
            </label>
            <input type="range" min={50} max={500} step={25} value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-indigo-500" />
            <div className="flex justify-between text-xs text-slate-600"><span>50 m (tight)</span><span>500 m (loose)</span></div>
        </div>
    );

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
                <MapPin size={15} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white">Office Location</span>
                {office && <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">✓ Set</span>}
            </div>

            <div className="p-5 space-y-4">

                {/* ── Already saved ── */}
                {office ? (
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin size={14} className="text-indigo-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-white text-sm font-semibold">{office.name}</p>
                                <p className="text-slate-400 text-xs font-mono mt-0.5">{office.lat.toFixed(6)}, {office.lng.toFixed(6)}</p>
                                <p className="text-slate-500 text-xs mt-1">Radius: <span className="text-slate-300">{office.radius} m</span></p>
                            </div>
                        </div>

                        {/* Radius update */}
                        <RadiusSlider />
                        <button onClick={() => { const loc = { ...office, radius }; saveOfficeLocation(loc); onSaved(loc); setSuccess(true); setTimeout(() => setSuccess(false), 2000); }}
                            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-all border border-slate-700">
                            Update Radius
                        </button>

                        <div className="flex gap-2">
                            <button onClick={captureAuto} disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-50">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                                Re-capture GPS
                            </button>
                            <button onClick={handleClear}
                                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-all">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                ) : (
                    /* ── First-time setup ── */
                    <div className="space-y-4">
                        <p className="text-slate-400 text-sm">
                            Set your office location. The app will alert you to log your exit when you move away.
                        </p>

                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Location Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                placeholder="My Office"
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                        </div>

                        <RadiusSlider />

                        {/* Method tabs */}
                        <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
                            <button onClick={() => { setStep('auto'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${step === 'auto' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                <Navigation size={12} /> Auto-detect
                            </button>
                            <button onClick={() => { setStep('manual'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${step === 'manual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                <KeyRound size={12} /> Enter Manually
                            </button>
                        </div>

                        {step === 'auto' && (
                            <button onClick={captureAuto} disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50">
                                {loading
                                    ? <><Loader2 size={15} className="animate-spin" /> Detecting location…</>
                                    : <><Navigation size={15} /> Use My Current Location</>}
                            </button>
                        )}

                        {step === 'manual' && (
                            <div className="space-y-3">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Open <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Google Maps</a>, right-click your office building → copy the coordinates shown, and paste them below.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500">Latitude</label>
                                        <input type="number" step="any" value={manualLat}
                                            onChange={(e) => setManualLat(e.target.value)}
                                            placeholder="e.g. 28.61390"
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500">Longitude</label>
                                        <input type="number" step="any" value={manualLng}
                                            onChange={(e) => setManualLng(e.target.value)}
                                            placeholder="e.g. 77.20902"
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono" />
                                    </div>
                                </div>
                                <button onClick={captureManual}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-95">
                                    <MapPin size={15} /> Save This Location
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="flex items-start gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                        <AlertTriangle size={13} className="shrink-0 mt-0.5" /> {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs">
                        <Check size={13} /> Office location saved!
                    </div>
                )}
            </div>
        </div>
    );
}
