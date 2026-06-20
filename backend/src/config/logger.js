const pino = require('pino');

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  base: { service: 'event-booking-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['password', 'passwordHash', 'token', 'refreshToken', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
});

module.exports = logger;
