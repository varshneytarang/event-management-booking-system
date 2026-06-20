const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./config/logger');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // prevent oversized payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── NoSQL injection sanitization ──────────────────────────────────────────────
app.use(mongoSanitize());

// ── HTTP request logging (skip in test) ──────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
      skip: (req) => req.url === '/api/health',
    })
  );
}

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Event Booking API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── Swagger API docs ──────────────────────────────────────────────────────────
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Event Booking API Docs',
    customCss: '.swagger-ui .topbar { background-color: #6366f1; }',
  })
);

// Expose raw spec for programmatic consumption
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── Application routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// ── Error handling (must be last) ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
