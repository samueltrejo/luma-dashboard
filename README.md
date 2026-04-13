# Luma Dashboard ✨

Luma Dashboard is a personal command center for Samuel Trejo, built as an Angular 19 frontend with an Express backend. This initial scaffold lays the foundation for personal, family, work, and server-monitoring views that will expand over time.

## Tech Stack
- Angular 19
- Standalone components with inline templates
- SCSS styling
- Node.js + Express
- Docker + Docker Compose
- Nginx for frontend serving and API proxying

## Quick Start
```bash
docker compose up --build
```

Then open `http://localhost:3000`.

## Project Structure
- `src/` - Angular frontend
- `server/` - Express API
- `docker/nginx/` - Nginx config for frontend serving and API proxying
- `context/CONTEXT.md` - project context, status, and backlog
- `docker-compose.yml` - local orchestration

## Notes
- Frontend is served on port `3000`
- API runs on port `3000` inside its container and is proxied through nginx at `/api`
- Health endpoint: `/api/health`

Created by Luma ✨
