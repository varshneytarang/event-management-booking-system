const eventRepo = require('../repositories/event.repository');
const ApiError = require('../utils/ApiError');
const { parsePagination } = require('../utils/pagination');

class EventService {
  async listEvents(query) {
    const { skip, limit, buildMeta } = parsePagination(query);

    // ── Build filter ──────────────────────────────────────────────────────────
    const filter = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.venue) {
      filter.venue = { $regex: query.venue, $options: 'i' };
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.date) {
      const start = new Date(query.date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(query.date);
      end.setUTCHours(23, 59, 59, 999);
      filter.dateTime = { $gte: start, $lte: end };
    }

    // ── Build sort ────────────────────────────────────────────────────────────
    const sortField = query.sortBy || 'dateTime';
    const sortOrder = query.order === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    const { events, total } = await eventRepo.findAll({ filter, sort, skip, limit });
    return { events, meta: buildMeta(total) };
  }

  async getEvent(id) {
    const event = await eventRepo.findById(id);
    if (!event) throw ApiError.notFound('Event not found');
    return event;
  }

  async createEvent(data, adminId) {
    const event = await eventRepo.create({
      ...data,
      availableSeats: data.totalSeats,
      createdBy: adminId,
    });
    return event;
  }

  async updateEvent(id, updates) {
    const event = await eventRepo.findById(id);
    if (!event) throw ApiError.notFound('Event not found');

    // If totalSeats is being updated, recalculate availableSeats
    if (updates.totalSeats !== undefined) {
      const bookedSeats = event.totalSeats - event.availableSeats;
      if (updates.totalSeats < bookedSeats) {
        throw ApiError.badRequest(
          `Cannot reduce total seats below already booked seats (${bookedSeats})`
        );
      }
      updates.availableSeats = updates.totalSeats - bookedSeats;
    }

    const updated = await eventRepo.updateById(id, updates);
    return updated;
  }

  async deleteEvent(id) {
    const event = await eventRepo.findById(id);
    if (!event) throw ApiError.notFound('Event not found');
    await eventRepo.deleteById(id);
  }
}

module.exports = new EventService();
