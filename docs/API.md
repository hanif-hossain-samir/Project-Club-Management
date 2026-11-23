# REST API Reference

Base Path: `/api`
Authenticated controller/admin actions include the `x-user-id` request header.

## System
- `GET /api/health` — Server and database connectivity status
- `GET /api/stats` — Summary counts across clubs, wings, events, notices, and gallery items

## Authentication
- `POST /api/auth/login` — Authenticate user by university email
- `POST /api/auth/register` — Register a student account

## Clubs & Member Requests
- `GET /api/clubs` — List university clubs and specialized wings
- `GET /api/member-requests` — Fetch wing membership applications scoped to requester role
- `POST /api/member-requests` — Submit wing join request
- `PATCH /api/member-requests/:id/approve` — Approve pending member application
- `PATCH /api/member-requests/:id/reject` — Reject pending member application
- `GET /api/members` & `DELETE /api/members/:userId` — Manage club roster

## Events, Notices & Gallery
- `GET /api/events`, `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id`
- `POST /api/events/:id/register` — Register student for an event
- `GET /api/announcements`, `POST /api/announcements`, `PUT /api/announcements/:id`, `DELETE /api/announcements/:id`
- `GET /api/gallery`, `POST /api/gallery`, `POST /api/gallery/:id/like`, `PUT /api/gallery/:id`, `DELETE /api/gallery/:id`
