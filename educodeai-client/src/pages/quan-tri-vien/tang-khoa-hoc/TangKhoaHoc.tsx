import { useEffect, useState } from 'react';
import './TangKhoaHoc.css';
import '../../../assets/styles/LayoutDashboard.css';
import quaTangKhoaHocService, { type HocVienTangOptionDTO, type KhoaHocTangOptionDTO } from '@/services/qua-tang-khoa-hoc.service';
import { NguoiDungService } from '@/services/quan-ly-nguoi-dung.service';

interface LichSuQuaTang {
  maQuaTang: number;
  tenKhoaHoc: string;
  tenNguoiTang: string;
  tenNguoiNhan: string;
  emailNguoiNhan?: string;
  loaiNguoiTang: string;
  trangThai: string;
  createdAt: string;
}

const PAGE_SIZE = 10;

const abbreviateName = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return parts.join(' ');

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleInitials = parts
    .slice(1, -1)
    .map((part) => `${part.charAt(0).toUpperCase()}.`)
    .join(' ');

  return `${firstName} ${middleInitials} ${lastName}`;
};

const getTypeClassName = (type: string) => {
  const normalizedType = type.trim().toUpperCase();
  if (normalizedType.includes('ADMIN') || normalizedType.includes('SYSTEM')) {
    return 'qlhv-type-badge--admin';
  }
  if (normalizedType.includes('GIANG') || normalizedType.includes('TEACHER')) {
    return 'qlhv-type-badge--teacher';
  }
  return 'qlhv-type-badge--default';
};

const getStatusClassName = (status: string) => {
  const normalizedStatus = status.trim().toUpperCase();
  if (normalizedStatus === 'COMPLETED' || normalizedStatus === 'COMPLETE' || normalizedStatus === 'DONE') {
    return 'qlhv-status-badge--success';
  }
  if (normalizedStatus.includes('PENDING') || normalizedStatus.includes('WAIT')) {
    return 'qlhv-status-badge--warning';
  }
  if (normalizedStatus.includes('FAIL') || normalizedStatus.includes('REJECT') || normalizedStatus.includes('CANCEL')) {
    return 'qlhv-status-badge--danger';
  }
  return 'qlhv-status-badge--default';
};

export default function TangKhoaHoc() {
  const [lichSuQuaTang, setLichSuQuaTang] = useState<LichSuQuaTang[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [tuKhoa, setTuKhoa] = useState('');
  const [tuKhoaDangTim, setTuKhoaDangTim] = useState('');
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [thongBao, setThongBao] = useState<string | null>(null);
  const [moModalTang, setMoModalTang] = useState(false);
  const [tuKhoaHocVien, setTuKhoaHocVien] = useState('');
  const [hocVienOptions, setHocVienOptions] = useState<HocVienTangOptionDTO[]>([]);
  const [hocVienDaChon, setHocVienDaChon] = useState<number | null>(null);
  const [khoaHocOptions, setKhoaHocOptions] = useState<KhoaHocTangOptionDTO[]>([]);
  const [khoaHocDaChon, setKhoaHocDaChon] = useState<number | null>(null);
  const [dangTaiHocVien, setDangTaiHocVien] = useState(false);
  const [dangTaiKhoaHoc, setDangTaiKhoaHoc] = useState(false);
  const [dangTang, setDangTang] = useState(false);
  const [loiModal, setLoiModal] = useState<string | null>(null);

  const fetchLichSu = async (keyword?: string) => {
    setDangTai(true);
    try {
      const data = await quaTangKhoaHocService.lichSuAdmin(keyword);
      setLichSuQuaTang(data);
      setTrangHienTai(1);
    } catch {
      setLichSuQuaTang([]);
      setThongBao('Không tải được lịch sử tặng khóa học.');
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    void fetchLichSu();
  }, []);

  const locLichSu = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTuKhoaDangTim(tuKhoa);
    void fetchLichSu(tuKhoa || undefined);
  };

  const taiHocVien = async (keyword = '') => {
    setDangTaiHocVien(true);
    try {
      const result = await NguoiDungService.layDanhSach({ page: 1, pageSize: 50, keyword, vaiTro: 2 });
      setHocVienOptions((result.data || []).map((item) => ({
        maNguoiDung: Number(item.maNguoiDung),
        hoTen: item.hoTen || 'Học viên',
        email: item.email,
      })));
    } catch {
      setLoiModal('Không tải được danh sách học viên.');
    } finally {
      setDangTaiHocVien(false);
    }
  };

  const moModal = () => {
    setMoModalTang(true);
    setTuKhoaHocVien('');
    setHocVienDaChon(null);
    setKhoaHocDaChon(null);
    setKhoaHocOptions([]);
    setLoiModal(null);
    void taiHocVien();
  };

  const chonHocVien = async (maNguoiNhan: number) => {
    setHocVienDaChon(maNguoiNhan || null);
    setKhoaHocDaChon(null);
    setKhoaHocOptions([]);
    if (!maNguoiNhan) return;
    setDangTaiKhoaHoc(true);
    try {
      const data = await quaTangKhoaHocService.layKhoaHocCoTheTangChoHocVien(maNguoiNhan);
      setKhoaHocOptions(data);
    } catch {
      setLoiModal('Không tải được danh sách khóa học có thể tặng.');
    } finally {
      setDangTaiKhoaHoc(false);
    }
  };

  const dongModal = () => {
    setMoModalTang(false);
    setLoiModal(null);
  };

  const xacNhanTang = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hocVienDaChon || !khoaHocDaChon) {
      setLoiModal('Vui lòng chọn học viên và khóa học.');
      return;
    }
    setDangTang(true);
    setLoiModal(null);
    try {
      const result = await quaTangKhoaHocService.adminTang({ maNguoiNhan: hocVienDaChon, maKhoaHoc: khoaHocDaChon });
      dongModal();
      setThongBao(result.thongBao || 'Tặng khóa học thành công.');
      await fetchLichSu(tuKhoaDangTim || undefined);
    } catch (error: any) {
      setLoiModal(error?.response?.data?.thongBao || 'Không thể tặng khóa học.');
    } finally {
      setDangTang(false);
    }
  };

  const xuatCsv = () => {
    if (!lichSuQuaTang.length) {
      setThongBao('Không có dữ liệu để xuất CSV.');
      return;
    }

    const headers = ['MaQuaTang', 'TenKhoaHoc', 'TenNguoiTang', 'TenNguoiNhan', 'EmailNguoiNhan', 'LoaiNguoiTang', 'TrangThai', 'CreatedAt'];
    const rows = lichSuQuaTang.map((item) => [
      item.maQuaTang,
      item.tenKhoaHoc,
      item.tenNguoiTang,
      item.tenNguoiNhan,
      item.emailNguoiNhan || '',
      item.loaiNguoiTang,
      item.trangThai,
      item.createdAt
    ].map((value) => `"${String(value).replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `lich-su-qua-tang-admin-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tongSoTrang = Math.max(1, Math.ceil(lichSuQuaTang.length / PAGE_SIZE));
  const danhSachHienTai = lichSuQuaTang.slice((trangHienTai - 1) * PAGE_SIZE, trangHienTai * PAGE_SIZE);

  return (
    <div className="qlhv-container qtv-page-content relative">
      {thongBao && (
        <div className="qlhv-toast error" role="status">
          <span>{thongBao}</span>
          <button type="button" onClick={() => setThongBao(null)} aria-label="Đóng thông báo">×</button>
        </div>
      )}

      <header className="qlhv-header">
        <div>
          <h1 className="qlhv-title">Tặng Khóa Học</h1>
          <p className="qlhv-subtitle">Quản lý và theo dõi danh sách lượt tặng khóa học trong hệ thống.</p>
        </div>
        <button type="button" className="qlhv-btn-primary" onClick={moModal}>+ Tặng Khóa Học</button>
      </header>

      <section className="qlhv-card" aria-labelledby="lich-su-qua-tang-title">
        <div className="qlhv-history-toolbar">
          <h2 id="lich-su-qua-tang-title" className="qlhv-section-title">Lịch sử tặng khóa học</h2>
          <form onSubmit={locLichSu} className="qlhv-history-form">
            <input
              className="qlhv-input"
              placeholder="Tìm mã/tên/email..."
              value={tuKhoa}
              onChange={(event) => setTuKhoa(event.target.value)}
              aria-label="Tìm kiếm lịch sử tặng khóa học"
            />
            <button type="submit" className="qlhv-btn-search">Lọc</button>
            <button type="button" className="qlhv-btn-search qlhv-btn-export" onClick={xuatCsv}>Xuất CSV</button>
          </form>
        </div>

          <div className="qlhv-table-wrapper">
            <table className="qlhv-table">
              <colgroup>
                <col className="qlhv-col-code" />
                <col className="qlhv-col-course" />
                <col className="qlhv-col-giver" />
                <col className="qlhv-col-recipient" />
                <col className="qlhv-col-type" />
                <col className="qlhv-col-status" />
                <col className="qlhv-col-time" />
              </colgroup>
              <thead>
                <tr>
                  <th className="qlhv-code-cell">Mã</th>
                  <th>Khóa học</th>
                  <th>Người tặng</th>
                  <th>Người nhận</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                  <th className="qlhv-time-header">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {dangTai ? (
                  <tr><td colSpan={7} className="qlhv-table-message">Đang tải lịch sử...</td></tr>
                ) : danhSachHienTai.length === 0 ? (
                  <tr><td colSpan={7} className="qlhv-table-message">Chưa có dữ liệu lịch sử tặng khóa.</td></tr>
                ) : danhSachHienTai.map((item) => (
                  <tr key={item.maQuaTang}>
                    <td className="qlhv-code-cell">#{item.maQuaTang}</td>
                    <td className="qlhv-course-cell" title={item.tenKhoaHoc}>{item.tenKhoaHoc}</td>
                    <td className="qlhv-giver-cell">
                      <span title={item.tenNguoiTang} aria-label={`Người tặng: ${item.tenNguoiTang}`}>
                        {abbreviateName(item.tenNguoiTang)}
                      </span>
                    </td>
                    <td className="qlhv-recipient-cell">
                      <span className="qlhv-truncated-text" title={item.tenNguoiNhan}>{item.tenNguoiNhan}</span>
                      <small className="qlhv-truncated-text" title={item.emailNguoiNhan || '—'}>{item.emailNguoiNhan || '—'}</small>
                    </td>
                    <td className="qlhv-type-cell">
                      <span
                        className={`qlhv-type-badge ${getTypeClassName(item.loaiNguoiTang)}`}
                        title={item.loaiNguoiTang}
                      >
                        {item.loaiNguoiTang}
                      </span>
                    </td>
                    <td className="qlhv-status-cell">
                      <span className={`qlhv-status-badge ${getStatusClassName(item.trangThai)}`}>
                        {item.trangThai}
                      </span>
                    </td>
                    <td className="qlhv-time-cell">{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {!dangTai && lichSuQuaTang.length > 0 && (
          <div className="qlhv-pagination">
            <span>Trang <b>{trangHienTai}</b> / {tongSoTrang}{tuKhoaDangTim ? ` · Từ khóa: ${tuKhoaDangTim}` : ''}</span>
            <div>
              <button type="button" disabled={trangHienTai === 1} onClick={() => setTrangHienTai((page) => page - 1)} className="qlhv-page-btn" aria-label="Trang trước">‹</button>
              <button type="button" disabled={trangHienTai >= tongSoTrang} onClick={() => setTrangHienTai((page) => page + 1)} className="qlhv-page-btn" aria-label="Trang sau">›</button>
            </div>
          </div>
        )}
      </section>

      {moModalTang && (
        <div className="qlhv-modal-overlay" role="presentation" onClick={(event) => event.target === event.currentTarget && dongModal()}>
          <form className="qlhv-modal-card" role="dialog" aria-modal="true" aria-labelledby="qlhv-modal-title" onSubmit={xacNhanTang}>
            <div className="qlhv-modal-header">
              <h2 id="qlhv-modal-title">Tặng Khóa Học Cho Học Viên</h2>
              <button type="button" className="qlhv-modal-close" onClick={dongModal} disabled={dangTang} aria-label="Đóng modal">×</button>
            </div>
            <div className="qlhv-modal-body">
              {loiModal && <div className="qlhv-modal-error" role="alert">{loiModal}</div>}
              <label className="qlhv-modal-label" htmlFor="qlhv-hoc-vien">Học viên</label>
              <input
                id="qlhv-hoc-vien-search"
                className="qlhv-modal-input"
                placeholder="Tìm tên hoặc email..."
                value={tuKhoaHocVien}
                onChange={(event) => {
                  setTuKhoaHocVien(event.target.value);
                  void taiHocVien(event.target.value);
                }}
                aria-label="Tìm học viên"
              />
              <select id="qlhv-hoc-vien" className="qlhv-modal-select" value={hocVienDaChon ?? ''} onChange={(event) => void chonHocVien(Number(event.target.value))} disabled={dangTaiHocVien}>
                <option value="">{dangTaiHocVien ? 'Đang tải học viên...' : 'Chọn học viên'}</option>
                {hocVienOptions.map((item) => <option key={item.maNguoiDung} value={item.maNguoiDung}>#{item.maNguoiDung} - {item.hoTen}{item.email ? ` (${item.email})` : ''}</option>)}
              </select>
              <label className="qlhv-modal-label" htmlFor="qlhv-khoa-hoc">Khóa học</label>
              <select id="qlhv-khoa-hoc" className="qlhv-modal-select" value={khoaHocDaChon ?? ''} onChange={(event) => setKhoaHocDaChon(Number(event.target.value) || null)} disabled={!hocVienDaChon || dangTaiKhoaHoc}>
                <option value="">{dangTaiKhoaHoc ? 'Đang tải khóa học...' : 'Chọn khóa học'}</option>
                {khoaHocOptions.map((item) => <option key={item.maKhoaHoc} value={item.maKhoaHoc}>{item.tenKhoaHoc}</option>)}
              </select>
              {hocVienDaChon && !dangTaiKhoaHoc && khoaHocOptions.length === 0 && <p className="qlhv-modal-hint">Học viên này không có khóa học phù hợp để tặng.</p>}
            </div>
            <div className="qlhv-modal-footer">
              <button type="button" className="qlhv-modal-btn qlhv-modal-btn-secondary" onClick={dongModal} disabled={dangTang}>Hủy</button>
              <button type="submit" className="qlhv-modal-btn qlhv-modal-btn-primary" disabled={dangTang || !hocVienDaChon || !khoaHocDaChon}>{dangTang ? 'Đang xử lý...' : 'Xác nhận tặng'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
