const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/user.repository');
const { createTokenPair, verifyRefreshToken } = require('../utils/tokens');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

class AuthService {
  async register({ name, email, password }) {
    const exists = await userRepo.existsByEmail(email);
    if (exists) throw ApiError.conflict('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepo.create({ name, email, passwordHash });

    const tokens = createTokenPair(user._id.toString(), user.role);

    // Persist refresh token
    const fullUser = await userRepo.findById(user._id, true);
    fullUser.addRefreshToken(tokens.refreshToken);
    await userRepo.save(fullUser);

    logger.info({ userId: user._id, email }, 'User registered');
    return { user, tokens };
  }

  async login({ email, password }) {
    const user = await userRepo.findByEmail(email, true);
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const valid = await user.comparePassword(password);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    const tokens = createTokenPair(user._id.toString(), user.role);
    user.addRefreshToken(tokens.refreshToken);
    await userRepo.save(user);

    logger.info({ userId: user._id, email }, 'User logged in');
    // Strip sensitive fields before returning
    const safeUser = user.toJSON();
    return { user: safeUser, tokens };
  }

  async logout(userId, refreshToken) {
    const user = await userRepo.findById(userId, true);
    if (!user) return; // idempotent

    user.removeRefreshToken(refreshToken);
    await userRepo.save(user);
    logger.info({ userId }, 'User logged out');
  }

  async refreshTokens(incomingRefreshToken) {
    if (!incomingRefreshToken) throw ApiError.unauthorized('Refresh token required');

    // Verify signature and expiry
    const decoded = verifyRefreshToken(incomingRefreshToken);

    const user = await userRepo.findById(decoded.id, true);
    if (!user) throw ApiError.unauthorized('User not found');

    // Validate token is still in our whitelist (rotation check)
    if (!user.refreshTokens.includes(incomingRefreshToken)) {
      // Possible token reuse — clear all tokens as security measure
      user.clearRefreshTokens();
      await userRepo.save(user);
      logger.warn({ userId: user._id }, 'Refresh token reuse detected — all tokens revoked');
      throw ApiError.unauthorized('Refresh token reuse detected. Please log in again.');
    }

    // Rotate: remove old, issue new pair
    user.removeRefreshToken(incomingRefreshToken);
    const tokens = createTokenPair(user._id.toString(), user.role);
    user.addRefreshToken(tokens.refreshToken);
    await userRepo.save(user);

    logger.info({ userId: user._id }, 'Tokens refreshed');
    return { user: user.toJSON(), tokens };
  }

  async getMe(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }
}

module.exports = new AuthService();
