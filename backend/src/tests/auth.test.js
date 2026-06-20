require('./setup');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const User = require('../models/User');

describe('Auth API', () => {
  // ── Registration ────────────────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    const validUser = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Secret123!',
    };

    it('should register a new user and return accessToken', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.accessToken).toBeDefined();
      // Refresh token should be set as httpOnly cookie
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return 409 if email already exists', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app).post('/api/auth/register').send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'not-an-email' });

      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].field).toBe('email');
    });

    it('should return 422 for weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: '12345' });

      expect(res.status).toBe(422);
      expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
    });

    it('should return 422 when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(422);
    });
  });

  // ── Login ───────────────────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hash = await bcrypt.hash('Secret123!', 10);
      await User.create({ name: 'Jane', email: 'jane@example.com', passwordHash: hash });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com', password: 'Secret123!' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com', password: 'WrongPass!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'Secret123!' });

      expect(res.status).toBe(401);
    });
  });

  // ── Get current user ────────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const hash = await bcrypt.hash('Secret123!', 10);
      await User.create({ name: 'Jane', email: 'jane@example.com', passwordHash: hash });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com', password: 'Secret123!' });

      const token = loginRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('jane@example.com');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
    });
  });

  // ── Logout ──────────────────────────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const hash = await bcrypt.hash('Secret123!', 10);
      await User.create({ name: 'Jane', email: 'jane@example.com', passwordHash: hash });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com', password: 'Secret123!' });

      const token = loginRes.body.data.accessToken;

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
