# ShopNest — Server

Express + PostgreSQL (Prisma) REST API for ShopNest, a full-stack e-commerce platform. Paired with the [shopnest-client](https://github.com/GeorgeBlaize/shopnest-client) Next.js frontend.

## Stack

Express 5, PostgreSQL via Prisma ORM, JWT auth (httpOnly cookies) with bcrypt password hashing, optional Google sign-in via Firebase Admin SDK, zod validation, centralized error handling, role-based access control.

## Folder structure

```
index.js         app bootstrap
app.js           express app + middleware + route wiring
routes/          one file per resource
controllers/     business logic per resource
middleware/      auth, role guard, validation, rate limiting, error handling
config/          Prisma client, env, CORS, Firebase admin
prisma/          schema.prisma + seed.js
utils/           ApiError, asyncHandler, jwt, pagination, slugify, etc.
validators/      zod schemas per resource
```

## Getting started

Requires a PostgreSQL database — local install, Docker, or a free hosted instance (Neon/Supabase/Railway):

```bash
docker run --name shopnest-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=shopnest -p 5432:5432 -d postgres:16
```

```bash
npm install
cp .env.example .env       # fill in DATABASE_URL, JWT_SECRET, etc.
npm run prisma:migrate     # creates tables
npm run seed                # seeds demo data + demo accounts
npm run dev                  # starts API on http://localhost:5000
```

## Environment variables

See [`.env.example`](./.env.example) for the full list:

- `DATABASE_URL` — PostgreSQL connection string
- `PORT`, `NODE_ENV`, `CLIENT_URL` — server + CORS config
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_NAME` — auth
- `FIREBASE_SERVICE_ACCOUNT_JSON` — Firebase Admin SDK service account, single-line JSON (only needed for Google sign-in)

## Scripts

- `npm run dev` — start API with nodemon
- `npm run start` — run in production mode
- `npm run prisma:migrate` — run Prisma migrations
- `npm run prisma:studio` — open Prisma Studio
- `npm run seed` — seed the database

## Demo credentials (after seeding)

| Role    | Email                 | Password    |
|---------|------------------------|-------------|
| Admin   | admin@shopnest.com    | Admin@123   |
| Manager | manager@shopnest.com  | Manager@123 |
| User    | user@shopnest.com     | User@123    |
