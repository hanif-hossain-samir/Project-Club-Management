import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeString,
  sanitizePlainObject,
  isValidImageUrl,
  isValidEmail,
  getClubForWing
} from '../backend/src/utils/validators.js';
import {
  validateEventForm,
  validateNoticeForm,
  isValidImageUrl as isFrontendImageUrl
} from '../frontend/js/validation.js';

test('sanitizePlainObject recursively removes NoSQL $ operators, dotted keys, and prototype keys', () => {
  const dirty = {
    title: 'CUCC Hackathon',
    $where: 'malicious()',
    'user.role': 'administrator',
    nested: {
      safe: true,
      $gt: '',
      'deep.dot': 123
    },
    items: [{ ok: 1, $ne: null }]
  };

  const clean = sanitizePlainObject(dirty);
  assert.equal(clean.title, 'CUCC Hackathon');
  assert.equal('$where' in clean, false);
  assert.equal('user.role' in clean, false);
  assert.equal(clean.nested.safe, true);
  assert.equal('$gt' in clean.nested, false);
  assert.equal('deep.dot' in clean.nested, false);
  assert.equal(clean.items[0].ok, 1);
  assert.equal('$ne' in clean.items[0], false);
});

test('sanitizeString trims and caps string length safely', () => {
  assert.equal(sanitizeString('  hello  '), 'hello');
  assert.equal(sanitizeString('abcdef', 3), 'abc');
  assert.equal(sanitizeString(12345), '');
});

test('isValidImageUrl rejects unsafe protocols and accepts valid URLs and assets', () => {
  assert.equal(isValidImageUrl('https://cityuniversity.ac.bd/logo.png'), true);
  assert.equal(isValidImageUrl('/city-university-logo.jpg'), true);
  assert.equal(isValidImageUrl('/assets/aistudio/photo.jpg'), true);
  assert.equal(isValidImageUrl('data:image/png;base64,iVBORw0KGgo='), true);

  assert.equal(isValidImageUrl('javascript:alert(1)'), false);
  assert.equal(isValidImageUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isValidImageUrl(''), false);

  assert.equal(isFrontendImageUrl('javascript:alert(1)'), false);
  assert.equal(isFrontendImageUrl('https://example.com/pic.jpg'), true);
});

test('email, wing lookup, and frontend form validators behave consistently', () => {
  assert.equal(isValidEmail('controller.tech@cityuniversity.edu'), true);
  assert.equal(isValidEmail('invalid-email'), false);

  assert.equal(getClubForWing('programming'), 'computer_club');
  assert.equal(getClubForWing('cyber_security'), 'computer_club');
  assert.equal(getClubForWing('research'), 'computer_club');
  assert.equal(getClubForWing('sports'), 'events_and_clubs');

  assert.equal(validateEventForm({ title: '', date: '2026-10-10', venue: 'Auditorium' }), 'Event title is required.');
  assert.equal(validateEventForm({ title: 'Tech Fest', date: '2026-10-10', venue: 'Auditorium' }), null);

  assert.equal(validateNoticeForm({ title: 'Notice', content: '' }), 'Notice content is required.');
  assert.equal(validateNoticeForm({ title: 'Notice', content: 'Updated schedule' }), null);
});
