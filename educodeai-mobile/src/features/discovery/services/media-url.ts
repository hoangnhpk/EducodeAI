import { BASE_URL } from '../../../shared/configs/api';

/**
 * Logic media chuẩn theo web (getImageUrl ở giang-vien/khoa-hoc-cua-toi):
 * 1. URL tuyệt đối (http/https/data/blob) → dùng nguyên.
 * 2. Path bắt đầu bằng `/` (vd `/uploads/khoa-hoc/x.jpg`) → backend phục vụ
 *    qua UseStaticFiles → ghép BASE_URL. Đây là ảnh giảng viên upload thật.
 * 3. Tên file trần (vd `cpp-course.jpg`) → asset seed. Bộ ảnh này đã được copy
 *    vào `educodeai-server/wwwroot/img/` nên backend phục vụ trực tiếp qua
 *    UseStaticFiles → WEB_ASSET_BASE = BASE_URL là đúng. Nếu sau này ảnh seed
 *    chuyển sang host khác (CDN/web origin), chỉ cần đổi WEB_ASSET_BASE.
 */
const WEB_ASSET_BASE = BASE_URL;

const isAbsolute = (value: string) =>
  value.startsWith('http://') ||
  value.startsWith('https://') ||
  value.startsWith('data:') ||
  value.startsWith('blob:');

/** Tương đương getMediaUrl của web: ghép base cho path tương đối (vd `/uploads/...`). */
export function resolveMediaUrl(path?: string | null): string {
  const value = path?.trim();
  if (!value) return '';
  if (isAbsolute(value)) return value;
  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${BASE_URL}${normalized}`;
}

/** Ảnh khóa học — port đúng 3 nhánh của getImageUrl web. */
export function resolveCourseImage(hinhAnh?: string | null): string {
  const value = hinhAnh?.trim();
  if (!value) return '';
  if (isAbsolute(value)) return value;
  // Ảnh upload thật do backend phục vụ (/uploads/...).
  if (value.startsWith('/')) return `${BASE_URL}${value}`;
  // Tên file trần: asset seed của web client.
  return `${WEB_ASSET_BASE}/img/${value}`;
}

/** Ảnh fallback khi media lỗi — cùng ảnh web đang dùng ở TrangChu. */
export const FALLBACK_COURSE_IMAGE =
  'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=500&q=80';
