const { z } = require('zod');

const listUsersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    role: z.enum(['USER', 'ADMIN', 'MANAGER']).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().min(6).max(20).optional(),
    avatarUrl: z.string().trim().url().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateRoleSchema = z.object({
  body: z.object({ role: z.enum(['USER', 'ADMIN', 'MANAGER']) }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});

module.exports = { listUsersSchema, updateProfileSchema, updateRoleSchema };
