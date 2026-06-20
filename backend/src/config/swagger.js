const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Booking API',
      version: '1.0.0',
      description:
        'Production-ready REST API for Event Booking System. Supports JWT authentication with access/refresh tokens, event management, and seat bookings.',
      contact: { name: 'API Support', email: 'support@eventbooking.com' },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development' },
      { url: 'https://your-api.render.com', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter access token obtained from /api/auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', example: 'jane@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Event: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'React Summit 2025' },
            description: { type: 'string' },
            venue: { type: 'string', example: 'Amsterdam, Netherlands' },
            dateTime: { type: 'string', format: 'date-time' },
            totalSeats: { type: 'integer', example: 500 },
            availableSeats: { type: 'integer', example: 320 },
            category: { type: 'string', example: 'Technology' },
            imageUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            eventId: { $ref: '#/components/schemas/Event' },
            seatsBooked: { type: 'integer', example: 2 },
            status: { type: 'string', enum: ['confirmed', 'cancelled'] },
            bookingReference: { type: 'string', example: 'BK-A1B2C3' },
            bookingDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Resource not found' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/docs/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
