# Workflow Hub API

A small Express and PostgreSQL API demonstrating a modular registration endpoint with Prisma.

## Implemented endpoint

`POST /auth/register` accepts JSON with `name`, `email`, and `password`.

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "use-a-long-unique-password"
}
```

Success returns HTTP `201` with the user's `id`, `name`, `email`, `role`, and `createdAt`. Passwords require at least 12 characters and are hashed with bcrypt before storage; they are never included in the response. Invalid input returns `400`; duplicate email returns `409`; unexpected persistence errors return a generic `500`. JSON bodies are limited to 20 KB.

## Run locally

Requirements: Node.js 20 or later and PostgreSQL.

1. Install dependencies: `npm ci`
2. Create a local PostgreSQL database and copy `.env.example` to `.env`; replace the placeholder connection details.
3. Generate the Prisma client: `npx prisma generate`
4. Apply migrations: `npx prisma migrate deploy`
5. Start the API: `npm start`

The server listens on port 5000 by default; set `PORT` to override it. Never commit real database credentials.

## Tests

Run `npm test`. The registration-handler tests use an injected fake persistence layer, so they do not require a database. GitHub Actions runs these tests on pushes and pull requests.

## Scope

This is a learning project, not a production-ready account service. It does not issue login tokens or implement login, email verification, password reset, rate limiting, or deployment configuration. Add and review those controls before using it with real accounts.
