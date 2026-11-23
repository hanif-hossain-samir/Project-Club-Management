# Architecture Overview

## Technology Stack
- **Frontend**: HTML5, CSS3 (Standard CSS & Scoped CSS Modules), JavaScript (ESM + React)
- **Backend**: Node.js + Express.js (`backend/src/app.js`, `backend/src/server.js`)
- **Database**: MongoDB with Mongoose (`backend/src/models/*`, `database/seeders/seed.js`, `database/migrations/001_initial_indexes.js`), featuring automatic in-memory fallback when no external `mongod` instance is reachable.

## Directory Structure
- `frontend/css/`: Design tokens (`variables.css`), resets & app shell (`style.css`), reusable UI primitives (`components.css`), and responsive breakpoints (`responsive.css`).
- `frontend/js/`: Application bootstrap (`main.js`, `App.jsx`), REST client (`api.js`), auth/theme contexts (`auth.js`, `theme.js`), form validation (`validation.js`), CSS-Module components (`components/*`), and page modules (`pages/*`).
- `frontend/pages/` & `frontend/components/`: Static HTML5 pages and semantic markup templates.
- `backend/src/`: Database connector, Mongoose models, input validators, RBAC auth middleware, controllers, Express routers, and unified data service.
- `database/`: Database idempotent index migrations and demo seed scripts.
- `tests/`: Automated Node test suites for validators and HTTP routes.
