require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    logger.info(`API Docs: http://localhost:${PORT}/api-docs`);
  });

  // ── Graceful shutdown ───────────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error({ err }, 'Unhandled Promise Rejection — shutting down');
    server.close(() => process.exit(1));
  });

  // Catch uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught Exception — shutting down');
    process.exit(1);
  });
};

start();
