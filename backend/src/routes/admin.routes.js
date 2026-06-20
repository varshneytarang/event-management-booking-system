const { Router } = require('express');
const { createEvent, updateEvent, deleteEvent } = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../validators/validate');
const { createEventSchema, updateEventSchema } = require('../validators/event.validator');

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only event management endpoints
 */

/**
 * @swagger
 * /api/admin/events:
 *   post:
 *     summary: Create a new event (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, venue, dateTime, totalSeats]
 *             properties:
 *               name: { type: string, example: "React Summit 2025" }
 *               description: { type: string }
 *               venue: { type: string, example: "Amsterdam, Netherlands" }
 *               dateTime: { type: string, format: date-time }
 *               totalSeats: { type: integer, example: 500 }
 *               category: { type: string, enum: [Technology, Design, Business, Community, Music, Sports, General] }
 *               imageUrl: { type: string }
 *     responses:
 *       201:
 *         description: Event created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       422:
 *         description: Validation failed
 */
router.post('/events', validate(createEventSchema), createEvent);

/**
 * @swagger
 * /api/admin/events/{id}:
 *   put:
 *     summary: Update an existing event (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               venue: { type: string }
 *               dateTime: { type: string, format: date-time }
 *               totalSeats: { type: integer }
 *               status: { type: string, enum: [upcoming, ongoing, completed, cancelled] }
 *     responses:
 *       200:
 *         description: Event updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Event not found
 */
router.put('/events/:id', validate(updateEventSchema), updateEvent);

/**
 * @swagger
 * /api/admin/events/{id}:
 *   delete:
 *     summary: Delete an event (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Event not found
 */
router.delete('/events/:id', deleteEvent);

module.exports = router;
