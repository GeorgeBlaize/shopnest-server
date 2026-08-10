const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildMeta } = require('../utils/pagination');

async function recomputeProductRating(tx, productId) {
  const agg = await tx.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await tx.product.update({
    where: { id: productId },
    data: {
      avgRating: agg._avg.rating || 0,
      reviewCount: agg._count.rating,
    },
  });
}

const listByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10 });

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  res.json({ success: true, data: { items, meta: buildMeta({ page, limit, total }) } });
});

const create = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound('Product not found');

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });
  if (existing) throw ApiError.conflict('You have already reviewed this product');

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: { productId, userId, rating, comment },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    await recomputeProductRating(tx, productId);
    return created;
  });

  res.status(201).json({ success: true, data: { review } });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw ApiError.notFound('Review not found');
  if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw ApiError.forbidden('You cannot delete this review');
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id } });
    await recomputeProductRating(tx, review.productId);
  });

  res.json({ success: true, message: 'Review deleted' });
});

module.exports = { listByProduct, create, remove };
