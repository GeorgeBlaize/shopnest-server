const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const overview = asyncHandler(async (req, res) => {
  const [revenueAgg, totalOrders, totalUsers, totalProducts] = await Promise.all([
    prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count(),
  ]);

  res.json({
    success: true,
    data: {
      totalRevenue: Number(revenueAgg._sum.total || 0),
      totalOrders,
      totalUsers,
      totalProducts,
    },
  });
});

const salesOverTime = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, status: { not: 'CANCELLED' } },
    select: { createdAt: true, total: true },
  });

  const byDay = new Map();
  for (const order of orders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + Number(order.total));
  }

  const series = Array.from(byDay.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({ success: true, data: { series } });
});

const ordersByStatus = asyncHandler(async (req, res) => {
  const grouped = await prisma.order.groupBy({ by: ['status'], _count: { status: true } });
  const data = grouped.map((g) => ({ status: g.status, count: g._count.status }));
  res.json({ success: true, data: { items: data } });
});

const topProducts = asyncHandler(async (req, res) => {
  const grouped = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, title: true },
  });
  const titleMap = new Map(products.map((p) => [p.id, p.title]));

  const items = grouped.map((g) => ({
    productId: g.productId,
    title: titleMap.get(g.productId) || 'Unknown product',
    quantitySold: g._sum.quantity || 0,
  }));

  res.json({ success: true, data: { items } });
});

const myStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [orderCount, spendAgg, reviewCount] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.aggregate({
      where: { userId, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    }),
    prisma.review.count({ where: { userId } }),
  ]);

  res.json({
    success: true,
    data: {
      orderCount,
      totalSpent: Number(spendAgg._sum.total || 0),
      reviewCount,
    },
  });
});

module.exports = { overview, salesOverTime, ordersByStatus, topProducts, myStats };
