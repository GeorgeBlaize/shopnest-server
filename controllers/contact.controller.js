const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildMeta } = require('../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const message = await prisma.contactMessage.create({ data: req.body });
  res.status(201).json({ success: true, data: { message } });
});

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 15 });
  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.contactMessage.count(),
  ]);
  res.json({ success: true, data: { items, meta: buildMeta({ page, limit, total }) } });
});

const resolve = asyncHandler(async (req, res) => {
  const message = await prisma.contactMessage.update({
    where: { id: req.params.id },
    data: { resolved: true },
  });
  res.json({ success: true, data: { message } });
});

module.exports = { create, list, resolve };
