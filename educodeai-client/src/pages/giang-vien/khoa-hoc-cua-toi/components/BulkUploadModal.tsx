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
  tieuDe: string;
  dungLuongMb: number;
  tienDo: number;
  trangThai: 'cho_xu_ly' | 'dang_tai' | 'thanh_cong' | 'loi';
  thongBaoLoi?: string;
}

interface BulkUploadModalProps {
  dangMo: boolean;
  dongModal: () => void;
  maGiangVien: number;
  maChuong: number;
  soLuongHienTai: number;
  khiTaiLenThanhCong: (baiHocMoi: any[]) => void;
}

const QueueRow: React.FC<{
  item: BulkUploadItem;
  chiSo: number;
  khiDoiTieuDe: (id: string, tieuDe: string) => void;
  khiXoa: (id: string) => void;
  khiThuLai: (id: string) => void;
  dangTaiLenToanCuc: boolean;
}> = ({ item, chiSo, khiDoiTieuDe, khiXoa, khiThuLai, dangTaiLenToanCuc }) => {
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
            #{chiSo + 1}
          </div>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              className="khm-form-input khm-form-input-sm" 
              value={item.tieuDe} 
              onChange={e => khiDoiTieuDe(item.id, e.target.value)}
              disabled={item.trangThai !== 'cho_xu_ly' && item.trangThai !== 'loi'}
              placeholder="Tên bài học..."
              style={{ marginBottom: 4 }}
            />
            <div className="khm-text-sm khm-text-muted khm-flex khm-items-center khm-gap-8">
              <span className="khm-truncate" style={{ maxWidth: 200 }}>{item.file.name}</span>
              <span>•</span>
              <span>{item.dungLuongMb.toFixed(1)} MB</span>
            </div>
          </div>
          <div style={{ flex: '0 0 120px' }}>
             {item.trangThai === 'cho_xu_ly' && <span className="khm-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Chờ tải lên</span>}
             {item.trangThai === 'dang_tai' && (
               <div style={{ width: '100%' }}>
                 <div className="khm-text-sm khm-text-primary khm-mb-4">Đang tải... {item.tienDo}%</div>
                 <div style={{ background: '#e2e8f0', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                    <div style={{ background: 'var(--khm-primary)', height: '100%', width: `${item.tienDo}%`, transition: 'width 0.2s' }} />
                 </div>
               </div>
             )}
             {item.trangThai === 'thanh_cong' && <span className="khm-badge" style={{ background: '#dcfce7', color: '#166534' }}>✓ Thành công</span>}
             {item.trangThai === 'loi' && (
               <div>
                 <span className="khm-badge" style={{ background: '#fee2e2', color: '#991b1b', marginBottom: 4 }}>❌ Lỗi</span>
                 <div className="khm-text-sm khm-text-danger" style={{ fontSize: 10 }}>{item.thongBaoLoi}</div>
               </div>
             )}
          </div>
        </div>
        <div className="khm-list-item-actions">
           {item.trangThai === 'loi' && (
             <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={() => khiThuLai(item.id)}>Thử lại</button>
           )}
           {(item.trangThai === 'cho_xu_ly' || item.trangThai === 'loi') && !dangTaiLenToanCuc && (
             <button className="khm-btn khm-btn-danger-ghost khm-btn-sm khm-btn-icon" onClick={() => khiXoa(item.id)} title="Xóa">🗑</button>
           )}
        </div>
      </div>
    </div>
  );
};

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ dangMo, dongModal, maGiangVien, maChuong, soLuongHienTai, khiTaiLenThanhCong }) => {
  const [hangDoi, setHangDoi] = useState<BulkUploadItem[]>([]);
  const [dangTaiLen, setDangTaiLen] = useState(false);
  const [apDungPhuDeAI, setApDungPhuDeAI] = useState(false);
  
  const refInputFile = useRef<HTMLInputElement>(null);
  const refInputFolder = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!dangMo) {
      setHangDoi([]);
      setDangTaiLen(false);
      setApDungPhuDeAI(false);
    }
  }, [dangMo]);

  const xuLyChonFile = (files: FileList | null) => {
    if (!files) return;
    const itemsMoi: BulkUploadItem[] = [];
    const choPhep = ['video/mp4', 'video/webm', 'video/quicktime']; // quicktime is .mov
    
    Array.from(files).forEach(f => {
      if (choPhep.includes(f.type) || f.name.endsWith('.mp4') || f.name.endsWith('.mov')) {
        const dungLuongMb = f.size / (1024 * 1024);
        if (dungLuongMb > 2000) {
          alert(`File ${f.name} vượt quá dung lượng tối đa 2GB.`);
          return;
        }
        let tieuDe = f.name.replace(/\.[^/.]+$/, ""); // remove extension
        itemsMoi.push({
          id: Math.random().toString(36).substring(7),
          file: f,
          tieuDe,
          dungLuongMb,
          tienDo: 0,
          trangThai: 'cho_xu_ly'
        });
      } else {
        alert(`File ${f.name} không đúng định dạng video hỗ trợ.`);
      }
    });

    if (itemsMoi.length > 0) {
      // Sort alphabetically by default
      itemsMoi.sort((a, b) => a.tieuDe.localeCompare(b.tieuDe));
      setHangDoi(prev => [...prev, ...itemsMoi]);
    }
  };

  const xuLyKeoTha = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || dangTaiLen) return;
    const oldIdx = hangDoi.findIndex(l => l.id === active.id);
    const newIdx = hangDoi.findIndex(l => l.id === over.id);
    setHangDoi(arrayMove(hangDoi, oldIdx, newIdx));
  };

  const capNhatItem = (id: string, updates: Partial<BulkUploadItem>) => {
    setHangDoi(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const xuLyTaiLenHangDoi = async () => {
    if (dangTaiLen) return;
    setDangTaiLen(true);

    const dongThoiToiDa = 2;

    const dangThucThi = new Set<Promise<void>>();
    const danhSachThanhCong: any[] = [];
    let coLoi = false;

    // Snapshot the queue to get fixed indices for thuTu
    const qSnapshot = [...hangDoi];

    const taiLenFile = async (item: BulkUploadItem, indexOffset: number) => {
      try {
        capNhatItem(item.id, { trangThai: 'dang_tai', tienDo: 0, thongBaoLoi: undefined });
        
        // 1. Get Signature sequentially for each file just before uploading (Rate Limit prevention)
        const chuKy = await mediaApi.layChuKyUploadVideo();

        // 2. Upload to Cloudinary
        const ketQua = await mediaApi.uploadVideoToCloudinary(item.file, chuKy, (p) => {
           capNhatItem(item.id, { tienDo: p });
        });

        // 3. Save to DB
        const thoiLuong = Math.round(ketQua.duration || 0);
        const dungLuongMb = Math.round((ketQua.bytes || 0) / 1048576);
        
        const res: any = await api.themBaiHoc(maGiangVien, maChuong, {
            tieuDe: item.tieuDe,
            moTa: '',
            linkVideo: ketQua.secure_url,
            thoiLuong: thoiLuong,
            thuTu: soLuongHienTai + indexOffset + 1, // Sort order
            videoSource: 'cloudinary',
            videoPublicId: ketQua.public_id,
            videoSizeMb: dungLuongMb
        });

        danhSachThanhCong.push({
           maBaiHoc: res.maBaiHoc, tieuDe: item.tieuDe, moTa: '',
           linkVideo: ketQua.secure_url, thoiLuong: thoiLuong, thuTu: soLuongHienTai + indexOffset + 1,
           loaiBaiHoc: 'Video', videoSource: 'cloudinary', videoPublicId: ketQua.public_id
        });

        capNhatItem(item.id, { trangThai: 'thanh_cong', tienDo: 100 });
      } catch (error: any) {
         capNhatItem(item.id, { trangThai: 'loi', thongBaoLoi: error.message || 'Lỗi không xác định' });
         throw error; // Throw so we know it failed
      }
    };

    for (let i = 0; i < qSnapshot.length; i++) {
      const item = qSnapshot[i];
      if (item.trangThai === 'thanh_cong') continue; // Skip already successful (from retry)

      const p = taiLenFile(item, i).catch(() => { coLoi = true; });
      dangThucThi.add(p);
      p.finally(() => dangThucThi.delete(p));

      if (dangThucThi.size >= dongThoiToiDa) {
        await Promise.race(dangThucThi);
      }
    }

    await Promise.all(dangThucThi);

    setDangTaiLen(false);
    
    if (danhSachThanhCong.length > 0) {
       khiTaiLenThanhCong(danhSachThanhCong);
    }
    
    if (!coLoi) {
       // Close modal automatically if no errors
    }
  };

  const xuLyThuLaiLoi = () => {
     xuLyTaiLenHangDoi();
  };

  const soLuongCho = hangDoi.filter(q => q.trangThai === 'cho_xu_ly').length;
  const soLuongThanhCong = hangDoi.filter(q => q.trangThai === 'thanh_cong').length;
  const soLuongLoi = hangDoi.filter(q => q.trangThai === 'loi').length;
  const daHoanThanh = hangDoi.length > 0 && hangDoi.every(q => q.trangThai === 'thanh_cong' || q.trangThai === 'loi');

  if (!dangMo) return null;

  return (
    <div className="khm-modal-backdrop">
      <div className="khm-modal khm-modal-xl" onClick={e => e.stopPropagation()} style={{ maxWidth: 900 }}>
        <div className="khm-modal-header">
          <h3 className="khm-modal-title">Tải lên hàng loạt (Bulk Upload)</h3>
          {!dangTaiLen && <button className="khm-modal-close" onClick={dongModal}>×</button>}
        </div>
        <div className="khm-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          
          <div className="khm-flex khm-gap-16 khm-mb-24">
             <div className="khm-alert khm-alert-info khm-flex-1" style={{ margin: 0 }}>
               <div>
                 <strong>💡 Mẹo:</strong> Giữ tên file gọn gàng (VD: <code>01-gioi-thieu.mp4</code>) để hệ thống tự động sắp xếp (A-Z).
               </div>
             </div>
             <div className="khm-flex khm-gap-8 khm-items-center">
                <input 
                  type="file" 
                  multiple 
                  accept="video/mp4,video/webm,video/quicktime" 
                  ref={refInputFile} 
                  style={{ display: 'none' }} 
                  onChange={e => { xuLyChonFile(e.target.files); e.target.value = ''; }}
                />
                {/* Typescript hack for webkitdirectory */}
                <input 
                  type="file" 
                  multiple 
                  ref={refInputFolder} 
                  style={{ display: 'none' }} 
                  onChange={e => { xuLyChonFile(e.target.files); e.target.value = ''; }}
                  {...({ webkitdirectory: "", directory: "" } as any)}
                />
                <button className="khm-btn khm-btn-outline" onClick={() => refInputFile.current?.click()} disabled={dangTaiLen}>
                  + Chọn Files
                </button>
                <button className="khm-btn khm-btn-outline" onClick={() => refInputFolder.current?.click()} disabled={dangTaiLen} title="Chọn cả thư mục (Không hỗ trợ trên iOS Safari)">
                  + Chọn Folder
                </button>
             </div>
          </div>

          {hangDoi.length > 0 ? (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={xuLyKeoTha}>
                <SortableContext items={hangDoi.map(q => q.id)} strategy={verticalListSortingStrategy}>
                  <div className="khm-mb-24">
                    {hangDoi.map((item, idx) => (
                      <QueueRow 
                        key={item.id} 
                        item={item} 
                        chiSo={idx}
                        khiDoiTieuDe={(id, t) => capNhatItem(id, { tieuDe: t })}
                        khiXoa={id => setHangDoi(q => q.filter(x => x.id !== id))}
                        khiThuLai={() => { if(!dangTaiLen) xuLyTaiLenHangDoi(); }}
                        dangTaiLenToanCuc={dangTaiLen}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="khm-p-16 khm-border khm-rounded khm-bg-gray-50 khm-mb-16">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', justifyContent: 'flex-start', margin: 0, width: '100%', textAlign: 'left' }}>
                  <input type="checkbox" checked={apDungPhuDeAI} onChange={e => setApDungPhuDeAI(e.target.checked)} disabled={dangTaiLen} style={{ margin: 0, width: 'auto' }} />
                  <strong style={{ margin: 0 }}>✨ Áp dụng Phụ đề AI cho tất cả video (Phase 4)</strong>
                </label>
                {apDungPhuDeAI && (
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
             {hangDoi.length > 0 && `Tổng: ${hangDoi.length} | Đang chờ: ${soLuongCho} | Thành công: ${soLuongThanhCong} | Lỗi: ${soLuongLoi}`}
           </div>
           <div className="khm-flex khm-gap-8">
             {!dangTaiLen && <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={dongModal}>Đóng</button>}
             
             {hangDoi.length > 0 && !daHoanThanh && !dangTaiLen && (
               <button className="khm-btn khm-btn-primary khm-btn-sm" onClick={xuLyTaiLenHangDoi}>
                 ▶ Bắt đầu tải lên
               </button>
             )}
             
             {dangTaiLen && (
               <button className="khm-btn khm-btn-primary khm-btn-sm" disabled>
                 <span className="khm-spinner khm-spinner-sm" /> Đang xử lý...
               </button>
             )}

             {daHoanThanh && soLuongLoi > 0 && !dangTaiLen && (
               <button className="khm-btn khm-btn-danger khm-btn-sm" onClick={xuLyThuLaiLoi}>
                 Thử lại {soLuongLoi} file lỗi
               </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
