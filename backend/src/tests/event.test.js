require('./setup');
const request = require('supertest');
const app = require('../app');
const { createUserAndLogin, createEvent } = require('./helpers');

describe('Events API', () => {
  // ── List events ──────────────────────────────────────────────────────────────
  describe('GET /api/events', () => {
    beforeEach(async () => {
      await createEvent({ name: 'React Summit', category: 'Technology', venue: 'Amsterdam' });
      await createEvent({ name: 'Design Conf', category: 'Design', venue: 'London' });
    });

    it('should return paginated events', async () => {
      const res = await request(app).get('/api/events');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.events).toHaveLength(2);
      expect(res.body.meta.total).toBe(2);
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/api/events?category=Technology');

      expect(res.status).toBe(200);
      expect(res.body.data.events).toHaveLength(1);
      expect(res.body.data.events[0].name).toBe('React Summit');
    });

    it('should filter by venue (partial, case-insensitive)', async () => {
      const res = await request(app).get('/api/events?venue=london');

      expect(res.status).toBe(200);
      expect(res.body.data.events).toHaveLength(1);
      expect(res.body.data.events[0].name).toBe('Design Conf');
    });

    it('should paginate correctly', async () => {
      const res = await request(app).get('/api/events?page=1&limit=1');

      expect(res.status).toBe(200);
      expect(res.body.data.events).toHaveLength(1);
      expect(res.body.meta.totalPages).toBe(2);
      expect(res.body.meta.hasNextPage).toBe(true);
    });

    it('should return empty array when no events match', async () => {
      const res = await request(app).get('/api/events?category=Sports');

      expect(res.status).toBe(200);
      expect(res.body.data.events).toHaveLength(0);
    });
  });

  // ── Get single event ─────────────────────────────────────────────────────────
  describe('GET /api/events/:id', () => {
    it('should return event details', async () => {
      const event = await createEvent();
      const res = await request(app).get(`/api/events/${event._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.event._id).toBe(event._id.toString());
      expect(res.body.data.event.name).toBe('Test Event');
    });

    it('should return 404 for unknown id', async () => {
      const res = await request(app).get('/api/events/64f1a2b3c4d5e6f7a8b9c0d1');
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid ObjectId', async () => {
      const res = await request(app).get('/api/events/not-an-id');
      expect(res.status).toBe(400);
    });
  });

  // ── Admin create event ───────────────────────────────────────────────────────
  describe('POST /api/admin/events', () => {
    it('should allow admin to create event', async () => {
      const { accessToken } = await createUserAndLogin({
        email: 'admin@test.com',
        role: 'admin',
      });

      const res = await request(app)
        .post('/api/admin/events')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'New Conference',
          description: 'A brand new conference with lots of content',
          venue: 'New York, NY',
          dateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          totalSeats: 200,
          category: 'Technology',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.event.name).toBe('New Conference');
      expect(res.body.data.event.availableSeats).toBe(200);
    });

    it('should return 403 for regular users', async () => {
      const { accessToken } = await createUserAndLogin({ email: 'user@test.com' });

      const res = await request(app)
        .post('/api/admin/events')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Unauthorized Event',
          description: 'Should not be created',
          venue: 'Somewhere',
          dateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          totalSeats: 50,
        });

      expect(res.status).toBe(403);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).post('/api/admin/events').send({
        name: 'Ghost Event',
        description: 'No auth provided',
        venue: 'Nowhere',
        dateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalSeats: 50,
      });

      expect(res.status).toBe(401);
    });
  });
});
