const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

function extractToken(req) {
  if (req.cookies?.[env.cookieName]) return req.cookies[env.cookieName];
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired session');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) throw ApiError.unauthorized('User no longer exists');

  req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
  next();
});

// Populates req.user if a valid token is present, but does not require it.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (user) req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
});

module.exports = { authenticate, optionalAuth };
