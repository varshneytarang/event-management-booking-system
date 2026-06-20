require('./setup');
const request = require('supertest');
const app = require('../app');
const { createUserAndLogin, createEvent } = require('./helpers');

describe('Bookings API', () => {
  // ── Create booking ───────────────────────────────────────────────────────────
  describe('POST /api/bookings', () => {
    it('should create a booking and deduct available seats', async () => {
      const { accessToken } = await createUserAndLogin({ email: 'user@test.com' });
      const event = await createEvent({ totalSeats: 50, availableSeats: 50 });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId: event._id.toString(), seatsBooked: 2 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.seatsBooked).toBe(2);
      expect(res.body.data.booking.status).toBe('confirmed');
      expect(res.body.data.booking.bookingReference).toMatch(/^BK-/);

      // Verify seat count was decremented
      const eventRes = await request(app).get(`/api/events/${event._id}`);
      expect(eventRes.body.data.event.availableSeats).toBe(48);
    });

    it('should return 400 when booking more seats than available', async () => {
      const { accessToken } = await createUserAndLogin({ email: 'user@test.com' });
      const event = await createEvent({ totalSeats: 3, availableSeats: 3 });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId: event._id.toString(), seatsBooked: 5 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 when user already has active booking for same event', async () => {
      const { accessToken } = await createUserAndLogin({ email: 'user@test.com' });
      const event = await createEvent({ totalSeats: 50, availableSeats: 50 });

      // First booking
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId: event._id.toString(), seatsBooked: 1 });

      // Second booking for same event
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId: event._id.toString(), seatsBooked: 1 });

      expect(res.status).toBe(409);
    });

    it('should return 400 for cancelled event', async () => {
      const { accessToken } = await createUserAndLogin({ email: 'user@test.com' });
      const event = await createEvent({ status: 'cancelled' });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId: event._id.toString(), seatsBooked: 1 });

      expect(res.status).toBe(400);
    });

    it('should return 401 for unauthenticated request', async () => {
      const event = await createEvent();
      const res = await request(app)
        .post('/api/bookings')
        .send({ eventId: event._id.toString(), seatsBooked: 1 });

      expect(res.status).toBe(401);
    });

    it('should return 422 when seatsBooked is 0', async () => {
      const { accessToken } = await createUserAndLogin({ email: 'user@test.com' });
      const event = await createEvent();

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId: event._id.toString(), seatsBooked: 0 });

      expect(res.status).toBe(422);
    });
  });

  // ── Get user bookings ────────────────────────────────────────────────────────
  describe('GET /api/bookings', () => {
    it('should return all bookings for authenticated user', async () => {
      const { accessToken } = await createUserAndLogin({ email: 'user@test.com' });
      const event = await createEvent({ totalSeats: 50, availableSeats: 50 });

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId: event._id.toString(), seatsBooked: 2 });

      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.bookings).toHaveLength(1);
      expect(res.body.data.bookings[0].seatsBooked).toBe(2);
    });

    it("should not return another user's bookings", async () => {
      const user1 = await createUserAndLogin({ email: 'user1@test.com' });
      const user2 = await createUserAndLogin({ email: 'user2@test.com' });
      const event = await createEvent({ totalSeats: 50, availableSeats: 50 });

      // user1 books
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send({ eventId: event._id.toString(), seatsBooked: 1 });

      // user2 fetches their bookings
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${user2.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.bookings).toHaveLength(0);
    });
  });

  // ── Cancel booking ───────────────────────────────────────────────────────────
  describe('DELETE /api/bookings/:id', () => {
    it('should cancel booking and restore seats', async () => {
      const { accessToken } = await createUserAndLogin({ email: 'user@test.com' });
      const event = await createEvent({ totalSeats: 50, availableSeats: 50 });

      const bookingRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId: event._id.toString(), seatsBooked: 3 });

      const bookingId = bookingRes.body.data.booking._id;

      const cancelRes = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.booking.status).toBe('cancelled');

      // Seats should be restored
      const eventRes = await request(app).get(`/api/events/${event._id}`);
      expect(eventRes.body.data.event.availableSeats).toBe(50);
    });

    it('should return 400 when trying to cancel an already cancelled booking', async () => {
      const { accessToken } = await createUserAndLogin({ email: 'user@test.com' });
      const event = await createEvent({ totalSeats: 50, availableSeats: 50 });

      const bookingRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId: event._id.toString(), seatsBooked: 1 });

      const bookingId = bookingRes.body.data.booking._id;

      // Cancel once
      await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Cancel again
      const res = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(400);
    });

    it("should return 403 when cancelling another user's booking", async () => {
      const user1 = await createUserAndLogin({ email: 'user1@test.com' });
      const user2 = await createUserAndLogin({ email: 'user2@test.com' });
      const event = await createEvent({ totalSeats: 50, availableSeats: 50 });

      const bookingRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send({ eventId: event._id.toString(), seatsBooked: 1 });

      const bookingId = bookingRes.body.data.booking._id;

      const res = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${user2.accessToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent booking', async () => {
      const { accessToken } = await createUserAndLogin({ email: 'user@test.com' });

      const res = await request(app)
        .delete('/api/bookings/64f1a2b3c4d5e6f7a8b9c0d1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });
});
