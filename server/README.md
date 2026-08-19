# WareSense Server

Express backend for the WareSense warehouse monitoring dashboard.

**Full setup (Docker + manual):** see [README.md](../README.md) in the repo root.

## Stack

Node.js · Express 4 · TypeScript · SSE · JWT cookie auth · Zod · Vitest

## Setup

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Runs at **http://localhost:8740**

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8740` | Server port |
| `JWT_SECRET` | — | Signing secret for session tokens |
| `JWT_EXPIRES_IN` | `15m` | Session lifetime |
| `CLIENT_ORIGIN` | `http://localhost:9137` | CORS allowed origin |

## Demo login

- Email: `operator@waresense.io`
- Password: `warehouse123`

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Sign in |
| POST | `/api/auth/logout` | Yes | Sign out |
| GET | `/api/auth/me` | Cookie | Current session |
| POST | `/api/auth/expire` | Yes | Force expire (demo) |
| GET | `/api/dashboard/stream/telemetry` | Yes | SSE live stream |
| GET | `/api/dashboard/summary` | Yes | Aggregated metrics |
| GET | `/api/dashboard/alerts` | Yes | Derived alerts |
| GET | `/api/dashboard/trends` | Yes | Time series buckets |
| GET | `/api/dashboard/session/activity` | Yes | Session log |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |
| `npm test` | Vitest unit tests |
| `npm run lint` | Typecheck |

## Project layout

```
server/
├── src/
│   ├── index.ts           # Express app entry
│   ├── auth/              # JWT session handling
│   ├── routes/            # Auth + dashboard routes
│   ├── simulation/        # Dummy telemetry generator
│   ├── services/          # Aggregation logic
│   └── types/             # API type definitions
├── tests/
├── .env.example
└── package.json
```
