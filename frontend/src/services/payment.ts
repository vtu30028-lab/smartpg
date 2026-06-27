import api from './api';
import type { Payment } from '../types';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

export const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const createPaymentOrder = (data: {
  amount: number;
  booking_id?: number;
  pg_id?: number;
  payment_type?: string;
}) => api.post('/payment', data);

export const verifyPayment = (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  payment_id: number;
}) => api.post('/payment/verify', data);

export const getPaymentHistory = () => api.get<Payment[]>('/payments');

export const initiatePayment = async (
  amount: number,
  options: {
    booking_id?: number;
    pg_id?: number;
    payment_type?: string;
    pgName?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
  }
): Promise<boolean> => {
  const { data } = await createPaymentOrder({
    amount,
    booking_id: options.booking_id,
    pg_id: options.pg_id,
    payment_type: options.payment_type || 'rent',
  });

  const order = data.order;
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || order.key_id;
  const isDemoMode =
    !razorpayKey ||
    razorpayKey.includes('placeholder') ||
    razorpayKey.includes('demo') ||
    !razorpayKey.startsWith('rzp_');

  if (isDemoMode) {
    await verifyPayment({
      razorpay_order_id: order.order_id,
      razorpay_payment_id: `pay_demo_${Date.now()}`,
      razorpay_signature: 'demo_signature',
      payment_id: order.id,
    });
    return true;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Failed to load Razorpay. Check your internet connection.');
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: 'Smart PG Assistant',
      description: options.pgName || 'PG Payment',
      order_id: order.order_id,
      handler: async (response) => {
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            payment_id: order.id,
          });
          resolve(true);
        } catch {
          reject(new Error('Payment verification failed'));
        }
      },
      prefill: {
        name: options.userName,
        email: options.userEmail,
        contact: options.userPhone,
      },
      theme: { color: '#6366f1' },
    });

    rzp.open();
  });
};
