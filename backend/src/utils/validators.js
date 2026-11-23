export const ALLOWED_CLUB_WINGS = {
  computer_club: ['programming', 'cyber_security', 'research'],
  events_and_clubs: ['sports', 'cultural', 'tour']
};

export function sanitizeString(val, maxLength = 2000) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLength);
}

export function sanitizePlainObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      item && typeof item === 'object' ? sanitizePlainObject(item) : item
    );
  }
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (
      key.startsWith('$') ||
      key.includes('.') ||
      key === '__proto__' ||
      key === 'constructor' ||
      key === 'prototype'
    ) {
      continue;
    }
    if (Array.isArray(value)) {
      clean[key] = value.map((item) =>
        item && typeof item === 'object' ? sanitizePlainObject(item) : item
      );
    } else if (value && typeof value === 'object') {
      clean[key] = sanitizePlainObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export function isValidImageUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/assets/') || trimmed.startsWith('/images/') || trimmed.startsWith('/city-university-logo')) {
    return true;
  }
  if (trimmed.startsWith('data:image/')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getClubForWing(wingSlug) {
  if (ALLOWED_CLUB_WINGS.computer_club.includes(wingSlug)) {
    return 'computer_club';
  }
  return 'events_and_clubs';
}
