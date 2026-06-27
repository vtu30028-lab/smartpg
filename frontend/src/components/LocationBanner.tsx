import { MapPin, Navigation, Loader2, LocateFixed } from 'lucide-react';

interface LocationBannerProps {
  placeName?: string | null;
  status: 'idle' | 'loading' | 'granted' | 'denied' | 'error';
  errorMessage?: string | null;
  isLive?: boolean;
  onRequest: () => void;
  compact?: boolean;
}

export default function LocationBanner({
  placeName,
  status,
  errorMessage,
  isLive,
  onRequest,
  compact,
}: LocationBannerProps) {
  if (status === 'granted' && placeName) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-green-600 dark:text-green-400`}>
        <span className="relative flex h-2 w-2">
          {isLive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <MapPin size={compact ? 12 : 14} />
        <span>Live: {placeName}</span>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-primary-500`}>
        <Loader2 size={14} className="animate-spin" />
        Detecting your location...
      </div>
    );
  }

  if (status === 'denied' || status === 'error') {
    return (
      <div className={`glass-card ${compact ? '!p-3' : '!p-4'} border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/20`}>
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-amber-800 dark:text-amber-200 mb-2`}>
          {errorMessage || 'Location access is needed to show nearby PGs on the map.'}
        </p>
        <button onClick={onRequest} className="btn-primary !py-1.5 !px-3 text-xs">
          <LocateFixed size={14} /> Allow Location
        </button>
      </div>
    );
  }

  return (
    <div className={`glass-card ${compact ? '!p-3' : '!p-4'} flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-primary-200 dark:border-primary-800`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
          <Navigation size={20} className="text-primary-500" />
        </div>
        <div>
          <p className="font-medium text-sm">Enable live location</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Allow location to see PGs near you on the map and get better AI recommendations.
          </p>
        </div>
      </div>
      <button onClick={onRequest} className="btn-primary !py-2 !px-4 text-sm whitespace-nowrap shrink-0">
        <LocateFixed size={16} /> Allow Location
      </button>
    </div>
  );
}
