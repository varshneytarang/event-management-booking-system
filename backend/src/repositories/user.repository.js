const User = require('../models/User');

/**
 * Data-access layer for User.
 * Services call these — never query Mongoose directly from services.
 */
class UserRepository {
  /** Find user by email. Optionally select sensitive fields. */
  async findByEmail(email, selectSensitive = false) {
    const q = User.findOne({ email: email.toLowerCase() });
    if (selectSensitive) q.select('+passwordHash +refreshTokens');
    return q.exec();
  }

  async findById(id, selectSensitive = false) {
    const q = User.findById(id);
    if (selectSensitive) q.select('+passwordHash +refreshTokens');
    return q.exec();
  }

  async create(data) {
    return User.create(data);
  }

  async save(user) {
    return user.save();
  }

  async existsByEmail(email) {
    return User.exists({ email: email.toLowerCase() });
  }
}

module.exports = new UserRepository();
