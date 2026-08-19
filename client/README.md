# WareSense Client

React frontend for the WareSense warehouse monitoring dashboard.

**Full setup (Docker + manual):** see [README.md](../README.md) in the repo root.

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
