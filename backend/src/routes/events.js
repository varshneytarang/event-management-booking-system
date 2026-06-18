const express = require('express');
const { body, query } = require('express-validator');
const { Op } = require('sequelize');
const { Event, Booking } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// GET /api/events — list all events with optional filters
router.get(
  '/',
  [
    query('category').optional().trim(),
    query('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']),
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        category,
        status,
        search,
        page = 1,
        limit = 10,
      } = req.query;

      const where = {};

      if (category) where.category = category;
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { venue: { [Op.like]: `%${search}%` } },
        ];
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: events } = await Event.findAndCountAll({
        where,
        order: [['dateTime', 'ASC']],
        limit: parseInt(limit),
        offset,
      });

      res.json({
        success: true,
        data: {
          events,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/events/:id — get event details
router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Attach booking count for context
    const confirmedBookings = await Booking.count({
      where: { eventId: event.id, status: 'confirmed' },
    });

    res.json({
      success: true,
      data: { event, confirmedBookings },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/events — create event (admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Event name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('dateTime').notEmpty().withMessage('Date and time is required').isISO8601().withMessage('Invalid date format'),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
    body('category').optional().trim(),
    body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, description, dateTime, venue, totalSeats, category, imageUrl } = req.body;

      const event = await Event.create({
        name,
        description,
        dateTime,
        venue,
        totalSeats,
        availableSeats: totalSeats,
        category: category || 'General',
        imageUrl,
      });

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/events/:id — update event (admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    body('name').optional().trim().notEmpty().withMessage('Event name cannot be empty'),
    body('dateTime').optional().isISO8601().withMessage('Invalid date format'),
    body('totalSeats').optional().isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
    body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      // Recalculate available seats if totalSeats is being updated
      if (req.body.totalSeats !== undefined) {
        const bookedSeats = event.totalSeats - event.availableSeats;
        const newTotal = parseInt(req.body.totalSeats);
        if (newTotal < bookedSeats) {
          return res.status(400).json({
            success: false,
            message: `Cannot reduce total seats below already booked seats (${bookedSeats})`,
          });
        }
        req.body.availableSeats = newTotal - bookedSeats;
      }

      await event.update(req.body);

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/events/:id — delete event (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const activeBookings = await Booking.count({
      where: { eventId: event.id, status: 'confirmed' },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete event with ${activeBookings} active booking(s). Cancel them first.`,
      });
    }

    await event.destroy();

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
