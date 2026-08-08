import { Link } from 'react-router-dom';
import { encodeId } from '@/utils/id-helper';
import type { SkillTreeNode } from '@/services/khong-gian-hoc-tap.service';

const defaultImg = 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg';

type Props = {
  course: SkillTreeNode | null;
  maLoTrinh?: number | null;
  onClose: () => void;
};

export default function CourseDetailDrawer({ course, maLoTrinh, onClose }: Props) {
  if (!course) return null;

  const slug = course.slug?.trim() || 'khoa-hoc';
  const encoded = encodeId(course.maKhoaHoc);
  /** Đã đăng ký → vào học */
  const hrefHoc = `/khoa-hoc/${slug}/${encoded}`;
  /** Chưa đăng ký → luồng thanh toán (giống ChiTietKhoaHoc.handleDangKy) */
  const hrefMua = `/mua-khoa-hoc/${course.maKhoaHoc}`;
  const imgSrc = course.hinhAnh
    ? course.hinhAnh.startsWith('http')
      ? course.hinhAnh
      : `/img/${course.hinhAnh}`
    : defaultImg;

  const statusLabel =
    course.trangThai === 'done'
      ? 'HOÀN THÀNH'
      : course.trangThai === 'in_progress'
        ? 'ĐANG HỌC'
        : course.trangThai === 'not_registered'
          ? 'CHƯA ĐĂNG KÝ'
          : 'CHƯA MỞ';

  const daDangKy = course.daDangKy;
  const khoaBiKhoa = course.trangThai === 'locked';
  const canStudy = daDangKy && !khoaBiKhoa;
  const canMua = !daDangKy && course.trangThai === 'not_registered';

  return (
    <>
      <button type="button" className="kght-drawer-backdrop" onClick={onClose} aria-label="Đóng" />
      <aside className="kght-drawer" role="dialog" aria-label="Chi tiết khóa học">
        <div className="kght-drawer__banner">
          <img
            src={imgSrc}
            alt=""
            onError={(e) => {
              // Chặn vòng lặp khi chính ảnh mặc định (ảnh ngoài) cũng lỗi.
              if (e.currentTarget.dataset.fallback === '1') return;
              e.currentTarget.dataset.fallback = '1';
              e.currentTarget.src = defaultImg;
            }}
          />
          <button type="button" className="kght-drawer__close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <div className="kght-drawer__body">
          <span className={`kght-drawer__pill kght-drawer__pill--${course.trangThai}`}>{statusLabel}</span>
          <h2 className="kght-drawer__title">{course.tenKhoaHoc}</h2>
          <p className="kght-drawer__meta">
            Giai đoạn {course.giaiDoan} · {course.soBaiDaHoc}/{course.tongSoBaiHoc} bài đã học
          </p>

          <div className="kght-drawer__ring-wrap">
            <div
              className="kght-drawer__ring"
              style={{
                background: `conic-gradient(#f69050 ${course.phanTramTienDo * 3.6}deg, #f3f4f6 0deg)`,
              }}
            >
              <span>{course.phanTramTienDo}%</span>
            </div>
            <div className="kght-drawer__stats">
              <div>✅ {course.soBaiDaHoc} / {course.tongSoBaiHoc} bài</div>
              {course.mucTieuGiaiDoan && <div>🎯 {course.mucTieuGiaiDoan}</div>}
            </div>
          </div>

          {canStudy && (
            <Link to={hrefHoc} className="kght-btn kght-btn--primary kght-drawer__cta">
              {course.trangThai === 'done' ? 'Xem lại khóa học' : 'Học ngay'}
            </Link>
          )}
          {canMua && (
            <>
              <p className="kght-drawer__enroll-hint">
                Khóa này đã mở trong lộ trình. Đăng ký hoặc mua khóa học để bắt đầu học.
              </p>
              <Link to={hrefMua} className="kght-btn kght-btn--primary kght-drawer__cta">
                Đăng ký mua khóa học ngay
              </Link>
            </>
          )}
          {khoaBiKhoa && (
            <p className="kght-drawer__locked-hint">
              Hoàn thành khóa học trước đó trong lộ trình để mở khóa này.
            </p>
          )}

          {maLoTrinh != null && maLoTrinh > 0 && (
            <Link to={`/chi-tiet-lo-trinh/${encodeId(maLoTrinh)}`} className="kght-drawer__link">
              📑 Xem lộ trình đầy đủ
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
