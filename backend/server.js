const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { initDatabase, isDbConnected } = require('./config/initDatabase');
const { isRazorpayConfigured } = require('./config/razorpay');
const authRoutes = require('./routes/authRoutes');
const pgRoutes = require('./routes/pgRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);
app.use('/api', pgRoutes);
app.use('/api', bookingRoutes);
app.use('/api', paymentRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Smart PG Assistant API is running',
    database: isDbConnected() ? 'connected' : 'disconnected',
    razorpay: isRazorpayConfigured(),
    maps: Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY),
    port: PORT,
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  console.log('\nSmart PG Assistant — Starting...\n');
  await initDatabase();

  const server = app.listen(PORT, () => {
    console.log(`\n  API:    http://localhost:${PORT}`);
    console.log(`  Health: http://localhost:${PORT}/api/health`);
    console.log(`  DB:     ${isDbConnected() ? 'CONNECTED (users saved to MySQL)' : 'DISCONNECTED (set DB_PASSWORD in .env)'}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process first.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
}

start();
