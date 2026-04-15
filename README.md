# Luma Dashboard ✨

Luma Dashboard is a personal command center for Samuel Trejo, built as an Angular 19 frontend with an Express backend. It currently includes infrastructure monitoring plus a Codex AI usage panel backed by SQLite for durable usage snapshots.

## Tech Stack
- Angular 19
- Standalone components with inline templates
- SCSS styling
- Node.js + Express
- SQLite for Codex usage persistence
- Docker + Docker Compose
- Nginx for frontend serving and API proxying

## Quick Start
```bash
docker compose up --build
```

Then open `http://localhost:3000`.

## Project Structure
- `src/` - Angular frontend
- `server/` - Express API and SQLite-backed AI usage storage
- `server/data/dashboard.sqlite` - local SQLite database file created at runtime
- `docker/nginx/` - Nginx config for frontend serving and API proxying
- `context/CONTEXT.md` - project context, status, and backlog
- `docker-compose.yml` - local orchestration

## API Endpoints
- `GET /api/health` - service health and database status
- `GET /api/server/metrics` - live server metrics
- `GET /api/server/cost` - rolling energy cost estimate
- `GET /api/ai-usage/codex` - latest Codex usage windows and recent history
- `POST /api/ai-usage/codex` - store Codex usage snapshots

### POST /api/ai-usage/codex example
```json
{
  "snapshots": [
    {
      "windowName": "5h",
      "usageMinutesUsed": 42,
      "usageMinutesLimit": 300,
      "resetAt": "2026-04-15T10:00:00Z",
      "source": "manual",
      "rawPayload": {
        "label": "5h",
        "used": 42,
        "limit": 300
      }
    },
    {
      "windowName": "weekly",
      "usageMinutesUsed": 540,
      "usageMinutesLimit": 10080,
      "resetAt": "2026-04-20T00:00:00Z",
      "source": "manual"
    }
  ]
}
```

## Notes
- Frontend is served on port `3000`
- API runs on port `3000` inside its container and is proxied through nginx at `/api`
- SQLite data lives under `server/data/`

Created by Luma ✨
