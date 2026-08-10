const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const sanitizeUser = require('../utils/sanitizeUser');
const { parsePagination, buildMeta } = require('../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 15 });

  const where = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [rawItems, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { _count: { select: { orders: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  const items = rawItems.map(sanitizeUser);
  res.json({ success: true, data: { items, meta: buildMeta({ page, limit, total }) } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.user.id }, data: req.body });
  res.json({ success: true, data: { user: sanitizeUser(user) } });
});

const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (id === req.user.id) throw ApiError.badRequest('You cannot change your own role');
  const user = await prisma.user.update({ where: { id }, data: { role } });
  res.json({ success: true, data: { user: sanitizeUser(user) } });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) throw ApiError.badRequest('You cannot delete your own account');
  await prisma.user.delete({ where: { id } });
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { list, updateProfile, updateRole, remove };
