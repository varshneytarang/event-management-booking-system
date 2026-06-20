const mongoose = require('mongoose');
const bookingRepo = require('../repositories/booking.repository');
const eventRepo = require('../repositories/event.repository');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

class BookingService {
  /**
   * Create a booking inside a MongoDB transaction.
   * Seat deduction and booking insertion are atomic.
   */
  async createBooking(userId, { eventId, seatsBooked }) {
    // Pre-flight check outside transaction (cheap, non-critical)
    const eventExists = await eventRepo.findById(eventId);
    if (!eventExists) throw ApiError.notFound('Event not found');

    if (eventExists.status === 'cancelled') {
      throw ApiError.badRequest('This event has been cancelled');
    }
    if (eventExists.status === 'completed') {
      throw ApiError.badRequest('This event has already completed');
    }

    const alreadyBooked = await bookingRepo.existsActiveBooking(userId, eventId);
    if (alreadyBooked) {
      throw ApiError.conflict('You already have an active booking for this event');
    }

    // ── Transactional section ─────────────────────────────────────────────────
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Atomically decrement — returns null if insufficient seats
      const updatedEvent = await eventRepo.decrementSeats(eventId, seatsBooked, session);
      if (!updatedEvent) {
        throw ApiError.badRequest(
          `Not enough seats available. Requested: ${seatsBooked}, Available: ${eventExists.availableSeats}`
        );
      }

      const booking = await bookingRepo.create(
        { userId, eventId, seatsBooked, status: 'confirmed', bookingDate: new Date() },
        session
      );

      await session.commitTransaction();
      logger.info({ userId, eventId, seatsBooked, bookingId: booking._id }, 'Booking created');

      // Return populated booking
      return bookingRepo.findById(booking._id);
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async getUserBookings(userId) {
    return bookingRepo.findByUser(userId);
  }

  async getBooking(bookingId, userId, userRole) {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    // Users can only see their own bookings; admins can see all
    if (userRole !== 'admin' && booking.userId.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to this booking');
    }

    return booking;
  }

  /**
   * Cancel a booking inside a MongoDB transaction.
   * Seat restoration and status update are atomic.
   */
  async cancelBooking(bookingId, userId, userRole) {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    if (userRole !== 'admin' && booking.userId.toString() !== userId) {
      throw ApiError.forbidden('You cannot cancel this booking');
    }

    if (booking.status === 'cancelled') {
      throw ApiError.badRequest('Booking is already cancelled');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Restore seats
      await eventRepo.incrementSeats(booking.eventId._id || booking.eventId, booking.seatsBooked, session);

      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
      await bookingRepo.save(booking, session);

      await session.commitTransaction();
      logger.info({ bookingId, userId }, 'Booking cancelled');

      return booking;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new BookingService();
