const OFFICE_KEY = 'office_location';

export interface OfficeLocation {
    lat: number;
    lng: number;
    name: string;
    radius: number; // metres
}

/** Haversine great-circle distance in metres */
export function haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6_371_000; // Earth radius in metres
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getOfficeLocation(): OfficeLocation | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(OFFICE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function saveOfficeLocation(loc: OfficeLocation): void {
    localStorage.setItem(OFFICE_KEY, JSON.stringify(loc));
}

export function clearOfficeLocation(): void {
    localStorage.removeItem(OFFICE_KEY);
}

/** Returns true if the given coords are inside the office geofence */
export function isInsideGeofence(
    lat: number, lng: number,
    office: OfficeLocation
): boolean {
    return haversineDistance(lat, lng, office.lat, office.lng) <= office.radius;
}
