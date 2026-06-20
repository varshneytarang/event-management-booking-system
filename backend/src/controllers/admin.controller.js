const eventService = require('../services/event.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/admin/events
 */
const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user.id);
  ApiResponse.created(res, 'Event created successfully', { event });
});

/**
 * PUT /api/admin/events/:id
 */
const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body);
  ApiResponse.ok(res, 'Event updated successfully', { event });
});

/**
 * DELETE /api/admin/events/:id
 */
const deleteEvent = asyncHandler(async (req, res) => {
  await eventService.deleteEvent(req.params.id);
  ApiResponse.ok(res, 'Event deleted successfully');
});

module.exports = { createEvent, updateEvent, deleteEvent };
