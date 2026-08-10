import React, { useState, useRef } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ChuongHocDetail, BaiHocDetail } from '../types';
import { useModalA11y } from '@/hooks/useModalA11y';
import EmptyState from './ui/EmptyState';
import ConfirmDialog from './ui/ConfirmDialog';
import { ListItemSkeleton } from './ui/Skeleton';
import { useChapterManagement } from '../hooks/useChapterManagement';

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
            <div key={l.maBaiHoc} className="khm-flex khm-items-center khm-gap-10 khm-border-bottom khm-text-sm" style={{ padding: '6px 0', color: 'var(--khm-gray-700)' }}>
              <span className="khm-text-xs" style={{ color: 'var(--khm-gray-300)' }}>▷</span>
              <span className="khm-truncate" style={{ flex: 1 }}>{l.tieuDe}</span>
              <span style={{ color: 'var(--khm-gray-400)', flexShrink: 0 }}>{l.thoiLuong}s</span>
            </div>
          ))}
          {lessonCount > 4 && (
            <button
              onClick={() => onViewLessons(chapter.maChuong)}
              className="khm-mt-8 khm-text-primary khm-font-semibold khm-text-sm"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              +{lessonCount - 4} bài học khác →
            </button>
          )}
        </div>
      )}
      {expanded && lessonCount === 0 && (
        <div className="khm-chapter-lessons-panel khm-text-center khm-text-sm" style={{ color: 'var(--khm-gray-400)', padding: '14px 16px' }}>
          Chương này chưa có bài học. <button className="khm-btn-link khm-text-primary khm-font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onViewLessons(chapter.maChuong)}>Thêm bài học</button>
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
  onSave: (tenChuong: string | string[]) => void;
  onClose: () => void;
}
const ChapterModal: React.FC<ChapterModalProps> = ({ isOpen, editData, isLoading, onSave, onClose }) => {
  const [name, setName] = useState(editData?.tenChuong ?? '');
  const [err, setErr] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => { setName(editData?.tenChuong ?? ''); setErr(''); }, [editData, isOpen]);

  useModalA11y(isOpen && !isLoading, onClose, panelRef);

  if (!isOpen) return null;
  const handleSave = () => {
    if (editData) {
      const trimmedName = name.trim();
      if (!trimmedName) { setErr('Tên chương không được để trống.'); return; }
      if (trimmedName.length > 200) { setErr('Tên chương tối đa 200 ký tự.'); return; }
      onSave(trimmedName);
      return;
    }

    const names = name.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
    if (!names.length) { setErr('Vui lòng nhập ít nhất một tên chương.'); return; }
    const invalidIndex = names.findIndex(item => item.length > 200);
    if (invalidIndex >= 0) { setErr(`Tên chương ở dòng ${invalidIndex + 1} tối đa 200 ký tự.`); return; }
    onSave(names);
  };
  return (
    <div className="khm-modal-backdrop" onClick={onClose}>
      <div className="khm-modal" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="chapter-modal-title" onClick={e => e.stopPropagation()}>
        <div className="khm-modal-header">
          <h3 className="khm-modal-title" id="chapter-modal-title">{editData ? 'Chỉnh sửa chương' : 'Thêm chương mới'}</h3>
          <button className="khm-modal-close" onClick={onClose} aria-label="Đóng">×</button>
        </div>
        <div className="khm-modal-body">
          <div className="khm-form-group">
            <label className="khm-form-label">Tên chương <span className="req">*</span></label>
            {editData ? (
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
            ) : (
              <textarea
                className={`khm-form-input ${err ? 'error' : ''}`}
                placeholder={'Nhập danh sách tên chương, mỗi chương trên 1 dòng. Ví dụ:\nChương 1: Tổng quan\nChương 2: Cài đặt môi trường\nChương 3: Bắt đầu dự án'}
                value={name}
                onChange={e => { setName(e.target.value); setErr(''); }}
                autoFocus
                disabled={isLoading}
                rows={7}
              />
            )}
            {err && <div className="khm-form-error">⚠ {err}</div>}
          </div>
        </div>
        <div className="khm-modal-footer">
          <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={onClose} disabled={isLoading}>Hủy</button>
          <button className="khm-btn khm-btn-primary khm-btn-sm" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <><span className="khm-spinner khm-spinner-sm" /> Đang lưu...</> : (editData ? 'Cập nhật' : 'Thêm danh sách chương')}
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
  const {
    chapters, loading, error, modalOpen, editTarget, saving, deleteTarget, deleting, highlightId,
    setModalOpen, setEditTarget, setDeleteTarget,
    loadChapters, handleDragEnd, handleSave, handleConfirmDelete,
    ToastContainer
  } = useChapterManagement({ maKhoaHoc, initialChapters, onRefresh });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
      <div className="khm-flex-between khm-mb-16">
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
