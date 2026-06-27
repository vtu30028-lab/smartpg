const db = require('../config/database');
const { getShowcasePGById } = require('../data/showcasePGs');
const {
  getDemoBookings, createDemoBooking, updateDemoBookingStatus, getDemoStats,
} = require('../data/showcaseDemo');

exports.createBooking = async (req, res) => {
  const { pg_id, room_type, move_in_date, duration_months } = req.body;

  if (!pg_id) {
    return res.status(400).json({ message: 'PG ID is required.' });
  }

  try {
    const [pgs] = await db.query('SELECT rent, rooms FROM pgs WHERE id = ? AND is_active = TRUE', [pg_id]);
    if (pgs.length === 0) {
      return res.status(404).json({ message: 'PG not found or inactive.' });
    }

    const pg = pgs[0];
    const totalAmount = pg.rent * (duration_months || 1);

    const [result] = await db.query(
      `INSERT INTO bookings (user_id, pg_id, room_type, move_in_date, duration_months, status, total_amount)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [req.user.id, pg_id, room_type || 'single', move_in_date || null, duration_months || 1, totalAmount]
    );

    res.status(201).json({
      message: 'Booking created successfully.',
      booking: { id: result.insertId, total_amount: totalAmount, status: 'pending' },
    });
  } catch (error) {
    console.error('Create booking error (demo mode):', error.message);
    const pg = getShowcasePGById(pg_id);
    const rent = pg?.rent || 6000;
    const booking = createDemoBooking(req.user, { pg_id, room_type, move_in_date, duration_months }, rent);
    res.status(201).json({
      message: 'Booking created successfully.',
      booking: { id: booking.id, total_amount: booking.total_amount, status: booking.status },
    });
  }
};

exports.getBookings = async (req, res) => {
  try {
    let query = `
      SELECT b.*, p.name as pg_name, p.location, p.rent, p.images,
             u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN pgs p ON b.pg_id = p.id
      JOIN users u ON b.user_id = u.id
    `;
    const params = [];

    if (req.user.role === 'student') {
      query += ' WHERE b.user_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'owner') {
      query += ' WHERE p.owner_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY b.created_at DESC';
    const [bookings] = await db.query(query, params);

    const formatted = bookings.map((b) => ({
      ...b,
      images: typeof b.images === 'string' ? JSON.parse(b.images) : b.images,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get bookings error (demo mode):', error.message);
    res.json(getDemoBookings(req.user));
  }
};

exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const [bookings] = await db.query(
      `SELECT b.*, p.owner_id FROM bookings b JOIN pgs p ON b.pg_id = p.id WHERE b.id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const booking = bookings[0];
    const canUpdate =
      req.user.role === 'admin' ||
      booking.owner_id === req.user.id ||
      (booking.user_id === req.user.id && status === 'cancelled');

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Booking status updated.' });
  } catch (error) {
    console.error('Update booking error (demo mode):', error.message);
    const booking = updateDemoBookingStatus(id, status);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ message: 'Booking status updated.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    const [pgCount] = await db.query('SELECT COUNT(*) as count FROM pgs');
    const [bookingCount] = await db.query('SELECT COUNT(*) as count FROM bookings');
    const [revenue] = await db.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'success'");
    const [recentBookings] = await db.query(
      `SELECT b.*, p.name as pg_name, u.name as user_name
       FROM bookings b JOIN pgs p ON b.pg_id = p.id JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC LIMIT 5`
    );

    res.json({
      users: userCount[0].count,
      pgs: pgCount[0].count,
      bookings: bookingCount[0].count,
      revenue: revenue[0].total,
      recentBookings,
    });
  } catch (error) {
    console.error('Stats error (demo mode):', error.message);
    res.json(getDemoStats());
  }
};
