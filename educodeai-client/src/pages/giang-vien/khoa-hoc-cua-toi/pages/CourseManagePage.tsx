import React, { useState, useEffect, useCallback } from 'react';
import type { KhoaHocDetail, CertificateConfig } from '../types';
import * as api from '@/services/khoa-hoc-cua-toi.service';
import ChapterListEditor from '../components/ChapterListEditor';
import LessonListEditor from '../components/LessonListEditor';
import { FormSkeleton } from '../components/ui/Skeleton';
import { useToastStandalone } from '../components/ui/Toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import QuizEditorModal from '../components/QuizEditorModal';

const getGiangVienId = (): number => {
  try { const u = JSON.parse(localStorage.getItem('user_info') || '{}'); return u.maNguoiDung ?? u.id ?? 1; }
  catch { return 1; }
};

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const getImageUrl = (url?: string) => {
  if (!url) return 'https://placehold.co/600x200/6366f1/white?text=Khóa+Học';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

type Tab = 'overview' | 'content' | 'import' | 'certificate' | 'settings';

interface Props {
  maKhoaHoc: number;
  onBack: () => void;
  onEdit: () => void;
  onImportPlaylist: () => void;
  initialTab?: Tab;
}

const CourseManagePage: React.FC<Props> = ({ maKhoaHoc, onBack, onEdit, onImportPlaylist, initialTab = 'overview' }) => {
  const maGiangVien = getGiangVienId();
  const { showToast, ToastContainer } = useToastStandalone();

  const [detail, setDetail] = useState<KhoaHocDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [selectedChapter, setSelectedChapter] = useState<{ maChuong: number; tenChuong: string } | null>(null);

  // Certificate state
  const [certForm, setCertForm] = useState<CertificateConfig>({
    coChungChi: false, tenChungChi: '', diemDatChungChi: 70, soCauHoiChungChi: 20, thoiGianLamBaiChungChi: 60,
  });
  const [certErrors, setCertErrors] = useState<Record<string, string>>({});
  const [savingCert, setSavingCert] = useState(false);
  const [confirmCertToggle, setConfirmCertToggle] = useState<'enable' | 'disable' | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showQuizEditor, setShowQuizEditor] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await api.getChiTietKhoaHoc(maGiangVien, maKhoaHoc);
      setDetail(data);
      setCertForm({
        coChungChi: data.coChungChi,
        tenChungChi: data.tenChungChi ?? '',
        diemDatChungChi: data.diemDatChungChi,
        soCauHoiChungChi: data.soCauHoiChungChi,
        thoiGianLamBaiChungChi: data.thoiGianLamBaiChungChi,
      });
    } catch {
      setError('Không thể tải thông tin khóa học.');
    } finally { setLoading(false); }
  }, [maGiangVien, maKhoaHoc]);

  useEffect(() => { void loadDetail(); }, [loadDetail]);

  // ---- Select chapter → switch to content tab ----
  const handleSelectChapter = (maChuong: number) => {
    const ch = detail?.danhSachChuong.find(c => c.maChuong === maChuong);
    setSelectedChapter({ maChuong, tenChuong: ch?.tenChuong ?? '' });
    setTab('content');
  };

  // ---- Certificate ----
  const validateCert = () => {
    const e: Record<string, string> = {};
    if (certForm.coChungChi) {
      if (!certForm.tenChungChi?.trim()) e.tenChungChi = 'Tên chứng chỉ không được để trống.';
      if (certForm.diemDatChungChi < 0 || certForm.diemDatChungChi > 100) e.diemDatChungChi = 'Điểm đạt từ 0–100.';
      if (certForm.soCauHoiChungChi < 1 || certForm.soCauHoiChungChi > 100) e.soCauHoiChungChi = 'Số câu hỏi 1–100.';
      if (certForm.thoiGianLamBaiChungChi < 1 || certForm.thoiGianLamBaiChungChi > 180) e.thoiGianLamBaiChungChi = 'Thời gian 1–180 phút.';
    }
    setCertErrors(e);
    return !Object.keys(e).length;
  };

  const handleSaveCert = async () => {
    if (!validateCert()) return;
    try {
      setSavingCert(true);
      await api.saveCertificateConfig(maGiangVien, maKhoaHoc, certForm);
      showToast('success', 'Cập nhật cấu hình chứng chỉ thành công!');
      void loadDetail();
    } catch {
      showToast('error', 'Lỗi lưu cấu hình. Vui lòng thử lại.');
    } finally { setSavingCert(false); }
  };

  const handleCertToggle = (checked: boolean) => {
    setConfirmCertToggle(checked ? 'enable' : 'disable');
  };

  const handleConfirmCertToggle = async () => {
    if (!confirmCertToggle) return;
    try {
      setSavingCert(true);
      const newVal = confirmCertToggle === 'enable';
      setCertForm(p => ({ ...p, coChungChi: newVal }));
      await api.saveCertificateConfig(maGiangVien, maKhoaHoc, { ...certForm, coChungChi: newVal });
      showToast('success', newVal ? 'Đã bật chứng chỉ!' : 'Đã tắt chứng chỉ.');
      setConfirmCertToggle(null);
      void loadDetail();
    } catch {
      showToast('error', 'Lỗi cập nhật chứng chỉ. Vui lòng thử lại.');
    } finally { setSavingCert(false); }
  };

  const handleGenerateAIQuiz = async () => {
    if (!detail) return;
    try {
      setGeneratingAI(true);
      const res: any = await api.taoDeChungChiBangAI(maGiangVien, maKhoaHoc);
      if (res?.thanhCong) {
        showToast('success', res.thongBao || 'Tạo đề bằng AI thành công!');
        void loadDetail();
      } else {
        showToast('error', res?.thongBao || 'Lỗi khi tạo đề: ' + (res?.message || 'Vui lòng thử lại.'));
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi máy chủ khi gọi AI.');
    } finally {
      setGeneratingAI(false);
    }
  };



  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đưa khóa học này vào thùng rác? Học viên sẽ không thể truy cập nữa.")) return;
    try {
      await api.xoaKhoaHoc(maGiangVien, maKhoaHoc);
      showToast('success', 'Khóa học đã được xóa mềm.');
      onBack();
    } catch {
      showToast('error', 'Lỗi xóa khóa học.');
    }
  };

  if (loading) return <div className="khm-wrapper"><div className="khm-page"><FormSkeleton /></div></div>;
  if (error || !detail) return (
    <div className="khm-wrapper"><div className="khm-page">
      <div className="khm-alert khm-alert-danger">{error ?? 'Không tìm thấy khóa học.'}</div>
      <button className="khm-btn khm-btn-outline" onClick={onBack}>← Quay lại</button>
    </div></div>
  );

  const chapterCount = detail.danhSachChuong.length;
  const lessonCount = detail.danhSachChuong.reduce((s, c) => s + (c.danhSachBaiHoc?.length ?? 0), 0);

  return (
    <div className="khm-wrapper">
      <ToastContainer />
      <div className="khm-page">
        {/* Breadcrumb */}
        <div className="khm-breadcrumb">
          <button onClick={onBack}>Khóa học của tôi</button>
          <span className="khm-breadcrumb-sep">›</span>
          <span className="khm-breadcrumb-current">{detail.tenKhoaHoc}</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={onBack} style={{ borderRadius: 6 }}>
            ← Quay lại trang danh sách
          </button>
        </div>

        {/* Course header */}
        <div className="khm-card" style={{ marginBottom: 24, display: 'flex', gap: 20, padding: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <img
            src={getImageUrl(detail.hinhAnh)}
            alt={detail.tenKhoaHoc}
            style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 10, flexShrink: 0, background: 'var(--khm-gray-100)' }}
            onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x200/6366f1/white?text=Khóa+Học'; }}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span className="khm-badge khm-badge-primary">{detail.linhVuc}</span>
              <span className="khm-badge khm-badge-draft">{detail.trinhDo}</span>
              {detail.trangThai === 'Hoạt động' && <span className="khm-badge khm-badge-published">Hoạt động</span>}
              {detail.coChungChi && <span className="khm-badge khm-badge-cert">🏆 Chứng chỉ</span>}
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--khm-gray-900)' }}>{detail.tenKhoaHoc}</h2>
            {detail.moTa && <p style={{ fontSize: '0.82rem', color: 'var(--khm-gray-500)', margin: 0, lineHeight: 1.5 }}>{detail.moTa}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <button className="khm-btn khm-btn-accent khm-btn-sm" onClick={onImportPlaylist}>▶ Import YouTube</button>
            <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={onEdit}>✏️ Sửa</button>
          </div>
        </div>

        {/* Stats */}
        <div className="khm-stat-row" style={{ marginBottom: 24 }}>
          <div className="khm-stat-card">
            <div className="khm-stat-value">{detail.soHocVien}</div>
            <div className="khm-stat-label">Học viên</div>
          </div>
          <div className="khm-stat-card">
            <div className="khm-stat-value">{chapterCount}</div>
            <div className="khm-stat-label">Chương</div>
          </div>
          <div className="khm-stat-card">
            <div className="khm-stat-value">{lessonCount}</div>
            <div className="khm-stat-label">Bài học</div>
          </div>
          <div className="khm-stat-card">
            <div className="khm-stat-value" style={{ color: 'var(--khm-accent)' }}>{detail.diemDanhGiaTB.toFixed(1)}</div>
            <div className="khm-stat-label">Đánh giá</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="khm-tabs">
          <button className={`khm-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
            📊 Tổng quan
          </button>
          <button className={`khm-tab ${tab === 'content' ? 'active' : ''}`} onClick={() => setTab('content')}>
            📁 Nội dung
            <span className="khm-tab-badge">{chapterCount} chương / {lessonCount} bài</span>
          </button>
          <button className={`khm-tab ${tab === 'import' ? 'active' : ''}`} onClick={() => setTab('import')}>
            ▶ Import YouTube
          </button>
          <button className={`khm-tab ${tab === 'certificate' ? 'active' : ''}`} onClick={() => setTab('certificate')}>
            🏆 Chứng chỉ
          </button>
          <button className={`khm-tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
            ⚙️ Cài đặt
          </button>
        </div>

        {/* Tab: Overview */}
        {tab === 'overview' && (
          <div className="fade-in">
            <div className="khm-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--khm-gray-900)' }}>Thông tin khóa học</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div>
                  <label className="khm-form-label">Tên khóa học</label>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--khm-gray-800)' }}>{detail.tenKhoaHoc}</div>
                </div>
                <div>
                  <label className="khm-form-label">Danh mục</label>
                  <div><span className="khm-badge khm-badge-primary">{detail.linhVuc}</span></div>
                </div>
                <div>
                  <label className="khm-form-label">Trình độ</label>
                  <div><span className="khm-badge khm-badge-draft">{detail.trinhDo}</span></div>
                </div>
                <div>
                  <label className="khm-form-label">Trạng thái</label>
                  <div>
                    {detail.trangThai === 'Hoạt động' && <span className="khm-badge khm-badge-published">Hoạt động</span>}
                  </div>
                </div>
                <div>
                  <label className="khm-form-label">Giá khóa học</label>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--khm-gray-800)' }}>
                    {detail.giaKhoaHoc.toLocaleString()} {detail.donViTienTe}
                  </div>
                </div>
                <div>
                  <label className="khm-form-label">Cho phép mua</label>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: detail.choPhepMua ? 'var(--khm-success)' : 'var(--khm-danger)' }}>
                    {detail.choPhepMua ? '✅ Có' : '❌ Không'}
                  </div>
                </div>
              </div>
              {detail.moTa && (
                <div style={{ marginTop: 20 }}>
                  <label className="khm-form-label">Mô tả</label>
                  <div style={{ fontSize: '0.9rem', color: 'var(--khm-gray-700)', lineHeight: 1.6, background: 'var(--khm-gray-50)', padding: 16, borderRadius: 8 }}>
                    {detail.moTa}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--khm-gray-100)' }}>
                <button className="khm-btn khm-btn-primary" onClick={onEdit}>✏️ Chỉnh sửa thông tin</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Content */}
        {tab === 'content' && (
          <div className="fade-in">
            {!selectedChapter && chapterCount === 0 ? (
              <div className="khm-alert khm-alert-info">
                📂 Bạn cần tạo ít nhất một chương trước khi thêm bài học.
                <button className="khm-btn khm-btn-primary khm-btn-sm" style={{ marginLeft: 12 }} onClick={() => setSelectedChapter(null)}>
                  Tạo chương mới →
                </button>
              </div>
            ) : (
              <>
                {chapterCount > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <select
                      className="khm-form-select"
                      value={selectedChapter?.maChuong ?? ''}
                      onChange={e => {
                        const id = Number(e.target.value);
                        const ch = detail.danhSachChuong.find(c => c.maChuong === id);
                        if (ch) setSelectedChapter({ maChuong: id, tenChuong: ch.tenChuong });
                      }}
                      style={{ maxWidth: 360 }}
                    >
                      <option value="">-- Chọn chương --</option>
                      {detail.danhSachChuong.map(c => (
                        <option key={c.maChuong} value={c.maChuong}>{c.tenChuong}</option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedChapter ? (
                  <LessonListEditor
                    key={selectedChapter.maChuong}
                    maChuong={selectedChapter.maChuong}
                    tenChuong={selectedChapter.tenChuong}
                    initialLessons={detail.danhSachChuong.find(c => c.maChuong === selectedChapter.maChuong)?.danhSachBaiHoc ?? []}
                    onImportYT={onImportPlaylist}
                  />
                ) : (
                  <ChapterListEditor
                    maKhoaHoc={maKhoaHoc}
                    initialChapters={detail.danhSachChuong}
                    onSelectChapter={handleSelectChapter}
                    onRefresh={() => void loadDetail()}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: Import */}
        {tab === 'import' && (
          <div className="fade-in">
            <div className="khm-card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: 16 }}>▶️</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, color: 'var(--khm-gray-900)' }}>Import YouTube Playlist</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--khm-gray-500)', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
                Nhập URL playlist YouTube để tự động import các video vào khóa học.
              </p>
              <button className="khm-btn khm-btn-accent" onClick={onImportPlaylist}>Bắt đầu import →</button>
            </div>
          </div>
        )}

        {/* Tab: Certificate */}
        {tab === 'certificate' && (
          <div className="fade-in">
            <div className="khm-form-section">
              <div className="khm-form-section-header">
                <div className="khm-form-section-icon">🏆</div>
                <h3 className="khm-form-section-title">Cấu hình chứng chỉ</h3>
              </div>
              <div className="khm-form-section-body">
                <div className="khm-toggle-row">
                  <div>
                    <div className="khm-toggle-label">Cấp chứng chỉ khi hoàn thành</div>
                    <div className="khm-toggle-sublabel">Học viên sẽ phải làm bài kiểm tra để nhận chứng chỉ</div>
                  </div>
                  <label className="khm-toggle">
                    <input type="checkbox" checked={certForm.coChungChi} onChange={e => handleCertToggle(e.target.checked)} disabled={savingCert} />
                    <span className="khm-toggle-slider" />
                  </label>
                </div>

                {certForm.coChungChi ? (
                  <div className="fade-in">
                    <div className="khm-form-group">
                      <label className="khm-form-label">Tên chứng chỉ <span className="req">*</span></label>
                      <input
                        className={`khm-form-input ${certErrors.tenChungChi ? 'error' : ''}`}
                        value={certForm.tenChungChi ?? ''}
                        onChange={e => setCertForm(p => ({ ...p, tenChungChi: e.target.value }))}
                        placeholder="Ví dụ: Chứng chỉ React Developer"
                        disabled={savingCert}
                        maxLength={100}
                      />
                      {certErrors.tenChungChi && <div className="khm-form-error">⚠ {certErrors.tenChungChi}</div>}
                    </div>
                    <div className="khm-form-grid-2">
                      <div className="khm-form-group">
                        <label className="khm-form-label">Điểm đạt (%) <span className="req">*</span></label>
                        <input type="number" min={0} max={100}
                          className={`khm-form-input ${certErrors.diemDatChungChi ? 'error' : ''}`}
                          value={certForm.diemDatChungChi}
                          onChange={e => setCertForm(p => ({ ...p, diemDatChungChi: Number(e.target.value) }))}
                          disabled={savingCert}
                        />
                        {certErrors.diemDatChungChi && <div className="khm-form-error">⚠ {certErrors.diemDatChungChi}</div>}
                        <div className="khm-form-hint">0–100%</div>
                      </div>
                      <div className="khm-form-group">
                        <label className="khm-form-label">Số câu hỏi <span className="req">*</span></label>
                        <input type="number" min={1} max={100}
                          className={`khm-form-input ${certErrors.soCauHoiChungChi ? 'error' : ''}`}
                          value={certForm.soCauHoiChungChi}
                          onChange={e => setCertForm(p => ({ ...p, soCauHoiChungChi: Number(e.target.value) }))}
                          disabled={savingCert}
                        />
                        {certErrors.soCauHoiChungChi && <div className="khm-form-error">⚠ {certErrors.soCauHoiChungChi}</div>}
                        <div className="khm-form-hint">1–100 câu</div>
                      </div>
                      <div className="khm-form-group">
                        <label className="khm-form-label">Thời gian làm bài (phút) <span className="req">*</span></label>
                        <input type="number" min={1} max={180}
                          className={`khm-form-input ${certErrors.thoiGianLamBaiChungChi ? 'error' : ''}`}
                          value={certForm.thoiGianLamBaiChungChi}
                          onChange={e => setCertForm(p => ({ ...p, thoiGianLamBaiChungChi: Number(e.target.value) }))}
                          disabled={savingCert}
                        />
                        {certErrors.thoiGianLamBaiChungChi && <div className="khm-form-error">⚠ {certErrors.thoiGianLamBaiChungChi}</div>}
                        <div className="khm-form-hint">1–180 phút</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="khm-alert khm-alert-info">
                    💡 Bật chứng chỉ để học viên có động lực hoàn thành khóa học và nhận phần thưởng.
                  </div>
                )}

                {certForm.coChungChi && (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 16 }}>
                    {detail.daCoDeThiChungChi && (
                      <button className="khm-btn khm-btn-outline" onClick={() => setShowQuizEditor(true)}>
                        🔍 Xem & Chỉnh sửa đề thi
                      </button>
                    )}
                    <button className="khm-btn khm-btn-accent" onClick={() => void handleGenerateAIQuiz()} disabled={savingCert || generatingAI}>
                      {generatingAI ? <><span className="khm-spinner khm-spinner-sm" /> Đang tạo đề AI...</> : '✨ Tạo đề bằng AI'}
                    </button>
                    <button className="khm-btn khm-btn-primary" onClick={() => void handleSaveCert()} disabled={savingCert || generatingAI}>
                      {savingCert ? <><span className="khm-spinner khm-spinner-sm" /> Đang lưu...</> : '💾 Lưu cấu hình'}
                    </button>
                  </div>
                )}

                {detail.daCoDeThiChungChi && (
                  <div className="khm-alert khm-alert-success" style={{ marginTop: 12 }}>
                    ✅ Khóa học này đã có đề chứng chỉ ({detail.nguonDeChungChi}).
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Settings */}
        {tab === 'settings' && (
          <div className="fade-in">
            <div className="khm-form-section">
              <div className="khm-form-section-header">
                <div className="khm-form-section-icon">⚙️</div>
                <h3 className="khm-form-section-title">Cài đặt khóa học</h3>
              </div>
              <div className="khm-form-section-body">
                <div className="khm-alert khm-alert-info" style={{ marginBottom: 20 }}>
                  ℹ️ Các tính năng quản lý trạng thái khóa học đang phát triển.
                </div>

                <div className="khm-toggle-row">
                  <div>
                    <div className="khm-toggle-label">Cho phép mua khóa học</div>
                    <div className="khm-toggle-sublabel">Học viên có thể tìm thấy và mua khóa học này</div>
                  </div>
                  <label className="khm-toggle">
                    <input type="checkbox" checked={detail.choPhepMua} disabled />
                    <span className="khm-toggle-slider" />
                  </label>
                </div>

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--khm-gray-100)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--khm-gray-800)' }}>Thao tác nguy hiểm</h4>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>

                    <button className="khm-btn khm-btn-danger-ghost" onClick={() => void handleDelete()}>
                      🗑️ Đưa vào thùng rác
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--khm-gray-100)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, color: 'var(--khm-gray-800)' }}>Lịch sử cập nhật</h4>
                  <div className="khm-alert khm-alert-info">
                    📅 Ngày tạo: {new Date(detail.ngayTao).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Certificate toggle confirmation */}
      <ConfirmDialog
        isOpen={!!confirmCertToggle}
        title={confirmCertToggle === 'enable' ? 'Bật chứng chỉ?' : 'Tắt chứng chỉ?'}
        message={
          confirmCertToggle === 'enable'
            ? 'Bật chứng chỉ sẽ yêu cầu học viên hoàn thành bài kiểm tra để nhận chứng nhận.'
            : 'Tắt chứng chỉ có thể ảnh hưởng đến học viên đã có hoặc đang làm bài kiểm tra.'
        }
        confirmText={confirmCertToggle === 'enable' ? 'Bật chứng chỉ' : 'Tắt chứng chỉ'}
        variant={confirmCertToggle === 'disable' ? 'danger' : 'warning'}
        isLoading={savingCert}
        onConfirm={() => void handleConfirmCertToggle()}
        onCancel={() => setConfirmCertToggle(null)}
      />

      {/* Quiz Editor Modal */}
      <QuizEditorModal 
        maKhoaHoc={maKhoaHoc} 
        isOpen={showQuizEditor} 
        onClose={() => setShowQuizEditor(false)} 
      />
    </div>
  );
};

export default CourseManagePage;
