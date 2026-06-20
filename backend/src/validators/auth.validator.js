const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password cannot exceed 72 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Must be a valid email address'),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Must be a valid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  // Can also come from cookie — validated in middleware layer
  refreshToken: z.string().optional(),
});

module.exports = { registerSchema, loginSchema, refreshTokenSchema };
