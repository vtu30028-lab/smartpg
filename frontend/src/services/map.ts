export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let mapsScriptPromise: Promise<void> | null = null;

export const loadGoogleMapsScript = (): Promise<void> => {
  if (window.google?.maps) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error('Google Maps API key not configured'));
      return;
    }

    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
};

export const getCurrentLocation = (): Promise<Coordinates> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
    );
  });

/** Live location updates via watchPosition */
export const watchLocation = (
  onUpdate: (coords: Coordinates) => void,
  onError?: (err: GeolocationPositionError) => void
): (() => void) => {
  if (!navigator.geolocation) return () => {};

  const watchId = navigator.geolocation.watchPosition(
    (position) =>
      onUpdate({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }),
    (error) => onError?.(error),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 }
  );

  return () => navigator.geolocation.clearWatch(watchId);
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  if (GOOGLE_MAPS_API_KEY) {
    try {
      await loadGoogleMapsScript();
      const geocoder = new google.maps.Geocoder();
      return await new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            resolve(results[0].formatted_address.split(',').slice(0, 2).join(',').trim());
          } else {
            reject(new Error('Geocode failed'));
          }
        });
      });
    } catch {
      // fall through to OSM
    }
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  );
  const data = await res.json();
  return data.display_name?.split(',').slice(0, 2).join(',').trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
};

export const getGoogleMapsUrl = (lat: number, lng: number, label?: string) =>
  `https://www.google.com/maps?q=${lat},${lng}${label ? `&query=${encodeURIComponent(label)}` : ''}`;

export const getDirectionsUrl = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) =>
  `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}`;

export const getEmbedMapUrl = (lat: number, lng: number, label?: string) => {
  if (GOOGLE_MAPS_API_KEY) {
    const q = label ? encodeURIComponent(label) : `${lat},${lng}`;
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${q}&center=${lat},${lng}&zoom=15`;
  }
  return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
};

export const DEFAULT_LOCATION: Coordinates = { lat: 12.9716, lng: 77.5946 };

declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class Geocoder {
    geocode(
      request: { location: { lat: number; lng: number } },
      callback: (results: GeocoderResult[] | null, status: string) => void
    ): void;
  }
  interface GeocoderResult {
    formatted_address: string;
  }
}
