import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import type { KhoaHocCreateUpdate, KhoaHocDetail } from '../types';
import * as api from '@/services/khoa-hoc-cua-toi.service';
import { FormSkeleton } from '../components/ui/Skeleton';
import { laKhoaHocMienPhi } from "@/utils/format-gia-khoa-hoc";
import { getMediaUrl } from '@/utils/mediaUrl';

const getGiangVienId = (): number => {
  try {
    const raw = localStorage.getItem('user_info');
    if (raw) { const u = JSON.parse(raw); return u.maNguoiDung ?? u.id ?? 1; }
  } catch { /* ignore */ }
  return 1;
};

const LINH_VUC = [
  'Lập trình hệ thống',
  'Công nghệ thông tin',
  'Web Development',
  'Mobile Development',
  'AI & Machine Learning',
  'Backend Development',
  'Frontend Development',
  'Fullstack Development',
  'Web Design & UI/UX',
  'System Administration & DevOps',
  'Cyber Security',
  'Data Science',
  'Database Administration',
  'Cloud Computing',
  'Game Development',
  'Kiểm thử phần mềm',
  'Mạng máy tính',
  'IoT & Embedded',
  'Phân tích nghiệp vụ',
  'Quản lý dự án CNTT'
];
const TRINH_DO = ['Người mới', 'Trung cấp', 'Nâng cao'];

const MAX_VIDEO_SIZE_MB = 100;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg'];

type VideoPreview = { type: 'youtube' | 'direct'; src: string };

const getYouTubeVideoId = (url: URL): string | null => {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] ?? null;
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    if (url.pathname === '/watch') return url.searchParams.get('v');
    const parts = url.pathname.split('/').filter(Boolean);
    if ((parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') && parts[1]) return parts[1];
  }
  return null;
};

const getVideoPreview = (value?: string): VideoPreview | null => {
  const input = value?.trim();
  if (!input) return null;
  if (input.startsWith('/uploads/')) {
    return ALLOWED_VIDEO_EXTENSIONS.some(ext => input.toLowerCase().split('?')[0].endsWith(ext)) ? { type: 'direct', src: getMediaUrl(input) } : null;
  }
  try {
    const url = new URL(input);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const youtubeId = getYouTubeVideoId(url);
    if (youtubeId) return { type: 'youtube', src: `https://www.youtube.com/embed/${youtubeId}` };
    if (ALLOWED_VIDEO_EXTENSIONS.some(ext => url.pathname.toLowerCase().endsWith(ext))) return { type: 'direct', src: getMediaUrl(input) };
  } catch { return null; }
  return null;
};

const normalizeVideoUrl = (value?: string): string => getVideoPreview(value)?.src ?? value?.trim() ?? '';

const validateVideoFile = (file: File): string | null => {
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_VIDEO_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (!ALLOWED_VIDEO_TYPES.includes(file.type) || !hasValidExtension) return 'Chỉ chấp nhận video định dạng MP4, WebM hoặc OGG.';
  if (file.size > MAX_VIDEO_SIZE_BYTES) return `Kích thước video không được vượt quá ${MAX_VIDEO_SIZE_MB}MB.`;
  return null;
};

interface ValidationErrors {
  tenKhoaHoc?: string;
  linhVuc?: string;
  trinhDo?: string;
  thoiLuongGio?: string;
  giaKhoaHoc?: string;
  donViTienTe?: string;
  tenChungChi?: string;
  diemDatChungChi?: string;
  soCauHoiChungChi?: string;
  thoiGianLamBaiChungChi?: string;
  videoGioiThieu?: string;
}

interface Props {
  maKhoaHoc?: number; // if undefined = create mode
  onSaved: (maKhoaHoc: number) => void;         // go to manage
  onSavedAndContinue: (maKhoaHoc: number) => void; // go to playlist import
  onCancel: () => void;
}

const DEFAULT_FORM: KhoaHocCreateUpdate = {
  tenKhoaHoc: '',
  moTa: '',
  hinhAnh: '',
  videoGioiThieu: '',
  linhVuc: '',
  trinhDo: 'Cơ bản',
  thoiLuongGio: 1,
  trangThai: 'Hoạt động',
  giaKhoaHoc: 10000,
  donViTienTe: 'VND',
  choPhepMua: true,
  kyNangChinh: '',
  coChungChi: false,
  tenChungChi: '',
  diemDatChungChi: 70,
  soCauHoiChungChi: 20,
  thoiGianLamBaiChungChi: 60,
};

const CourseFormPage: React.FC<Props> = ({ maKhoaHoc, onSaved, onSavedAndContinue, onCancel }) => {
  const maGiangVien = getGiangVienId();
  const isEdit = maKhoaHoc !== undefined;
  const showToast = (icon: 'success' | 'error', title: string) => {
    void Swal.fire({ icon, title, timer: 1800, showConfirmButton: false });
  };
  const ToastContainer = () => null;

  const [form, setForm] = useState<KhoaHocCreateUpdate>(DEFAULT_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!isEdit || !maKhoaHoc) return;
    try {
      setLoading(true);
      setLoadError(null);
      const detail: KhoaHocDetail = await api.getChiTietKhoaHoc(maGiangVien, maKhoaHoc);
      setForm({
        tenKhoaHoc: detail.tenKhoaHoc,
        moTa: detail.moTa ?? '',
        hinhAnh: detail.hinhAnh ?? '',
        videoGioiThieu: detail.videoGioiThieu ?? '',
        linhVuc: detail.linhVuc,
        trinhDo: detail.trinhDo,
        thoiLuongGio: detail.thoiLuongGio,
        trangThai: detail.trangThai ?? 'Hoạt động',
        giaKhoaHoc: detail.giaKhoaHoc ?? 10000,
        donViTienTe: detail.donViTienTe ?? 'VND',
        choPhepMua: true,
        kyNangChinh: detail.kyNangChinh ?? '',
        coChungChi: detail.coChungChi,
        tenChungChi: detail.tenChungChi ?? '',
        diemDatChungChi: detail.diemDatChungChi,
        soCauHoiChungChi: detail.soCauHoiChungChi,
        thoiGianLamBaiChungChi: detail.thoiGianLamBaiChungChi,
      });
    } catch {
      setLoadError('Không thể tải thông tin khóa học.');
    } finally {
      setLoading(false);
    }
  }, [isEdit, maKhoaHoc, maGiangVien]);

  useEffect(() => { void loadDetail(); }, [loadDetail]);

  const set = (field: keyof KhoaHocCreateUpdate, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleVideoUrlChange = (value: string) => {
    set('videoGioiThieu', value);
    const trimmed = value.trim();
    if (!trimmed || getVideoPreview(trimmed)) {
      setErrors(prev => ({ ...prev, videoGioiThieu: undefined }));
    } else {
      setErrors(prev => ({ ...prev, videoGioiThieu: 'Link video không hợp lệ. Hãy dùng YouTube hoặc file .mp4, .webm, .ogg.' }));
    }
  };

  const handleVideoUrlBlur = () => {
    const normalized = normalizeVideoUrl(form.videoGioiThieu);
    if (normalized !== (form.videoGioiThieu ?? '')) set('videoGioiThieu', normalized);
  };

  const handleVideoUpload = async (file: File, input: HTMLInputElement) => {
    const validationError = validateVideoFile(file);
    if (validationError) {
      showToast('error', validationError);
      input.value = '';
      return;
    }
    try {
      setSubmitting(true);
      const url = await api.uploadVideoGioiThieuKhoaHoc(file);
      if (url) {
        set('videoGioiThieu', url);
        setErrors(prev => ({ ...prev, videoGioiThieu: undefined }));
        showToast('success', 'Upload video thành công!');
      }
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || err?.message || 'Lỗi khi upload video.');
    } finally {
      setSubmitting(false);
      input.value = '';
    }
  };

  const validate = (): boolean => {
    const e: ValidationErrors = {};
    if (!form.tenKhoaHoc.trim()) e.tenKhoaHoc = 'Tên khóa học không được để trống.';
    else if (form.tenKhoaHoc.length > 200) e.tenKhoaHoc = 'Tên khóa học tối đa 200 ký tự.';
    if (!form.linhVuc) e.linhVuc = 'Vui lòng chọn lĩnh vực.';
    if (!form.trinhDo) e.trinhDo = 'Vui lòng chọn trình độ.';
    if (!form.thoiLuongGio || form.thoiLuongGio <= 0) e.thoiLuongGio = 'Thời lượng phải lớn hơn 0.';
    if (form.thoiLuongGio > 999) e.thoiLuongGio = 'Thời lượng tối đa 999 giờ.';

    if (laKhoaHocMienPhi(form.donViTienTe)) {
      // Khóa miễn phí: không validate khoảng giá
    } else if (form.giaKhoaHoc === undefined || form.giaKhoaHoc === null) {
      e.giaKhoaHoc = 'Vui lòng nhập giá khóa học.';
    } else if (form.giaKhoaHoc < 10000 || form.giaKhoaHoc > 15000) {
      e.giaKhoaHoc = 'Giá khóa học phải từ 10,000 đến 15,000 VNĐ';
    }
    if (!form.donViTienTe?.trim()) e.donViTienTe = 'Đơn vị tiền tệ không được để trống.';
    if (form.videoGioiThieu?.trim() && !getVideoPreview(form.videoGioiThieu)) {
      e.videoGioiThieu = 'Link video không hợp lệ. Hãy dùng YouTube hoặc file .mp4, .webm, .ogg.';
    }

    if (form.coChungChi) {
      if (!form.tenChungChi?.trim()) e.tenChungChi = 'Tên chứng chỉ không được để trống khi bật chứng chỉ.';
      if (form.diemDatChungChi < 0 || form.diemDatChungChi > 100) e.diemDatChungChi = 'Điểm đạt phải từ 0–100.';
      if (form.soCauHoiChungChi < 1 || form.soCauHoiChungChi > 100) e.soCauHoiChungChi = 'Số câu hỏi phải từ 1–100.';
      if (form.thoiGianLamBaiChungChi < 1 || form.thoiGianLamBaiChungChi > 180) e.thoiGianLamBaiChungChi = 'Thời gian làm bài từ 1–180 phút.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (andContinue: boolean) => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      let savedId = maKhoaHoc!;
      if (isEdit) {
        await api.capNhatKhoaHoc(maGiangVien, maKhoaHoc!, form);
        showToast('success', 'Cập nhật khóa học thành công!');
      } else {
        const newId = await api.taoKhoaHoc(maGiangVien, form);
        if (!newId || typeof newId !== 'number') throw new Error('Không nhận được ID khóa học');
        savedId = newId;
        showToast('success', 'Tạo khóa học thành công!');
      }

      setTimeout(() => {
        if (andContinue && savedId) onSavedAndContinue(savedId);
        else if (andContinue) onSavedAndContinue(savedId);
        else onSaved(savedId);
      }, 600);
    } catch {
      showToast('error', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="khm-wrapper">
      <div className="khm-page">
        <div style={{ height: 24, marginBottom: 24 }} className="khm-skeleton" />
        <FormSkeleton />
      </div>
    </div>
  );

  if (loadError) return (
    <div className="khm-wrapper">
      <div className="khm-page">
        <div className="khm-alert khm-alert-danger">{loadError}</div>
        <button className="khm-btn khm-btn-outline" onClick={onCancel}>← Quay lại</button>
      </div>
    </div>
  );

  return (
    <div className="khm-wrapper">
      <ToastContainer />
      <div className="khm-page khm-form-page">
        {/* Breadcrumb */}
        <div className="khm-breadcrumb">
          <button onClick={onCancel}>Khóa học của tôi</button>
          <span className="khm-breadcrumb-sep">›</span>
          <span className="khm-breadcrumb-current">
            {isEdit ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
          </span>
        </div>

        <div className="khm-page-header" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={onCancel} style={{ borderRadius: 6, padding: '8px 12px' }}>
            ← Quay lại
          </button>
          <div>
            <h1 className="khm-page-title">{isEdit ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}</h1>
            <p className="khm-page-subtitle">Điền đầy đủ thông tin rồi lưu lại.</p>
          </div>
        </div>

        {/* Section 1: Basic Info */}
        <div className="khm-form-section">
          <div className="khm-form-section-header">
            <div className="khm-form-section-icon">📋</div>
            <div>
              <h3 className="khm-form-section-title">Thông tin cơ bản</h3>
            </div>
          </div>
          <div className="khm-form-section-body">
            <div className="khm-form-group">
              <label className="khm-form-label">Tên khóa học <span className="req">*</span></label>
              <input
                className={`khm-form-input ${errors.tenKhoaHoc ? 'error' : ''}`}
                placeholder="Ví dụ: Lập trình React từ cơ bản đến nâng cao"
                value={form.tenKhoaHoc}
                onChange={e => set('tenKhoaHoc', e.target.value)}
                disabled={submitting}
                maxLength={200}
              />
              {errors.tenKhoaHoc && <div className="khm-form-error">⚠ {errors.tenKhoaHoc}</div>}
              <div className="khm-form-hint">{form.tenKhoaHoc.length}/200 ký tự</div>
            </div>

            <div className="khm-form-group">
              <label className="khm-form-label">Mô tả khóa học</label>
              <textarea
                className="khm-form-textarea"
                placeholder="Mô tả ngắn về nội dung, mục tiêu khóa học..."
                value={form.moTa ?? ''}
                onChange={e => set('moTa', e.target.value)}
                disabled={submitting}
                rows={4}
              />
            </div>

            <div className="khm-form-group">
              <label className="khm-form-label">Hình ảnh cover (Link hoặc Upload)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  className="khm-form-input"
                  placeholder="https://... hoặc bấm nút bên cạnh để tải ảnh lên"
                  value={form.hinhAnh ?? ''}
                  onChange={e => set('hinhAnh', e.target.value)}
                  disabled={submitting}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="khm-btn khm-btn-outline khm-btn-sm"
                  onClick={() => document.getElementById('upload-course-img')?.click()}
                  disabled={submitting}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Upload File
                </button>
                <input
                  type="file"
                  id="upload-course-img"
                  style={{ display: 'none' }}
                  accept=".jpg,.jpeg,.png,.webp,.gif"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      showToast('error', 'Kích thước ảnh vượt quá 5MB.');
                      e.target.value = '';
                      return;
                    }
                    try {
                      setSubmitting(true);
                      const url = await api.uploadHinhAnhKhoaHoc(file);
                      if (url) {
                        set('hinhAnh', url);
                        showToast('success', 'Upload ảnh thành công!');
                      }
                    } catch (err: any) {
                      showToast('error', err?.message || 'Lỗi khi upload ảnh.');
                    } finally {
                      setSubmitting(false);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <div className="khm-form-hint">Dán URL từ internet hoặc tải ảnh trực tiếp từ máy tính.</div>
              {form.hinhAnh && (
                <div style={{ marginTop: '12px' }}>
                  <img
                    src={form.hinhAnh}
                    alt="Course Preview"
                    style={{ maxHeight: '160px', borderRadius: '4px', border: '1px solid var(--khm-gray-200)', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
                  />
                </div>
              )}
            </div>

            <div className="khm-form-group">
              <label className="khm-form-label">Video giới thiệu khóa học</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  className={`khm-form-input ${errors.videoGioiThieu ? 'error' : ''}`}
                  placeholder="Dán link YouTube hoặc URL video .mp4/.webm/.ogg"
                  value={form.videoGioiThieu ?? ''}
                  onChange={e => handleVideoUrlChange(e.target.value)}
                  onBlur={handleVideoUrlBlur}
                  disabled={submitting}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="khm-btn khm-btn-outline khm-btn-sm"
                  onClick={() => document.getElementById('upload-course-video')?.click()}
                  disabled={submitting}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Tải video lên
                </button>
                <input
                  type="file"
                  id="upload-course-video"
                  style={{ display: 'none' }}
                  accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void handleVideoUpload(file, e.currentTarget);
                  }}
                />
              </div>
              {errors.videoGioiThieu && <div className="khm-form-error">? {errors.videoGioiThieu}</div>}
              <div className="khm-form-hint">
                Có 2 lựa chọn: dán link YouTube/video trực tiếp, hoặc upload file MP4/WebM/OGG tối đa {MAX_VIDEO_SIZE_MB}MB.
              </div>
              {(() => {
                const preview = getVideoPreview(form.videoGioiThieu);
                if (!preview) return null;

                return (
                  <div style={{ marginTop: '12px' }}>
                    {preview.type === 'youtube' ? (
                      <iframe
                        src={preview.src}
                        title="Video giới thiệu khóa học"
                        style={{ width: '100%', maxWidth: '520px', height: '292px', border: '1px solid var(--khm-gray-200)', borderRadius: '8px' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={preview.src}
                        controls
                        style={{ width: '100%', maxWidth: '520px', maxHeight: '292px', border: '1px solid var(--khm-gray-200)', borderRadius: '8px', background: '#000' }}
                      />
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Section 2: Details */}
        <div className="khm-form-section">
          <div className="khm-form-section-header">
            <div className="khm-form-section-icon">⚙️</div>
            <h3 className="khm-form-section-title">Thông tin chi tiết</h3>
          </div>
          <div className="khm-form-section-body">
            <div className="khm-form-grid-2">
              <div className="khm-form-group">
                <label className="khm-form-label">Lĩnh vực <span className="req">*</span></label>
                <select
                  className={`khm-form-select ${errors.linhVuc ? 'error' : ''}`}
                  value={form.linhVuc}
                  onChange={e => set('linhVuc', e.target.value)}
                  disabled={submitting}
                >
                  <option value="">-- Chọn lĩnh vực --</option>
                  {LINH_VUC.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                {errors.linhVuc && <div className="khm-form-error">⚠ {errors.linhVuc}</div>}
              </div>

              <div className="khm-form-group">
                <label className="khm-form-label">Trình độ <span className="req">*</span></label>
                <select
                  className={`khm-form-select ${errors.trinhDo ? 'error' : ''}`}
                  value={form.trinhDo}
                  onChange={e => set('trinhDo', e.target.value)}
                  disabled={submitting}
                >
                  {TRINH_DO.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                {errors.trinhDo && <div className="khm-form-error">⚠ {errors.trinhDo}</div>}
              </div>

              <div className="khm-form-group">
                <label className="khm-form-label">Thời lượng (giờ) <span className="req">*</span></label>
                <input
                  type="number"
                  className={`khm-form-input ${errors.thoiLuongGio ? 'error' : ''}`}
                  min={1} max={999}
                  value={form.thoiLuongGio}
                  onChange={e => set('thoiLuongGio', Number(e.target.value))}
                  disabled={submitting}
                />
                {errors.thoiLuongGio && <div className="khm-form-error">⚠ {errors.thoiLuongGio}</div>}
              </div>

              <div className="khm-form-group">
                <label className="khm-form-label">Trạng thái</label>
                <select
                  className="khm-form-select"
                  value={form.trangThai ?? 'Hoạt động'}
                  onChange={e => set('trangThai', e.target.value)}
                  disabled={submitting}
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Không hoạt động">Không hoạt động</option>
                </select>
              </div>
            </div>

            <div className="khm-form-grid-2" style={{ marginTop: 16, marginBottom: 16 }}>
              <div className="khm-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="khm-form-label d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={laKhoaHocMienPhi(form.donViTienTe)}
                    disabled={submitting}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('donViTienTe', 'FREE');
                        set('giaKhoaHoc', 10000);
                      } else {
                        set('donViTienTe', 'VND');
                      }
                    }}
                  />
                  Khóa học miễn phí (hiển thị &quot;Miễn phí&quot; cho học viên)
                </label>
              </div>

              <div className="khm-form-group">
                <label className="khm-form-label">Giá khóa học (VNĐ) {!laKhoaHocMienPhi(form.donViTienTe) && <span className="req">*</span>}</label>
                <input
                  type="number"
                  className={`khm-form-input ${errors.giaKhoaHoc ? 'error' : ''}`}
                  min={10000} max={15000} step={1000}
                  value={form.giaKhoaHoc}
                  onChange={e => set('giaKhoaHoc', Number(e.target.value))}
                  disabled={submitting || laKhoaHocMienPhi(form.donViTienTe)}
                  placeholder="Ví dụ: 10000"
                />
                {errors.giaKhoaHoc && <div className="khm-form-error">⚠ {errors.giaKhoaHoc}</div>}
                {!laKhoaHocMienPhi(form.donViTienTe) && (
                  <div className="khm-form-hint">Giá khóa học phải từ 10,000 đến 15,000 VNĐ</div>
                )}
              </div>

              <div className="khm-form-group">
                <label className="khm-form-label">Đơn vị tiền tệ <span className="req">*</span></label>
                <input
                  type="text"
                  className={`khm-form-input ${errors.donViTienTe ? 'error' : ''}`}
                  value={form.donViTienTe}
                  onChange={e => set('donViTienTe', e.target.value)}
                  disabled={submitting || laKhoaHocMienPhi(form.donViTienTe)}
                />
                {errors.donViTienTe && <div className="khm-form-error">⚠ {errors.donViTienTe}</div>}
              </div>
            </div>

            <div className="khm-form-group">
              <label className="khm-form-label">Kỹ năng chính (phân tách bằng dấu phẩy)</label>
              <input
                className="khm-form-input"
                placeholder="React, TypeScript, Node.js..."
                value={form.kyNangChinh ?? ''}
                onChange={e => set('kyNangChinh', e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Certificate */}
        <div className="khm-form-section">
          <div className="khm-form-section-header">
            <div className="khm-form-section-icon">🏆</div>
            <div>
              <h3 className="khm-form-section-title">Cấu hình chứng chỉ</h3>
            </div>
          </div>
          <div className="khm-form-section-body">
            <div className="khm-toggle-row">
              <div>
                <div className="khm-toggle-label">Cấp chứng chỉ khi hoàn thành</div>
                <div className="khm-toggle-sublabel">
                  Học viên sẽ phải làm bài kiểm tra để nhận chứng chỉ
                </div>
              </div>
              <label className="khm-toggle">
                <input
                  type="checkbox"
                  checked={form.coChungChi}
                  onChange={e => set('coChungChi', e.target.checked)}
                  disabled={submitting}
                />
                <span className="khm-toggle-slider" />
              </label>
            </div>

            {form.coChungChi && (
              <div className="fade-in">
                <div className="khm-form-group">
                  <label className="khm-form-label">Tên chứng chỉ <span className="req">*</span></label>
                  <input
                    className={`khm-form-input ${errors.tenChungChi ? 'error' : ''}`}
                    placeholder="Ví dụ: Chứng chỉ React Developer"
                    value={form.tenChungChi ?? ''}
                    onChange={e => set('tenChungChi', e.target.value)}
                    disabled={submitting}
                    maxLength={100}
                  />
                  {errors.tenChungChi && <div className="khm-form-error">⚠ {errors.tenChungChi}</div>}
                </div>

                <div className="khm-form-grid-2">
                  <div className="khm-form-group">
                    <label className="khm-form-label">Điểm đạt (%) <span className="req">*</span></label>
                    <input
                      type="number" min={0} max={100}
                      className={`khm-form-input ${errors.diemDatChungChi ? 'error' : ''}`}
                      value={form.diemDatChungChi}
                      onChange={e => set('diemDatChungChi', Number(e.target.value))}
                      disabled={submitting}
                    />
                    {errors.diemDatChungChi && <div className="khm-form-error">⚠ {errors.diemDatChungChi}</div>}
                    <div className="khm-form-hint">Từ 0 đến 100%</div>
                  </div>

                  <div className="khm-form-group">
                    <label className="khm-form-label">Số câu hỏi <span className="req">*</span></label>
                    <input
                      type="number" min={1} max={100}
                      className={`khm-form-input ${errors.soCauHoiChungChi ? 'error' : ''}`}
                      value={form.soCauHoiChungChi}
                      onChange={e => set('soCauHoiChungChi', Number(e.target.value))}
                      disabled={submitting}
                    />
                    {errors.soCauHoiChungChi && <div className="khm-form-error">⚠ {errors.soCauHoiChungChi}</div>}
                    <div className="khm-form-hint">1–100 câu</div>
                  </div>

                  <div className="khm-form-group">
                    <label className="khm-form-label">Thời gian làm bài (phút) <span className="req">*</span></label>
                    <input
                      type="number" min={1} max={180}
                      className={`khm-form-input ${errors.thoiGianLamBaiChungChi ? 'error' : ''}`}
                      value={form.thoiGianLamBaiChungChi}
                      onChange={e => set('thoiGianLamBaiChungChi', Number(e.target.value))}
                      disabled={submitting}
                    />
                    {errors.thoiGianLamBaiChungChi && <div className="khm-form-error">⚠ {errors.thoiGianLamBaiChungChi}</div>}
                    <div className="khm-form-hint">1–180 phút</div>
                  </div>
                </div>
              </div>
            )}

            {!form.coChungChi && (
              <div className="khm-alert khm-alert-info" style={{ marginTop: 0 }}>
                💡 Bật chứng chỉ để học viên có động lực hoàn thành khóa học và nhận phần thưởng.
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 40 }}>
          <button
            className="khm-btn khm-btn-outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            className="khm-btn khm-btn-outline"
            onClick={() => void handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? <><span className="khm-spinner khm-spinner-sm" /> Đang lưu...</> : '💾 Lưu'}
          </button>
          <button
            className="khm-btn khm-btn-primary"
            onClick={() => void handleSubmit(true)}
            disabled={submitting}
          >
            {submitting ? <><span className="khm-spinner khm-spinner-sm" /> Đang lưu...</> : '📁 Lưu & Thêm nội dung'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseFormPage;
