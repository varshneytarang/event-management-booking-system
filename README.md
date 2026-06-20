# EventHub — Production Event Booking System

A full-stack, production-ready event booking application built with **React.js**, **Node.js**, **Express.js**, and **MongoDB**. Features JWT authentication with refresh token rotation, atomic seat booking via MongoDB transactions, role-based access control, Swagger API docs, Jest/Supertest tests, and full Docker support.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Features](#features)
4. [Folder Structure](#folder-structure)
5. [Setup Instructions](#setup-instructions)
6. [Environment Variables](#environment-variables)
7. [API Documentation](#api-documentation)
8. [Deployment Guide](#deployment-guide)
9. [Assumptions](#assumptions)
10. [Design Decisions](#design-decisions)

---

## Project Overview

EventHub allows users to browse events, book seats, and manage their reservations. Admins can create, update, and delete events. The system prevents overselling through atomic MongoDB transactions with row-level locking.

**Tech stack:**

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, TanStack Query v5, React Hook Form, Zod |
| Backend | Node.js 20, Express 4, Mongoose 8 |
| Database | MongoDB 7 (Atlas in production, in-memory for tests) |
| Auth | JWT access tokens (15m) + refresh tokens (7d) with rotation |
| Validation | Zod (backend + frontend) |
| Logging | Pino with pino-pretty in development |
| Docs | Swagger / OpenAPI 3.0 |
| Testing | Jest + Supertest + mongodb-memory-server |
| Containerisation | Docker + docker-compose |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  React + Vite                                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐ │
│  │  Pages   │  │  Hooks   │  │  Context   │  │  API     │ │
│  │ (Router) │→ │ (Query)  │→ │  (Auth)    │  │ (Axios)  │ │
│  └──────────┘  └──────────┘  └────────────┘  └────┬─────┘ │
└────────────────────────────────────────────────────┼────────┘
                                                     │ HTTPS
┌────────────────────────────────────────────────────┼────────┐
│                     Express API                    ↓        │
│                                                             │
│  Routes → Controllers → Services → Repositories            │
│                                          ↓                  │
│  Middleware:                         Mongoose               │
│  - helmet / cors / mongoSanitize         ↓                  │
│  - rateLimiter                      MongoDB Atlas           │
│  - authenticate (JWT)               (Transactions)          │
│  - authorize (RBAC)                                         │
│  - validate (Zod)                                           │
│  - errorHandler (global)                                    │
└─────────────────────────────────────────────────────────────┘
```

**Request flow:**
```
HTTP Request
  → Express Route
  → Rate Limiter
  → Zod Validator
  → authenticate middleware (JWT)
  → authorize middleware (RBAC)
  → Controller (thin — delegates)
  → Service (business logic)
  → Repository (DB queries)
  → MongoDB (with transactions where needed)
  → Standardised ApiResponse / ApiError
```

---

## Features

### Authentication
- User registration with strong password validation
- Login with email + password
- JWT access token (15 min) + refresh token (7 days)
- Refresh token rotation — each use issues a new pair
- Refresh token reuse detection — all tokens revoked on suspicious activity
- httpOnly cookie for refresh token storage
- Silent token refresh in frontend Axios interceptor with request queue

### Event Management
- List all events with search, category, status, venue, date filters
- Pagination with metadata (total, pages, hasNext, hasPrev)
- Full-text search on name, description, venue (MongoDB text index)
- Event detail page with seat availability progress bar
- Admin: create, update, delete events (RBAC protected)

### Booking Management
- Book 1–10 seats per booking
- Atomic seat deduction via MongoDB transactions (prevents race conditions)
- One active booking per user per event (conflict detection)
- View all bookings with stats (total / confirmed / cancelled)
- Cancel booking with atomic seat restoration
- Unique booking reference code (BK-XXXXXXXX)

### Admin Role
- Role-based access: `user` | `admin`
- Admin endpoints protected via `authorize('admin')` middleware
- Admin badge shown in Navbar

### API Documentation
- Swagger UI at `GET /api-docs`
- Raw OpenAPI spec at `GET /api-docs.json`
- All endpoints documented with request/response schemas

### Testing
- Jest + Supertest integration tests
- MongoDB in-memory server (no real DB needed for tests)
- Tests cover: registration, login, auth guards, event CRUD, booking creation, seat deduction, booking cancellation, seat restoration, RBAC

### Production Ready
- Helmet security headers
- CORS configured per environment
- Express rate limiting (100/15min global, 10/15min for auth)
- NoSQL injection sanitization (express-mongo-sanitize)
- Graceful shutdown (SIGTERM/SIGINT)
- Unhandled rejection + uncaught exception handlers
- Error messages sanitized in production
- Pino structured logging with sensitive field redaction

---

## Folder Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Mongoose connection
│   │   │   ├── logger.js          # Pino logger
│   │   │   ├── swagger.js         # OpenAPI spec
│   │   │   └── seed.js            # DB seeder (8 events + 2 users)
│   │   ├── models/
│   │   │   ├── User.js            # passwordHash, refreshTokens, methods
│   │   │   ├── Event.js           # text index, virtuals
│   │   │   └── Booking.js         # bookingReference pre-save hook
│   │   ├── repositories/
│   │   │   ├── user.repository.js
│   │   │   ├── event.repository.js  # decrementSeats/incrementSeats with session
│   │   │   └── booking.repository.js
│   │   ├── services/
│   │   │   ├── auth.service.js    # token rotation, reuse detection
│   │   │   ├── event.service.js   # filter/sort/paginate
│   │   │   └── booking.service.js # MongoDB transactions
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── event.controller.js
│   │   │   ├── booking.controller.js
│   │   │   └── admin.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # Swagger JSDoc annotated
│   │   │   ├── event.routes.js
│   │   │   ├── booking.routes.js
│   │   │   └── admin.routes.js
│   │   ├── middleware/
│   │   │   ├── authenticate.js    # JWT guard → req.user
│   │   │   ├── authorize.js       # RBAC guard
│   │   │   ├── errorHandler.js    # global error + 404
│   │   │   └── rateLimiter.js     # api + auth limiters
│   │   ├── validators/
│   │   │   ├── validate.js        # Zod middleware factory
│   │   │   ├── auth.validator.js
│   │   │   ├── event.validator.js
│   │   │   └── booking.validator.js
│   │   ├── utils/
│   │   │   ├── ApiError.js        # operational error class
│   │   │   ├── ApiResponse.js     # standardised response helper
│   │   │   ├── asyncHandler.js    # wraps async controllers
│   │   │   ├── tokens.js          # JWT helpers + cookie options
│   │   │   └── pagination.js      # parsePagination
│   │   ├── tests/
│   │   │   ├── setup.js           # MongoMemoryServer lifecycle
│   │   │   ├── helpers.js         # createUserAndLogin, createEvent
│   │   │   ├── auth.test.js
│   │   │   ├── event.test.js
│   │   │   └── booking.test.js
│   │   ├── app.js                 # Express app (no listen)
│   │   └── server.js              # DB connect + graceful shutdown
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js           # instance + interceptors
│   │   │   ├── auth.api.js
│   │   │   ├── events.api.js
│   │   │   └── bookings.api.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # hydrate on mount, setAuth/clearAuth
│   │   ├── hooks/
│   │   │   ├── useAuth.js         # useRegister/useLogin/useLogout
│   │   │   ├── useEvents.js       # useEvents/useEvent
│   │   │   └── useBookings.js     # useBookings/useCreateBooking/useCancelBooking
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── ErrorMessage.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── EventCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   ├── EventDetailPage.jsx
│   │   │   ├── BookingsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── .dockerignore
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB 7 (local, running as a replica set) **or** MongoDB Atlas URI
- Docker + Docker Compose (optional — easiest way to run everything including MongoDB)

> **Windows note:** Use `copy` instead of `cp` for `.env` files, or duplicate the file manually in Explorer.

---

### Option A — Local development (recommended for development)

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd <repo-folder>
```

**2. Backend setup**
```bash
cd backend
npm install
cp .env.example .env   # Windows: copy .env.example .env
# Edit .env — at minimum set MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET
# The .env file ships with safe defaults for local development
```

Seed the database with 8 sample events and 2 demo accounts:
```bash
npm run seed
```

Start the dev server:
```bash
npm run dev
# API running at http://localhost:5000
# Swagger docs at http://localhost:5000/api-docs
```

**3. Frontend setup** (new terminal)
```bash
cd frontend
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev
# App running at http://localhost:5173
```

**4. Run tests**
```bash
cd backend
npm test
# Uses mongodb-memory-server — no real DB or replica set needed for tests
# Coverage report: npm run test:coverage
```

---

### Option B — Docker Compose (single command)

```bash
# From the project root
docker-compose up --build
```

Services started:
| Service | URL |
|---|---|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:5000 |
| Swagger Docs | http://localhost:5000/api-docs |
| MongoDB | localhost:27017 |

To seed the database when running via Docker:
```bash
docker-compose exec backend node src/config/seed.js
```

---

### Demo Accounts (created by seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@eventbooking.com | Admin123! |
| User | demo@eventbooking.com | Demo1234! |

### Available npm scripts

**Backend (`cd backend`)**

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with nodemon (auto-restart) |
| `npm start` | Start production server |
| `npm run seed` | Reset DB and seed 8 events + 2 demo users |
| `npm test` | Run all Jest tests (in-memory DB) |
| `npm run test:coverage` | Run tests with coverage report |

**Frontend (`cd frontend`)**

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Express server port |
| `NODE_ENV` | No | `development` | `development` \| `production` \| `test` |
| `MONGO_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh token signing secret (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token expiry |
| `CLIENT_URL` | No | `http://localhost:5173` | CORS allowed origin |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window in ms (15 min) |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `/api` | Backend API base URL |

> In development the Vite proxy forwards `/api` requests to `http://localhost:5000`, so `VITE_API_URL` is only needed for production builds pointing at a deployed API.

---

## API Documentation

Interactive Swagger UI: `GET /api-docs`

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

### Standardised Responses

**Success**
```json
{ "success": true, "message": "...", "data": {}, "meta": {} }
```

**Error**
```json
{ "success": false, "message": "...", "errors": [{ "field": "email", "message": "..." }] }
```

---

### Auth Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login, receive access token + refresh cookie |
| `POST` | `/api/auth/logout` | 🔒 User | Revoke refresh token |
| `POST` | `/api/auth/refresh-token` | Public | Rotate refresh token, issue new access token |
| `GET` | `/api/auth/me` | 🔒 User | Get current user profile |

**Register request**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secret123!"
}
```
Password rules: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.

**Login request**
```json
{ "email": "jane@example.com", "password": "Secret123!" }
```

**Login response**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "user" },
    "accessToken": "eyJhbGci..."
  }
}
```
Refresh token is set as an `httpOnly` cookie automatically.

---

### Event Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events` | Public | Paginated event list with filters |
| `GET` | `/api/events/:id` | Public | Single event details |

**Query parameters for `GET /api/events`**

| Param | Type | Example | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page (max 100) |
| `search` | string | `react` | Full-text search (name, description, venue) |
| `venue` | string | `Delhi` | Partial venue filter |
| `category` | string | `Technology` | Exact category filter |
| `status` | string | `upcoming` | Event status filter |
| `date` | string | `2025-10-15` | Filter events on a specific date (YYYY-MM-DD) |
| `sortBy` | string | `dateTime` | Sort field |
| `order` | string | `asc` | Sort direction |

---

### Booking Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | 🔒 User | Create a booking (atomic transaction) |
| `GET` | `/api/bookings` | 🔒 User | Get all bookings for current user |
| `GET` | `/api/bookings/:id` | 🔒 User | Get single booking by ID |
| `DELETE` | `/api/bookings/:id` | 🔒 User | Cancel booking and restore seats (atomic transaction) |

**Create booking request**
```json
{ "eventId": "664f1a2b3c4d5e6f7a8b9c0d", "seatsBooked": 2 }
```

**Create booking response**
```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "booking": {
      "_id": "...",
      "bookingReference": "BK-A1B2C3D4",
      "seatsBooked": 2,
      "status": "confirmed",
      "eventId": { "name": "React Summit", "venue": "Amsterdam", ... }
    }
  }
}
```

**Get single booking response (`GET /api/bookings/:id`)**
```json
{
  "success": true,
  "message": "Booking fetched successfully",
  "data": {
    "booking": {
      "_id": "...",
      "bookingReference": "BK-A1B2C3D4",
      "seatsBooked": 2,
      "status": "confirmed",
      "bookingDate": "2025-06-18T10:00:00.000Z",
      "eventId": {
        "_id": "...",
        "name": "React Summit 2025",
        "venue": "Amsterdam, Netherlands",
        "dateTime": "2025-10-15T09:00:00.000Z",
        "availableSeats": 498,
        "totalSeats": 500
      },
      "userId": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com" }
    }
  }
}
```

**Error cases**
| Status | Reason |
|---|---|
| `400` | Not enough seats available |
| `400` | Event cancelled or completed |
| `401` | No / invalid access token |
| `404` | Event not found |
| `409` | Already have active booking for this event |
| `422` | Validation error (e.g. `seatsBooked` must be 1–10) |

---

### Admin Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/events` | 🔒 Admin | Create event |
| `PUT` | `/api/admin/events/:id` | 🔒 Admin | Update event |
| `DELETE` | `/api/admin/events/:id` | 🔒 Admin | Delete event |

**Create event request**
```json
{
  "name": "React Summit 2025",
  "description": "The biggest React conference...",
  "venue": "Amsterdam, Netherlands",
  "dateTime": "2025-10-15T09:00:00Z",
  "totalSeats": 500,
  "category": "Technology",
  "imageUrl": "https://example.com/image.jpg"
}
```

---

### Health Check

```
GET /api/health
```
```json
{ "success": true, "message": "Event Booking API is healthy", "timestamp": "...", "environment": "development" }
```

---

## Deployment Guide

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `node src/server.js`
5. Set root directory: `backend`
6. Add all environment variables from the table above
7. Set `MONGO_URI` to your MongoDB Atlas connection string
8. Set `NODE_ENV=production`
9. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend → Vercel

1. Import your repository on [Vercel](https://vercel.com)
2. Set root directory: `frontend`
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable: `VITE_API_URL=https://your-api.render.com/api`

### Database → MongoDB Atlas

1. Create a free cluster on [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a database user with read/write permissions
3. Whitelist `0.0.0.0/0` (or Render's IP ranges) in Network Access
4. Copy the connection string to `MONGO_URI`
5. Run the seed script once: `node src/config/seed.js`

> **Important:** MongoDB transactions require a replica set. MongoDB Atlas free tier (M0) supports replica sets automatically. If running locally without Docker, start MongoDB with `--replSet rs0` or use the `docker-compose.yml` which handles this for you.

### Verify deployment

After deploying, hit the health endpoint:
```
GET https://your-api.render.com/api/health
```
Expected response:
```json
{ "success": true, "message": "Event Booking API is healthy", "environment": "production" }
```

---

## Assumptions

1. **MongoDB replica set required for transactions.** The booking and cancellation flows use multi-document transactions which require a replica set. The `docker-compose.yml` handles this automatically. For local development without Docker, the easiest solution is to use a free MongoDB Atlas cluster (M0 tier) — it comes as a replica set out of the box.

2. **One active booking per user per event.** A user cannot book the same event twice while a confirmed booking exists. They must cancel first before re-booking.

3. **Maximum 10 seats per booking.** Enforced at both API level (Zod schema) and UI level (seat picker capped at 10 and at available count) to prevent bulk seat hoarding.

4. **Refresh token stored in httpOnly cookie.** The `/api/auth/refresh-token` endpoint also accepts a `refreshToken` field in the request body as a fallback for native app clients that cannot use cookies.

5. **Admin accounts are seeded, not self-registered.** There is no public admin registration endpoint. Admin accounts are created via `npm run seed` or by setting `role: 'admin'` directly in MongoDB.

6. **Event images are external URLs.** File upload is not implemented. Events store an optional `imageUrl` string pointing to an externally hosted image.

7. **No email verification.** Accounts are immediately active after registration. Adding email verification would require a third-party mail provider (SendGrid, Resend) and is intentionally out of scope.

8. **Password requirements follow OWASP recommendations.** Minimum 8 characters with uppercase, lowercase, number, and special character. This is enforced identically on both backend (Zod) and frontend (Zod via React Hook Form).

---

## Design Decisions

### Backend

**Repository pattern**
Services never call Mongoose models directly — they go through repository classes. This decouples business logic from the database layer, making it easy to swap out the ORM or add caching later without touching service code.

**MongoDB transactions for seat operations**
Both booking creation and cancellation use `mongoose.startSession()` with `session.startTransaction()`. The seat decrement uses a `findOneAndUpdate` with `$gte` guard — this makes the check-and-update atomic at the document level and prevents the classic TOCTOU race condition where two simultaneous requests both read `availableSeats: 5`, both see enough capacity, and both write successfully despite only 5 seats being available.

**Refresh token rotation with reuse detection**
Every token refresh issues a completely new pair and invalidates the old refresh token. If a previously-used refresh token arrives again (possible sign of theft), all tokens for that user are immediately revoked and they must log in again. Tokens are stored as an array on the User document (max 5, scoped to `/api/auth` cookie path).

**Layered error handling**
`ApiError` is a custom Error subclass with `statusCode` and `isOperational` flags. Operational errors are errors we anticipate and handle (validation, not found, etc). Non-operational errors (programmer mistakes, unexpected DB failures) are caught by the global `errorHandler`, logged at `error` level, and returned with a generic message in production.

**Zod as the single source of validation truth**
Zod schemas are used on both the backend (via Express middleware factory) and the frontend (via `@hookform/resolvers/zod`). This avoids duplicating validation logic and ensures the same rules apply everywhere.

### Frontend

**TanStack Query v5 for server state**
All API data lives in React Query's cache. Mutations (`useCreateBooking`, `useCancelBooking`) call `invalidateQueries` on success, which automatically refreshes both the booking list and the event's seat count. `keepPreviousData` on the events list prevents flickering between filter changes.

**Silent token refresh with request queue**
The Axios response interceptor catches `401` responses, pauses all concurrent requests in a queue, silently refreshes the access token using the httpOnly cookie, and then replays all queued requests with the new token. This is invisible to the user.

**React Hook Form + Zod**
Forms use `react-hook-form` with `@hookform/resolvers/zod` for schema-based validation. This gives controlled form behaviour, inline field-level error messages, and prevents any submission until all fields pass — without any manual `useState` for error tracking.

**No external UI library**
All components are hand-built using CSS custom properties (variables) and inline styles. This keeps the bundle minimal, makes the design fully transparent, and avoids fighting a third-party design system's opinions.
