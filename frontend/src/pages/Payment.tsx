import { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { initiatePayment } from '../services/payment';
import { getCurrentUser } from '../services/auth';

export default function Payment() {
  const { bookingId } = useParams();
  const location = useLocation();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const state = location.state as {
    amount?: number;
    pgName?: string;
    pgId?: number;
  } | null;

  const amount = state?.amount || 0;

  const handlePay = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      await initiatePayment(amount, {
        booking_id: Number(bookingId),
        pg_id: state?.pgId,
        payment_type: 'booking',
        pgName: state?.pgName,
        userName: user?.name,
        userEmail: user?.email,
        userPhone: user?.phone,
      });
      setSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="glass-card">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your booking for {state?.pgName} has been confirmed.
          </p>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft size={16} /> Back
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
            <CreditCard size={28} />
          </div>
          <h1 className="font-display text-2xl font-bold">Complete Payment</h1>
          {state?.pgName && (
            <p className="text-gray-500 mt-1">{state.pgName}</p>
          )}
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Amount to pay</span>
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              ₹{amount.toLocaleString()}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mb-4">
          Secure payment powered by Razorpay.
        </p>

        <button
          onClick={handlePay}
          disabled={loading || !amount}
          className="btn-primary w-full !py-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Processing...</>
          ) : (
            <><CreditCard size={18} /> Pay ₹{amount.toLocaleString()}</>
          )}
        </button>
      </motion.div>
    </div>
  );
}
