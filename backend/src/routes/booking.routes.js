const { Router } = require('express');
const { createBooking, getUserBookings, getBooking, cancelBooking } = require('../controllers/booking.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../validators/validate');
const { createBookingSchema } = require('../validators/booking.validator');

const router = Router();

// All booking routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management (authenticated users)
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, seatsBooked]
 *             properties:
 *               eventId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c0d"
 *               seatsBooked:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 2
 *     responses:
 *       201:
 *         description: Booking confirmed
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
 *                         booking: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: Not enough seats / event unavailable
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 *       409:
 *         description: Already booked this event
 */
router.post('/', validate(createBookingSchema), createBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings for the authenticated user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User bookings list
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
 *                         bookings:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Booking' }
 *       401:
 *         description: Unauthorized
 */
router.get('/', getUserBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — not your booking
 *       404:
 *         description: Booking not found
 */
router.get('/:id', getBooking);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel a booking and restore seats
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled, seats restored
 *       400:
 *         description: Already cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', cancelBooking);

module.exports = router;
