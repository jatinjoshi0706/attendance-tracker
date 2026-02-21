'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { OfficeLocation, haversineDistance } from '@/lib/geo';

export type GeofenceStatus = 'inside' | 'outside' | 'unknown' | 'denied' | 'unsupported';

interface UseGeofenceOptions {
    office: OfficeLocation | null;
    /** Fired once when user moves OUTSIDE the geofence */
    onLeave: () => void;
    /** Fired once when user moves BACK INSIDE */
    onReturn: () => void;
}

export function useGeofence({ office, onLeave, onReturn }: UseGeofenceOptions) {
    const [status, setStatus] = useState<GeofenceStatus>('unknown');
    const [distanceMetres, setDistanceMetres] = useState<number | null>(null);
    const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

    // refs so callbacks don't cause re-subscription when identity changes
    const prevInsideRef = useRef<boolean | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const onLeaveRef = useRef(onLeave);
    const onReturnRef = useRef(onReturn);
    useEffect(() => { onLeaveRef.current = onLeave; }, [onLeave]);
    useEffect(() => { onReturnRef.current = onReturn; }, [onReturn]);

    const handlePosition = useCallback(
        (pos: GeolocationPosition) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setCurrentCoords({ lat, lng });

            if (!office) { setStatus('unknown'); return; }

            const dist = haversineDistance(lat, lng, office.lat, office.lng);
            setDistanceMetres(Math.round(dist));

            const nowInside = dist <= office.radius;
            setStatus(nowInside ? 'inside' : 'outside');

            // Transition callbacks
            if (prevInsideRef.current !== null) {
                if (prevInsideRef.current && !nowInside) onLeaveRef.current();
                if (!prevInsideRef.current && nowInside) onReturnRef.current();
            }
            prevInsideRef.current = nowInside;
        },
        [office]   // re-subscribe only when office changes
    );

    const handleError = useCallback((err: GeolocationPositionError) => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unknown');
    }, []);

    useEffect(() => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            setStatus('unsupported');
            return;
        }
        // Immediate first fix
        navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
            enableHighAccuracy: true, timeout: 10_000,
        });
        // Continuous watch
        watchIdRef.current = navigator.geolocation.watchPosition(
            handlePosition, handleError,
            { enableHighAccuracy: true, maximumAge: 15_000, timeout: 15_000 }
        );
        return () => {
            if (watchIdRef.current !== null)
                navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [handlePosition, handleError]);

    return { status, distanceMetres, currentCoords };
}
