import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Calendar, CreditCard, Star, Loader2, XCircle, CheckCircle, Clock,
} from 'lucide-react';
import api from '../services/api';
import { getCurrentUser, getProfile } from '../services/auth';
import { getPaymentHistory } from '../services/payment';
import { initiatePayment } from '../services/payment';
import type { Booking, Payment, User } from '../types';

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  confirmed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  completed: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(getCurrentUser());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }

    Promise.all([
      getProfile().then(({ data }) => setProfile(data)),
      api.get<Booking[]>('/bookings').then(({ data }) => setBookings(data)),
      getPaymentHistory().then(({ data }) => setPayments(data)),
    ]).finally(() => setLoading(false));
  }, [navigate]);

  const handlePayRent = async (booking: Booking) => {
    setPayingId(booking.id);
    try {
      await initiatePayment(booking.rent || booking.total_amount, {
        booking_id: booking.id,
        pg_id: booking.pg_id,
        payment_type: 'rent',
        pgName: booking.pg_name,
        userName: profile?.name,
        userEmail: profile?.email,
        userPhone: profile?.phone,
      });
      const { data } = await getPaymentHistory();
      setPayments(data);
    } catch {
      alert('Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' });
      const { data } = await api.get<Booking[]>('/bookings');
      setBookings(data);
    } catch {
      alert('Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Student Dashboard</h1>
            <p className="text-gray-500">Welcome back, {profile?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Bookings', value: bookings.filter((b) => b.status === 'confirmed').length, icon: Calendar },
            { label: 'Pending', value: bookings.filter((b) => b.status === 'pending').length, icon: Clock },
            { label: 'Payments Made', value: payments.filter((p) => p.status === 'success').length, icon: CreditCard },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-primary-500" /> My Bookings
            </h2>
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No bookings yet.</p>
                <Link to="/search" className="btn-primary mt-4 inline-flex text-sm">Find a PG</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const config = statusConfig[booking.status];
                  const StatusIcon = config.icon;
                  return (
                    <div key={booking.id} className={`p-4 rounded-xl ${config.bg}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <Link to={`/pg/${booking.pg_id}`} className="font-medium hover:text-primary-500">
                            {booking.pg_name}
                          </Link>
                          <p className="text-sm text-gray-500">{booking.location}</p>
                          <p className="text-sm mt-1">₹{booking.total_amount?.toLocaleString()} • {booking.duration_months} mo</p>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-medium capitalize ${config.color}`}>
                          <StatusIcon size={14} /> {booking.status}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {booking.status === 'pending' && (
                          <Link to={`/payment/${booking.id}`} state={{ amount: booking.total_amount, pgName: booking.pg_name, pgId: booking.pg_id }} className="btn-primary !py-1.5 !px-3 text-xs">
                            Pay Now
                          </Link>
                        )}
                        {booking.status === 'confirmed' && (
                          <button onClick={() => handlePayRent(booking)} disabled={payingId === booking.id} className="btn-accent !py-1.5 !px-3 text-xs">
                            {payingId === booking.id ? 'Processing...' : 'Pay Rent'}
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <button onClick={() => handleCancel(booking.id)} className="btn-secondary !py-1.5 !px-3 text-xs text-red-500">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-card">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-primary-500" /> Payment History
            </h2>
            {payments.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No payments yet.</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="font-medium text-sm">{payment.pg_name || 'Payment'}</p>
                      <p className="text-xs text-gray-500 capitalize">{payment.payment_type} • {new Date(payment.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{payment.amount.toLocaleString()}</p>
                      <p className={`text-xs capitalize ${payment.status === 'success' ? 'text-green-500' : payment.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/search" className="btn-primary inline-flex items-center gap-2">
            <Star size={16} /> Find More PGs
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
