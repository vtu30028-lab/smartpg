import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Wifi, Utensils, Wind, Bath } from 'lucide-react';
import type { PG } from '../types';

interface PGCardProps {
  pg: PG;
  index?: number;
}

export default function PGCard({ pg, index = 0 }: PGCardProps) {
  const [imgError, setImgError] = useState(false);
  const fallbackImages = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
  ];
  const fallbackImage = fallbackImages[(pg.id || 0) % fallbackImages.length];
  const image = (!imgError && pg.images && pg.images.length > 0 && pg.images[0]) ? pg.images[0] : fallbackImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link to={`/pg/${pg.id}`} className="block glass-card overflow-hidden !p-0 group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={pg.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {pg.is_featured && (
            <span className="absolute top-3 left-3 badge bg-accent-500 text-white">Featured</span>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg drop-shadow-lg">{pg.name}</h3>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <MapPin size={12} /> {pg.location}
              </p>
            </div>
            {pg.distance != null && (
              <span className="badge bg-white/20 text-white backdrop-blur-sm">{pg.distance} km</span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-gray-500 text-sm mr-1">Starts from</span>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ₹{pg.rent?.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm">/mo</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={16} fill="currentColor" />
              <span className="font-semibold text-sm">{pg.rating || 'New'}</span>
              {pg.total_reviews > 0 && (
                <span className="text-gray-400 text-xs">({pg.total_reviews})</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {pg.food_available && (
              <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                <Utensils size={10} className="mr-1" /> Food
              </span>
            )}
            {pg.wifi && (
              <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                <Wifi size={10} className="mr-1" /> WiFi
              </span>
            )}
            {pg.ac && (
              <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                <Wind size={10} className="mr-1" /> AC
              </span>
            )}
            {pg.attached_bathroom && (
              <span className="badge bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                <Bath size={10} className="mr-1" /> Bath
              </span>
            )}
            {pg.room_pricing && Object.keys(pg.room_pricing).map((type) => (
              <span key={type} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                {type}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
