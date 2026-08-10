const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildMeta } = require('../utils/pagination');
const generateOrderNumber = require('../utils/orderNumber');

const SHIPPING_FEE = 5.0;
const FREE_SHIPPING_THRESHOLD = 75.0;

const create = asyncHandler(async (req, res) => {
  const { addressId, items } = req.body;
  const userId = req.user.id;

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    throw ApiError.badRequest('Select a valid shipping address');
  }

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItemsData = items.map(({ productId, quantity }) => {
    const product = productMap.get(productId);
    if (!product) throw ApiError.badRequest(`Product ${productId} no longer exists`);
    if (product.stock < quantity) {
      throw ApiError.badRequest(`Not enough stock for "${product.title}"`);
    }
    const price = Number(product.price);
    subtotal += price * quantity;
    return {
      productId,
      titleSnapshot: product.title,
      priceSnapshot: price,
      quantity,
    };
  });

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId,
        subtotal,
        shippingFee,
        total,
        items: { create: orderItemsData },
      },
      include: { items: true, address: true },
    });

    for (const item of orderItemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  res.status(201).json({ success: true, data: { order } });
});

const listMine = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10 });
  const where = { userId: req.user.id };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { items: true, address: true },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, data: { items, meta: buildMeta({ page, limit, total }) } });
});

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, address: true, user: { select: { id: true, name: true, email: true } } },
  });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.userId !== req.user.id && !['ADMIN', 'MANAGER'].includes(req.user.role)) {
    throw ApiError.forbidden('You cannot view this order');
  }
  res.json({ success: true, data: { order } });
});

const listAll = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 15 });
  const where = { ...(status ? { status } : {}) };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { items: true, user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, data: { items, meta: buildMeta({ page, limit, total }) } });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await prisma.order.update({ where: { id }, data: { status } });
  res.json({ success: true, data: { order } });
});

module.exports = { create, listMine, getById, listAll, updateStatus };
