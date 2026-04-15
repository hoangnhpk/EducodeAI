import { useState } from 'react';
import Swal from 'sweetalert2';
import { BaiTapThucHanhService } from '@/services/bai-tap-thuc-hanh.service';
import type { DanhSachBaiTapDTO, BaiTapThucHanhData } from './BaiTapThucHanhDTO';
import PreviewBaiTapAI from './PreviewBaiTapAI';

interface Props {
  danhSach: DanhSachBaiTapDTO[];
  isLoading: boolean;
  onRefresh: () => void;
  onClickTaoMoi: () => void;
}

export default function DanhSachBaiTapThucHanh({ danhSach, isLoading, onRefresh, onClickTaoMoi }: Props) {
  const [viewData, setViewData] = useState<BaiTapThucHanhData | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Lọc lấy các bài tập loại IDE (Thực hành coding)
  const listThucHanh = danhSach.filter((bt) => bt.loaiBaiTap === 'IDE');

  const handleView = async (maBaiTap: number) => {
    setViewLoading(true);
    setViewData(null);
    try {
      const res = await BaiTapThucHanhService.getChiTiet(maBaiTap);
      setViewData(res.data);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tải chi tiết bài tập.' });
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = (maBaiTap: number, title: string) => {
    Swal.fire({
      title: `Xóa "${title}"?`,
      text: 'Hành động này không thể hoàn tác.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#FF4D4D',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await BaiTapThucHanhService.deleteBaiTap(maBaiTap);
          Swal.fire({ icon: 'success', title: 'Đã xóa!', timer: 1500, showConfirmButton: false });
          onRefresh();
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể xóa bài tập.' });
        }
      }
    });
  };

  return (
    <>
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="btth-list-header d-flex justify-content-between align-items-center p-3 border-bottom">
            <h4 className="m-0" style={{ fontSize: '16px', fontWeight: 700, color: '#334155' }}>
              <i className="bi bi-list-task me-2" />
              Tất cả bài tập thực hành ({listThucHanh.length})
            </h4>
            <div className="d-flex gap-2">
              <button className="action-btn view-btn btn-sm" onClick={onRefresh} disabled={isLoading}>
                <i className="bi bi-arrow-clockwise" /> Làm mới
              </button>
              <button className="action-btn edit-btn btn-sm" onClick={onClickTaoMoi}>
                <i className="bi bi-plus-lg" /> Tạo bài tập mới
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle table-hover m-0">
              <thead className="table-light">
                <tr style={{ fontSize: '13px', textTransform: 'uppercase', color: '#64748B' }}>
                  <th className="ps-3" style={{ fontWeight: 600 }}>Tên bài tập / Khóa học</th>
                  <th style={{ fontWeight: 600 }}>Chương / Bài học</th>
                  <th style={{ fontWeight: 600, width: '120px' }} className="text-center">Trạng thái</th>
                  <th style={{ fontWeight: 600, width: '150px' }} className="text-end pe-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : listThucHanh.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1 d-block mb-3 opacity-25" />
                      Không tìm thấy bài tập thực hành nào.
                    </td>
                  </tr>
                ) : (
                  listThucHanh.map((bt) => (
                    <tr key={bt.maBaiTap}>
                      <td className="ps-3">
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{bt.tenBaiTap}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>{bt.tenKhoaHoc}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: '#334155' }}>{bt.tenChuong}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}># {bt.tenBaiHoc}</div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2">
                          {bt.trangThai || 'HIỂN THỊ'}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <div className="d-flex justify-content-end gap-1">
                          <button className="action-btn view-btn" title="Xem chi tiết" onClick={() => handleView(bt.maBaiTap)}>
                            <i className="bi bi-eye" />
                          </button>
                          <button className="action-btn delete-btn" title="Xóa" onClick={() => handleDelete(bt.maBaiTap, bt.tenBaiTap)}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal chi tiết (Readonly Preview) */}
      {(viewLoading || viewData) && (
        <div className="quiz-modal-overlay" style={{ display: 'flex' }} onClick={() => setViewData(null)}>
          <div
            className="quiz-modal-content"
            style={{ width: '98vw', maxWidth: '1600px', maxHeight: '96vh', margin: '2vh auto', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quiz-modal-header d-flex justify-content-between align-items-center" style={{ padding: '20px 24px', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                   <i className="bi bi-file-earmark-text text-primary fs-5" />
                </div>
                <h3 className="m-0" style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Chi tiết Bài tập Thực hành</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setViewData(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="quiz-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '0', scrollbarWidth: 'thin', background: '#f8fafc' }}>
              {viewLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" />
                  <p className="mt-2 text-muted">Đang tải chi tiết...</p>
                </div>
              ) : (
                viewData && <PreviewBaiTapAI data={viewData} editable={false} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
