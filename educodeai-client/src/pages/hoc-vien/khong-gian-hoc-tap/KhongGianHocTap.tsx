import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { encodeId } from '@/utils/id-helper';
import {
  layDanhSachKhongGianHocTap,
  type KhongGianHocTapItem,
} from '@/services/khong-gian-hoc-tap.service';
import './KhongGianHocTap.css';

const defaultImg = 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg';

export default function KhongGianHocTap() {
  const [courses, setCourses] = useState<KhongGianHocTapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await layDanhSachKhongGianHocTap();
        if (!cancelled) setCourses(data);
      } catch (e) {
        if (!cancelled) {
          setError('Không tải được danh sách khóa học. Vui lòng thử lại.');
          setCourses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="kght-page">
      <div className="kght-hero">
        <h1 className="kght-title">Không gian học tập</h1>
        <p className="kght-lead">
          Các khóa học bạn đã đăng ký và tiến độ hoàn thành.
        </p>
      </div>

      {loading && (
        <div className="kght-state">
          <div className="kght-spinner" aria-hidden />
          <p>Đang tải...</p>
        </div>
      )}

      {!loading && error && (
        <div className="kght-state kght-state--error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="kght-state">
          <p>Bạn chưa đăng ký khóa học nào.</p>
          <Link to="/" className="kght-btn kght-btn--ghost">
            Khám phá khóa học
          </Link>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="kght-grid">
          {courses.map((kh) => {
            const slug = kh.slug?.trim() || 'khoa-hoc';
            const imgSrc = kh.hinhAnh
              ? kh.hinhAnh.startsWith('http')
                ? kh.hinhAnh
                : `/img/${kh.hinhAnh}`
              : defaultImg;
            const encoded = encodeId(kh.maKhoaHoc);
            const hrefHoc = `/khoa-hoc/${slug}/${encoded}`;

            return (
              <article key={kh.maKhoaHoc} className="kght-card">
                <div className="kght-card__thumb">
                  <img
                    src={imgSrc}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = defaultImg;
                    }}
                  />
                </div>
                <div className="kght-card__body">
                  <h2 className="kght-card__title">{kh.tenKhoaHoc}</h2>
                  <p className="kght-card__meta">
                    Đã học {kh.soBaiDaHoc}/{kh.tongSoBaiHoc} bài
                  </p>
                  <div className="kght-progress" role="progressbar" aria-valuenow={kh.phanTramTienDo} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="kght-progress__bar"
                      style={{ width: `${Math.min(100, Math.max(0, kh.phanTramTienDo))}%` }}
                    />
                  </div>
                  <div className="kght-card__pct">{kh.phanTramTienDo}% hoàn thành</div>
                  <Link to={hrefHoc} className="kght-btn kght-btn--primary">
                    Học tiếp
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
