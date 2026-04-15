# Luma Dashboard Context

## Project Name
Luma Dashboard

## Description
A personal dashboard for Samuel Trejo that will surface personal, family, and work resource status in one place, including server monitoring, Codex usage visibility, and related health views.

## Architecture Overview
- Frontend: Angular 19 standalone application with inline templates and SCSS component styles
- Backend: Node.js + Express API with health, server metrics, and AI usage endpoints
- Persistence: SQLite database for Codex usage snapshots under `server/data/dashboard.sqlite`
- Containerization: Docker multi-stage frontend image + Dockerized Express API
- Orchestration: Docker Compose running frontend and API together
- Ingress target: `dashboard.samueltrejo.com` on port `3000`

## Navigation Plan
- AI Usage — in progress
- Server Monitor — done
- Events — planned
- Family — planned
- Finances — planned
- Reminders — planned
- Navigation shell / routing structure — TBD

## Component Organization
- `src/app/components/ai-usage/` contains Codex usage UI and frontend models
- `src/app/components/server-monitor/` contains infrastructure monitoring UI and supporting logic
- `src/app/components/` is the categorical home for future feature sections such as Events, Family, Finances, and Reminders
- The root app shell stays minimal and hosts feature components rather than owning feature-heavy dashboard markup

## What's Done
- Angular 19 scaffold created with standalone components
- Branded landing dashboard implemented
- Express API created under `server/`
- Dockerfiles created for frontend and backend
- Nginx reverse proxy configured for `/api`
- Docker Compose added
- README added with quick start and structure overview
- Added `/api/server/metrics` with live CPU, memory, disk, network, uptime, temperature, power, process, GPU placeholder, hostname, and timestamp data
- Added `/api/server/cost` using a fixed power rate (`0.117/kWh`) with daily, weekly, monthly, and yearly estimates
- Added standalone Angular Server Monitor section with dedicated CPU, memory, disk, network, uptime, temperature, power, GPU placeholder, and top process panels
- Added SQLite-backed Codex usage snapshot storage under `server/data/dashboard.sqlite`
- Added `GET /api/ai-usage/codex` and `POST /api/ai-usage/codex`
- Added Angular AI Usage section for latest Codex window usage and recent snapshot history
- Verified backend endpoints locally and rebuilt the dashboard stack on port `3000`

## What's Next
- Add a lightweight ingestion path from OpenClaw/Codex status into `POST /api/ai-usage/codex`
- Build the Events section
- Build the Family section
- Build the Finances section
- Build the Reminders section
- Authentication and access control
- Alerting and thresholds for server anomalies or usage thresholds
- External integrations (homelab, cloud, calendars, finances, services)
- Persistent configuration and environment management

## Current Status
Server monitoring is live, Codex usage persistence is wired in with SQLite, and the dashboard now exposes both infrastructure and AI usage data on port `3000`.
