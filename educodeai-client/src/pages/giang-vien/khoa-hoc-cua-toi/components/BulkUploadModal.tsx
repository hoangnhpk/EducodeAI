import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as mediaApi from '@/services/media.service';
import * as api from '@/services/khoa-hoc-cua-toi.service';

interface BulkUploadItem {
  id: string;
  file: File;
  title: string;
  sizeMb: number;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMsg?: string;
  videoUrl?: string; // Optional: preview or final url
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  maGiangVien: number;
  maChuong: number;
  currentCount: number;
  onUploadSuccess: (newLessons: any[]) => void;
}

const QueueRow: React.FC<{
  item: BulkUploadItem;
  index: number;
  onTitleChange: (id: string, title: string) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  isUploadingGlobal: boolean;
}> = ({ item, index, onTitleChange, onRemove, onRetry, isUploadingGlobal }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`khm-list-item ${isDragging ? 'dragging' : ''} khm-mb-8`} >
      <div className="khm-list-item-row" style={{ padding: '8px 12px' }}>
        <div className="khm-drag-handle" {...attributes} {...listeners} title="Kéo để sắp xếp">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/>
          </svg>
        </div>
        <div className="khm-list-item-info khm-flex-1" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: '0 0 40px', textAlign: 'center', color: 'var(--khm-gray-500)', fontSize: '0.8rem' }}>
            #{index + 1}
          </div>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              className="khm-form-input khm-form-input-sm" 
              value={item.title} 
              onChange={e => onTitleChange(item.id, e.target.value)}
              disabled={item.status !== 'pending' && item.status !== 'error'}
              placeholder="Tên bài học..."
              style={{ marginBottom: 4 }}
            />
            <div className="khm-text-sm khm-text-muted khm-flex khm-items-center khm-gap-8">
              <span className="khm-truncate" style={{ maxWidth: 200 }}>{item.file.name}</span>
              <span>•</span>
              <span>{item.sizeMb.toFixed(1)} MB</span>
            </div>
          </div>
          <div style={{ flex: '0 0 120px' }}>
             {item.status === 'pending' && <span className="khm-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Chờ tải lên</span>}
             {item.status === 'uploading' && (
               <div style={{ width: '100%' }}>
                 <div className="khm-text-sm khm-text-primary khm-mb-4">Đang tải... {item.progress}%</div>
                 <div style={{ background: '#e2e8f0', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                    <div style={{ background: 'var(--khm-primary)', height: '100%', width: `${item.progress}%`, transition: 'width 0.2s' }} />
                 </div>
               </div>
             )}
             {item.status === 'success' && <span className="khm-badge" style={{ background: '#dcfce7', color: '#166534' }}>✓ Thành công</span>}
             {item.status === 'error' && (
               <div>
                 <span className="khm-badge" style={{ background: '#fee2e2', color: '#991b1b', marginBottom: 4 }}>❌ Lỗi</span>
                 <div className="khm-text-sm khm-text-danger" style={{ fontSize: 10 }}>{item.errorMsg}</div>
               </div>
             )}
          </div>
        </div>
        <div className="khm-list-item-actions">
           {item.status === 'error' && (
             <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={() => onRetry(item.id)}>Thử lại</button>
           )}
           {(item.status === 'pending' || item.status === 'error') && !isUploadingGlobal && (
             <button className="khm-btn khm-btn-danger-ghost khm-btn-sm khm-btn-icon" onClick={() => onRemove(item.id)} title="Xóa">🗑</button>
           )}
        </div>
      </div>
    </div>
  );
};

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, maGiangVien, maChuong, currentCount, onUploadSuccess }) => {
  const [queue, setQueue] = useState<BulkUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [applyAiSubtitles, setApplyAiSubtitles] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!isOpen) {
      setQueue([]);
      setIsUploading(false);
      setApplyAiSubtitles(false);
    }
  }, [isOpen]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const newItems: BulkUploadItem[] = [];
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime']; // quicktime is .mov
    
    Array.from(files).forEach(f => {
      if (allowed.includes(f.type) || f.name.endsWith('.mp4') || f.name.endsWith('.mov')) {
        let title = f.name.replace(/\.[^/.]+$/, ""); // remove extension
        newItems.push({
          id: Math.random().toString(36).substring(7),
          file: f,
          title,
          sizeMb: f.size / (1024 * 1024),
          progress: 0,
          status: 'pending'
        });
      }
    });

    if (newItems.length > 0) {
      // Sort alphabetically by default
      newItems.sort((a, b) => a.title.localeCompare(b.title));
      setQueue(prev => [...prev, ...newItems]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || isUploading) return;
    const oldIdx = queue.findIndex(l => l.id === active.id);
    const newIdx = queue.findIndex(l => l.id === over.id);
    setQueue(arrayMove(queue, oldIdx, newIdx));
  };

  const updateItem = (id: string, updates: Partial<BulkUploadItem>) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const processUploadQueue = async () => {
    if (isUploading) return;
    setIsUploading(true);

    const maxConcurrency = 2;

    const executing = new Set<Promise<void>>();
    const successfulLessons: any[] = [];
    let hasError = false;

    // Snapshot the queue to get fixed indices for thuTu
    const qSnapshot = [...queue];

    const uploadFile = async (item: BulkUploadItem, indexOffset: number) => {
      try {
        updateItem(item.id, { status: 'uploading', progress: 0, errorMsg: undefined });
        
        // 1. Get Signature sequentially for each file just before uploading (Rate Limit prevention)
        const sig = await mediaApi.layChuKyUploadVideo();

        // 2. Upload to Cloudinary
        const uploadResult = await mediaApi.uploadVideoToCloudinary(item.file, sig, (p) => {
           updateItem(item.id, { progress: p });
        });

        // 3. Save to DB
        const duration = Math.round(uploadResult.duration || 0);
        const sizeMb = Math.round((uploadResult.bytes || 0) / 1048576);
        
        const res: any = await api.themBaiHoc(maGiangVien, maChuong, {
            tieuDe: item.title,
            moTa: '',
            linkVideo: uploadResult.secure_url,
            thoiLuong: duration,
            thuTu: currentCount + indexOffset + 1, // Sort order
            videoSource: 'cloudinary',
            videoPublicId: uploadResult.public_id,
            videoSizeMb: sizeMb
        });

        successfulLessons.push({
           maBaiHoc: res.maBaiHoc, tieuDe: item.title, moTa: '',
           linkVideo: uploadResult.secure_url, thoiLuong: duration, thuTu: currentCount + indexOffset + 1,
           loaiBaiHoc: 'Video', videoSource: 'cloudinary', videoPublicId: uploadResult.public_id
        });

        updateItem(item.id, { status: 'success', progress: 100 });
      } catch (error: any) {
         updateItem(item.id, { status: 'error', errorMsg: error.message || 'Lỗi không xác định' });
         throw error; // Throw so we know it failed
      }
    };

    for (let i = 0; i < qSnapshot.length; i++) {
      const item = qSnapshot[i];
      if (item.status === 'success') continue; // Skip already successful (from retry)

      const p = uploadFile(item, i).catch(() => { hasError = true; });
      executing.add(p);
      p.finally(() => executing.delete(p));

      if (executing.size >= maxConcurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);

    setIsUploading(false);
    
    if (successfulLessons.length > 0) {
       onUploadSuccess(successfulLessons);
    }
    
    if (!hasError) {
       // Close modal automatically if no errors
    }
  };

  const handleRetryAllErrors = () => {
     processUploadQueue();
  };

  const pendingCount = queue.filter(q => q.status === 'pending').length;
  const successCount = queue.filter(q => q.status === 'success').length;
  const errorCount = queue.filter(q => q.status === 'error').length;
  const isFinished = queue.length > 0 && queue.every(q => q.status === 'success' || q.status === 'error');

  if (!isOpen) return null;

  return (
    <div className="khm-modal-backdrop">
      <div className="khm-modal khm-modal-xl" onClick={e => e.stopPropagation()} style={{ maxWidth: 900 }}>
        <div className="khm-modal-header">
          <h3 className="khm-modal-title">Tải lên hàng loạt (Bulk Upload)</h3>
          {!isUploading && <button className="khm-modal-close" onClick={onClose}>×</button>}
        </div>
        <div className="khm-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          
          <div className="khm-flex khm-gap-16 khm-mb-24">
             <div className="khm-alert khm-alert-info khm-flex-1" style={{ margin: 0 }}>
               <strong>💡 Mẹo:</strong> Giữ tên file gọn gàng (VD: <code>01-gioi-thieu.mp4</code>) để hệ thống tự động sắp xếp (A-Z).
             </div>
             <div className="khm-flex khm-gap-8 khm-items-center">
                <input 
                  type="file" 
                  multiple 
                  accept="video/mp4,video/webm,video/quicktime" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={e => { handleFilesSelected(e.target.files); e.target.value = ''; }}
                />
                {/* Typescript hack for webkitdirectory */}
                <input 
                  type="file" 
                  multiple 
                  ref={folderInputRef} 
                  style={{ display: 'none' }} 
                  onChange={e => { handleFilesSelected(e.target.files); e.target.value = ''; }}
                  {...({ webkitdirectory: "", directory: "" } as any)}
                />
                <button className="khm-btn khm-btn-outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  + Chọn Files
                </button>
                <button className="khm-btn khm-btn-outline" onClick={() => folderInputRef.current?.click()} disabled={isUploading} title="Chọn cả thư mục (Không hỗ trợ trên iOS Safari)">
                  + Chọn Folder
                </button>
             </div>
          </div>

          {queue.length > 0 ? (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={queue.map(q => q.id)} strategy={verticalListSortingStrategy}>
                  <div className="khm-mb-24">
                    {queue.map((item, idx) => (
                      <QueueRow 
                        key={item.id} 
                        item={item} 
                        index={idx}
                        onTitleChange={(id, t) => updateItem(id, { title: t })}
                        onRemove={id => setQueue(q => q.filter(x => x.id !== id))}
                        onRetry={() => { if(!isUploading) processUploadQueue(); }}
                        isUploadingGlobal={isUploading}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="khm-p-16 khm-border khm-rounded khm-bg-gray-50 khm-mb-16">
                <label className="khm-flex khm-items-center khm-gap-8" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={applyAiSubtitles} onChange={e => setApplyAiSubtitles(e.target.checked)} disabled={isUploading} />
                  <strong>✨ Áp dụng Phụ đề AI cho tất cả video (Phase 4)</strong>
                </label>
                {applyAiSubtitles && (
                  <p className="khm-text-sm khm-text-muted khm-mt-8 khm-mb-0">
                    Hệ thống sẽ tự động tạo phụ đề sau khi tải xong. Tổng chi phí dự kiến sẽ được tính toán ở Phase 4.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="khm-text-center khm-p-60 khm-border khm-border-dashed khm-rounded">
              <div style={{ fontSize: 48, marginBottom: 16 }}>📥</div>
              <h4 className="khm-mb-8">Chưa có video nào</h4>
              <p className="khm-text-muted">Nhấn nút Chọn Files hoặc Chọn Folder ở trên để bắt đầu.</p>
            </div>
          )}

        </div>
        <div className="khm-modal-footer khm-flex-between">
           <div className="khm-text-sm khm-text-muted">
             {queue.length > 0 && `Tổng: ${queue.length} | Đang chờ: ${pendingCount} | Thành công: ${successCount} | Lỗi: ${errorCount}`}
           </div>
           <div className="khm-flex khm-gap-8">
             {!isUploading && <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={onClose}>Đóng</button>}
             
             {queue.length > 0 && !isFinished && !isUploading && (
               <button className="khm-btn khm-btn-primary khm-btn-sm" onClick={processUploadQueue}>
                 ▶ Bắt đầu tải lên
               </button>
             )}
             
             {isUploading && (
               <button className="khm-btn khm-btn-primary khm-btn-sm" disabled>
                 <span className="khm-spinner khm-spinner-sm" /> Đang xử lý...
               </button>
             )}

             {isFinished && errorCount > 0 && !isUploading && (
               <button className="khm-btn khm-btn-danger khm-btn-sm" onClick={handleRetryAllErrors}>
                 Thử lại {errorCount} file lỗi
               </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
