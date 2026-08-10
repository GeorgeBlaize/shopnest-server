const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');
const { parsePagination, buildMeta } = require('../utils/pagination');

function buildSort(sort) {
  switch (sort) {
    case 'price_asc':
      return { price: 'asc' };
    case 'price_desc':
      return { price: 'desc' };
    case 'rating':
      return { avgRating: 'desc' };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
}

const list = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, rating, sort, featured } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const where = {
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { shortDesc: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(rating ? { avgRating: { gte: Number(rating) } } : {}),
    ...(featured !== undefined ? { isFeatured: featured } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: buildSort(sort),
      skip,
      take: limit,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ success: true, data: { items, meta: buildMeta({ page, limit, total }) } });
});

const getBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  });
  if (!product) throw ApiError.notFound('Product not found');

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: { category: true },
  });

  res.json({ success: true, data: { product, related } });
});

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, data: { product } });
});

const create = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const product = await prisma.product.create({ data: { ...req.body, slug } });
  res.status(201).json({ success: true, data: { product } });
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };
  if (data.title) data.slug = slugify(data.title);
  const product = await prisma.product.update({ where: { id }, data });
  res.json({ success: true, data: { product } });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id } });
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = { list, getBySlug, getById, create, update, remove };
