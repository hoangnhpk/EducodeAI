/**
 * Kênh truyền bộ lọc Home → tab Khám phá.
 * Không dùng params của Expo Router vì navigate sang tab đã mount không cập nhật
 * lại useLocalSearchParams (quirk đã biết với Tabs) → bộ lọc không ăn.
 * Home ghi bộ lọc vào đây rồi navigate; CoursesScreen đọc (và xóa) khi focus.
 */

export interface CourseFilter {
  search?: string;
  maGiangVien?: number;
  tenGiangVien?: string;
}

let boLocChoDoi: CourseFilter | null = null;

export const datBoLocKhoaHoc = (filter: CourseFilter) => {
  boLocChoDoi = filter;
};

/** Đọc bộ lọc đang chờ và xóa nó (chỉ áp dụng 1 lần). */
export const layBoLocKhoaHoc = (): CourseFilter | null => {
  const f = boLocChoDoi;
  boLocChoDoi = null;
  return f;
};
