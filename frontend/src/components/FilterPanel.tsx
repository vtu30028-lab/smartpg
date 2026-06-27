import { SlidersHorizontal, X } from 'lucide-react';
import type { PGFilters } from '../types';

interface FilterPanelProps {
  filters: PGFilters;
  onChange: (filters: PGFilters) => void;
  onApply: () => void;
  onClear: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function FilterPanel({
  filters,
  onChange,
  onApply,
  onClear,
  isOpen = true,
  onToggle,
}: FilterPanelProps) {
  const update = (key: keyof PGFilters, value: unknown) =>
    onChange({ ...filters, [key]: value });

  const toggleBool = (key: keyof PGFilters) =>
    onChange({ ...filters, [key]: !filters[key] });

  const content = (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Price Range (₹/month)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minRent || ''}
            onChange={(e) => update('minRent', e.target.value ? Number(e.target.value) : undefined)}
            className="input-field !py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxRent || ''}
            onChange={(e) => update('maxRent', e.target.value ? Number(e.target.value) : undefined)}
            className="input-field !py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Room Type</label>
        <select
          value={filters.roomType || ''}
          onChange={(e) => update('roomType', e.target.value || undefined)}
          className="input-field !py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
          <option value="shared">Shared</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Gender</label>
        <select
          value={filters.gender || ''}
          onChange={(e) => update('gender', e.target.value || undefined)}
          className="input-field !py-2 text-sm"
        >
          <option value="">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Amenities</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'food' as const, label: 'Food' },
            { key: 'wifi' as const, label: 'WiFi' },
            { key: 'ac' as const, label: 'AC' },
            { key: 'bathroom' as const, label: 'Attached Bath' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                filters[key]
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700'
                  : 'bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={!!filters[key]}
                onChange={() => toggleBool(key)}
                className="rounded text-primary-500 focus:ring-primary-500"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onApply} className="btn-primary flex-1 !py-2 text-sm">Apply Filters</button>
        <button onClick={onClear} className="btn-secondary !py-2 text-sm">Clear</button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden btn-secondary w-full !py-2 mb-4 flex items-center justify-center gap-2"
      >
        <SlidersHorizontal size={16} />
        Filters
      </button>

      <div className={`glass-card ${isOpen ? 'block' : 'hidden lg:block'} lg:!p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-primary-500" />
            Filters
          </h3>
          {onToggle && (
            <button onClick={onToggle} className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <X size={18} />
            </button>
          )}
        </div>
        {content}
      </div>
    </>
  );
}
