export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidImageUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('/city-university-logo') ||
    trimmed.startsWith('data:image/')
  ) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isRequiredString(value, minLen = 1) {
  return typeof value === 'string' && value.trim().length >= minLen;
}

export function validateEventForm({ title, date, venue }) {
  if (!isRequiredString(title)) return 'Event title is required.';
  if (!isRequiredString(date)) return 'Event date is required.';
  if (!isRequiredString(venue)) return 'Event venue is required.';
  return null;
}

export function validateNoticeForm({ title, content }) {
  if (!isRequiredString(title)) return 'Notice title is required.';
  if (!isRequiredString(content)) return 'Notice content is required.';
  return null;
}
