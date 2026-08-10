const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { id: 'asc' } });
  res.json({ success: true, data: { testimonials } });
});

module.exports = { list };
