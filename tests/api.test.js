import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../backend/src/app.js';

let server;
let baseUrl;

before(async () => {
  const app = createApp();
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/health returns healthy status and portal metadata', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.status, 'healthy');
  assert.equal(body.app, 'City University Events & Clubs (CUEC)');
});

test('GET /api/clubs and /api/events return seeded CUCC collections', async () => {
  const [clubsRes, eventsRes] = await Promise.all([
    fetch(`${baseUrl}/api/clubs`),
    fetch(`${baseUrl}/api/events?clubId=computer_club`)
  ]);
  assert.equal(clubsRes.status, 200);
  assert.equal(eventsRes.status, 200);

  const clubsData = await clubsRes.json();
  const eventsData = await eventsRes.json();
  assert.equal(clubsData.success, true);
  assert.ok(Array.isArray(clubsData.clubs) && clubsData.clubs.length > 0);
  assert.equal(eventsData.success, true);
  assert.ok(Array.isArray(eventsData.events) && eventsData.events.length > 0);
  assert.ok(eventsData.events.every((e) => e.clubId === 'computer_club'));
});

test('RBAC blocks unauthenticated or unauthorized access to protected routes', async () => {
  const unauthRes = await fetch(`${baseUrl}/api/member-requests`);
  assert.equal(unauthRes.status, 401);

  const eventCreateUnauth = await fetch(`${baseUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test', wingSlug: 'programming', date: '2026-12-01', venue: 'Lab 1' })
  });
  assert.equal(eventCreateUnauth.status, 401);
});

test('CUCC Controller can create an event and unsafe banner URLs are rejected', async () => {
  const badUrlRes = await fetch(`${baseUrl}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr-ctrl-1'
    },
    body: JSON.stringify({
      title: 'XSS Check Event',
      wingSlug: 'programming',
      date: '2026-12-10',
      venue: 'Lab 2',
      bannerUrl: 'javascript:alert(1)'
    })
  });
  assert.equal(badUrlRes.status, 400);

  const okRes = await fetch(`${baseUrl}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr-ctrl-1'
    },
    body: JSON.stringify({
      title: 'Winter ICPC Practice',
      wingSlug: 'programming',
      date: '2026-12-12',
      venue: 'CUCC Coding Arena',
      bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
    })
  });
  assert.equal(okRes.status, 201);
  const created = await okRes.json();
  assert.equal(created.success, true);
  assert.equal(created.event.clubId, 'computer_club');
});

test('Notice creation & pinning updates /api/announcements cleanly', async () => {
  const postRes = await fetch(`${baseUrl}/api/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr-ctrl-1'
    },
    body: JSON.stringify({
      title: 'Pinned Exam Notice',
      content: 'All programming practice contests paused during midterm exams.',
      priority: 'urgent',
      pinned: true
    })
  });
  assert.equal(postRes.status, 201);
  const postData = await postRes.json();
  assert.equal(postData.announcement.pinned, true);
  assert.equal(postData.announcement.clubId, 'computer_club');
});
