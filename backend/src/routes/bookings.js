const express = require('express');
const { body } = require('express-validator');
const { sequelize, Booking, Event, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const crypto = require('crypto');

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

/** Generate a short unique booking reference, e.g. BK-A3F9C1 */
const generateBookingRef = () =>
  'BK-' + crypto.randomBytes(3).toString('hex').toUpperCase();

// POST /api/bookings — create a booking
router.post(
  '/',
  [
    body('eventId')
      .notEmpty().withMessage('Event ID is required')
      .isInt({ min: 1 }).withMessage('Event ID must be a positive integer'),
    body('seatsBooked')
      .notEmpty().withMessage('Number of seats is required')
      .isInt({ min: 1, max: 10 }).withMessage('You can book between 1 and 10 seats'),
  ],
  validate,
  async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
      const { eventId, seatsBooked } = req.body;
      const seats = parseInt(seatsBooked);

      // Lock the event row for this transaction
      const event = await Event.findByPk(eventId, { transaction: t, lock: t.LOCK.UPDATE });

      if (!event) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      if (event.status === 'cancelled') {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'This event has been cancelled' });
      }

      if (event.status === 'completed') {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'This event has already completed' });
      }

      if (event.availableSeats < seats) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Only ${event.availableSeats} seat(s) available`,
        });
      }

      // Check if user already has an active booking for this event
      const existingBooking = await Booking.findOne({
        where: { userId: req.user.id, eventId, status: 'confirmed' },
        transaction: t,
      });

      if (existingBooking) {
        await t.rollback();
        return res.status(409).json({
          success: false,
          message: 'You already have an active booking for this event',
        });
      }

      // Deduct seats
      await event.update(
        { availableSeats: event.availableSeats - seats },
        { transaction: t }
      );

      const booking = await Booking.create(
        {
          userId: req.user.id,
          eventId,
          seatsBooked: seats,
          bookingReference: generateBookingRef(),
          status: 'confirmed',
        },
        { transaction: t }
      );

      await t.commit();

      // Reload with associations for the response
      const fullBooking = await Booking.findByPk(booking.id, {
        include: [{ model: Event, as: 'event' }],
      });

      res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully',
        data: { booking: fullBooking },
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }
);

// GET /api/bookings — get all bookings for the logged-in user
router.get('/', async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'name', 'dateTime', 'venue', 'category', 'status', 'imageUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:id — get a single booking (must belong to user)
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: { booking } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/bookings/:id — cancel a booking
router.delete('/:id', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, userId: req.user.id },
      transaction: t,
    });

    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    const event = await Event.findByPk(booking.eventId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // Release seats back to event inventory
    if (event) {
      await event.update(
        { availableSeats: event.availableSeats + booking.seatsBooked },
        { transaction: t }
      );
    }

    await booking.update(
      { status: 'cancelled', cancelledAt: new Date() },
      { transaction: t }
    );

    await t.commit();

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released.',
      data: { booking },
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
});

module.exports = router;
