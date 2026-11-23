export function formatWingLabel(slug) {
  if (!slug || typeof slug !== 'string') return '';
  return slug.replace(/_/g, ' ');
}

export function formatShortDate(dateValue) {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return String(dateValue);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatMonthShort(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return 'NOV';
  return d.toLocaleDateString('en-US', { month: 'short' });
}

export function formatDayOfMonth(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '08';
  return String(d.getDate());
}

export function getInitials(name, length = 2) {
  if (!name || typeof name !== 'string') return 'CU';
  return name.trim().substring(0, length).toUpperCase();
}
