const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { refreshCookieOptions } = require('../utils/tokens');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);

  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions());

  ApiResponse.created(res, 'Account created successfully', {
    user,
    accessToken: tokens.accessToken,
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.login(req.body);

  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions());

  ApiResponse.ok(res, 'Login successful', {
    user,
    accessToken: tokens.accessToken,
  });
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  await authService.logout(req.user.id, refreshToken);

  res.clearCookie('refreshToken', { path: '/api/auth' });
  ApiResponse.ok(res, 'Logged out successfully');
});

/**
 * POST /api/auth/refresh-token
 * Accepts token from httpOnly cookie OR request body (for clients that can't use cookies).
 */
const refreshToken = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
  const { user, tokens } = await authService.refreshTokens(incoming);

  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions());

  ApiResponse.ok(res, 'Tokens refreshed', {
    user,
    accessToken: tokens.accessToken,
  });
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  ApiResponse.ok(res, 'User profile fetched', { user });
});

module.exports = { register, login, logout, refreshToken, getMe };
