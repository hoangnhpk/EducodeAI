/**
 * Public API của module Discovery & Commerce (Khiến).
 *
 * Contract bàn giao cho các module khác:
 * - Learning (Khôi): Discovery điều hướng `router.push('/learn/[courseId]')` với
 *   `courseId: string` (số dạng chuỗi). Ownership đã được backend xác nhận trước khi
 *   điều hướng (khoaHocDaDangKy / daMua / sau thanh toán thành công).
 * - Routes module này expose:
 *   /home, /courses, /my-learning (tabs)
 *   /course/[courseId], /course/[courseId]/checkout
 *   /gifts/redeem, /gifts/history
 */

export * from './types';
export { DiscoveryHomeService } from './services/discovery-home.service';
export { MyCoursesService } from './services/my-courses.service';
export { CourseDetailService } from './services/course-detail.service';
export { CommerceService, docLoiBackend } from './services/commerce.service';
export { resolveMediaUrl, resolveCourseImage, FALLBACK_COURSE_IMAGE } from './services/media-url';
export { formatGiaKhoaHoc, laKhoaHocMienPhi } from './utils/format-gia';
export { CourseCard } from './components/course-card';
export { LoadingState, EmptyState, ErrorState, CourseCardSkeleton } from './components/state-views';
export { usePaymentPolling } from './hooks/use-payment-polling';
export { useDebounce } from './hooks/use-debounce';

/**
 * Suy ra trạng thái CTA từ flags backend (dùng chung giữa detail/checkout).
 * - owned: đã đăng ký/mua → vào học.
 * - free: miễn phí chưa sở hữu → đăng ký free.
 * - purchasable: có phí + cho phép mua → checkout.
 * - unavailable: không cho mua.
 */
export function suyRaOwnership(flags: {
  daSoHuu: boolean;
  laMienPhi: boolean;
  choPhepMua: boolean;
}): import('./types').CourseOwnership {
  if (flags.daSoHuu) return 'owned';
  if (flags.laMienPhi) return 'free';
  if (flags.choPhepMua) return 'purchasable';
  return 'unavailable';
}
