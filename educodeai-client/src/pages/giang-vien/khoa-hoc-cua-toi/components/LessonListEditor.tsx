import React, { useState, useCallback } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BaiHocDetail } from '../types';
import * as api from '../api/khoaHocApi';
import EmptyState from './ui/EmptyState';
import ConfirmDialog from './ui/ConfirmDialog';
import { ListItemSkeleton } from './ui/Skeleton';
import { useToastStandalone } from './ui/Toast';

const getGiangVienId = (): number => {
  try { const u = JSON.parse(localStorage.getItem('user_info') || '{}'); return u.maNguoiDung ?? u.id ?? 1; }
  catch { return 1; }
};

const getYTId = (url?: string): string | null => {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};
const ytThumb = (url?: string) => {
  const id = getYTId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};
const formatDur = (s: number) => { const m = Math.floor(s / 60); return `${m}:${(s % 60).toString().padStart(2, '0')}`; };

// ---- Lesson modal ----
interface LessonModalProps {
  isOpen: boolean;
  editData?: BaiHocDetail | null;
  currentCount: number;
  isLoading: boolean;
  onSave: (type: 'Video' | 'File', dto: any) => void;
  onClose: () => void;
}
const LessonModal: React.FC<LessonModalProps> = ({ isOpen, editData, currentCount, isLoading, onSave, onClose }) => {
  const isEdit = !!editData;
  const initialType = editData?.loaiBaiHoc === 'File' ? 'File' : 'Video';
  const [loaiBaiHoc, setLoaiBaiHoc] = useState<'Video' | 'File'>(initialType);
  const [tieuDe, setTieuDe] = useState(editData?.tieuDe ?? '');
  const [moTa, setMoTa] = useState(editData?.moTa ?? '');
  const [linkVideo, setLinkVideo] = useState(editData?.linkVideo ?? '');
  const [thoiLuong, setThoiLuong] = useState(editData?.thoiLuong ?? 0);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isYT = editData?.linkVideo && getYTId(editData.linkVideo);

  React.useEffect(() => {
    setLoaiBaiHoc(editData?.loaiBaiHoc === 'File' ? 'File' : 'Video');
    setTieuDe(editData?.tieuDe ?? '');
    setMoTa(editData?.moTa ?? '');
    setLinkVideo(editData?.linkVideo ?? '');
    setThoiLuong(editData?.thoiLuong ?? 0);
    setFile(null);
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;
  const validate = () => {
    const e: Record<string, string> = {};
    if (!tieuDe.trim()) e.tieuDe = 'Tiêu đề bài học không được để trống.';
    if (tieuDe.length > 200) e.tieuDe = 'Tiêu đề tối đa 200 ký tự.';
    if (loaiBaiHoc === 'File' && !isEdit && !file) e.file = 'Vui lòng chọn file tĩnh.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (loaiBaiHoc === 'Video') {
      onSave('Video', { tieuDe: tieuDe.trim(), moTa: moTa.trim(), linkVideo: linkVideo.trim(), thoiLuong, thuTu: editData?.thuTu ?? currentCount + 1 });
    } else {
      onSave('File', { tieuDe: tieuDe.trim(), moTa: moTa.trim(), file, thuTu: editData?.thuTu ?? currentCount + 1 });
    }
  };

  return (
    <div className="khm-modal-backdrop" onClick={onClose}>
      <div className="khm-modal khm-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="khm-modal-header">
          <h3 className="khm-modal-title">{isEdit ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}</h3>
          <button className="khm-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="khm-modal-body">
          {!isEdit && (
            <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="radio" name="loai" checked={loaiBaiHoc === 'Video'} onChange={() => setLoaiBaiHoc('Video')} />
                Video (YouTube)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="radio" name="loai" checked={loaiBaiHoc === 'File'} onChange={() => setLoaiBaiHoc('File')} />
                Tài liệu (File)
              </label>
            </div>
          )}

          {isYT && (
            <div className="khm-alert khm-alert-info" style={{ marginBottom: 16 }}>
              🎬 Bài học này được import từ YouTube. Chỉ có thể chỉnh sửa tiêu đề và mô tả.
            </div>
          )}
          
          <div className="khm-form-group">
            <label className="khm-form-label">Tiêu đề <span className="req">*</span></label>
            <input
              className={`khm-form-input ${errors.tieuDe ? 'error' : ''}`}
              value={tieuDe}
              onChange={e => { setTieuDe(e.target.value); setErrors(p => ({ ...p, tieuDe: '' })); }}
              placeholder="Nhập tiêu đề bài học..."
              autoFocus disabled={isLoading} maxLength={200}
            />
            {errors.tieuDe && <div className="khm-form-error">⚠ {errors.tieuDe}</div>}
          </div>
          
          <div className="khm-form-group">
            <label className="khm-form-label">Mô tả</label>
            <textarea className="khm-form-textarea" value={moTa} onChange={e => setMoTa(e.target.value)} disabled={isLoading} rows={3} placeholder="Mô tả nội dung bài học..." />
          </div>

          {loaiBaiHoc === 'Video' ? (
            !isYT && (
              <div className="khm-form-grid-2">
                <div className="khm-form-group">
                  <label className="khm-form-label">Link YouTube</label>
                  <input className="khm-form-input" value={linkVideo} onChange={e => setLinkVideo(e.target.value)} disabled={isLoading} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div className="khm-form-group">
                  <label className="khm-form-label">Thời lượng (giây)</label>
                  <input type="number" min={0} className="khm-form-input" value={thoiLuong} onChange={e => setThoiLuong(Number(e.target.value))} disabled={isLoading} />
                </div>
              </div>
            )
          ) : (
            <div className="khm-form-group">
              <label className="khm-form-label">Tài liệu đính kèm {isEdit && '(Bỏ qua nếu không đổi file)'}</label>
              <input 
                type="file" 
                onChange={e => { setFile(e.target.files?.[0] || null); setErrors(p => ({ ...p, file: '' })) }} 
                disabled={isLoading} 
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                className={`khm-form-input ${errors.file ? 'error' : ''}`} 
                style={{ padding: '6px 10px' }} 
              />
              {errors.file && <div className="khm-form-error">⚠ {errors.file}</div>}
              {isEdit && linkVideo && !file && (
                <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                  File hiện tại: <a href={linkVideo} target="_blank" rel="noreferrer" style={{ color: 'var(--khm-primary)' }}>{linkVideo.split('/').pop()}</a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="khm-modal-footer">
          <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={onClose} disabled={isLoading}>Hủy</button>
          <button className="khm-btn khm-btn-primary khm-btn-sm" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <><span className="khm-spinner khm-spinner-sm" /> Đang lưu...</> : (isEdit ? 'Cập nhật' : 'Thêm bài học')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Video Preview Modal ----
const VideoPreviewModal: React.FC<{ lesson: BaiHocDetail | null; onClose: () => void }> = ({ lesson, onClose }) => {
  if (!lesson) return null;
  const ytId = getYTId(lesson.linkVideo);
  const isFile = lesson.loaiBaiHoc === 'File';

  return (
    <div className="khm-modal-backdrop" onClick={onClose}>
      <div className="khm-modal khm-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="khm-modal-header">
          <h3 className="khm-modal-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.tieuDe}</h3>
          <button className="khm-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="khm-modal-body" style={{ padding: 0 }}>
          {isFile ? (
            <div style={{ padding: 60, textAlign: 'center', background: 'var(--khm-gray-50)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
              <h4 style={{ marginBottom: 16, color: 'var(--khm-gray-800)' }}>Đây là tài liệu đính kèm</h4>
              <a href={lesson.linkVideo} target="_blank" rel="noreferrer" className="khm-btn khm-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                ⬇ Tải xuống / Mở tài liệu
              </a>
            </div>
          ) : ytId ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
              <iframe
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={lesson.tieuDe}
              />
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--khm-gray-400)' }}>
              Không có video để xem trước.
            </div>
          )}
          {lesson.moTa && (
            <p style={{ padding: '14px 20px', margin: 0, fontSize: '0.875rem', color: 'var(--khm-gray-600)', borderTop: '1px solid var(--khm-gray-100)' }}>
              {lesson.moTa}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ---- DnD Lesson Row ----
const LessonRow: React.FC<{
  lesson: BaiHocDetail; index: number;
  onEdit: (l: BaiHocDetail) => void;
  onDelete: (l: BaiHocDetail) => void;
  onPreview: (l: BaiHocDetail) => void;
}> = ({ lesson, index, onEdit, onDelete, onPreview }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.maBaiHoc });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const ytId = getYTId(lesson.linkVideo);
  const thumb = ytId ? ytThumb(lesson.linkVideo) : null;
  const isYT = !!ytId;
  const isFile = lesson.loaiBaiHoc === 'File';

  return (
    <div ref={setNodeRef} style={style} className={`khm-list-item ${isDragging ? 'dragging' : ''}`}>
      <div className="khm-list-item-row">
        <div className="khm-drag-handle" {...attributes} {...listeners} title="Kéo để sắp xếp">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/>
          </svg>
        </div>

        {/* Thumbnail */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {isFile ? (
             <div className="khm-list-item-thumb-placeholder" style={{ background: 'var(--khm-gray-100)', color: 'var(--khm-primary)', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>
          ) : thumb ? (
            <img src={thumb} alt={lesson.tieuDe} className="khm-list-item-thumb" />
          ) : (
            <div className="khm-list-item-thumb-placeholder">🎥</div>
          )}
          {((isYT && thumb) || isFile) && (
            <button
              onClick={() => onPreview(lesson)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, borderRadius: 6 }}
              title="Xem"
            >▶</button>
          )}
        </div>

        <div className="khm-list-item-info">
          <p className="khm-list-item-title">{lesson.tieuDe}</p>
          <div className="khm-list-item-meta">
            <span>#{index + 1}</span>
            {lesson.thoiLuong > 0 && <span>⏱ {formatDur(lesson.thoiLuong)}</span>}
            {isYT && <span className="khm-badge khm-badge-yt" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>YouTube</span>}
            {isFile && <span className="khm-badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.68rem', padding: '1px 6px', borderRadius: 4 }}>Tài liệu</span>}
          </div>
        </div>

        <div className="khm-list-item-actions">
          {((isYT && thumb) || isFile) && (
            <button className="khm-btn khm-btn-ghost khm-btn-sm khm-btn-icon" onClick={() => onPreview(lesson)} title="Xem">▶</button>
          )}
          <button className="khm-btn khm-btn-ghost khm-btn-sm khm-btn-icon" onClick={() => onEdit(lesson)} title="Chỉnh sửa">✏️</button>
          <button className="khm-btn khm-btn-danger-ghost khm-btn-sm khm-btn-icon" onClick={() => onDelete(lesson)} title="Xóa">🗑</button>
        </div>
      </div>
    </div>
  );
};

// ---- Main Component ----
interface Props {
  maChuong: number;
  tenChuong: string;
  initialLessons?: BaiHocDetail[];
  onImportYT?: () => void;
}

const LessonListEditor: React.FC<Props> = ({ maChuong, tenChuong, initialLessons = [], onImportYT }) => {
  const maGiangVien = getGiangVienId();
  const { showToast, ToastContainer } = useToastStandalone();

  const [lessons, setLessons] = useState<BaiHocDetail[]>(
    [...initialLessons].sort((a, b) => a.thuTu - b.thuTu)
  );
  const [loading, setLoading] = useState(!initialLessons.length && maChuong > 0);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BaiHocDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BaiHocDetail | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<BaiHocDetail | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const loadLessons = useCallback(async () => {
    if (!maChuong) return;
    try {
      setLoading(true); setError(null);
      const detail = await api.getChiTietKhoaHoc(maGiangVien, 0); // placeholder
      // Since we don't have a get-lessons-by-chapter endpoint, use chapter data from detail
      // This is a fallback; ideally the parent passes lessons
      void detail;
    } catch {
      setError('Không thể tải bài học.');
    } finally { setLoading(false); }
  }, [maChuong, maGiangVien]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = lessons.findIndex(l => l.maBaiHoc === active.id);
    const newIdx = lessons.findIndex(l => l.maBaiHoc === over.id);
    const reordered = arrayMove(lessons, oldIdx, newIdx).map((l, i) => ({ ...l, thuTu: i + 1 }));
    setLessons(reordered);
    try {
      await api.reorderBaiHoc(maGiangVien, maChuong, {
        lessonOrders: reordered.map(l => ({ maBaiHoc: l.maBaiHoc, thuTu: l.thuTu })),
      });
      showToast('success', 'Sắp xếp bài học thành công!');
    } catch {
      showToast('error', 'Lỗi sắp xếp. Đã khôi phục thứ tự cũ.');
      setLessons([...lessons]);
    }
  }, [lessons, maGiangVien, maChuong, showToast]);

  const handleSave = async (type: 'Video' | 'File', dto: any) => {
    try {
      setSaving(true);
      if (editTarget) {
        if (type === 'Video') {
          await api.capNhatBaiHoc(maGiangVien, editTarget.maBaiHoc, dto);
        } else {
          await api.capNhatBaiHocFile(editTarget.maBaiHoc, dto);
        }
        setLessons(prev => prev.map(l => l.maBaiHoc === editTarget.maBaiHoc ? { ...l, tieuDe: dto.tieuDe, moTa: dto.moTa, thoiLuong: dto.thoiLuong || 0, linkVideo: (type === 'Video' ? dto.linkVideo : l.linkVideo) } : l));
        showToast('success', 'Cập nhật bài học thành công! (Tải lại trang để thấy file mới nhất)');
      } else {
        let res: any;
        if (type === 'Video') {
           res = await api.themBaiHoc(maGiangVien, maChuong, dto);
        } else {
           res = await api.themBaiHocFile(maChuong, dto);
        }
        setLessons(prev => [...prev, { maBaiHoc: res.maBaiHoc, tieuDe: res.tieuDe, moTa: res.moTa, linkVideo: res.linkVideo, thoiLuong: res.thoiLuong || 0, thuTu: res.thuTu, loaiBaiHoc: type }]);
        showToast('success', 'Thêm bài học thành công!');
      }
      setModalOpen(false); setEditTarget(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally { setSaving(false); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.xoaBaiHoc(maGiangVien, deleteTarget.maBaiHoc);
      setLessons(prev => prev.filter(l => l.maBaiHoc !== deleteTarget.maBaiHoc));
      showToast('success', `Đã xóa bài học "${deleteTarget.tieuDe}".`);
      setDeleteTarget(null);
    } catch {
      showToast('error', 'Lỗi xóa bài học.');
    } finally { setDeleting(false); }
  };

  if (loading) return <div>{[1,2,3,4].map(i => <ListItemSkeleton key={i} />)}</div>;
  if (error) return (
    <div className="khm-alert khm-alert-danger">
      {error}
      <button className="khm-btn khm-btn-outline khm-btn-sm" style={{ marginLeft: 12 }} onClick={() => void loadLessons()}>Thử lại</button>
    </div>
  );

  return (
    <div>
      <ToastContainer />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <p className="khm-text-muted" style={{ margin: 0 }}>
          Chương: <strong>{tenChuong}</strong> · {lessons.length} bài học
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {onImportYT && (
            <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={onImportYT}>
              ▶ Import YouTube
            </button>
          )}
          <button className="khm-btn khm-btn-primary khm-btn-sm" onClick={() => { setEditTarget(null); setModalOpen(true); }}>
            + Thêm bài học
          </button>
        </div>
      </div>

      {lessons.length === 0 ? (
        <EmptyState
          icon="🎥"
          title="Chương này chưa có bài học nào"
          description="Import từ YouTube playlist hoặc thêm bài học thủ công."
          action={
            <div style={{ display: 'flex', gap: 10 }}>
              {onImportYT && (
                <button className="khm-btn khm-btn-primary" onClick={onImportYT}>▶ Import YouTube</button>
              )}
              <button className="khm-btn khm-btn-outline" onClick={() => { setEditTarget(null); setModalOpen(true); }}>+ Thêm thủ công</button>
            </div>
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={lessons.map(l => l.maBaiHoc)} strategy={verticalListSortingStrategy}>
            {lessons.map((l, i) => (
              <LessonRow
                key={l.maBaiHoc} lesson={l} index={i}
                onEdit={lesson => { setEditTarget(lesson); setModalOpen(true); }}
                onDelete={setDeleteTarget}
                onPreview={setPreviewLesson}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <LessonModal
        isOpen={modalOpen}
        editData={editTarget}
        currentCount={lessons.length}
        isLoading={saving}
        onSave={(type, dto) => void handleSave(type, dto)}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa bài học?"
        message={`Xóa bài học "${deleteTarget?.tieuDe}" không thể khôi phục. Bạn có chắc chắn không?`}
        confirmText="Xóa bài học"
        variant="danger"
        isLoading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <VideoPreviewModal lesson={previewLesson} onClose={() => setPreviewLesson(null)} />
    </div>
  );
};

export default LessonListEditor;
