const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');

const list = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  res.json({ success: true, data: { categories } });
});

const create = asyncHandler(async (req, res) => {
  const { name, imageUrl } = req.body;
  const category = await prisma.category.create({
    data: { name, imageUrl, slug: slugify(name) },
  });
  res.status(201).json({ success: true, data: { category } });
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };
  if (data.name) data.slug = slugify(data.name);
  const category = await prisma.category.update({ where: { id }, data });
  res.json({ success: true, data: { category } });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw ApiError.conflict('Cannot delete a category that still has products');
  }
  await prisma.category.delete({ where: { id } });
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { list, create, update, remove };
