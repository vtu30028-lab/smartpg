# Smart PG Assistant 🏠

AI-powered PG (Paying Guest) finder — a full-stack web app for students to discover, book, and pay for PG accommodations near colleges.

## Features

- **AI PG Assistant** — Natural language search (e.g. "Find PG under 8000 near college with food")
- **Location-based search** — Live geolocation, nearby PG finder, distance calculation
- **Google Maps integration** — Map view, directions, embedded maps
- **Premium UI** — Glassmorphism design, dark/light mode, smooth animations
- **User roles** — Student, PG Owner, Admin dashboards
- **Booking & payments** — Razorpay integration for rent and booking payments
- **Reviews & ratings** — Students can review PGs

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend  | Node.js, Express        |
| Database | MySQL                   |
| Payments | Razorpay                |
| Maps     | Google Maps API         |

## Project Structure

```
smartpg/
├── frontend/          React + TypeScript app
├── backend/           Express API server
├── database/          MySQL schema & seed data
├── .env.example       Environment variables template
└── package.json       Root scripts
```

## Setup

### Prerequisites

- Node.js 18+
- MySQL 8+
- Google Maps API key (optional, for enhanced maps)
- Razorpay test keys (optional, for payments)

### 1. Clone & install

```bash
cd smartpg
npm run install:all
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials, JWT secret, and API keys.

### 3. Setup database

```bash
mysql -u root -p < database/smart_pg.sql
```

### 4. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Demo Accounts

All demo accounts use password: `password`

| Role    | Email                 |
|---------|-----------------------|
| Student | student@smartpg.com   |
| Owner   | owner@smartpg.com     |
| Admin   | admin@smartpg.com     |

## API Endpoints

### Authentication
- `POST /api/register` — Register user
- `POST /api/login` — Login
- `GET /api/profile` — Get profile (auth required)

### PG Listings
- `GET /api/pgs` — List/search PGs (supports filters & geolocation)
- `GET /api/pgs/:id` — PG details
- `POST /api/pg` — Create PG (owner)
- `PUT /api/pg/:id` — Update PG (owner)
- `DELETE /api/pg/:id` — Delete PG (owner)
- `POST /api/ai-search` — AI-powered search

### Bookings
- `POST /api/book` — Create booking (student)
- `GET /api/bookings` — List bookings
- `PUT /api/bookings/:id` — Update booking status

### Payments
- `POST /api/payment` — Create payment order
- `POST /api/payment/verify` — Verify Razorpay payment
- `GET /api/payments` — Payment history

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `JWT_SECRET` | JWT signing secret |
| `PORT` | Backend port (default 5000) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps embed API |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay server keys |

## License

MIT
