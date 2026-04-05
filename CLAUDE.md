# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Run in production (node src/app.js)
npm run dev      # Run with hot-reload via nodemon
```

There are no tests and no linter configured. The CI pipeline only checks syntax:

```bash
node --check src/app.js && node --check src/routes.js && node --check src/firebase.js
```

## Environment

The app requires a `FIREBASE_SERVICE_ACCOUNT` environment variable — a base64-encoded JSON string of the Firebase Admin SDK service account. Without it, the process exits immediately on startup.

For local development, create a `.env` file (loaded automatically when `NODE_ENV !== 'production'`):

```
FIREBASE_SERVICE_ACCOUNT=<base64-encoded service account JSON>
PORT=3000
```

## Architecture

Three-file Express app backed by Firestore:

- **`src/app.js`** — Express setup: CORS, JSON body parsing, rate limiting (100 req/IP/15min), request logging middleware, mounts `routes` at `/api`, health check at `/`, and centralized error handler.
- **`src/firebase.js`** — Initializes Firebase Admin SDK from `FIREBASE_SERVICE_ACCOUNT` env var and exports `{ db }` (Firestore instance).
- **`src/routes.js`** — All CRUD route handlers for the `tasks` Firestore collection: `GET/POST /api/tasks`, `GET/PATCH/DELETE /api/tasks/:id`, and `GET /api/docs`.

## Task data model

```js
{
  id: string,          // Firestore document ID (auto-generated)
  title: string,       // required, max 100 chars
  priority: string,    // defaults to 'normal'
  completed: boolean,  // defaults to false
  createdAt: string    // ISO 8601 timestamp
}
```

Tasks are ordered by `createdAt` descending.
