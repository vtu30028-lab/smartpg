import { MapPin, Navigation } from 'lucide-react';
import type { PG } from '../types';
import { getDirectionsUrl } from '../services/map';
import GoogleMapView from './GoogleMapView';

interface MapViewProps {
  pgs: PG[];
  userLat?: number;
  userLng?: number;
  selectedPg?: PG | null;
  onSelectPg?: (pg: PG) => void;
}

export default function MapView({ pgs, userLat, userLng, selectedPg, onSelectPg }: MapViewProps) {
  const centerPg = selectedPg || pgs.find((p) => p.latitude && p.longitude) || pgs[0];

  return (
    <div className="glass-card !p-0 overflow-hidden h-full min-h-[400px] flex flex-col">
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MapPin size={18} className="text-primary-500" />
          Map View
          <span className="text-sm font-normal text-gray-500">({pgs.length} PGs)</span>
        </h3>
        {userLat && userLng && centerPg?.latitude && centerPg?.longitude && (
          <a
            href={getDirectionsUrl(userLat, userLng, centerPg.latitude, centerPg.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            <Navigation size={14} /> Directions
          </a>
        )}
      </div>

      <GoogleMapView
        pgs={pgs}
        userLat={userLat}
        userLng={userLng}
        selectedPg={selectedPg}
        onSelectPg={onSelectPg}
        height="380px"
      />

      {pgs.length > 0 && (
        <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 max-h-32 overflow-y-auto scrollbar-hide">
          <div className="flex gap-2 flex-wrap">
            {pgs.slice(0, 12).map((pg) => (
              <button
                key={pg.id}
                onClick={() => onSelectPg?.(pg)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  selectedPg?.id === pg.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                }`}
              >
                {pg.name} {pg.distance != null && `(${pg.distance}km)`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
