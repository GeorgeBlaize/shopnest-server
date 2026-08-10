const { z } = require('zod');

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60),
    imageUrl: z.string().trim().url('Provide a valid image URL'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60).optional(),
    imageUrl: z.string().trim().url('Provide a valid image URL').optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});

module.exports = { createCategorySchema, updateCategorySchema };
