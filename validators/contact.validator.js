const { z } = require('zod');

const createContactSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    subject: z.string().trim().min(3).max(120),
    message: z.string().trim().min(10).max(2000),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { createContactSchema };
