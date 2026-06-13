# DSA Revision Tracker

A full-featured spaced-revision tracker for coding interview prep. React + Express + MongoDB with auth, analytics, practice mode, email alerts, and PWA support.

## Features

- **Auth** — Register/login, per-user data
- **Question CRUD** — URL links, custom revision days, reminder overrides, markdown notes
- **Smart revision** — Configurable intervals per confidence level (from API/settings)
- **Dashboard** — Stats, streak, interview countdown, topic weakness chart
- **Due filter** — Click due card to filter questions
- **Practice mode** — Solve from scratch, reveal notes, mark revised
- **Bulk actions** — Multi-select revise/delete
- **Undo delete** — 8-second undo on delete toast
- **Confidence history** — Tracked on every revise/update
- **Similar questions** — By shared tags
- **Search & filter** — Name, confidence, platform, tags (all from your data)
- **Table** — Pagination, column sorting
- **Export/Import** — JSON backup
- **Email** — Daily due digest + weekly summary
- **PWA** — Installable, service worker, push notifications
- **Keyboard shortcuts** — `N` new, `/` search, `Esc` close
- **Mobile nav** — Bottom tabs on small screens
- **Dark mode** — Default dark theme

## Setup

```bash
npm install
npm run install:all
cp server/.env.example server/.env
# Edit server/.env: MONGODB_URI, JWT_SECRET, SMTP (optional)
npm run dev
```

Open http://localhost:5173 → **Register** an account (existing orphan questions auto-assign on first login).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for auth tokens |
| `SMTP_*` | Email alerts (optional) |
| `DEFAULT_ALERT_EMAIL` | Alert recipient |
| `ALERT_CRON_SCHEDULE` | Daily alert cron (default `0 8 * * *`) |

## Deploy

- **Backend:** [Render](https://render.com) — use `render.yaml`, set env vars
- **Frontend:** [Vercel](https://vercel.com) — deploy `client/`, update `vercel.json` API rewrite URL

Server must run 24/7 for email cron jobs.

## Scripts

```bash
npm run dev          # Both servers
npm run dev:server   # API only (port 5001)
npm run dev:client   # UI only (port 5173)
cd server && npm test  # Run revision logic tests
```

## API Overview

| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Sign in |
| `GET /api/settings` | Platforms, tags, intervals, interview date |
| `PUT /api/settings` | Update settings |
| `GET /api/questions` | List questions |
| `GET /api/questions/stats` | Full dashboard stats |
| `GET /api/questions/practice` | Due questions for practice mode |
| `GET /api/questions/export` | Export JSON |
| `POST /api/questions/import` | Import JSON |
| `POST /api/questions/restore` | Undo delete |
| `PATCH /api/questions/bulk/revise` | Bulk mark revised |
| `DELETE /api/questions/bulk` | Bulk delete |
