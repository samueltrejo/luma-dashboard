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

## What's Done
- Angular 19 scaffold created with standalone components
- Branded landing dashboard implemented
- Express API created under `server/`
- Dockerfiles created for frontend and backend
- Nginx reverse proxy configured for `/api`
- Docker Compose added
- README added with quick start and structure overview

## What's Next
- Authentication and access control
- Personal/family/work widget system
- Server monitoring panels and alert states
- External integrations (homelab, cloud, calendars, finances, services)
- Persistent configuration and environment management

## Current Status
Initial scaffold complete and ready for iterative feature development.
