const eventService = require('../services/event.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/events
 */
const listEvents = asyncHandler(async (req, res) => {
  const { events, meta } = await eventService.listEvents(req.query);
  ApiResponse.ok(res, 'Events fetched successfully', { events }, meta);
});

/**
 * GET /api/events/:id
 */
const getEvent = asyncHandler(async (req, res) => {
  const event = await eventService.getEvent(req.params.id);
  ApiResponse.ok(res, 'Event fetched successfully', { event });
});

module.exports = { listEvents, getEvent };
