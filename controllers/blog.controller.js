const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');
const { parsePagination, buildMeta } = require('../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 6 });
  const where = { published: true };

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.blogPost.count({ where }),
  ]);

  res.json({ success: true, data: { items, meta: buildMeta({ page, limit, total }) } });
});

const getBySlug = asyncHandler(async (req, res) => {
  const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } });
  if (!post) throw ApiError.notFound('Blog post not found');
  res.json({ success: true, data: { post } });
});

const create = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const post = await prisma.blogPost.create({ data: { ...req.body, slug: slugify(title) } });
  res.status(201).json({ success: true, data: { post } });
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };
  if (data.title) data.slug = slugify(data.title);
  const post = await prisma.blogPost.update({ where: { id }, data });
  res.json({ success: true, data: { post } });
});

const remove = asyncHandler(async (req, res) => {
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Blog post deleted' });
});

module.exports = { list, getBySlug, create, update, remove };
