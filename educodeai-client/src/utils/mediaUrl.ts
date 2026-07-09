const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export function getMediaUrl(path?: string | null): string {
  const value = path?.trim();
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:') || value.startsWith('data:')) {
    return value;
  }
  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${API_BASE}${normalized}`;
}
