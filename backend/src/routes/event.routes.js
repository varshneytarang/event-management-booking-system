const { Router } = require('express');
const { listEvents, getEvent } = require('../controllers/event.controller');
const validate = require('../validators/validate');
const { eventQuerySchema } = require('../validators/event.validator');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event discovery endpoints (public)
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: List all events with filtering and pagination
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Full-text search on name, description, and venue
 *       - in: query
 *         name: venue
 *         schema: { type: string }
 *         description: Filter by venue (partial, case-insensitive)
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [Technology, Design, Business, Community, Music, Sports, General] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [upcoming, ongoing, completed, cancelled] }
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2025-10-15" }
 *         description: Filter events on a specific date (YYYY-MM-DD)
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [dateTime, name, availableSeats, createdAt], default: dateTime }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Paginated event list
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
 *                         events:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Event' }
 *                     meta: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', validate(eventQuerySchema, 'query'), listEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Event details
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
 *                         event: { $ref: '#/components/schemas/Event' }
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.get('/:id', getEvent);

module.exports = router;
