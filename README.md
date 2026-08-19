# WareSense

Smart warehouse real-time dashboard — full-stack recruitment task.

Live SSE telemetry, periodic polling APIs, JWT session auth, and a 6-page React dashboard for monitoring warehouse zones (temperature, humidity, throughput, alerts).

## Requirements

- **Node.js 18+** and **npm** (for manual setup)
- **Docker Desktop** (optional, for one-command setup)

## Ports

Non-default ports to avoid conflicts with common dev tools:

| Service | URL |
|---------|-----|
| **App (frontend)** | http://localhost:9137 |
| **API (backend)** | http://localhost:8740 |

## Option A — Docker (one command)

Best if you want everything running without installing Node locally.

```bash
git clone https://github.com/akash6344/waresense.git
cd waresense
docker compose up --build
```

Open **http://localhost:9137**

Stop with `Ctrl+C`. Run in the background:

```bash
docker compose up --build -d
docker compose down   # stop
```

## Option B — Manual setup (without Docker)

Use two terminals. **Start the backend first**, then the frontend.

### Terminal 1 — Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Server runs at **http://localhost:8740**

### Terminal 2 — Frontend

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:9137** (proxies `/api` to the backend)

## Login

| Field | Value |
|-------|-------|
| Email | `operator@waresense.io` |
| Password | `warehouse123` |

## Project structure

```
waresense/
├── client/              # React + Vite frontend
├── server/              # Express + TypeScript backend
├── docker-compose.yml   # Docker setup (both services)
├── README.md            # This file
└── SUBMISSION.md        # Submission notes for reviewers
```

## Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, Recharts, React Router |
| Backend | Node.js, Express, TypeScript, SSE, JWT (httpOnly cookies), Zod, Vitest |

## Features

- **Live stream** — SSE telemetry with LIVE indicator and pause/resume
- **Periodic polling** — summary, alerts, and trends APIs (5–15s interval)
- **Session auth** — login, protected routes, logout, expiry handling
- **6 pages** — Login, Dashboard, Analytics, Alerts, Settings, Profile
- **Theming** — light/dark modes with consistent industrial palette
- **Interactivity** — filters, search, sort, threshold sliders, alert detail drawer

## Scripts

**Server** (`cd server`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm test` | Run Vitest tests |
| `npm run lint` | Typecheck |

**Client** (`cd client`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Typecheck |

## More detail

- [client/README.md](client/README.md) — frontend-specific notes
- [server/README.md](server/README.md) — API reference and server layout
- [SUBMISSION.md](SUBMISSION.md) — copy-paste blurb for assignment submission

## Assignment brief

Original task PDF: [server/docs/Full-Stack Recruitment Task.pdf](server/docs/Full-Stack%20Recruitment%20Task.pdf)
