# WareSense — Submission Guide

## Repository

**GitHub:** https://github.com/akash6344/waresense

## One-command setup (Docker)

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

```bash
git clone https://github.com/akash6344/waresense.git
cd waresense
docker compose up --build
```

Open **http://localhost:5173**

Stop with `Ctrl+C`, or run detached: `docker compose up --build -d`

## Manual setup (without Docker)

**Terminal 1 — Backend**
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**

## Demo credentials

| Field | Value |
|-------|-------|
| Email | `operator@waresense.io` |
| Password | `warehouse123` |

## What to submit (email / form)

You can send:

1. **GitHub repo link:** https://github.com/akash6344/waresense  
2. **How to run:** `docker compose up --build` then open http://localhost:5173  
3. **Login:** operator@waresense.io / warehouse123  
4. **Stack:** React + TypeScript + Vite + Tailwind + Zustand (frontend) · Node + Express + SSE + JWT (backend)  
5. **Notes:** Independent `client/` and `server/` folders; assignment brief in `server/docs/`

### Short submission blurb (copy-paste)

```
WareSense — Smart Warehouse Real-Time Dashboard

Repo: https://github.com/akash6344/waresense

Run: docker compose up --build
App: http://localhost:5173
Login: operator@waresense.io / warehouse123

Features: SSE live telemetry, periodic polling APIs, JWT session auth,
6-page dashboard, light/dark theming, filters/search/sort, alert drawer.
```

## Project structure

```
waresense/
├── client/          # React frontend (port 5173)
├── server/          # Express backend (port 4000)
├── docker-compose.yml
└── SUBMISSION.md
```

## Assignment checklist

- [x] Live real-time data (SSE, LIVE indicator, 3+ metrics)
- [x] Periodic API polling (summary, alerts, trends)
- [x] Consistent theming (light/dark)
- [x] Session management (login, protected routes, logout, expiry)
- [x] 6 pages (Login, Dashboard, Analytics, Alerts, Settings, Profile)
- [x] Coherent warehouse domain
- [x] Multi-modality UI (filters, sliders, pause/resume, drawer, toasts)
