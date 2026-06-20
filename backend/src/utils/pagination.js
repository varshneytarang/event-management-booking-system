/**
 * Builds mongoose query options and pagination metadata from request query params.
 *
 * @param {object} query - req.query
 * @param {number} defaultLimit
 * @returns {{ skip: number, limit: number, page: number, buildMeta: Function }}
 */
const parsePagination = (query, defaultLimit = 10) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  const buildMeta = (total) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  });

  return { skip, limit, page, buildMeta };
};

module.exports = { parsePagination };
