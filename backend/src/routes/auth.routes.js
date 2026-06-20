const { Router } = require('express');
const { register, login, logout, refreshToken, getMe } = require('../controllers/auth.controller');
const validate = require('../validators/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const authenticate = require('../middleware/authenticate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and token management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 example: "Secret123!"
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/User' }
 *                         accessToken: { type: string }
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive access + refresh tokens
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: jane@example.com }
 *               password: { type: string, example: "Secret123!" }
 *     responses:
 *       200:
 *         description: Login successful — refresh token set as httpOnly cookie
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/User' }
 *                         accessToken: { type: string }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post('/login', authLimiter, validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout the current user (invalidates refresh token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticate, logout);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Rotate refresh token and issue new access token
 *     tags: [Auth]
 *     security: []
 *     description: Accepts refreshToken from httpOnly cookie or request body. Returns new access token and rotates the refresh token.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string, description: "Optional if sent via cookie" }
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', refreshToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, getMe);

module.exports = router;
