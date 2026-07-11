import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { encodeId } from '@/utils/id-helper';
import {
  layDanhSachKhongGianHocTap,
  type KhongGianHocTapItem,
} from '@/services/khong-gian-hoc-tap.service';
import SkillTreeView from './components/SkillTreeView';
import './KhongGianHocTap.css';

const defaultImg = 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg';

type ViewMode = 'list' | 'map';

export default function KhongGianHocTap() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem('kght-view') as ViewMode) || 'list';
    } catch {
      return 'list';
    }
  });
  const [maLoTrinh, setMaLoTrinh] = useState<number | undefined>(() => {
    try {
      const raw = localStorage.getItem('kght-ma-lo-trinh');
      if (!raw) return undefined;
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    } catch {
      return undefined;
    }
  });

  const handleLoTrinhChange = (id: number | undefined) => {
    setMaLoTrinh(id);
    try {
      if (id && id > 0) localStorage.setItem('kght-ma-lo-trinh', String(id));
      else localStorage.removeItem('kght-ma-lo-trinh');
    } catch {
      /* ignore */
    }
  };
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
      } catch {
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

  const listSummary = useMemo(() => {
    if (courses.length === 0) return null;
    const hoanThanh = courses.filter((c) => c.phanTramTienDo >= 100).length;
    const dangHoc = courses.filter((c) => c.phanTramTienDo > 0 && c.phanTramTienDo < 100).length;
    const tb =
      Math.round(courses.reduce((s, c) => s + c.phanTramTienDo, 0) / courses.length) || 0;
    return { total: courses.length, hoanThanh, dangHoc, tb };
  }, [courses]);

  const setView = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('kght-view', mode);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="kght-page">
      <div className="kght-hero">
        <div className="kght-hero__row">
          <div>
            <h1 className="kght-title">Không gian học tập</h1>
            <p className="kght-lead">
              {viewMode === 'map'
                ? 'Bản đồ lộ trình — theo dõi thứ tự khóa học và bước tiếp theo.'
                : 'Các khóa học bạn đã đăng ký và tiến độ hoàn thành.'}
            </p>
          </div>
          <div className="kght-view-toggle" role="group" aria-label="Chế độ hiển thị">
            <button
              type="button"
              className={`kght-view-toggle__btn${viewMode === 'list' ? ' is-active' : ''}`}
              onClick={() => setView('list')}
            >
              <i className="bi bi-grid-3x3-gap" /> Danh sách
            </button>
            <button
              type="button"
              className={`kght-view-toggle__btn${viewMode === 'map' ? ' is-active' : ''}`}
              onClick={() => setView('map')}
            >
              <i className="bi bi-diagram-3" /> Bản đồ
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        <SkillTreeView maLoTrinh={maLoTrinh} onLoTrinhChange={handleLoTrinhChange} />
      ) : (
        <>
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

          {!loading && !error && courses.length > 0 && listSummary && (
            <div className="kght-list">
              <div className="kght-stat-row" role="group" aria-label="Thống kê khóa học">
                <div className="kght-stat-card kght-stat-card--total">
                  <div className="kght-stat-card__icon" aria-hidden>
                    <i className="bi bi-journal-bookmark-fill" />
                  </div>
                  <div className="kght-stat-card__content">
                    <span className="kght-stat-card__value">{listSummary.total}</span>
                    <span className="kght-stat-card__label">Khóa đã đăng ký</span>
                  </div>
                </div>
                <div className="kght-stat-card kght-stat-card--learning">
                  <div className="kght-stat-card__icon" aria-hidden>
                    <i className="bi bi-play-circle-fill" />
                  </div>
                  <div className="kght-stat-card__content">
                    <span className="kght-stat-card__value">{listSummary.dangHoc}</span>
                    <span className="kght-stat-card__label">Đang học</span>
                  </div>
                </div>
                <div className="kght-stat-card kght-stat-card--done">
                  <div className="kght-stat-card__icon" aria-hidden>
                    <i className="bi bi-patch-check-fill" />
                  </div>
                  <div className="kght-stat-card__content">
                    <span className="kght-stat-card__value">{listSummary.hoanThanh}</span>
                    <span className="kght-stat-card__label">Hoàn thành</span>
                  </div>
                </div>
                <div className="kght-stat-card kght-stat-card--avg">
                  <div className="kght-stat-card__icon" aria-hidden>
                    <i className="bi bi-graph-up-arrow" />
                  </div>
                  <div className="kght-stat-card__content">
                    <span className="kght-stat-card__value">{listSummary.tb}%</span>
                    <span className="kght-stat-card__label">Tiến độ trung bình</span>
                  </div>
                  <div
                    className="kght-stat-card__bar"
                    role="progressbar"
                    aria-valuenow={listSummary.tb}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="kght-stat-card__bar-fill" style={{ width: `${listSummary.tb}%` }} />
                  </div>
                </div>
              </div>

              <div className="kght-list-grid">
                {courses.map((kh) => {
                  const slug = kh.slug?.trim() || 'khoa-hoc';
                  const imgSrc = kh.hinhAnh
                    ? kh.hinhAnh.startsWith('http')
                      ? kh.hinhAnh
                      : `/img/${kh.hinhAnh}`
                    : defaultImg;
                  const encoded = encodeId(kh.maKhoaHoc);
                  const hrefHoc = `/khoa-hoc/${slug}/${encoded}`;
                  const pct = Math.min(100, Math.max(0, kh.phanTramTienDo));
                  const status =
                    pct >= 100 ? 'done' : pct > 0 ? 'learning' : 'new';
                  const statusLabel =
                    status === 'done'
                      ? 'Hoàn thành'
                      : status === 'learning'
                        ? 'Đang học'
                        : 'Chưa bắt đầu';
                  const baiLabel =
                    kh.tongSoBaiHoc > 0
                      ? `${kh.soBaiDaHoc}/${kh.tongSoBaiHoc} bài`
                      : 'Chưa có bài học';

                  return (
                    <article key={kh.maKhoaHoc} className="kght-course-card">
                      <Link to={hrefHoc} className="kght-course-card__link">
                        <div className="kght-course-card__media">
                          <img
                            src={imgSrc}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = defaultImg;
                            }}
                          />
                          <span className={`kght-course-card__badge kght-course-card__badge--${status}`}>
                            {statusLabel}
                          </span>
                          <span className="kght-course-card__pct-ring">{pct}%</span>
                        </div>
                        <div className="kght-course-card__body">
                          <h2 className="kght-course-card__title">{kh.tenKhoaHoc}</h2>
                          <p className="kght-course-card__meta">
                            <i className="bi bi-journal-text" aria-hidden /> {baiLabel}
                          </p>
                          <div className="kght-course-card__progress-row">
                            <div
                              className="kght-progress kght-course-card__bar"
                              role="progressbar"
                              aria-valuenow={pct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div className="kght-progress__bar" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="kght-course-card__pct-text">{pct}%</span>
                          </div>
                          <span className="kght-course-card__cta">
                            {status === 'done' ? 'Xem lại' : 'Học ngay'}
                            <i className="bi bi-arrow-right" aria-hidden />
                          </span>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
