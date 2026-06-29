import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Map, List, Loader2 } from 'lucide-react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import PGCard from '../components/PGCard';
import MapView from '../components/MapView';
import ChatBot from '../components/ChatBot';
import LocationBanner from '../components/LocationBanner';
import { useLocationContext } from '../context/LocationContext';
import { getAllFallbackPGs } from '../data/fallbackPGs';
import type { PG, PGFilters } from '../types';

export default function PGSearch() {
  const { location, status, errorMessage, requestLocation, isLive } = useLocationContext();
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<PGFilters>({});
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPg, setSelectedPg] = useState<PG | null>(null);
  const [askedLocation, setAskedLocation] = useState(false);

  const fetchPGs = useCallback(async (currentFilters: PGFilters, searchTerm?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (currentFilters.minRent) params.set('minRent', String(currentFilters.minRent));
      if (currentFilters.maxRent) params.set('maxRent', String(currentFilters.maxRent));
      if (currentFilters.food) params.set('food', 'true');
      if (currentFilters.wifi) params.set('wifi', 'true');
      if (currentFilters.ac) params.set('ac', 'true');
      if (currentFilters.bathroom) params.set('bathroom', 'true');
      if (currentFilters.roomType) params.set('roomType', currentFilters.roomType);
      if (currentFilters.gender) params.set('gender', currentFilters.gender);
      if (currentFilters.lat) params.set('lat', String(currentFilters.lat));
      if (currentFilters.lng) params.set('lng', String(currentFilters.lng));
      if (currentFilters.radius) params.set('radius', String(currentFilters.radius));

      const { data } = await api.get<PG[]>(`/pgs?${params.toString()}`);
      
      // Remove duplicates from the backend if any exist
      const uniqueData = data?.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i) || [];
      
      setPgs(uniqueData);
    } catch {
      // Only use fallback data if the API is completely down/throws an error
      setPgs(getAllFallbackPGs());
    } finally {
      setLoading(false);
    }
  }, []);

  // Ask location permission when page loads
  useEffect(() => {
    if (!askedLocation && status === 'idle') {
      setAskedLocation(true);
      requestLocation();
    }
  }, [askedLocation, status, requestLocation]);

  // Refetch PGs when live location updates or status is resolved
  useEffect(() => {
    if (!askedLocation || status === 'loading' || status === 'idle') return;

    if (location) {
      const newFilters = { ...filters, lat: location.lat, lng: location.lng, radius: 15 };
      setFilters(newFilters);
      fetchPGs(newFilters, search);
    } else {
      fetchPGs(filters, search);
    }
  }, [location?.lat, location?.lng, status, askedLocation]);

  const handleSearch = () => fetchPGs(filters, search);

  const handleLocation = () => requestLocation();

  const handleApplyFilters = () => {
    setFilterOpen(false);
    fetchPGs(filters, search);
  };

  const handleClearFilters = () => {
    const cleared: PGFilters = location
      ? { lat: location.lat, lng: location.lng, radius: 15 }
      : {};
    setFilters(cleared);
    fetchPGs(cleared, search);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-3xl font-bold mb-2">Find Your PG</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Search by location, use filters, or ask our AI assistant
        </p>

        <LocationBanner
          placeName={location?.placeName}
          status={status}
          errorMessage={errorMessage}
          isLive={isLive}
          onRequest={requestLocation}
        />
      </motion.div>

      <div className="mb-8">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
          onLocationClick={handleLocation}
          loading={status === 'loading'}
        />
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {loading ? 'Searching...' : `${pgs.length} PG${pgs.length !== 1 ? 's' : ''} found`}
          {location && ` near ${location.placeName || 'your location'}`}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'glass'}`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-primary-500 text-white' : 'glass'}`}
          >
            <Map size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            isOpen={filterOpen}
            onToggle={() => setFilterOpen(!filterOpen)}
          />
        </div>

        <div className="lg:col-span-3">
          {loading && pgs.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary-500" />
            </div>
          ) : viewMode === 'map' ? (
            <MapView
              pgs={pgs}
              userLat={location?.lat}
              userLng={location?.lng}
              selectedPg={selectedPg}
              onSelectPg={setSelectedPg}
            />
          ) : pgs.length === 0 ? (
            <div className="glass-card text-center py-16">
              <p className="text-gray-500 text-lg">No PGs found matching your criteria.</p>
              <button onClick={handleClearFilters} className="btn-primary mt-4">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {pgs.map((pg, i) => (
                <PGCard key={pg.id} pg={pg} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ChatBot />
    </div>
  );
}
