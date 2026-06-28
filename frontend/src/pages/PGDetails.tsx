import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Star, Wifi, Utensils, Wind, Bath, Car, Shirt,
  Phone, Mail, Navigation, Loader2, ArrowLeft,
} from 'lucide-react';
import api from '../services/api';
import { isAuthenticated, getCurrentUser } from '../services/auth';
import { getDirectionsUrl } from '../services/map';
import GoogleMapView from '../components/GoogleMapView';
import type { PG } from '../types';

export default function PGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pg, setPg] = useState<PG | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    api.get<PG>(`/pgs/${id}`)
      .then(({ data }) => setPg(data))
      .catch(() => navigate('/search'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    setReviewLoading(true);
    try {
      await api.post('/review', { pg_id: pg?.id, ...reviewForm });
      const { data } = await api.get<PG>(`/pgs/${id}`);
      setPg(data);
      setReviewForm({ rating: 5, comment: '' });
    } catch {
      alert('Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!pg) return null;

  const fallbackImages = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
  ];
  const fallbackImage = fallbackImages[(pg.id || 0) % fallbackImages.length];
  const image = (!imgError && pg.images && pg.images.length > 0 && pg.images[0]) ? pg.images[0] : fallbackImage;
  const amenities = [
    { key: 'food_available', label: 'Food', icon: Utensils },
    { key: 'wifi', label: 'WiFi', icon: Wifi },
    { key: 'ac', label: 'AC', icon: Wind },
    { key: 'attached_bathroom', label: 'Attached Bath', icon: Bath },
    { key: 'laundry', label: 'Laundry', icon: Shirt },
    { key: 'parking', label: 'Parking', icon: Car },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/search" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card !p-0 overflow-hidden">
            <img 
              src={image} 
              alt={pg.name} 
              onError={() => setImgError(true)}
              className="w-full h-64 sm:h-80 object-cover" 
            />
          </motion.div>

          <div className="glass-card">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold">{pg.name}</h1>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={16} /> {pg.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  <span className="text-lg font-normal text-gray-500 mr-1">Starts from</span>
                  ₹{pg.rent?.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
                <div className="flex items-center gap-1 justify-end text-yellow-500 mt-1">
                  <Star size={16} fill="currentColor" />
                  <span className="font-semibold">{pg.rating || 'New'}</span>
                  <span className="text-gray-400 text-sm">({pg.total_reviews} reviews)</span>
                </div>
              </div>
            </div>

            {pg.description && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{pg.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {amenities.map(({ key, label, icon: Icon }) => {
                const active = pg[key as keyof PG];
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                      active
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 line-through'
                    }`}
                  >
                    <Icon size={16} /> {label}
                  </div>
                );
              })}
            </div>

            <div className="mb-6">
              <h2 className="font-semibold text-lg mb-3">Pricing & Room Types</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pg.room_pricing && Object.entries(pg.room_pricing).map(([type, price]) => (
                  <div key={type} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <span className="capitalize font-medium">{type} Sharing</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">₹{price.toLocaleString()}/mo</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 capitalize">
                {pg.gender_preference === 'any' ? 'All genders' : `${pg.gender_preference} only`}
              </span>
              <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {pg.rooms} rooms available
              </span>
            </div>
          </div>

          {pg.latitude && pg.longitude && (
            <div className="glass-card !p-0 overflow-hidden">
              <GoogleMapView singlePg={pg} height="320px" zoom={15} />
            </div>
          )}

          {pg.reviews && pg.reviews.length > 0 && (
            <div className="glass-card">
              <h2 className="font-semibold text-lg mb-4">Reviews</h2>
              <div className="space-y-4">
                {pg.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200/50 dark:border-gray-700/50 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{review.user_name}</span>
                      <div className="flex items-center gap-0.5 text-yellow-500">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {user?.role === 'student' && (
            <div className="glass-card">
              <h2 className="font-semibold text-lg mb-4">Write a Review</h2>
              <form onSubmit={handleReview} className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="input-field !py-2 mt-1"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience..."
                  className="input-field min-h-[80px] resize-none"
                />
                <button type="submit" disabled={reviewLoading} className="btn-primary !py-2 text-sm">
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card sticky top-24">
            <h3 className="font-semibold mb-4">Book This PG</h3>
            <Link
              to={isAuthenticated() ? `/book/${pg.id}` : '/login'}
              className="btn-primary w-full !py-3 mb-4"
            >
              Book Now
            </Link>

            {pg.owner_name && (
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-500">Contact Owner</h4>
                <p className="font-medium">{pg.owner_name}</p>
                {pg.owner_phone && (
                  <a href={`tel:${pg.owner_phone}`} className="flex items-center gap-2 text-sm text-primary-500">
                    <Phone size={14} /> {pg.owner_phone}
                  </a>
                )}
                {pg.owner_email && (
                  <a href={`mailto:${pg.owner_email}`} className="flex items-center gap-2 text-sm text-primary-500">
                    <Mail size={14} /> {pg.owner_email}
                  </a>
                )}
                {pg.latitude && pg.longitude && (
                  <a
                    href={getDirectionsUrl(12.9716, 77.5946, pg.latitude, pg.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full !py-2 text-sm"
                  >
                    <Navigation size={14} /> Get Directions
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
