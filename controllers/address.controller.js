const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  res.json({ success: true, data: { addresses } });
});

const create = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (req.body.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const address = await prisma.address.create({ data: { ...req.body, userId } });
  res.status(201).json({ success: true, data: { address } });
});

async function assertOwnedAddress(id, userId) {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) throw ApiError.notFound('Address not found');
  if (address.userId !== userId) throw ApiError.forbidden('This address does not belong to you');
  return address;
}

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await assertOwnedAddress(id, req.user.id);
  if (req.body.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
  }
  const address = await prisma.address.update({ where: { id }, data: req.body });
  res.json({ success: true, data: { address } });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await assertOwnedAddress(id, req.user.id);
  await prisma.address.delete({ where: { id } });
  res.json({ success: true, message: 'Address deleted' });
});

module.exports = { list, create, update, remove };
