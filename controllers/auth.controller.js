const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');
const sanitizeUser = require('../utils/sanitizeUser');
const { verifyFirebaseIdToken } = require('../config/firebaseAdmin');

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setAuthCookie(res, token) {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.isProduction,
    // Client and server are on different domains in production (Vercel <-> Render),
    // so the cookie must be SameSite=None (requires Secure) to be sent cross-site.
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'USER' },
  });

  const token = signToken({ id: user.id, role: user.role });
  setAuthCookie(res, token);
  res.status(201).json({ success: true, data: { user: sanitizeUser(user) } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw ApiError.unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const token = signToken({ id: user.id, role: user.role });
  setAuthCookie(res, token);
  res.json({ success: true, data: { user: sanitizeUser(user) } });
});

const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  let decoded;
  try {
    decoded = await verifyFirebaseIdToken(idToken);
  } catch {
    throw ApiError.unauthorized('Invalid Google sign-in token');
  }

  const { uid, email, name, picture } = decoded;
  if (!email) throw ApiError.badRequest('Google account has no email address');

  let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });

  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({ where: { id: user.id }, data: { firebaseUid: uid } });
    } else {
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          firebaseUid: uid,
          avatarUrl: picture || null,
          role: 'USER',
        },
      });
    }
  }

  const token = signToken({ id: user.id, role: user.role });
  setAuthCookie(res, token);
  res.json({ success: true, data: { user: sanitizeUser(user) } });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: { user: sanitizeUser(user) } });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
  });
  res.json({ success: true, message: 'Logged out' });
});

module.exports = { register, login, firebaseLogin, me, logout };
