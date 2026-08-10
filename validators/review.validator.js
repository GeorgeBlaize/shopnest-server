const { z } = require('zod');

const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().min(5).max(500),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { createReviewSchema };
