const { z } = require('zod');

const addressBody = {
  label: z.string().trim().min(2).max(40),
  line1: z.string().trim().min(5).max(160),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(20),
  isDefault: z.coerce.boolean().optional(),
};

const createAddressSchema = z.object({
  body: z.object(addressBody),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateAddressSchema = z.object({
  body: z.object(Object.fromEntries(Object.entries(addressBody).map(([k, s]) => [k, s.optional()]))),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});

module.exports = { createAddressSchema, updateAddressSchema };
