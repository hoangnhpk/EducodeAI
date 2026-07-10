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

const MAX_VIDEO_PER_BATCH = 50;

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
  const [showPhuDeConfirm, setShowPhuDeConfirm] = useState(false);
  const [dangXuLyPhuDe, setDangXuLyPhuDe] = useState(false);
  const [phuDeKetQua, setPhuDeKetQua] = useState<string | null>(null);

  // Track uploaded lesson IDs for post-upload AI subtitle
  const uploadedLessonsRef = useRef<{ maBaiHoc: number; thoiLuong: number }[]>([]);

  const refInputFile = useRef<HTMLInputElement>(null);
  const refInputFolder = useRef<HTMLInputElement>(null);
  const refInputSafariFallback = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!dangMo) {
      setHangDoi([]);
      setDangTaiLen(false);
      setApDungPhuDeAI(false);
      uploadedLessonsRef.current = [];
      setShowPhuDeConfirm(false);
      setDangXuLyPhuDe(false);
      setPhuDeKetQua(null);
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
      setHangDoi(prev => {
        const combined = [...prev, ...itemsMoi];
        const total = combined.length;
        if (total > MAX_VIDEO_PER_BATCH) {
          alert(`Chỉ được tải lên tối đa ${MAX_VIDEO_PER_BATCH} video mỗi lần. ${total - MAX_VIDEO_PER_BATCH} video vượt quá đã bị loại.`);
          // Lấy đúng MAX_VIDEO_PER_BATCH item (giữ ưu tiên video đầu tiên)
          const kept = prev.length >= MAX_VIDEO_PER_BATCH ? prev : [...prev, ...itemsMoi.slice(0, MAX_VIDEO_PER_BATCH - prev.length)];
          return kept.sort((a, b) => a.tieuDe.localeCompare(b.tieuDe));
        }
        // Sort alphabetically by default
        combined.sort((a, b) => a.tieuDe.localeCompare(b.tieuDe));
        return combined;
      });
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

    const dongThoiToiDa = 3;

    const dangThucThi = new Set<Promise<void>>();
    const danhSachThanhCong: any[] = [];

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

        // Track lesson for AI subtitle (if checkbox checked)
        if (apDungPhuDeAI) {
          uploadedLessonsRef.current.push({ maBaiHoc: res.maBaiHoc, thoiLuong: thoiLuong });
        }

        capNhatItem(item.id, { trangThai: 'thanh_cong', tienDo: 100 });
      } catch (error: any) {
         capNhatItem(item.id, { trangThai: 'loi', thongBaoLoi: error.message || 'Lỗi không xác định' });
         throw error; // Throw so we know it failed
      }
    };

    for (let i = 0; i < qSnapshot.length; i++) {
      const item = qSnapshot[i];
      if (item.trangThai === 'thanh_cong') continue; // Skip already successful (from retry)

      const p = taiLenFile(item, i).catch(() => { /* lỗi mỗi file đã hiển thị status + Retry riêng */ });
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

    // If AI subtitle checkbox was checked, show the confirm modal
    if (apDungPhuDeAI && uploadedLessonsRef.current.length > 0) {
      setShowPhuDeConfirm(true);
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
                {/* Fallback for Safari iOS: does not support webkitdirectory */}
                <input
                  type="file"
                  multiple
                  ref={refInputSafariFallback}
                  style={{ display: 'none' }}
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={e => { xuLyChonFile(e.target.files); e.target.value = ''; }}
                />
                {/* webkitdirectory for desktop folder selection */}
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
                <button className="khm-btn khm-btn-outline" onClick={() => refInputFolder.current?.click()} disabled={dangTaiLen} title="Chọn cả thư mục (Desktop)">
                  + Chọn Folder
                </button>
                <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={() => refInputSafariFallback.current?.click()} disabled={dangTaiLen} style={{ fontSize: 12 }} title="Safari iOS fallback">
                  📱 Chọn File (iOS)
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
                  <strong style={{ margin: 0 }}>✨ Tạo Phụ đề AI sau khi tải lên (Có phí)</strong>
                </label>
                {apDungPhuDeAI && (
                  <p className="khm-text-sm khm-text-muted khm-mt-8 khm-mb-0">
                    Sau khi tải lên hoàn tất, sẽ hiển thị Modal xác nhận chi phí trước khi trừ tiền. Giới hạn tối đa 50 video/lần.
                  </p>
                )}
              </div>

              {/* AI Subtitle Confirm Modal */}
              {showPhuDeConfirm && (
                <div className="khm-modal-backdrop">
                  <div className="khm-modal khm-modal-md" onClick={e => e.stopPropagation()}>
                    <div className="khm-modal-header">
                      <h3 className="khm-modal-title">✨ Xác nhận tạo Phụ đề AI</h3>
                      <button className="khm-modal-close" disabled={dangXuLyPhuDe} onClick={() => setShowPhuDeConfirm(false)}>×</button>
                    </div>
                    <div className="khm-modal-body">
                      {phuDeKetQua ? (
                        <div className="khm-alert khm-alert-success">{phuDeKetQua}</div>
                      ) : (
                        <>
                          <div className="khm-alert khm-alert-warning khm-mb-16">
                            Bạn đang chọn tạo phụ đề tự động bằng AI cho <strong>{uploadedLessonsRef.current.length} video</strong>.
                          </div>
                          <table className="khm-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--khm-gray-200)', textAlign: 'left' }}>
                                <th style={{ padding: '6px 8px', fontSize: 13 }}>Video</th>
                                <th style={{ padding: '6px 8px', fontSize: 13 }}>Thời lượng</th>
                                <th style={{ padding: '6px 8px', fontSize: 13 }}>Chi phí</th>
                              </tr>
                            </thead>
                            <tbody>
                              {uploadedLessonsRef.current.slice(0, 10).map((l, i) => (
                                <tr key={l.maBaiHoc} style={{ borderBottom: '1px solid var(--khm-gray-100)' }}>
                                  <td style={{ padding: '4px 8px' }}>#{i + 1}</td>
                                  <td style={{ padding: '4px 8px' }}>{Math.ceil(l.thoiLuong / 60)} phút</td>
                                  <td style={{ padding: '4px 8px' }}>${(Math.ceil(l.thoiLuong / 60) * 0.06).toFixed(2)}</td>
                                </tr>
                              ))}
                              {uploadedLessonsRef.current.length > 10 && (
                                <tr><td colSpan={3} style={{ padding: '4px 8px', color: 'var(--khm-gray-500)', fontStyle: 'italic' }}>...còn {uploadedLessonsRef.current.length - 10} video nữa</td></tr>
                              )}
                            </tbody>
                            <tfoot>
                              <tr style={{ fontWeight: 'bold', borderTop: '2px solid var(--khm-gray-300)' }}>
                                <td style={{ padding: '6px 8px' }}>Tổng</td>
                                <td style={{ padding: '6px 8px' }}>{uploadedLessonsRef.current.reduce((s, l) => s + Math.ceil(l.thoiLuong / 60), 0)} phút</td>
                                <td style={{ padding: '6px 8px' }}>
                                  ${uploadedLessonsRef.current.reduce((s, l) => s + Math.ceil(l.thoiLuong / 60) * 0.06, 0).toFixed(2)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>

                          <div className="khm-alert khm-alert-info" style={{ fontSize: 13 }}>
                            <input type="checkbox" id="phude_gdpr_consent" className="khm-mr-4" />
                            <label htmlFor="phude_gdpr_consent">
                              Tôi xác nhận video không chứa thông tin cá nhân nhạy cảm. Nội dung audio sẽ gửi tới Google Cloud Speech-to-Text, tự động xóa sau 24h.
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="khm-modal-footer khm-flex-between">
                      {phuDeKetQua ? (
                        <button className="khm-btn khm-btn-primary khm-btn-sm" onClick={() => setShowPhuDeConfirm(false)}>Đóng</button>
                      ) : (
                        <>
                          <span className="khm-text-sm khm-text-muted">Phí AI: $0.06/phút</span>
                          <div className="khm-flex khm-gap-8">
                            <button className="khm-btn khm-btn-outline khm-btn-sm" disabled={dangXuLyPhuDe} onClick={() => setShowPhuDeConfirm(false)}>Hủy</button>
                            <button className="khm-btn khm-btn-sm" style={{ background: '#c026d3', color: '#fff', border: 'none' }}
                              disabled={dangXuLyPhuDe}
                              onClick={async () => {
                                const cb = document.getElementById('phude_gdpr_consent') as HTMLInputElement;
                                if (!cb.checked) { alert('Vui lòng đồng ý với điều khoản GDPR.'); return; }
                                setDangXuLyPhuDe(true);
                                try {
                                  let success = 0, fail = 0;
                                  for (const l of uploadedLessonsRef.current) {
                                    try { await mediaApi.taoPhuDeAI(l.maBaiHoc); success++; }
                                    catch { fail++; }
                                  }
                                  setPhuDeKetQua(`✅ Đã gửi yêu cầu AI cho ${success} video.${fail > 0 ? ` ❌ ${fail} video thất bại.` : ''} Phụ đề sẽ có sau vài phút.`);
                                } catch { setPhuDeKetQua('❌ Lỗi hệ thống. Vui lòng thử lại sau.'); }
                                finally { setDangXuLyPhuDe(false); }
                              }}
                            >
                              {dangXuLyPhuDe ? <><span className="khm-spinner khm-spinner-sm" /> Đang xử lý...</> : `Đồng ý - $${uploadedLessonsRef.current.reduce((s, l) => s + Math.ceil(l.thoiLuong / 60) * 0.06, 0).toFixed(2)}`}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
