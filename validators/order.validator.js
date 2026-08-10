const { z } = require('zod');

const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string().min(1),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.coerce.number().int().positive().max(50),
        })
      )
      .min(1, 'Cart is empty'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const listOrdersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});

module.exports = { createOrderSchema, listOrdersSchema, updateStatusSchema };
