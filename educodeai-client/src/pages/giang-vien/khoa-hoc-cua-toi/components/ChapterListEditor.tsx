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
import type { ChuongHocDetail, BaiHocDetail } from '../types';
import * as api from '../api/khoaHocApi';
import EmptyState from './ui/EmptyState';
import ConfirmDialog from './ui/ConfirmDialog';
import { ListItemSkeleton } from './ui/Skeleton';
import { useToastStandalone } from './ui/Toast';

const getGiangVienId = (): number => {
  try { const u = JSON.parse(localStorage.getItem('user_info') || '{}'); return u.maNguoiDung ?? u.id ?? 1; }
  catch { return 1; }
};

// ---- DnD Chapter Row ----
interface ChapterRowProps {
  chapter: ChuongHocDetail;
  index: number;
  onEdit: (c: ChuongHocDetail) => void;
  onDelete: (c: ChuongHocDetail) => void;
  onViewLessons: (maChuong: number) => void;
  highlightedId?: number | null;
}

const ChapterRow: React.FC<ChapterRowProps> = ({ chapter, index, onEdit, onDelete, onViewLessons, highlightedId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: chapter.maChuong });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [expanded, setExpanded] = useState(false);
  const lessonCount = chapter.danhSachBaiHoc?.length ?? 0;
  const isHighlighted = highlightedId === chapter.maChuong;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: isHighlighted ? 'var(--khm-primary)' : undefined }}
      className={`khm-list-item ${isDragging ? 'dragging' : ''}`}
    >
      <div className="khm-list-item-row">
        {/* Drag handle */}
        <div className="khm-drag-handle" {...attributes} {...listeners} title="Kéo để sắp xếp">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="12" x2="15" y2="12"/>
            <line x1="9" y1="18" x2="15" y2="18"/>
          </svg>
        </div>

        <div className="khm-chapter-number">{index + 1}</div>

        {/* Expand toggle */}
        <button className={`khm-chapter-expand-btn ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(!expanded)} title="Mở/đóng">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        <div className="khm-list-item-info">
          <p className="khm-list-item-title">{chapter.tenChuong}</p>
          <div className="khm-list-item-meta">
            <span className="khm-chapter-lessons-count">{lessonCount} bài học</span>
          </div>
        </div>

        <div className="khm-list-item-actions">
          <button className="khm-btn khm-btn-primary khm-btn-sm" onClick={() => onViewLessons(chapter.maChuong)}>
            Bài học
          </button>
          <button className="khm-btn khm-btn-ghost khm-btn-sm khm-btn-icon" onClick={() => onEdit(chapter)} title="Chỉnh sửa">
            ✏️
          </button>
          <button className="khm-btn khm-btn-danger-ghost khm-btn-sm khm-btn-icon" onClick={() => onDelete(chapter)} title="Xóa">
            🗑
          </button>
        </div>
      </div>

      {/* Lesson preview when expanded */}
      {expanded && lessonCount > 0 && (
        <div className="khm-chapter-lessons-panel">
          {(chapter.danhSachBaiHoc ?? []).slice(0, 4).map((l: BaiHocDetail) => (
            <div key={l.maBaiHoc} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--khm-gray-100)', fontSize: '0.82rem', color: 'var(--khm-gray-700)' }}>
              <span style={{ color: 'var(--khm-gray-300)', fontSize: 12 }}>▷</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.tieuDe}</span>
              <span style={{ color: 'var(--khm-gray-400)', flexShrink: 0 }}>{l.thoiLuong}s</span>
            </div>
          ))}
          {lessonCount > 4 && (
            <button
              onClick={() => onViewLessons(chapter.maChuong)}
              style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--khm-primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              +{lessonCount - 4} bài học khác →
            </button>
          )}
        </div>
      )}
      {expanded && lessonCount === 0 && (
        <div className="khm-chapter-lessons-panel" style={{ textAlign: 'center', color: 'var(--khm-gray-400)', fontSize: '0.82rem', padding: '14px 16px' }}>
          Chương này chưa có bài học. <button className="khm-btn-link" style={{ color: 'var(--khm-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => onViewLessons(chapter.maChuong)}>Thêm bài học</button>
        </div>
      )}
    </div>
  );
};

// ---- Modal (Add/Edit Chapter) ----
interface ChapterModalProps {
  isOpen: boolean;
  editData?: ChuongHocDetail | null;
  isLoading: boolean;
  onSave: (tenChuong: string) => void;
  onClose: () => void;
}
const ChapterModal: React.FC<ChapterModalProps> = ({ isOpen, editData, isLoading, onSave, onClose }) => {
  const [name, setName] = useState(editData?.tenChuong ?? '');
  const [err, setErr] = useState('');

  React.useEffect(() => { setName(editData?.tenChuong ?? ''); setErr(''); }, [editData, isOpen]);

  if (!isOpen) return null;
  const handleSave = () => {
    if (!name.trim()) { setErr('Tên chương không được để trống.'); return; }
    if (name.length > 200) { setErr('Tên chương tối đa 200 ký tự.'); return; }
    onSave(name.trim());
  };
  return (
    <div className="khm-modal-backdrop" onClick={onClose}>
      <div className="khm-modal" onClick={e => e.stopPropagation()}>
        <div className="khm-modal-header">
          <h3 className="khm-modal-title">{editData ? 'Chỉnh sửa chương' : 'Thêm chương mới'}</h3>
          <button className="khm-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="khm-modal-body">
          <div className="khm-form-group">
            <label className="khm-form-label">Tên chương <span className="req">*</span></label>
            <input
              className={`khm-form-input ${err ? 'error' : ''}`}
              placeholder="Ví dụ: Chương 1 - Giới thiệu"
              value={name}
              onChange={e => { setName(e.target.value); setErr(''); }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              disabled={isLoading}
              maxLength={200}
            />
            {err && <div className="khm-form-error">⚠ {err}</div>}
          </div>
        </div>
        <div className="khm-modal-footer">
          <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={onClose} disabled={isLoading}>Hủy</button>
          <button className="khm-btn khm-btn-primary khm-btn-sm" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <><span className="khm-spinner khm-spinner-sm" /> Đang lưu...</> : (editData ? 'Cập nhật' : 'Thêm chương')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Main Component ----
interface Props {
  maKhoaHoc: number;
  initialChapters?: ChuongHocDetail[];
  onSelectChapter: (maChuong: number) => void;
  onRefresh?: () => void;
}

const ChapterListEditor: React.FC<Props> = ({ maKhoaHoc, initialChapters = [], onSelectChapter, onRefresh }) => {
  const maGiangVien = getGiangVienId();
  const { showToast, ToastContainer } = useToastStandalone();

  const [chapters, setChapters] = useState<ChuongHocDetail[]>(
    [...initialChapters].sort((a, b) => a.thuTu - b.thuTu),
  );
  const [loading, setLoading] = useState(!initialChapters.length);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ChuongHocDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChuongHocDetail | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Load (if no initial data)
  const loadChapters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const detail = await api.getChiTietKhoaHoc(maGiangVien, maKhoaHoc);
      setChapters([...detail.danhSachChuong].sort((a, b) => a.thuTu - b.thuTu));
    } catch {
      setError('Không thể tải danh sách chương.');
    } finally { setLoading(false); }
  }, [maGiangVien, maKhoaHoc]);

  // Drag end → reorder
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = chapters.findIndex(c => c.maChuong === active.id);
    const newIndex = chapters.findIndex(c => c.maChuong === over.id);
    const reordered = arrayMove(chapters, oldIndex, newIndex).map((c, i) => ({ ...c, thuTu: i + 1 }));
    setChapters(reordered); // optimistic
    try {
      await api.reorderChuong(maGiangVien, maKhoaHoc, {
        chapterOrders: reordered.map(c => ({ maChuong: c.maChuong, thuTu: c.thuTu })),
      });
      showToast('success', 'Sắp xếp chương thành công!');
    } catch {
      showToast('error', 'Lỗi sắp xếp chương. Đã khôi phục thứ tự cũ.');
      setChapters([...chapters]); // rollback
    }
  }, [chapters, maGiangVien, maKhoaHoc, showToast]);

  // Add/Edit save
  const handleSave = async (tenChuong: string) => {
    try {
      setSaving(true);
      const dto = { tenChuong, thuTu: editTarget ? editTarget.thuTu : chapters.length + 1 };
      if (editTarget) {
        await api.capNhatChuong(maGiangVien, editTarget.maChuong, dto);
        setChapters(prev => prev.map(c => c.maChuong === editTarget.maChuong ? { ...c, tenChuong } : c));
        showToast('success', 'Cập nhật chương thành công!');
      } else {
        const res = await api.themChuong(maGiangVien, maKhoaHoc, dto);
        const newCh: ChuongHocDetail = { maChuong: res.maChuong, tenChuong: res.tenChuong, thuTu: res.thuTu, danhSachBaiHoc: [] };
        setChapters(prev => [...prev, newCh]);
        setHighlightId(res.maChuong);
        setTimeout(() => setHighlightId(null), 2000);
        showToast('success', 'Thêm chương thành công!');
      }
      setModalOpen(false);
      setEditTarget(null);
      onRefresh?.();
    } catch {
      showToast('error', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally { setSaving(false); }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.xoaChuong(maGiangVien, deleteTarget.maChuong);
      setChapters(prev => prev.filter(c => c.maChuong !== deleteTarget.maChuong));
      showToast('success', `Đã xóa chương "${deleteTarget.tenChuong}".`);
      setDeleteTarget(null);
      onRefresh?.();
    } catch {
      showToast('error', 'Lỗi xóa chương. Vui lòng thử lại.');
    } finally { setDeleting(false); }
  };

  if (loading) return <div>{[1,2,3].map(i => <ListItemSkeleton key={i} />)}</div>;
  if (error) return (
    <div className="khm-alert khm-alert-danger">
      {error}
      <button className="khm-btn khm-btn-outline khm-btn-sm" style={{ marginLeft: 12 }} onClick={() => void loadChapters()}>Thử lại</button>
    </div>
  );

  return (
    <div>
      <ToastContainer />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p className="khm-text-muted" style={{ margin: 0 }}>
          {chapters.length > 0 ? `${chapters.length} chương · Kéo để sắp xếp` : 'Chưa có chương nào'}
        </p>
        <button className="khm-btn khm-btn-primary khm-btn-sm" onClick={() => { setEditTarget(null); setModalOpen(true); }}>
          + Thêm chương
        </button>
      </div>

      {chapters.length === 0 ? (
        <EmptyState
          icon="📂"
          title="Chưa có chương học nào"
          description="Tạo chương đầu tiên để tổ chức nội dung khóa học."
          action={
            <button className="khm-btn khm-btn-primary" onClick={() => { setEditTarget(null); setModalOpen(true); }}>
              + Tạo chương đầu tiên
            </button>
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={chapters.map(c => c.maChuong)} strategy={verticalListSortingStrategy}>
            {chapters.map((c, i) => (
              <ChapterRow
                key={c.maChuong}
                chapter={c}
                index={i}
                onEdit={ch => { setEditTarget(ch); setModalOpen(true); }}
                onDelete={setDeleteTarget}
                onViewLessons={onSelectChapter}
                highlightedId={highlightId}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <ChapterModal
        isOpen={modalOpen}
        editData={editTarget}
        isLoading={saving}
        onSave={tenChuong => void handleSave(tenChuong)}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa chương học?"
        message={`Xóa chương "${deleteTarget?.tenChuong}" sẽ xóa tất cả bài học trong chương này. Hành động này không thể khôi phục.`}
        confirmText="Xóa chương"
        variant="danger"
        isLoading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ChapterListEditor;
