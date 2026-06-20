const bookingService = require('../services/booking.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/bookings
 */
const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body);
  ApiResponse.created(res, 'Booking confirmed successfully', { booking });
});

/**
 * GET /api/bookings
 */
const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getUserBookings(req.user.id);
  ApiResponse.ok(res, 'Bookings fetched successfully', { bookings });
});

/**
 * GET /api/bookings/:id
 */
const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBooking(req.params.id, req.user.id, req.user.role);
  ApiResponse.ok(res, 'Booking fetched successfully', { booking });
});

/**
 * DELETE /api/bookings/:id
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user.id, req.user.role);
  ApiResponse.ok(res, 'Booking cancelled successfully. Seats have been released.', { booking });
});

module.exports = { createBooking, getUserBookings, getBooking, cancelBooking };
