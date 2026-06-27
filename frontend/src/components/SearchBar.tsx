import { Search, MapPin, Loader2 } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onLocationClick?: () => void;
  loading?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onLocationClick,
  loading,
  placeholder = 'Search PG by location, name...',
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder={placeholder}
          className="input-field !pl-12 !py-4 text-base"
        />
      </div>
      <div className="flex gap-2">
        {onLocationClick && (
          <button
            onClick={onLocationClick}
            disabled={loading}
            className="btn-secondary !px-4 whitespace-nowrap"
            title="Use my location"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
            <span className="hidden sm:inline">Near Me</span>
          </button>
        )}
        <button onClick={onSearch} className="btn-primary !px-8">
          Search
        </button>
      </div>
    </div>
  );
}
