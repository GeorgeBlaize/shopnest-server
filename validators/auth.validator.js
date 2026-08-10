const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const firebaseLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(10, 'Missing Firebase ID token'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { registerSchema, loginSchema, firebaseLoginSchema };
