# EventHub — Event Management System

A full-stack event management application built with **React + Vite** (frontend) and **Node.js + Express + SQLite** (backend). Users can browse events, book seats, and manage their bookings. Admins can create and manage events.

---

## Table of Contents

- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Assumptions](#assumptions)
- [Design Decisions](#design-decisions)
- [Project Structure](#project-structure)

---

## Project Setup

### Prerequisites

- Node.js v18+ and npm

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the example env file and configure it:

```bash
cp .env.example .env
```

Seed the database with sample events and demo users:

```bash
npm run seed
```

Start the development server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
```

Copy the example env file:

```bash
cp .env.example .env
```

Start the Vite dev server:

```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`.

### Demo accounts (created by seed)

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@events.com   | Admin123  |
| User  | demo@events.com    | Demo1234  |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Required | Default       | Description                              |
|-----------------|----------|---------------|------------------------------------------|
| `PORT`          | No       | `5000`        | Port the Express server listens on       |
| `JWT_SECRET`    | Yes      | —             | Secret key used to sign JWT tokens       |
| `JWT_EXPIRES_IN`| No       | `7d`          | JWT token expiry duration                |
| `NODE_ENV`      | No       | `development` | Environment (`development`/`production`) |

### Frontend (`frontend/.env`)

| Variable       | Required | Default                      | Description              |
|----------------|----------|------------------------------|--------------------------|
| `VITE_API_URL` | No       | `http://localhost:5000/api`  | Backend API base URL     |

> **Note:** In development the Vite proxy (`/api → http://localhost:5000`) handles requests automatically, so `VITE_API_URL` only matters in production builds.

---

## API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require the header:
```
Authorization: Bearer <token>
```

Successful responses follow the shape:
```json
{ "success": true, "data": { ... } }
```

Error responses follow:
```json
{ "success": false, "message": "...", "errors": [...] }
```

---

### Authentication

#### `POST /api/auth/register`

Register a new user account.

**Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret1"
}
```

**Validations**
- `name`: required, 2–100 characters
- `email`: required, valid email format, must be unique
- `password`: required, min 6 characters, must contain at least one digit

**Response `201`**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { "id": 3, "name": "Jane Doe", "email": "jane@example.com", "role": "user" },
    "token": "<jwt>"
  }
}
```

---

#### `POST /api/auth/login`

Log in and receive a JWT token.

**Body**
```json
{
  "email": "jane@example.com",
  "password": "secret1"
}
```

**Response `200`**
```json
{
  "success": true,
  "data": { "user": { ... }, "token": "<jwt>" }
}
```

---

#### `GET /api/auth/me` 🔒

Get the currently authenticated user's profile.

**Response `200`**
```json
{
  "success": true,
  "data": { "user": { "id": 1, "name": "...", "email": "...", "role": "user" } }
}
```

---

### Events

#### `GET /api/events`

List all events. Supports filtering and pagination.

**Query parameters**

| Param      | Type    | Description                                          |
|------------|---------|------------------------------------------------------|
| `search`   | string  | Full-text search on name, description, venue         |
| `category` | string  | Filter by category (Technology, Design, etc.)        |
| `status`   | string  | `upcoming` \| `ongoing` \| `completed` \| `cancelled`|
| `page`     | integer | Page number (default: `1`)                           |
| `limit`    | integer | Results per page, 1–100 (default: `10`)              |

**Response `200`**
```json
{
  "success": true,
  "data": {
    "events": [ { "id": 1, "name": "React Summit", ... } ],
    "pagination": { "total": 8, "page": 1, "limit": 10, "totalPages": 1 }
  }
}
```

---

#### `GET /api/events/:id`

Get full details of a single event.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "event": { "id": 1, "name": "React Summit", "availableSeats": 500, ... },
    "confirmedBookings": 0
  }
}
```

**Response `404`** — event not found.

---

#### `POST /api/events` 🔒 (Admin only)

Create a new event.

**Body**
```json
{
  "name": "My Conference",
  "description": "A great event.",
  "dateTime": "2025-06-01T09:00:00Z",
  "venue": "New York, NY",
  "totalSeats": 200,
  "category": "Technology",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response `201`** — returns created event.

---

#### `PUT /api/events/:id` 🔒 (Admin only)

Update an event. All fields are optional. If `totalSeats` is updated, `availableSeats` is recalculated automatically. Reducing `totalSeats` below already-booked seats is rejected.

---

#### `DELETE /api/events/:id` 🔒 (Admin only)

Delete an event. Rejected if there are active (confirmed) bookings.

---

### Bookings

All booking endpoints require authentication.

#### `POST /api/bookings` 🔒

Create a booking.

**Body**
```json
{
  "eventId": 1,
  "seatsBooked": 2
}
```

**Validations**
- `seatsBooked`: 1–10
- Event must exist, be `upcoming` or `ongoing`, and have sufficient available seats
- A user may only have one active booking per event

**Response `201`**
```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "booking": {
      "id": 1,
      "bookingReference": "BK-A3F9C1",
      "seatsBooked": 2,
      "status": "confirmed",
      "event": { ... }
    }
  }
}
```

---

#### `GET /api/bookings` 🔒

Get all bookings for the authenticated user, ordered newest first.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": 1,
        "bookingReference": "BK-A3F9C1",
        "seatsBooked": 2,
        "status": "confirmed",
        "event": { "id": 1, "name": "React Summit", "dateTime": "...", "venue": "..." }
      }
    ]
  }
}
```

---

#### `GET /api/bookings/:id` 🔒

Get a single booking by ID. Returns `404` if the booking doesn't belong to the authenticated user.

---

#### `DELETE /api/bookings/:id` 🔒

Cancel a booking. The booked seats are immediately released back to the event's available inventory.

**Response `200`**
```json
{
  "success": true,
  "message": "Booking cancelled successfully. Seats have been released.",
  "data": { "booking": { "status": "cancelled", "cancelledAt": "..." } }
}
```

**Error cases**
- `404` — booking not found or doesn't belong to user
- `400` — booking is already cancelled

---

### Health Check

#### `GET /api/health`

```json
{ "success": true, "message": "Event Management API is running", "timestamp": "..." }
```

---

## Assumptions

1. **No payment processing** — bookings are free. A `totalAmount` field exists on the Booking model as a placeholder for future integration.
2. **One active booking per user per event** — a user cannot book the same event twice if they already have a confirmed booking. They must cancel first.
3. **Maximum 10 seats per booking** — to prevent bulk seat hoarding. This is enforced at both the API and UI levels.
4. **Admin accounts are seeded** — there is no self-service admin registration. Admin accounts are created via the seed script or directly in the database.
5. **SQLite for portability** — chosen so the project runs without any database installation. The database file (`database.sqlite`) is created automatically on first run.
6. **Seat inventory is eventually consistent per request** — seat deduction uses database transactions with row locking (`LOCK.UPDATE`) to prevent double-booking under concurrent requests.
7. **No email verification** — accounts are active immediately after registration.
8. **Images are URLs** — events reference external image URLs rather than supporting file uploads, keeping the setup simple.

---

## Design Decisions

### Backend

**SQLite + Sequelize**
Chosen for zero-config portability. Any reviewer can clone and run without installing a database server. Sequelize ORM provides model-level validations, hooks (e.g. password hashing before save), and association queries. Migrating to PostgreSQL or MySQL only requires changing the Sequelize dialect and connection string.

**Transactional seat booking**
Seat deduction on booking creation and seat restoration on cancellation both run inside Sequelize transactions with row-level locking. This prevents race conditions where two simultaneous requests could both read the same available seat count and both succeed, overselling the event.

**Layered error handling**
A single `errorHandler` middleware at the end of the Express chain catches all errors — including Sequelize validation errors, unique constraint violations, and JWT errors — and normalises them into a consistent JSON shape. Route handlers only need to call `next(error)`.

**Role-based access**
The `authenticate` middleware validates the JWT and attaches the user to `req.user`. The `requireAdmin` middleware is a separate guard composed on top, keeping authorization concerns orthogonal to authentication.

### Frontend

**Vite proxy**
The Vite dev server proxies `/api/*` to `http://localhost:5000`, so the frontend never hardcodes the backend port and CORS is not an issue during development. In production, set `VITE_API_URL` to the deployed API URL.

**Auth state in React Context**
`AuthContext` hydrates from `localStorage` on mount by calling `GET /api/auth/me` to verify the token is still valid. This means stale or tampered tokens are caught immediately on page load rather than only at the next protected API call.

**Axios interceptors**
A single request interceptor attaches the JWT from `localStorage` to every outgoing request. A response interceptor catches `401` responses globally, clears the stored token, and redirects to `/login` — preventing the UI from ever showing stale authenticated state.

**No external UI library**
All components (Button, Input, Badge, Modal, Spinner) are hand-built using inline styles and CSS variables. This keeps the bundle small and makes the styling fully transparent and customisable without wrestling with a third-party design system.

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # Sequelize + SQLite connection
│   │   │   └── seed.js           # Database seed script
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT authenticate + requireAdmin
│   │   │   ├── errorHandler.js   # Global error + 404 handlers
│   │   │   └── validate.js       # express-validator result handler
│   │   ├── models/
│   │   │   ├── index.js          # Associations
│   │   │   ├── User.js
│   │   │   ├── Event.js
│   │   │   └── Booking.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── events.js
│   │   │   └── bookings.js
│   │   └── index.js              # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js          # Axios instance + interceptors
    │   │   ├── auth.js
    │   │   ├── events.js
    │   │   └── bookings.js
    │   ├── components/
    │   │   ├── ui/               # Button, Input, Badge, Spinner, Modal
    │   │   ├── Navbar.jsx
    │   │   ├── EventCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── EventsPage.jsx
    │   │   ├── EventDetailPage.jsx
    │   │   └── BookingsPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── vite.config.js
    └── package.json
```
