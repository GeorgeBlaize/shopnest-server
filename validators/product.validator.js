const { z } = require('zod');

const listProductsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating']).optional(),
    featured: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }),
});

const productBody = {
  title: z.string().trim().min(3).max(140),
  shortDesc: z.string().trim().min(10).max(200),
  description: z.string().trim().min(20),
  specs: z.record(z.string(), z.string()).default({}),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().nullish(),
  stock: z.coerce.number().int().nonnegative(),
  images: z.array(z.string().trim().url()).min(1, 'At least one image is required'),
  categoryId: z.string().min(1),
  isFeatured: z.coerce.boolean().optional(),
};

const createProductSchema = z.object({
  body: z.object(productBody),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateProductSchema = z.object({
  body: z.object(
    Object.fromEntries(Object.entries(productBody).map(([key, schema]) => [key, schema.optional()]))
  ),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});

module.exports = { listProductsSchema, createProductSchema, updateProductSchema };
