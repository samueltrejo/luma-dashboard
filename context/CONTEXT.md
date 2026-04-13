# Luma Dashboard Context

## Project Name
Luma Dashboard

## Description
A personal dashboard for Samuel Trejo that will surface personal, family, and work resource status in one place, including server monitoring and related health views.

## Architecture Overview
- Frontend: Angular 19 standalone application with inline templates and SCSS component styles
- Backend: Node.js + Express API with health and ping endpoints
- Containerization: Docker multi-stage frontend image + Dockerized Express API
- Orchestration: Docker Compose running frontend and API together
- Ingress target: `dashboard.samueltrejo.com` on port `3000`

## Navigation Plan
- Server Monitor — done
- Events — planned
- Family — planned
- Finances — planned
- Reminders — planned
- Navigation shell / routing structure — TBD

## Component Organization
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
- Verified backend endpoints locally on port `3001` and confirmed Angular production build succeeds
- Removed the hero section, simplified branding, and dropped unused testing infrastructure

## What's Next
- Build the Events section
- Build the Family section
- Build the Finances section
- Build the Reminders section
- Authentication and access control
- Alerting and thresholds for server anomalies
- External integrations (homelab, cloud, calendars, finances, services)
- Persistent configuration and environment management

## Current Status
Server monitoring is live, the root shell is intentionally minimal, and the next planned work is expanding the dashboard into additional categorized sections.
