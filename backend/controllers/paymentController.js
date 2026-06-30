const db = require('../config/database');
const crypto = require('crypto');
const { getRazorpay, isRazorpayConfigured } = require('../config/razorpay');
const {
  getDemoPayments, createDemoPayment, verifyDemoPayment,
} = require('../data/showcaseDemo');

async function createRazorpayOrder(amount, receipt) {
  const razorpay = getRazorpay();
  if (!razorpay) return null;

  const order = await razorpay.orders.create({
    amount: Math.round(Number(amount) * 100),
    currency: 'INR',
    receipt: receipt || `rcpt_${Date.now()}`,
  });

  return order;
}

exports.createPayment = async (req, res) => {
  const { amount, booking_id, pg_id, payment_type = 'rent' } = req.body;

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required.' });
  }

  try {
    let razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    if (isRazorpayConfigured()) {
      const order = await createRazorpayOrder(amount, `booking_${booking_id || 'new'}`);
      if (order) razorpayOrderId = order.id;
    }

    const [result] = await db.query(
      `INSERT INTO payments (user_id, booking_id, pg_id, amount, payment_type, razorpay_order_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, booking_id || null, pg_id || null, amount, payment_type, razorpayOrderId]
    );

    res.status(201).json({
      message: 'Payment order created.',
      order: {
        id: result.insertId,
        order_id: razorpayOrderId,
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Create payment error (demo mode):', error.message);

    if (isRazorpayConfigured()) {
      return res.status(400).json({ message: 'Razorpay configuration is incorrect or payment failed: ' + error.message });
    }

    let razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    const payment = createDemoPayment(req.user, { amount, booking_id, pg_id, payment_type });
    res.status(201).json({
      message: 'Payment order created.',
      order: {
        id: payment.id,
        order_id: razorpayOrderId,
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, payment_id } = req.body;

  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && razorpay_order_id && razorpay_payment_id) {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (req.body.razorpay_signature !== expectedSignature) {
        try {
          await db.query('UPDATE payments SET status = ? WHERE id = ?', ['failed', payment_id]);
        } catch { /* demo mode */ }
        return res.status(400).json({ message: 'Payment verification failed.' });
      }
    }

    try {
      await db.query(
        'UPDATE payments SET status = ?, razorpay_payment_id = ?, receipt_url = ? WHERE id = ?',
        ['success', razorpay_payment_id, `/receipts/${payment_id}`, payment_id]
      );

      const [payment] = await db.query('SELECT booking_id FROM payments WHERE id = ?', [payment_id]);
      if (payment[0]?.booking_id) {
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['confirmed', payment[0].booking_id]);
      }
    } catch {
      verifyDemoPayment(payment_id);
    }

    res.json({ message: 'Payment verified successfully.', status: 'success' });
  } catch (error) {
    console.error('Verify payment error (demo mode):', error.message);
    verifyDemoPayment(req.body.payment_id);
    res.json({ message: 'Payment verified successfully.', status: 'success' });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    let query = `
      SELECT pay.*, p.name as pg_name, b.status as booking_status
      FROM payments pay
      LEFT JOIN pgs p ON pay.pg_id = p.id
      LEFT JOIN bookings b ON pay.booking_id = b.id
    `;
    const params = [];

    if (req.user.role === 'student') {
      query += ' WHERE pay.user_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'owner') {
      query += ' WHERE p.owner_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY pay.created_at DESC';
    const [payments] = await db.query(query, params);
    res.json(payments);
  } catch (error) {
    console.error('Payment history error (demo mode):', error.message);
    res.json(getDemoPayments(req.user));
  }
};
