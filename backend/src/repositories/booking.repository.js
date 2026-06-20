const Booking = require('../models/Booking');

class BookingRepository {
  async create(data, session) {
    // insertMany returns array; wrap in array for transaction session support
    const [booking] = await Booking.create([data], { session });
    return booking;
  }

  async findByUser(userId) {
    return Booking.find({ userId })
      .populate('eventId', 'name venue dateTime category imageUrl status')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findById(id) {
    return Booking.findById(id)
      .populate('eventId', 'name venue dateTime category imageUrl status availableSeats totalSeats')
      .populate('userId', 'name email')
      .exec();
  }

  async findOne(filter) {
    return Booking.findOne(filter).exec();
  }

  async save(booking, session) {
    return booking.save({ session });
  }

  /** Check whether a user already has an active booking for a given event */
  async existsActiveBooking(userId, eventId) {
    return Booking.exists({ userId, eventId, status: 'confirmed' });
  }
}

module.exports = new BookingRepository();
