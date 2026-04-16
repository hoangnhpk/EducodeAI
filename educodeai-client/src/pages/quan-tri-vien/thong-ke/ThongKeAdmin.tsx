import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import thongKeAdminService, {
  type DangKyItemDTO,
  type DangKyTheoThangDTO,
  type ChatLuongKhoaHocItemDTO,
  type GiangVienItemDTO,
  type HocVienItemDTO,
  type KhoaHocItemDTO,
  type PagedResultDTO,
  type TopGiangVienDangKyDTO,
  type TopKhoaHocDangKyDTO,
  type ThongKeTongQuanDTO,
} from '@/services/thong-ke-admin.service';
import './ThongKeAdmin.css';

type DetailKind = 'hoc-vien' | 'giang-vien' | 'khoa-hoc' | 'dang-ky';
type QualityTab = 'top' | 'improve';

export default function ThongKeAdmin() {
  const [overview, setOverview] = useState<ThongKeTongQuanDTO | null>(null);
  const [dangKyTheoThang, setDangKyTheoThang] = useState<DangKyTheoThangDTO[]>([]);
  const [topKhoaHoc, setTopKhoaHoc] = useState<TopKhoaHocDangKyDTO[]>([]);
  const [topGiangVien, setTopGiangVien] = useState<TopGiangVienDangKyDTO[]>([]);
  const [chatLuong, setChatLuong] = useState<ChatLuongKhoaHocItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthInputToLabel = (yyyyMm: string) => {
    // yyyy-MM -> MM/yyyy
    const [y, m] = yyyyMm.split('-');
    if (!y || !m) return yyyyMm;
    return `${m}/${y}`;
  };

  const monthInputToVietnamese = (yyyyMm: string) => {
    const [y, m] = yyyyMm.split('-');
    if (!y || !m) return yyyyMm;
    const mm = Number(m);
    if (!Number.isFinite(mm) || mm < 1 || mm > 12) return yyyyMm;
    return `Tháng ${mm}/${y}`;
  };

  const toMonthInput = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const now = new Date();
  const defaultTo = toMonthInput(now);
  const defaultFrom = toMonthInput(new Date(now.getFullYear(), now.getMonth() - 11, 1));

  const [chartFrom, setChartFrom] = useState(defaultFrom);
  const [chartTo, setChartTo] = useState(defaultTo);
  const [chartLoading, setChartLoading] = useState(false);
  const [topLoading, setTopLoading] = useState(false);
  const fromMonthRef = useRef<HTMLInputElement | null>(null);
  const toMonthRef = useRef<HTMLInputElement | null>(null);

  const openMonthPicker = (el: HTMLInputElement | null) => {
    if (!el) return;
    el.focus();
    // Chrome/Edge support showPicker() on date/month inputs
    const anyEl = el as unknown as { showPicker?: () => void };
    anyEl.showPicker?.();
  };

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailKind, setDetailKind] = useState<DetailKind>('hoc-vien');
  const [detailTitle, setDetailTitle] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailSearch, setDetailSearch] = useState('');
  const [detailPage, setDetailPage] = useState(1);
  const detailPageSize = 10;
  const [detailData, setDetailData] = useState<PagedResultDTO<any> | null>(null);
  const lastRequestId = useRef(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [ov, chart] = await Promise.all([
          thongKeAdminService.getTongQuan(),
          thongKeAdminService.getDangKyTheoThang({ from: defaultFrom, to: defaultTo }),
        ]);

        if (cancelled) return;
        setOverview(ov);
        setDangKyTheoThang(chart);

        // Load top lists for default range
        const [topCourses, topTeachers] = await Promise.all([
          thongKeAdminService.getTopKhoaHoc({ from: defaultFrom, to: defaultTo, top: 5 }),
          thongKeAdminService.getTopGiangVien({ from: defaultFrom, to: defaultTo, top: 5 }),
        ]);
        if (cancelled) return;
        setTopKhoaHoc(topCourses);
        setTopGiangVien(topTeachers);

        const quality = await thongKeAdminService.getChatLuongKhoaHoc({ from: defaultFrom, to: defaultTo, top: 10 });
        if (cancelled) return;
        setChatLuong(quality);
      } catch (e: unknown) {
        if (cancelled) return;
        const maybeAxios = e as { response?: { data?: { message?: string } } };
        setError(maybeAxios?.response?.data?.message || 'Không thể tải dữ liệu thống kê.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const from = chartFrom;
    const to = chartTo;
    if (!from || !to) return;

    (async () => {
      setChartLoading(true);
      setTopLoading(true);
      try {
        const [chart, topCourses, topTeachers] = await Promise.all([
          thongKeAdminService.getDangKyTheoThang({ from, to }),
          thongKeAdminService.getTopKhoaHoc({ from, to, top: 5 }),
          thongKeAdminService.getTopGiangVien({ from, to, top: 5 }),
        ]);
        if (!cancelled) {
          setDangKyTheoThang(chart);
          setTopKhoaHoc(topCourses);
          setTopGiangVien(topTeachers);
        }

        const quality = await thongKeAdminService.getChatLuongKhoaHoc({ from, to, top: 10 });
        if (!cancelled) setChatLuong(quality);
      } finally {
        if (!cancelled) {
          setChartLoading(false);
          setTopLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chartFrom, chartTo]);

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailError(null);
    setDetailLoading(false);
  };

  const openDetail = (kind: DetailKind) => {
    setDetailKind(kind);
    setDetailOpen(true);
    setDetailError(null);
    setDetailSearch('');
    setDetailPage(1);

    if (kind === 'hoc-vien') setDetailTitle('Chi tiết học viên');
    else if (kind === 'giang-vien') setDetailTitle('Chi tiết giảng viên');
    else if (kind === 'khoa-hoc') setDetailTitle('Chi tiết khóa học');
    else setDetailTitle('Chi tiết lượt đăng ký');
  };

  useEffect(() => {
    if (!detailOpen) return;
    const requestId = ++lastRequestId.current;

    (async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const params = { page: detailPage, pageSize: detailPageSize, search: detailSearch || undefined };
        let data:
          | PagedResultDTO<HocVienItemDTO>
          | PagedResultDTO<GiangVienItemDTO>
          | PagedResultDTO<KhoaHocItemDTO>
          | PagedResultDTO<DangKyItemDTO>;

        if (detailKind === 'hoc-vien') data = await thongKeAdminService.getChiTietHocVien(params);
        else if (detailKind === 'giang-vien') data = await thongKeAdminService.getChiTietGiangVien(params);
        else if (detailKind === 'khoa-hoc') data = await thongKeAdminService.getChiTietKhoaHoc(params);
        else data = await thongKeAdminService.getChiTietDangKy(params);

        if (requestId !== lastRequestId.current) return;
        setDetailData(data as unknown as PagedResultDTO<any>);
      } catch (e: unknown) {
        if (requestId !== lastRequestId.current) return;
        const maybeAxios = e as { response?: { data?: { message?: string } } };
        setDetailError(maybeAxios?.response?.data?.message || 'Không thể tải dữ liệu chi tiết.');
      } finally {
        if (requestId === lastRequestId.current) setDetailLoading(false);
      }
    })();
  }, [detailOpen, detailKind, detailPage, detailSearch]);

  const chartData = useMemo(
    () =>
      dangKyTheoThang.map((x) => ({
        label: x.nhan,
        value: x.soLuotDangKy,
      })),
    [dangKyTheoThang]
  );

  const fmtPercent01 = (v: number) => `${Math.round((v || 0) * 100)}%`;
  const fmt2 = (v: number) =>
    Number.isFinite(v) ? (v as number).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';

  const sortedQuality = useMemo(() => {
    const xs = [...(chatLuong ?? [])];
    xs.sort((a, b) => (b.diemChatLuong ?? 0) - (a.diemChatLuong ?? 0));
    return xs;
  }, [chatLuong]);
  const topQuality = sortedQuality.slice(0, 5);
  const bottomQuality = [...sortedQuality].reverse().slice(0, 5);
  const [qualityTab, setQualityTab] = useState<QualityTab>('top');

  if (loading) {
    return (
      <div className="adm-stats-page">
        <div className="adm-stats-state">
          <div className="adm-stats-spinner" aria-hidden />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adm-stats-page">
        <div className="adm-stats-state adm-stats-state--error">
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-stats-page">
      <div className="adm-stats-header">
        <div>
          <h1 className="adm-stats-title">THỐNG KÊ HỆ THỐNG</h1>
          
        </div>
      </div>

      <div className="adm-stats-grid">
        <button type="button" className="adm-kpi adm-kpi--clickable" onClick={() => openDetail('hoc-vien')}>
          <div className="adm-kpi__icon adm-kpi__icon--blue">
            <i className="bi bi-people-fill" />
          </div>
          <div>
            <div className="adm-kpi__label">Tổng học viên</div>
            <div className="adm-kpi__value">{overview?.tongHocVien?.toLocaleString('vi-VN') ?? 0}</div>
          </div>
        </button>

        <button type="button" className="adm-kpi adm-kpi--clickable" onClick={() => openDetail('giang-vien')}>
          <div className="adm-kpi__icon adm-kpi__icon--purple">
            <i className="bi bi-person-video3" />
          </div>
          <div>
            <div className="adm-kpi__label">Tổng giảng viên</div>
            <div className="adm-kpi__value">{overview?.tongGiangVien?.toLocaleString('vi-VN') ?? 0}</div>
          </div>
        </button>

        <button type="button" className="adm-kpi adm-kpi--clickable" onClick={() => openDetail('khoa-hoc')}>
          <div className="adm-kpi__icon adm-kpi__icon--orange">
            <i className="bi bi-journal-code" />
          </div>
          <div>
            <div className="adm-kpi__label">Tổng khóa học</div>
            <div className="adm-kpi__value">{overview?.tongKhoaHoc?.toLocaleString('vi-VN') ?? 0}</div>
          </div>
        </button>

        <button type="button" className="adm-kpi adm-kpi--clickable" onClick={() => openDetail('dang-ky')}>
          <div className="adm-kpi__icon adm-kpi__icon--green">
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div>
            <div className="adm-kpi__label">Tổng lượt đăng ký</div>
            <div className="adm-kpi__value">{overview?.tongLuotDangKy?.toLocaleString('vi-VN') ?? 0}</div>
          </div>
        </button>
      </div>

      <div className="adm-chart card border-0 shadow-sm">
        <div className="adm-chart__header">
          <h2 className="adm-chart__title">Lượt đăng ký theo tháng</h2>
          <div className="adm-chart__filters">
            <div className="adm-chart__filter">
              <span className="adm-chart__filter-label">Từ</span>
              <div className="adm-month" role="button" tabIndex={0} onClick={() => openMonthPicker(fromMonthRef.current)}>
                <span className="adm-month__text">{monthInputToVietnamese(chartFrom)}</span>
                <button
                  type="button"
                  className="adm-month__icon"
                  aria-label="Mở chọn tháng bắt đầu"
                  title="Chọn tháng bắt đầu"
                  onClick={() => openMonthPicker(fromMonthRef.current)}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
                    <path
                      d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 6H5v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8ZM6 6h12a1 1 0 0 1 1 1v0H5V7a1 1 0 0 1 1-1Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <input
                  type="month"
                  lang="vi"
                  className="adm-month__input"
                  ref={fromMonthRef}
                  value={chartFrom}
                  onChange={(e) => setChartFrom(e.target.value)}
                  aria-label="Chọn tháng bắt đầu"
                />
              </div>
            </div>
            <div className="adm-chart__filter">
              <span className="adm-chart__filter-label">Đến</span>
              <div className="adm-month" role="button" tabIndex={0} onClick={() => openMonthPicker(toMonthRef.current)}>
                <span className="adm-month__text">{monthInputToVietnamese(chartTo)}</span>
                <button
                  type="button"
                  className="adm-month__icon"
                  aria-label="Mở chọn tháng kết thúc"
                  title="Chọn tháng kết thúc"
                  onClick={() => openMonthPicker(toMonthRef.current)}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
                    <path
                      d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 6H5v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8ZM6 6h12a1 1 0 0 1 1 1v0H5V7a1 1 0 0 1 1-1Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <input
                  type="month"
                  lang="vi"
                  className="adm-month__input"
                  ref={toMonthRef}
                  value={chartTo}
                  onChange={(e) => setChartTo(e.target.value)}
                  aria-label="Chọn tháng kết thúc"
                />
              </div>
            </div>
            <span className="adm-chart__hint">
              {monthInputToLabel(chartFrom)} - {monthInputToLabel(chartTo)}
            </span>
          </div>
        </div>

        {chartLoading ? (
          <div className="adm-chart__empty">Đang tải biểu đồ...</div>
        ) : chartData.length === 0 ? (
          <div className="adm-chart__empty">Chưa có dữ liệu</div>
        ) : (
          <div className="adm-chart__body">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="admOrangeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f69050" stopOpacity={0.38} />
                    <stop offset="70%" stopColor="#f69050" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#f69050" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="admOrangeStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#fb873f" />
                    <stop offset="100%" stopColor="#f69050" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ stroke: 'rgba(246, 144, 80, 0.25)', strokeWidth: 2 }}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    boxShadow: '0 10px 30px rgba(2, 6, 23, 0.10)',
                  }}
                  formatter={(value: unknown) => [Number(value).toLocaleString('vi-VN'), 'Lượt đăng ký']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="url(#admOrangeStroke)"
                  strokeWidth={3.25}
                  fill="url(#admOrangeFill)"
                  fillOpacity={1}
                  dot={{ r: 4.25, strokeWidth: 2, stroke: '#f69050', fill: '#fff' }}
                  activeDot={{ r: 6.25, strokeWidth: 2, stroke: '#f69050', fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="adm-top-grid">
        <div className="adm-top card border-0 shadow-sm">
          <div className="adm-top__header">
            <h3 className="adm-top__title">Top 5 khóa học nhiều đăng ký</h3>
            <span className="adm-top__range">
              {monthInputToLabel(chartFrom)} - {monthInputToLabel(chartTo)}
            </span>
          </div>
          <div className="adm-top__body">
            {topLoading ? (
              <div className="adm-top__empty">Đang tải...</div>
            ) : topKhoaHoc.length === 0 ? (
              <div className="adm-top__empty">Chưa có dữ liệu</div>
            ) : (
              <div className="adm-table adm-table--compact">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 56 }}>#</th>
                      <th>Khóa học</th>
                      <th style={{ width: 140, textAlign: 'center' }}>Lượt đăng ký</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topKhoaHoc.map((x, idx) => (
                      <tr key={x.maKhoaHoc}>
                        <td>{idx + 1}</td>
                        <td className="adm-ellipsis" title={x.tenKhoaHoc}>
                          {x.tenKhoaHoc}
                        </td>
                        <td style={{ textAlign: 'center' }}>{x.soLuotDangKy.toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="adm-top card border-0 shadow-sm">
          <div className="adm-top__header">
            <h3 className="adm-top__title">Top 5 giảng viên nhiều đăng ký</h3>
            <span className="adm-top__range">
              {monthInputToLabel(chartFrom)} - {monthInputToLabel(chartTo)}
            </span>
          </div>
          <div className="adm-top__body">
            {topLoading ? (
              <div className="adm-top__empty">Đang tải...</div>
            ) : topGiangVien.length === 0 ? (
              <div className="adm-top__empty">Chưa có dữ liệu</div>
            ) : (
              <div className="adm-table adm-table--compact">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 56 }}>#</th>
                      <th>Giảng viên</th>
                      <th style={{ width: 140, textAlign: 'center' }}>Lượt đăng ký</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topGiangVien.map((x, idx) => (
                      <tr key={x.maGiangVien}>
                        <td>{idx + 1}</td>
                        <td className="adm-ellipsis" title={`${x.tenGiangVien}${x.email ? ` • ${x.email}` : ''}`}>
                          <div className="adm-top__name">{x.tenGiangVien}</div>
                          {x.email ? <div className="adm-top__sub">{x.email}</div> : null}
                        </td>
                        <td style={{ textAlign: 'center' }}>{x.soLuotDangKy.toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="adm-widgets-grid">
        <div className="adm-widget card border-0 shadow-sm">
          <div className="adm-widget__header">
            <h3 className="adm-widget__title">Chất lượng khóa học</h3>
            <span className="adm-widget__range">
              {monthInputToLabel(chartFrom)} - {monthInputToLabel(chartTo)}
            </span>
          </div>
          <div className="adm-widget__body">
            {sortedQuality.length === 0 ? (
              <div className="adm-widget__empty">Chưa có dữ liệu</div>
            ) : (
              <div className="adm-quality-tabs">
                <div className="adm-tabs" role="tablist" aria-label="Chất lượng khóa học">
                  <button
                    type="button"
                    className={`adm-tab ${qualityTab === 'top' ? 'adm-tab--active' : ''}`}
                    role="tab"
                    aria-selected={qualityTab === 'top'}
                    onClick={() => setQualityTab('top')}
                  >
                    Top tốt
                  </button>
                  <button
                    type="button"
                    className={`adm-tab ${qualityTab === 'improve' ? 'adm-tab--active' : ''}`}
                    role="tab"
                    aria-selected={qualityTab === 'improve'}
                    onClick={() => setQualityTab('improve')}
                  >
                    Cần cải thiện
                  </button>
                </div>

                <div className="adm-table adm-table--compact">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: 56 }}>#</th>
                        <th>Khóa học</th>
                        <th style={{ width: 140, textAlign: 'center' }}>Bình luận</th>
                        <th style={{ width: 110, textAlign: 'center' }}>Sao</th>
                        <th style={{ width: 140, textAlign: 'center' }}>Hoàn thành</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(qualityTab === 'top' ? topQuality : bottomQuality).map((x, idx) => (
                        <tr key={`${qualityTab}-${x.maKhoaHoc}`}>
                          <td>{idx + 1}</td>
                          <td className="adm-ellipsis" title={`${x.tenKhoaHoc} • ${x.tenGiangVien}`}>
                            <div className="adm-top__name">{x.tenKhoaHoc}</div>
                            <div className="adm-top__sub">{x.tenGiangVien}</div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {x.soBinhLuan.toLocaleString('vi-VN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {x.soDanhGia > 0 ? fmt2(x.diemDanhGiaTrungBinh) : '—'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {fmtPercent01(x.tyLeHoanThanh)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {detailOpen && (
        <div className="adm-modal" role="dialog" aria-modal="true" aria-label={detailTitle}>
          <div className="adm-modal__backdrop" onClick={closeDetail} />
          <div className="adm-modal__panel">
            <div className="adm-modal__header">
              <div>
                <h3 className="adm-modal__title">{detailTitle}</h3>
              </div>
              <button type="button" className="adm-modal__close" onClick={closeDetail} aria-label="Đóng">
                ×
              </button>
            </div>

            <div className="adm-modal__tools">
              <input
                className="adm-modal__search"
                value={detailSearch}
                onChange={(e) => {
                  setDetailSearch(e.target.value);
                  setDetailPage(1);
                }}
                placeholder="Tìm kiếm..."
              />
            </div>

            <div className="adm-modal__body">
              {detailLoading ? (
                <div className="adm-modal__state">
                  <div className="adm-stats-spinner" aria-hidden />
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : detailError ? (
                <div className="adm-modal__state adm-modal__state--error">
                  <h4>Lỗi</h4>
                  <p>{detailError}</p>
                </div>
              ) : (detailData?.items?.length ?? 0) === 0 ? (
                <div className="adm-modal__state">
                  <p>Không có dữ liệu phù hợp.</p>
                </div>
              ) : (
                <div className="adm-detail">
                  <div className="adm-table">
                    {detailKind === 'hoc-vien' && (
                      <table>
                        <thead>
                          <tr>
                            <th>Mã</th>
                            <th>Tài khoản</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Trạng thái</th>
                            <th>Ngày tham gia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((detailData?.items ?? []) as HocVienItemDTO[]).map((x) => (
                            <tr key={x.maNguoiDung}>
                              <td>{x.maNguoiDung}</td>
                              <td>{x.taiKhoan}</td>
                              <td>{x.hoTen}</td>
                              <td>{x.email}</td>
                              <td>{x.trangThai}</td>
                              <td>{new Date(x.ngayThamGia).toLocaleDateString('vi-VN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {detailKind === 'giang-vien' && (
                      <table>
                        <thead>
                          <tr>
                            <th>Mã</th>
                            <th>Tài khoản</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Trạng thái</th>
                            <th>Ngày tham gia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((detailData?.items ?? []) as GiangVienItemDTO[]).map((x) => (
                            <tr key={x.maNguoiDung}>
                              <td>{x.maNguoiDung}</td>
                              <td>{x.taiKhoan}</td>
                              <td>{x.hoTen}</td>
                              <td>{x.email}</td>
                              <td>{x.trangThai}</td>
                              <td>{new Date(x.ngayThamGia).toLocaleDateString('vi-VN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {detailKind === 'khoa-hoc' && (
                      <table>
                        <thead>
                          <tr>
                            <th>Mã</th>
                            <th>Tên khóa học</th>
                            <th>Lĩnh vực</th>
                            <th>Trình độ</th>
                            <th>Giảng viên</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((detailData?.items ?? []) as KhoaHocItemDTO[]).map((x) => (
                            <tr key={x.maKhoaHoc}>
                              <td>{x.maKhoaHoc}</td>
                              <td>{x.tenKhoaHoc}</td>
                              <td>{x.linhVuc}</td>
                              <td>{x.trinhDo}</td>
                              <td>{x.tenGiangVien}</td>
                              <td>{x.trangThai}</td>
                              <td>{new Date(x.ngayTao).toLocaleDateString('vi-VN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {detailKind === 'dang-ky' && (
                      <table>
                        <thead>
                          <tr>
                            <th>Mã</th>
                            <th>Ngày đăng ký</th>
                            <th>Khóa học</th>
                            <th>Học viên</th>
                            <th>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((detailData?.items ?? []) as DangKyItemDTO[]).map((x) => (
                            <tr key={x.maDangKy}>
                              <td>{x.maDangKy}</td>
                              <td>{new Date(x.ngayDangKy).toLocaleDateString('vi-VN')}</td>
                              <td>{x.tenKhoaHoc}</td>
                              <td>{x.tenHocVien}</td>
                              <td>{x.emailHocVien}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="adm-detail__footer">
                    <div className="adm-modal__meta adm-modal__meta--footer">
                      {detailData
                        ? `Trang ${detailData.page}/${detailData.totalPages} • Tổng ${detailData.totalItems.toLocaleString(
                            'vi-VN'
                          )}`
                        : ''}
                    </div>
                    <div className="adm-modal__pager">
                      <button
                        type="button"
                        className="adm-modal__btn"
                        onClick={() => setDetailPage((p) => Math.max(1, p - 1))}
                        disabled={detailLoading || (detailData?.page ?? 1) <= 1}
                        aria-label="Trang trước"
                        title="Trang trước"
                      >
                        &lt;
                      </button>
                      <button
                        type="button"
                        className="adm-modal__btn"
                        onClick={() => setDetailPage((p) => p + 1)}
                        disabled={detailLoading || (detailData?.page ?? 1) >= (detailData?.totalPages ?? 1)}
                        aria-label="Trang sau"
                        title="Trang sau"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
