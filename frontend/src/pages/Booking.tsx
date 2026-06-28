import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Loader2, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import type { PG } from '../types';

export default function Booking() {
  const { pgId } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [pg, setPg] = useState<PG | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    room_type: 'single',
    move_in_date: '',
    duration_months: 1,
  });

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    api.get<PG>(`/pgs/${pgId}`)
      .then(({ data }) => {
        setPg(data);
        const defaultRoomType = data.room_pricing ? Object.keys(data.room_pricing)[0] : 'single';
        setForm((f) => ({ ...f, room_type: defaultRoomType }));
      })
      .catch(() => navigate('/search'))
      .finally(() => setLoading(false));
  }, [pgId, navigate]);

  const rentAmount = pg?.room_pricing?.[form.room_type] || pg?.rent || 0;
  const totalAmount = rentAmount * form.duration_months;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/book', {
        pg_id: pg?.id,
        ...form,
      });
      navigate(`/payment/${data.booking.id}`, {
        state: { amount: data.booking.total_amount, pgName: pg?.name, pgId: pg?.id },
      });
    } catch {
      alert('Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={`/pg/${pg.id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft size={16} /> Back to PG Details
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
        <h1 className="font-display text-2xl font-bold mb-2">Book {pg.name}</h1>
        <p className="text-gray-500 mb-6">{pg.location} • ₹{pg.rent.toLocaleString()}/month</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Room Type</label>
            <select
              value={form.room_type}
              onChange={(e) => setForm({ ...form, room_type: e.target.value })}
              className="input-field capitalize"
            >
              {pg.room_pricing && Object.keys(pg.room_pricing).length > 0 ? Object.keys(pg.room_pricing).map((type) => (
                <option key={type} value={type}>{type} (₹{pg.room_pricing[type].toLocaleString()}/mo)</option>
              )) : (
                <option value="single">Single (₹{pg.rent?.toLocaleString() || 0}/mo)</option>
              )}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Move-in Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={form.move_in_date}
                onChange={(e) => setForm({ ...form, move_in_date: e.target.value })}
                className="input-field !pl-11"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Duration (months)</label>
            <select
              value={form.duration_months}
              onChange={(e) => setForm({ ...form, duration_months: Number(e.target.value) })}
              className="input-field"
            >
              {[1, 3, 6, 12].map((m) => (
                <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <div className="flex justify-between text-sm mb-1">
              <span>Rent × {form.duration_months} month(s)</span>
              <span>₹{rentAmount.toLocaleString()} × {form.duration_months}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-primary-200 dark:border-primary-800">
              <span>Total</span>
              <span className="text-primary-600 dark:text-primary-400">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
            {submitting ? 'Creating Booking...' : 'Proceed to Payment'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
