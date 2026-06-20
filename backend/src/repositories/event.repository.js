const Event = require('../models/Event');

class EventRepository {
  /**
   * Paginated list with optional text search, venue, category, status, date filters.
   */
  async findAll({ filter, sort, skip, limit }) {
    const [events, total] = await Promise.all([
      Event.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Event.countDocuments(filter),
    ]);
    return { events, total };
  }

  async findById(id) {
    return Event.findById(id).exec();
  }

  async create(data) {
    return Event.create(data);
  }

  async updateById(id, updates) {
    return Event.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).exec();
  }

  async deleteById(id) {
    return Event.findByIdAndDelete(id).exec();
  }

  /**
   * Atomically decrement availableSeats.
   * Uses $inc with a floor guard to prevent going below 0.
   * Returns the updated document, or null if seats were insufficient.
   */
  async decrementSeats(id, count, session) {
    return Event.findOneAndUpdate(
      { _id: id, availableSeats: { $gte: count } },
      { $inc: { availableSeats: -count } },
      { new: true, session }
    ).exec();
  }

  /**
   * Atomically restore seats on booking cancellation.
   */
  async incrementSeats(id, count, session) {
    return Event.findOneAndUpdate(
      { _id: id },
      { $inc: { availableSeats: count } },
      { new: true, session }
    ).exec();
  }
}

module.exports = new EventRepository();
