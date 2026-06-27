import React, { useState } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BaiHocDetail } from '../types';
import EmptyState from './ui/EmptyState';
import ConfirmDialog from './ui/ConfirmDialog';
import { ListItemSkeleton } from './ui/Skeleton';
import { useLessonManagement } from '../hooks/useLessonManagement';
import BulkUploadModal from './BulkUploadModal';

const getGiangVienId = (): number => {
  try {
    const u = JSON.parse(localStorage.getItem('user_info') || '{}');
    return u.maNguoiDung ?? u.id ?? 1;
  } catch { return 1; }
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
  uploadProgress: number | null;
  onSave: (type: 'Video' | 'File' | 'VideoUpload', dto: any) => void;
  onClose: () => void;
}
const LessonModal: React.FC<LessonModalProps> = ({ isOpen, editData, currentCount, isLoading, uploadProgress, onSave, onClose }) => {
  const isEdit = !!editData;
  const initialType = editData?.loaiBaiHoc === 'File' ? 'File' : 'Video';
  const [loaiBaiHoc, setLoaiBaiHoc] = useState<'Video' | 'File' | 'VideoUpload'>(initialType);
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
    if (loaiBaiHoc === 'VideoUpload' && !isEdit && !file) e.file = 'Vui lòng chọn video để tải lên.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (loaiBaiHoc === 'Video') {
      onSave('Video', { tieuDe: tieuDe.trim(), moTa: moTa.trim(), linkVideo: linkVideo.trim(), thoiLuong, thuTu: editData?.thuTu ?? currentCount + 1 });
    } else if (loaiBaiHoc === 'VideoUpload') {
      onSave('VideoUpload', { tieuDe: tieuDe.trim(), moTa: moTa.trim(), file, thuTu: editData?.thuTu ?? currentCount + 1 });
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
            <div className="khm-flex khm-gap-16 khm-mb-16">
              <label className="khm-flex khm-items-center khm-gap-8" style={{ cursor: 'pointer' }}>
                <input type="radio" name="loai" checked={loaiBaiHoc === 'Video'} onChange={() => setLoaiBaiHoc('Video')} />
                Video (YouTube)
              </label>
              <label className="khm-flex khm-items-center khm-gap-8" style={{ cursor: 'pointer' }}>
                <input type="radio" name="loai" checked={loaiBaiHoc === 'VideoUpload'} onChange={() => setLoaiBaiHoc('VideoUpload')} />
                Video (Tải lên)
              </label>
              <label className="khm-flex khm-items-center khm-gap-8" style={{ cursor: 'pointer' }}>
                <input type="radio" name="loai" checked={loaiBaiHoc === 'File'} onChange={() => setLoaiBaiHoc('File')} />
                Tài liệu (File)
              </label>
            </div>
          )}

          {isYT && (
            <div className="khm-alert khm-alert-info khm-mb-16">
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
          ) : loaiBaiHoc === 'VideoUpload' ? (
            <div className="khm-form-group">
              <label className="khm-form-label">Video đính kèm {isEdit && '(Bỏ qua nếu không đổi video)'}</label>
              <input 
                type="file" 
                onChange={e => { setFile(e.target.files?.[0] || null); setErrors(p => ({ ...p, file: '' })) }} 
                disabled={isLoading} 
                accept="video/mp4,video/webm,video/ogg"
                className={`khm-form-input ${errors.file ? 'error' : ''}`} 
                style={{ padding: '6px 10px' }} 
              />
              {errors.file && <div className="khm-form-error">⚠ {errors.file}</div>}
              {uploadProgress !== null && (
                <div className="khm-mt-8">
                  <div style={{ background: '#e2e8f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{ background: 'var(--khm-primary)', height: '100%', width: `${uploadProgress}%`, transition: 'width 0.2s' }} />
                  </div>
                  <div className="khm-text-sm khm-text-muted khm-mt-4 khm-flex khm-gap-8 khm-items-center">
                    <span className="khm-spinner khm-spinner-sm" /> Đang xử lý tải lên: {uploadProgress}% (Vui lòng không đóng cửa sổ)
                  </div>
                </div>
              )}
            </div>
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
                <div className="khm-mt-8 khm-text-sm">
                  File hiện tại: <a href={linkVideo} target="_blank" rel="noreferrer" className="khm-text-primary">{linkVideo.split('/').pop()}</a>
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
          <h3 className="khm-modal-title khm-truncate">{lesson.tieuDe}</h3>
          <button className="khm-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="khm-modal-body khm-p-0">
          {isFile ? (
            <div className="khm-text-center khm-p-60" style={{ background: 'var(--khm-gray-50)' }}>
              <div className="khm-mb-16" style={{ fontSize: 40 }}>📄</div>
              <h4 className="khm-mb-16" style={{ color: 'var(--khm-gray-800)' }}>Đây là tài liệu đính kèm</h4>
              <a href={lesson.linkVideo} target="_blank" rel="noreferrer" className="khm-btn khm-btn-primary khm-flex khm-items-center" style={{ textDecoration: 'none' }}>
                ⬇ Tải xuống / Mở tài liệu
              </a>
            </div>
          ) : ytId ? (
            <div className="khm-relative" style={{ paddingBottom: '56.25%', background: '#000' }}>
              <iframe
                className="khm-absolute-inset"
                style={{ width: '100%', height: '100%', border: 'none' }}
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={lesson.tieuDe}
              />
            </div>
          ) : lesson.videoSource === 'cloudinary' ? (
            <div className="khm-relative" style={{ background: '#000' }}>
               <video 
                 controls 
                 controlsList="nodownload" 
                 width="100%" 
                 src={lesson.linkVideo} 
                 poster={lesson.linkVideo ? lesson.linkVideo.replace('.mp4', '.jpg').replace('.webm', '.jpg') : undefined}
               >
                 Trình duyệt không hỗ trợ phát video.
               </video>
            </div>
          ) : (
            <div className="khm-text-center" style={{ padding: 40, color: 'var(--khm-gray-400)' }}>
              Không có video để xem trước.
            </div>
          )}
          {lesson.moTa && (
            <p className="khm-text-sm" style={{ padding: '14px 20px', margin: 0, color: 'var(--khm-gray-600)', borderTop: '1px solid var(--khm-gray-100)' }}>
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
        <div className="khm-relative" style={{ flexShrink: 0 }}>
          {isFile ? (
             <div className="khm-list-item-thumb-placeholder khm-flex khm-items-center" style={{ color: 'var(--khm-primary)', fontSize: 24, justifyContent: 'center' }}>📄</div>
          ) : thumb ? (
            <img src={thumb} alt={lesson.tieuDe} className="khm-list-item-thumb" />
          ) : lesson.videoSource === 'cloudinary' ? (
            <img src={lesson.linkVideo?.replace('.mp4', '.jpg').replace('.webm', '.jpg')} alt={lesson.tieuDe} className="khm-list-item-thumb" />
          ) : (
            <div className="khm-list-item-thumb-placeholder">🎥</div>
          )}
          {((isYT && thumb) || isFile || lesson.videoSource === 'cloudinary') && (
            <button
              onClick={() => onPreview(lesson)}
              className="khm-absolute-inset khm-flex khm-items-center"
              style={{ background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer', justifyContent: 'center', color: 'white', fontSize: 16, borderRadius: 6 }}
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
          {((isYT && thumb) || isFile || lesson.videoSource === 'cloudinary') && (
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
  const {
    lessons, loading, error, modalOpen, editTarget, saving, deleteTarget, deleting, previewLesson,
    uploadProgress, setLessons,
    setModalOpen, setEditTarget, setDeleteTarget, setPreviewLesson,
    loadLessons, handleDragEnd, handleSave, handleConfirmDelete,
    ToastContainer
  } = useLessonManagement({ maChuong, initialLessons });

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const maGiangVien = getGiangVienId();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
      <div className="khm-flex-between khm-mb-16" style={{ flexWrap: 'wrap', gap: 8 }}>
        <p className="khm-text-muted" style={{ margin: 0 }}>
          Chương: <strong>{tenChuong}</strong> · {lessons.length} bài học
        </p>
        <div className="khm-flex khm-gap-8">
          {onImportYT && (
            <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={onImportYT}>
              ▶ Import YouTube
            </button>
          )}
          <button className="khm-btn khm-btn-secondary khm-btn-sm" onClick={() => setBulkModalOpen(true)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
            📥 Tải lên Hàng loạt
          </button>
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
            <div className="khm-flex khm-gap-10">
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
        uploadProgress={uploadProgress}
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

      <BulkUploadModal 
        isOpen={bulkModalOpen} 
        onClose={() => setBulkModalOpen(false)} 
        maGiangVien={maGiangVien} 
        maChuong={maChuong} 
        currentCount={lessons.length} 
        onUploadSuccess={(newLessons) => {
           setLessons(prev => {
             const updated = [...prev, ...newLessons];
             return updated.sort((a, b) => a.thuTu - b.thuTu);
           });
           setBulkModalOpen(false);
        }} 
      />

      <VideoPreviewModal lesson={previewLesson} onClose={() => setPreviewLesson(null)} />
    </div>
  );
};

export default LessonListEditor;
