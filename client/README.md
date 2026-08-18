# WareSense Client

Independent React frontend for the WareSense warehouse monitoring dashboard.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Zustand · Recharts · React Router

## Setup

```bash
cd client
npm install
npm run dev
```

Runs at **http://localhost:5173**

The dev server proxies `/api` requests to the backend at `http://localhost:4000`. Start the [server](../server/README.md) first.

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
