const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const User = require('../models/User');
const Event = require('../models/Event');

/**
 * Create a user directly in DB and return user + valid tokens via login.
 */
const createUserAndLogin = async ({
  name = 'Test User',
  email = 'test@example.com',
  password = 'Test1234!',
  role = 'user',
} = {}) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return {
    user,
    accessToken: res.body.data.accessToken,
    refreshToken: res.headers['set-cookie']?.[0]?.split(';')[0]?.replace('refreshToken=', ''),
  };
};

/**
 * Create a sample event directly in DB.
 */
const createEvent = async (overrides = {}) => {
  return Event.create({
    name: 'Test Event',
    description: 'A test event description that is long enough',
    venue: 'Test Venue, City',
    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week ahead
    totalSeats: 100,
    availableSeats: 100,
    category: 'Technology',
    status: 'upcoming',
    ...overrides,
  });
};

module.exports = { createUserAndLogin, createEvent };
