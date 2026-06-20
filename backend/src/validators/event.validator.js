const { z } = require('zod');

const CATEGORIES = ['Technology', 'Design', 'Business', 'Community', 'Music', 'Sports', 'General'];
const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

const createEventSchema = z.object({
  name: z
    .string({ required_error: 'Event name is required' })
    .trim()
    .min(3, 'Event name must be at least 3 characters')
    .max(200, 'Event name cannot exceed 200 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  venue: z
    .string({ required_error: 'Venue is required' })
    .trim()
    .min(3, 'Venue must be at least 3 characters')
    .max(300, 'Venue cannot exceed 300 characters'),
  dateTime: z
    .string({ required_error: 'Date and time is required' })
    .datetime({ message: 'Must be a valid ISO 8601 date-time string' })
    .refine((val) => new Date(val) > new Date(), { message: 'Event date must be in the future' }),
  totalSeats: z
    .number({ required_error: 'Total seats is required', invalid_type_error: 'Total seats must be a number' })
    .int('Total seats must be a whole number')
    .min(1, 'Total seats must be at least 1')
    .max(100000, 'Total seats cannot exceed 100,000'),
  category: z.enum(CATEGORIES).default('General'),
  imageUrl: z.string().url('Image URL must be a valid URL').optional().nullable(),
});

const updateEventSchema = z.object({
  name: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  venue: z.string().trim().min(3).max(300).optional(),
  dateTime: z
    .string()
    .datetime({ message: 'Must be a valid ISO 8601 date-time string' })
    .optional(),
  totalSeats: z
    .number()
    .int()
    .min(1)
    .max(100000)
    .optional(),
  category: z.enum(CATEGORIES).optional(),
  imageUrl: z.string().url().optional().nullable(),
  status: z.enum(STATUSES).optional(),
});

const eventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  venue: z.string().trim().optional(),
  category: z.enum(CATEGORIES).optional(),
  status: z.enum(STATUSES).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  sortBy: z.enum(['dateTime', 'name', 'availableSeats', 'createdAt']).default('dateTime'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

module.exports = { createEventSchema, updateEventSchema, eventQuerySchema, objectIdSchema };
