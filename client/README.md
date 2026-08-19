# WareSense Client

Independent React frontend for the WareSense warehouse monitoring dashboard.

## Quick start (Docker — recommended)

From the repo root:

```bash
docker compose up --build
```

Open **http://localhost:9137** — see [SUBMISSION.md](../SUBMISSION.md).

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Zustand · Recharts · React Router

## Setup

```bash
cd client
npm install
npm run dev
```

Runs at **http://localhost:9137**

The dev server proxies `/api` requests to the backend at `http://localhost:8740`. Start the [server](../server/README.md) first.

## Demo login

- Email: `operator@waresense.io`
- Password: `warehouse123`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Typecheck |

## Pages

Login · Dashboard (live SSE) · Analytics · Alerts · Settings · Profile
