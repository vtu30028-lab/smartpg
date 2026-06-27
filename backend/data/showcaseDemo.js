const bcrypt = require('bcryptjs');

const DEMO_PASSWORD = 'password';
const DEMO_HASH = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

const demoUsers = [
  { id: 1, name: 'Admin User', email: 'admin@smartpg.com', password: DEMO_HASH, role: 'admin', phone: null },
  { id: 2, name: 'Rajesh Kumar', email: 'owner@smartpg.com', password: DEMO_HASH, role: 'owner', phone: '9876543210' },
  { id: 3, name: 'Anita Desai', email: 'anita@smartpg.com', password: DEMO_HASH, role: 'owner', phone: '9876543212' },
  { id: 4, name: 'Priya Sharma', email: 'student@smartpg.com', password: DEMO_HASH, role: 'student', phone: '9876543211' },
];

let nextUserId = 5;
let nextBookingId = 3;
let nextPaymentId = 2;

const demoBookings = [
  {
    id: 1, user_id: 4, pg_id: 5, room_type: 'double', move_in_date: '2026-07-01',
    duration_months: 3, status: 'confirmed', total_amount: 18000,
    pg_name: 'Student Hub PG', location: 'Jayanagar, Bangalore', rent: 6000,
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    user_name: 'Priya Sharma', user_email: 'student@smartpg.com', created_at: '2026-06-01',
  },
  {
    id: 2, user_id: 4, pg_id: 8, room_type: 'triple', move_in_date: '2026-08-15',
    duration_months: 1, status: 'pending', total_amount: 7800,
    pg_name: 'Campus Connect PG', location: 'Jayanagar, Bangalore', rent: 7800,
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
    user_name: 'Priya Sharma', user_email: 'student@smartpg.com', created_at: '2026-06-10',
  },
];

const demoPayments = [
  {
    id: 1, user_id: 4, booking_id: 1, pg_id: 5, amount: 18000,
    payment_type: 'booking', status: 'success', pg_name: 'Student Hub PG',
    created_at: '2026-06-02',
  },
];

function findUserByEmail(email) {
  return demoUsers.find((u) => u.email === email);
}

function findUserById(id) {
  const user = demoUsers.find((u) => u.id === Number(id));
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

async function verifyDemoPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function demoLogin(email, password) {
  const user = findUserByEmail(email);
  if (!user) return null;
  const valid = await verifyDemoPassword(password, user.password);
  if (!valid) return null;
  const { password: _, ...safe } = user;
  return safe;
}

async function demoRegister({ name, email, password, role = 'student', phone }) {
  if (findUserByEmail(email)) return { error: 'Email already registered.' };
  const validRole = ['student', 'owner'].includes(role) ? role : 'student';
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: nextUserId++,
    name,
    email,
    password: hashedPassword,
    role: validRole,
    phone: phone || null,
  };
  demoUsers.push(user);
  const { password: _, ...safe } = user;
  return { user: safe };
}

function getDemoBookings(user) {
  if (user.role === 'student') {
    return demoBookings.filter((b) => b.user_id === user.id);
  }
  if (user.role === 'owner') {
    const ownerPgIds = user.id === 2 ? [1, 2, 3, 4, 5, 6, 7, 17] : [8, 9, 10, 11, 12, 13, 14, 15, 16];
    return demoBookings.filter((b) => ownerPgIds.includes(b.pg_id));
  }
  return demoBookings;
}

function createDemoBooking(user, { pg_id, room_type, move_in_date, duration_months }, rent) {
  const pgNames = {
    5: 'Student Hub PG', 8: 'Campus Connect PG', 1: 'Sunshine PG for Girls',
  };
  const locations = {
    5: 'Jayanagar, Bangalore', 8: 'Jayanagar, Bangalore', 1: 'Koramangala, Bangalore',
  };
  const total = rent * (duration_months || 1);
  const booking = {
    id: nextBookingId++,
    user_id: user.id,
    pg_id: Number(pg_id),
    room_type: room_type || 'single',
    move_in_date: move_in_date || null,
    duration_months: duration_months || 1,
    status: 'pending',
    total_amount: total,
    pg_name: pgNames[pg_id] || 'Demo PG',
    location: locations[pg_id] || 'Bangalore',
    rent,
    user_name: user.name,
    user_email: user.email,
    created_at: new Date().toISOString().split('T')[0],
  };
  demoBookings.unshift(booking);
  return booking;
}

function updateDemoBookingStatus(id, status) {
  const booking = demoBookings.find((b) => b.id === Number(id));
  if (booking) booking.status = status;
  return booking;
}

function getDemoPayments(user) {
  if (user.role === 'student') {
    return demoPayments.filter((p) => p.user_id === user.id);
  }
  return demoPayments;
}

function createDemoPayment(user, { amount, booking_id, pg_id, payment_type }) {
  const payment = {
    id: nextPaymentId++,
    user_id: user.id,
    booking_id: booking_id || null,
    pg_id: pg_id || null,
    amount: Number(amount),
    payment_type: payment_type || 'rent',
    status: 'pending',
    pg_name: 'Demo PG',
    created_at: new Date().toISOString().split('T')[0],
  };
  demoPayments.unshift(payment);
  return payment;
}

function verifyDemoPayment(paymentId) {
  const payment = demoPayments.find((p) => p.id === Number(paymentId));
  if (payment) {
    payment.status = 'success';
    if (payment.booking_id) {
      updateDemoBookingStatus(payment.booking_id, 'confirmed');
    }
  }
  return payment;
}

function getDemoStats() {
  return {
    users: demoUsers.length,
    pgs: 17,
    bookings: demoBookings.length,
    revenue: demoPayments.filter((p) => p.status === 'success').reduce((s, p) => s + p.amount, 0),
    recentBookings: demoBookings.slice(0, 5),
  };
}

function getDemoUsers() {
  return demoUsers.map(({ password, ...u }) => u);
}

function deleteDemoUser(id) {
  const idx = demoUsers.findIndex((u) => u.id === Number(id));
  if (idx === -1) return false;
  if (demoUsers[idx].role === 'admin') return false;
  demoUsers.splice(idx, 1);
  return true;
}

module.exports = {
  demoUsers,
  findUserByEmail,
  findUserById,
  demoLogin,
  demoRegister,
  getDemoBookings,
  createDemoBooking,
  updateDemoBookingStatus,
  getDemoPayments,
  createDemoPayment,
  verifyDemoPayment,
  getDemoStats,
  getDemoUsers,
  deleteDemoUser,
  DEMO_PASSWORD,
};
