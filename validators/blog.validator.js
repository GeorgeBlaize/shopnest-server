const { z } = require('zod');

const blogBody = {
  title: z.string().trim().min(5).max(140),
  excerpt: z.string().trim().min(10).max(200),
  content: z.string().trim().min(50),
  coverImage: z.string().trim().url(),
  authorName: z.string().trim().min(2).max(80),
  published: z.coerce.boolean().optional(),
};

const createBlogSchema = z.object({
  body: z.object(blogBody),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateBlogSchema = z.object({
  body: z.object(Object.fromEntries(Object.entries(blogBody).map(([k, s]) => [k, s.optional()]))),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});

module.exports = { createBlogSchema, updateBlogSchema };
