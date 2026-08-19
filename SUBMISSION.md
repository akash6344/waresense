# Submission Guide

Setup instructions (Docker **and** manual) are in the main **[README.md](README.md)**.

## Repository

https://github.com/akash6344/waresense

## What to send

1. **Repo link:** https://github.com/akash6344/waresense  
2. **Run (Docker):** `docker compose up --build` → http://localhost:9137  
3. **Run (manual):** see README — start `server/` then `client/`  
4. **Login:** `operator@waresense.io` / `warehouse123`

### Copy-paste blurb

```
WareSense — Smart Warehouse Real-Time Dashboard

Repo: https://github.com/akash6344/waresense

Docker:  docker compose up --build  →  http://localhost:9137
Manual:  see README (server + client, two terminals)
Login:   operator@waresense.io / warehouse123

Stack: React, TypeScript, Vite, Tailwind, Zustand | Node, Express, SSE, JWT
```

## Assignment checklist

- [x] Live real-time data (SSE, LIVE indicator, 3+ metrics)
- [x] Periodic API polling (summary, alerts, trends)
- [x] Consistent theming (light/dark)
- [x] Session management (login, protected routes, logout, expiry)
- [x] 6 pages (Login, Dashboard, Analytics, Alerts, Settings, Profile)
- [x] Coherent warehouse domain
- [x] Multi-modality UI (filters, sliders, pause/resume, drawer, toasts)
