const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

const createBookingSchema = z.object({
  eventId: objectIdSchema,
  seatsBooked: z
    .number({ required_error: 'Seats is required', invalid_type_error: 'Seats must be a number' })
    .int('Seats must be a whole number')
    .min(1, 'Must book at least 1 seat')
    .max(10, 'Cannot book more than 10 seats per booking'),
});

module.exports = { createBookingSchema, objectIdSchema };
