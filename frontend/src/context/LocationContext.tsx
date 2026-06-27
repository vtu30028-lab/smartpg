import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { getCurrentLocation, reverseGeocode, watchLocation } from '../services/map';

export type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

interface LocationState {
  lat: number;
  lng: number;
  placeName: string | null;
  accuracy?: number;
}

interface LocationContextType {
  location: LocationState | null;
  status: LocationStatus;
  errorMessage: string | null;
  requestLocation: () => Promise<void>;
  isLive: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const watchCleanup = useRef<(() => void) | null>(null);

  const resolvePlaceName = async (lat: number, lng: number) => {
    try {
      return await reverseGeocode(lat, lng);
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const applyPosition = useCallback(async (lat: number, lng: number, accuracy?: number) => {
    const placeName = await resolvePlaceName(lat, lng);
    setLocation({ lat, lng, placeName, accuracy });
    setStatus('granted');
    setErrorMessage(null);
  }, []);

  const requestLocation = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const coords = await getCurrentLocation();
      await applyPosition(coords.lat, coords.lng, coords.accuracy);

      watchCleanup.current?.();
      watchCleanup.current = watchLocation(
        async (pos) => {
          setIsLive(true);
          const placeName = await resolvePlaceName(pos.lat, pos.lng);
          setLocation({ lat: pos.lat, lng: pos.lng, placeName, accuracy: pos.accuracy });
        },
        () => setIsLive(false)
      );
    } catch (err) {
      const geoErr = err as GeolocationPositionError;
      if (geoErr?.code === 1) {
        setStatus('denied');
        setErrorMessage('Location permission denied. Allow location in browser settings to find nearby PGs.');
      } else {
        setStatus('error');
        setErrorMessage('Could not detect your location. Please try again.');
      }
    }
  }, [applyPosition]);

  useEffect(() => () => watchCleanup.current?.(), []);

  return (
    <LocationContext.Provider value={{ location, status, errorMessage, requestLocation, isLive }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used within LocationProvider');
  return ctx;
}

/** Optional hook — returns null if outside provider (shouldn't happen) */
export function useOptionalLocation() {
  return useContext(LocationContext);
}
