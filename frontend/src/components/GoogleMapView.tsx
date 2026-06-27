import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { PG } from '../types';
import {
  loadGoogleMapsScript,
  getEmbedMapUrl,
  GOOGLE_MAPS_API_KEY,
  DEFAULT_LOCATION,
} from '../services/map';

interface GoogleMapViewProps {
  pgs?: PG[];
  center?: { lat: number; lng: number };
  zoom?: number;
  userLat?: number;
  userLng?: number;
  selectedPg?: PG | null;
  onSelectPg?: (pg: PG) => void;
  height?: string;
  singlePg?: PG | null;
}

export default function GoogleMapView({
  pgs = [],
  center,
  zoom = 12,
  userLat,
  userLng,
  selectedPg,
  onSelectPg,
  height = '350px',
  singlePg,
}: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const pgList = singlePg ? [singlePg] : pgs.filter((p) => p.latitude && p.longitude);

  const getCenter = () => {
    if (center) return center;
    if (userLat && userLng) return { lat: userLat, lng: userLng };
    if (selectedPg?.latitude && selectedPg?.longitude) {
      return { lat: Number(selectedPg.latitude), lng: Number(selectedPg.longitude) };
    }
    if (pgList.length > 0) {
      return { lat: Number(pgList[0].latitude), lng: Number(pgList[0].longitude) };
    }
    return DEFAULT_LOCATION;
  };

  const updateUserMarker = (map: google.maps.Map, lat: number, lng: number) => {
    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition({ lat, lng });
    } else {
      userMarkerRef.current = new google.maps.Marker({
        map,
        position: { lat, lng },
        title: 'Your Live Location',
        zIndex: 999,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3,
        },
      });
    }
    if (!singlePg) {
      map.panTo({ lat, lng });
    }
  };

  const updatePgMarkers = (map: google.maps.Map, list: PG[]) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    list.forEach((pg) => {
      if (!pg.latitude || !pg.longitude) return;

      const marker = new google.maps.Marker({
        map,
        position: { lat: Number(pg.latitude), lng: Number(pg.longitude) },
        title: pg.name,
        label: {
          text: `₹${(pg.rent / 1000).toFixed(0)}k`,
          color: '#fff',
          fontSize: '10px',
          fontWeight: 'bold',
        },
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: selectedPg?.id === pg.id ? '#f43f5e' : '#6366f1',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 1,
          rotation: 180,
        },
      });

      marker.addListener('click', () => {
        onSelectPg?.(pg);
        infoWindowRef.current?.setContent(`
          <div style="padding:4px;max-width:200px;font-family:sans-serif">
            <strong style="font-size:14px">${pg.name}</strong>
            <p style="margin:4px 0;font-size:12px;color:#666">${pg.location}</p>
            <p style="margin:0;font-size:13px;color:#6366f1;font-weight:600">₹${pg.rent.toLocaleString()}/mo</p>
            ${pg.distance != null ? `<p style="margin:4px 0 0;font-size:11px;color:#888">${pg.distance} km away</p>` : ''}
          </div>
        `);
        infoWindowRef.current?.open(map, marker);
        map.panTo({ lat: Number(pg.latitude), lng: Number(pg.longitude) });
      });

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !mapRef.current) {
      setLoading(false);
      setError(!GOOGLE_MAPS_API_KEY);
      return;
    }

    let cancelled = false;

    loadGoogleMapsScript()
      .then(() => {
        if (cancelled || !mapRef.current) return;

        const mapCenter = getCenter();
        const map = new google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: singlePg ? 15 : userLat ? 14 : zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          ],
        });

        mapInstance.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();

        if (userLat && userLng) updateUserMarker(map, userLat, userLng);
        updatePgMarkers(map, pgList);
        setMapReady(true);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Live update user position on map
  useEffect(() => {
    if (!mapInstance.current || !mapReady || !userLat || !userLng) return;
    updateUserMarker(mapInstance.current, userLat, userLng);
  }, [userLat, userLng, mapReady]);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    updatePgMarkers(mapInstance.current, pgList);

    if (selectedPg?.latitude && selectedPg?.longitude) {
      mapInstance.current.panTo({
        lat: Number(selectedPg.latitude),
        lng: Number(selectedPg.longitude),
      });
      mapInstance.current.setZoom(15);
    }
  }, [selectedPg, pgs, mapReady]);

  if (error || !GOOGLE_MAPS_API_KEY) {
    const c = getCenter();
    return (
      <iframe
        title="PG Map"
        src={getEmbedMapUrl(c.lat, c.lng, singlePg?.name || selectedPg?.name)}
        className="w-full border-0"
        style={{ height }}
        loading="lazy"
        allowFullScreen
      />
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <Loader2 size={28} className="animate-spin text-primary-500" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-b-2xl" />
    </div>
  );
}
