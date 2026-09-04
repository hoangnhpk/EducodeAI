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

/**
 * Ảnh do admin cấu hình (banner, logo). Xử lý 3 dạng giá trị có thể gặp:
 *  - "/uploads/system/x.jpg"  → file admin upload, backend phục vụ → ghép API base
 *  - "carousel-1.jpg"         → asset tĩnh của frontend → /img/...
 *  - "https://..."            → URL ngoài → giữ nguyên
 */
export function getBannerUrl(path?: string | null): string {
  const value = path?.trim();
  if (!value) return '';

  // Dữ liệu cũ lưu cả host lúc upload (vd "http://localhost:5210/uploads/..."),
  // nên đổi môi trường là chết ảnh. Bóc lấy path để ghép với API base hiện tại.
  const anhDaUpload = value.match(/^https?:\/\/[^/]+(\/uploads\/.*)$/i);
  if (anhDaUpload) return getMediaUrl(anhDaUpload[1]);

  if (value.startsWith('/') || /^(https?:|blob:|data:)/i.test(value)) {
    return getMediaUrl(value);
  }
  return `/img/${value}`;
}
