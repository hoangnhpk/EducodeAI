import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { Bot, Settings, ShieldCheck, X } from 'lucide-react';
import { reviewAdminService } from '../../../services/review-admin.service';
import ReviewAdminDetailDrawer from './components/ReviewAdminDetailDrawer';
import ReviewAdminFilters from './components/ReviewAdminFilters';
import ReviewAdminStats from './components/ReviewAdminStats';
import ReviewAdminTable from './components/ReviewAdminTable';
import type { ReviewFilterParams, ReviewItem, ReviewSource, ThongKeReview, ReviewCourseInfo } from './components/ReviewAdmin.types';
import './ReviewAdmin.css';

// ────────────────────────────────────────────────
// Cấu hình tự động duyệt AI – lưu localStorage
// ────────────────────────────────────────────────
const SETTINGS_KEY = 'qtrv_ai_settings';

interface AISettings {
  enabled: boolean;          // Bật/tắt tự động duyệt
  nguongSoLuong: number;     // Gửi ngay khi ≥ N review chờ duyệt
  khoangCachPhut: number;    // Hoặc sau N phút nếu có ít nhất 1 review
}

const DEFAULT_AI_SETTINGS: AISettings = {
  enabled: false,
  nguongSoLuong: 20,    // Gửi AI ngay khi ≥20 review (không lãng phí cho 1-2 cái)
  khoangCachPhut: 120,  // Hẹn giờ mỗi 2 tiếng — đủ kịp thời, không tốn API
};

function loadSettings(): AISettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_AI_SETTINGS };
}

function saveSettings(s: AISettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ────────────────────────────────────────────────
const DEFAULT_FILTERS: ReviewFilterParams = {
  trangThai: 'TatCa',
  soSao: 'TatCa',
  search: '',
  page: 1,
  pageSize: 10,
};

export default function QuanLyReviewMoi() {
  const [thongKe, setThongKe] = useState<ThongKeReview | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [filters, setFilters] = useState<ReviewFilterParams>(DEFAULT_FILTERS);
  const [courses, setCourses] = useState<ReviewCourseInfo[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<ReviewSource>('api');
  const [error, setError] = useState<string | null>(null);

  // AI states
  const [aiDuying, setAiDuying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(loadSettings);
  const [draftSettings, setDraftSettings] = useState<AISettings>(loadSettings);
  const [lastAutoRun, setLastAutoRun] = useState<Date | null>(null);

  const thongKeRef = useRef(thongKe);
  thongKeRef.current = thongKe;
  const settingsRef = useRef(aiSettings);
  settingsRef.current = aiSettings;

  // ──── Data fetching ────
  const fetchThongKe = async (nextFilters = filters) => {
    const maKhoaHoc = nextFilters.maKhoaHoc === 'TatCa' ? undefined : Number(nextFilters.maKhoaHoc);
    const result = await reviewAdminService.getThongKe(maKhoaHoc || undefined);
    setThongKe(result.data);
    setSource(result.source);
  };

  const fetchReviews = async (nextFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await reviewAdminService.getReviews(nextFilters);
      setReviews(result.data.data);
      setTotalItems(result.data.total);
      setTotalPages(result.data.totalPages);
      setSource(result.source);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const result = await reviewAdminService.getKhoaHocFilters();
      setCourses(result.data);
    } catch { /* ignore */ }
  };

  const reloadAll = async (nextFilters = filters) => {
    await Promise.all([fetchThongKe(nextFilters), fetchReviews(nextFilters)]);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchThongKe(filters);
    fetchReviews(filters);
  }, [filters]);

  // ──── Mutation handlers ────
  const handleMutation = async (action: () => Promise<unknown>, msg: string) => {
    try {
      await action();
      await reloadAll(filters);
      Swal.fire({ icon: 'success', text: msg, timer: 1400, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: 'error', text: err.response?.data?.message || 'Không thể cập nhật.' });
    }
  };

  const handleApprove = async (id: number) => {
    await handleMutation(() => reviewAdminService.approveReview(id), 'Đã duyệt nội dung thành công.');
    if (selectedReview?.id === id) setSelectedReview(p => p ? { ...p, trangThai: 'DaDuyet' } : p);
  };

  const handleReject = async (id: number) => {
    await handleMutation(() => reviewAdminService.rejectReview(id), 'Đã từ chối nội dung.');
    if (selectedReview?.id === id) setSelectedReview(p => p ? { ...p, trangThai: 'TuChoi' } : p);
  };

  const handleDelete = async (id: number) => {
    await handleMutation(() => reviewAdminService.deleteReview(id), 'Đã xóa khỏi danh sách.');
    if (selectedReview?.id === id) setSelectedReview(null);
  };

  // ──── AI Duyệt thực sự ────
  const runAIDuyet = async (silent = false) => {
    if (aiDuying) return;
    setAiDuying(true);
    try {
      const result = await reviewAdminService.aiDuyetHangLoat();
      await reloadAll(filters);
      setLastAutoRun(new Date());
      if (!silent) {
        Swal.fire({
          icon: 'success',
          title: 'AI xử lý xong!',
          html: `✅ Duyệt: <strong>${result.soDaDuyet}</strong> &nbsp;|&nbsp; ❌ Từ chối: <strong>${result.soTuChoi}</strong>`,
          confirmButtonColor: '#8b5cf6',
        });
      }
    } catch {
      if (!silent) Swal.fire({ icon: 'error', text: 'AI không phản hồi, vui lòng thử lại.' });
    } finally {
      setAiDuying(false);
    }
  };

  // ──── Nút bấm thủ công ────
  const handleAIDuyet = async () => {
    const choDuyetCount = thongKe?.choDuyet ?? 0;
    if (choDuyetCount === 0) {
      Swal.fire({ icon: 'info', text: 'Không có đánh giá nào đang chờ duyệt.', timer: 2000, showConfirmButton: false });
      return;
    }
    const confirm = await Swal.fire({
      icon: 'question',
      title: 'AI Duyệt Hàng Loạt',
      html: `Gemini AI sẽ phân tích <strong>${choDuyetCount}</strong> đánh giá đang chờ.<br><br>Bạn vẫn có thể chỉnh lại thủ công sau.`,
      showCancelButton: true,
      confirmButtonText: '🤖 Để AI xử lý',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#8b5cf6',
    });
    if (confirm.isConfirmed) await runAIDuyet(false);
  };

  // ──── Auto-run theo Settings ────
  // Hẹn giờ: chỉ gửi khi có ≥1 review (nếu ít quá thì sau thời gian hẹn giờ vẫn gửi)
  const MIN_REVIEW_FOR_TIMER = 1;

  useEffect(() => {
    if (!aiSettings.enabled) return;

    const intervalMs = aiSettings.khoangCachPhut * 60 * 1000;

    const timer = setInterval(async () => {
      const s = settingsRef.current;
      const tk = thongKeRef.current;
      if (!s.enabled) return;

      const choDuyet = tk?.choDuyet ?? 0;
      // Chỉ trigger theo giờ khi có đủ MIN_REVIEW_FOR_TIMER review
      // (khi đủ ngưỡng lớn thì đã trigger real-time rồi, không cần timer nữa)
      if (choDuyet >= MIN_REVIEW_FOR_TIMER && choDuyet < s.nguongSoLuong) {
        console.log(`[AI Auto Timer] ${choDuyet} review chờ — kích hoạt theo giờ`);
        await runAIDuyet(true);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [aiSettings.enabled, aiSettings.khoangCachPhut]);

  // Trigger ngay (real-time) khi đủ ngưỡng lớn
  useEffect(() => {
    if (!aiSettings.enabled) return;
    const choDuyet = thongKe?.choDuyet ?? 0;
    if (choDuyet >= aiSettings.nguongSoLuong && !aiDuying) {
      console.log(`[AI Auto Threshold] ${choDuyet} >= ${aiSettings.nguongSoLuong} — kích hoạt ngay`);
      runAIDuyet(true);
    }
  }, [thongKe?.choDuyet, aiSettings.enabled, aiSettings.nguongSoLuong]);

  // ──── Settings panel handlers ────
  const handleOpenSettings = () => {
    setDraftSettings({ ...aiSettings });
    setShowSettings(true);
  };

  const handleSaveSettings = () => {
    saveSettings(draftSettings);
    setAiSettings(draftSettings);
    setShowSettings(false);
    Swal.fire({
      icon: 'success',
      text: draftSettings.enabled
        ? `Đã bật tự động duyệt: gửi AI khi ≥${draftSettings.nguongSoLuong} review hoặc mỗi ${draftSettings.khoangCachPhut} phút.`
        : 'Đã tắt tự động duyệt AI.',
      timer: 2500,
      showConfirmButton: false,
    });
  };

  const choDuyetCount = thongKe?.choDuyet ?? 0;

  return (
    <div className="qtrv-page">
      {/* ── Hero ── */}
      <section className="qtrv-hero">
        <div className="qtrv-hero__content">
          <div className="qtrv-hero__icon"><ShieldCheck size={24} /></div>
          <div>
            <h1>Quản lý đánh giá khóa học</h1>
            <p>Kiểm duyệt nhận xét học viên, xử lý nội dung không phù hợp.</p>
          </div>
        </div>

        {/* Nhóm nút AI */}
        <div className="qtrv-ai-group">
          {/* Chỉ báo auto đang bật */}
          {aiSettings.enabled && (
            <div className="qtrv-ai-auto-badge">
              <span className="qtrv-ai-auto-dot" />
              Tự động duyệt
              {lastAutoRun && (
                <span className="qtrv-ai-auto-last">
                  · lần cuối {lastAutoRun.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}

          {/* Nút thủ công */}
          <button
            type="button"
            className="qtrv-ai-batch-btn"
            onClick={handleAIDuyet}
            disabled={aiDuying}
            title="Gemini AI phân tích tất cả review đang chờ duyệt"
          >
            <Bot size={15} />
            {aiDuying ? 'AI đang xử lý...' : 'AI Duyệt'}
            {choDuyetCount > 0 && !aiDuying && (
              <span className="qtrv-ai-batch-count">{choDuyetCount}</span>
            )}
          </button>

          {/* Nút Settings */}
          <button
            type="button"
            className={`qtrv-ai-settings-btn ${aiSettings.enabled ? 'active' : ''}`}
            onClick={handleOpenSettings}
            title="Cài đặt tự động duyệt AI"
          >
            <Settings size={15} />
          </button>
        </div>
      </section>

      {/* ── Settings Panel ── */}
      {showSettings && (
        <div className="qtrv-settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="qtrv-settings-panel" onClick={e => e.stopPropagation()}>
            <div className="qtrv-settings-header">
              <div className="qtrv-settings-title">
                <Bot size={16} />
                Cài đặt AI Duyệt Tự Động
              </div>
              <button type="button" className="qtrv-settings-close" onClick={() => setShowSettings(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="qtrv-settings-body">
              {/* Toggle bật/tắt */}
              <label className="qtrv-toggle-row">
                <div>
                  <strong>Tự động duyệt</strong>
                  <p>AI tự chạy theo ngưỡng hoặc thời gian đặt trước</p>
                </div>
                <button
                  type="button"
                  className={`qtrv-toggle ${draftSettings.enabled ? 'on' : 'off'}`}
                  onClick={() => setDraftSettings(s => ({ ...s, enabled: !s.enabled }))}
                >
                  <span className="qtrv-toggle-thumb" />
                </button>
              </label>

              <hr className="qtrv-settings-divider" />

              {/* Ngưỡng số lượng */}
              <div className={`qtrv-settings-field ${!draftSettings.enabled ? 'disabled' : ''}`}>
                <label>
                  <strong>Gửi AI ngay khi ≥</strong>
                  <p>Số đánh giá đang chờ đạt mức này thì kích hoạt AI ngay lập tức, không cần chờ hẹn giờ.</p>
                </label>
                <div className="qtrv-settings-input-row">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={draftSettings.nguongSoLuong}
                    disabled={!draftSettings.enabled}
                    onChange={e => setDraftSettings(s => ({ ...s, nguongSoLuong: Math.max(1, Number(e.target.value)) }))}
                  />
                  <span>đánh giá</span>
                </div>
              </div>

              {/* Khoảng cách thời gian */}
              <div className={`qtrv-settings-field ${!draftSettings.enabled ? 'disabled' : ''}`}>
                <label>
                  <strong>Hẹn giờ tự động mỗi</strong>
                  <p>Nếu chưa đủ ngưỡng nhưng vẫn có review chờ, AI sẽ chạy theo chu kỳ này.</p>
                </label>
                <div className="qtrv-settings-input-row">
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    value={draftSettings.khoangCachPhut}
                    disabled={!draftSettings.enabled}
                    onChange={e => setDraftSettings(s => ({ ...s, khoangCachPhut: Math.max(5, Number(e.target.value)) }))}
                  />
                  <span>phút</span>
                </div>
                <div className="qtrv-settings-presets">
                  {[60, 120, 240, 480].map(m => (
                    <button
                      key={m}
                      type="button"
                      disabled={!draftSettings.enabled}
                      className={draftSettings.khoangCachPhut === m ? 'active' : ''}
                      onClick={() => setDraftSettings(s => ({ ...s, khoangCachPhut: m }))}
                    >
                      {m < 60 ? `${m} phút` : `${m / 60}h`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview logic */}
              {draftSettings.enabled && (
                <div className="qtrv-settings-preview">
                  <Bot size={13} />
                  <span>
                    AI sẽ tự động duyệt khi có <strong>≥{draftSettings.nguongSoLuong}</strong> review chờ,
                    hoặc mỗi <strong>{draftSettings.khoangCachPhut} phút</strong> nếu có bất kỳ review nào chờ.
                  </span>
                </div>
              )}
            </div>

            <div className="qtrv-settings-footer">
              <button type="button" className="qtrv-settings-cancel" onClick={() => setShowSettings(false)}>
                Hủy
              </button>
              <button type="button" className="qtrv-settings-save" onClick={handleSaveSettings}>
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      )}

      <ReviewAdminStats data={thongKe} />

      <ReviewAdminFilters
        filters={filters}
        source={source}
        loading={loading}
        courses={courses}
        onFilterChange={setFilters}
        onRefresh={() => reloadAll(filters)}
      />

      {error ? (
        <div className="qtrv-error-card">
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
          <button type="button" onClick={() => reloadAll(filters)}>Thử lại</button>
        </div>
      ) : (
        <ReviewAdminTable
          reviews={reviews}
          currentPage={filters.page || 1}
          totalPages={totalPages}
          totalItems={totalItems}
          loading={loading}
          onPageChange={page => setFilters(prev => ({ ...prev, page }))}
          onPreview={setSelectedReview}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}

      <ReviewAdminDetailDrawer
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
