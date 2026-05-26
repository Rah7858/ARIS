# ARIS — Accident Response Intelligence System · Frontend

> React + Vite frontend for the AI-powered accident detection and emergency response dashboard.

## Tech Stack
- React 19 + TypeScript
- TanStack Router (file-based routing)
- TanStack Query
- Tailwind CSS v4
- Recharts (analytics charts)
- React-Leaflet (incident maps)
- Axios (API client)

## Quick Start

```bash
cd frontend
npm install
npm run dev        # starts at http://localhost:5173
```

Requires the ARIS backend running at `http://localhost:5000`.

## Pages

| Route | Description |
|---|---|
| `/login` | JWT authentication |
| `/dashboard` | Command center — live feeds, accident map, stats |
| `/accidents` | Incident log with filters |
| `/cameras` | Camera node management |
| `/analytics` | Charts — hourly, severity, response times, cities |
| `/contacts` | Emergency contacts + alert dispatch |
| `/alerts` | Alert history audit trail |
| `/settings` | Operator profile & preferences |

## Environment

The Vite dev server proxies `/api/*` to `http://localhost:5000` automatically.
All API calls use relative paths (`/api/v1/...`).

## Auth

JWT token stored in `localStorage` as `aris_token`.
User object stored as `aris_user`.
All routes except `/login` are protected — redirect to `/login` if no token.
