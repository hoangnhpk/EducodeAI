import { useCallback, useEffect, useMemo, useState } from 'react';
import './QuanLyHocVienKhoaHoc.css';
import Swal from 'sweetalert2';
import quaTangKhoaHocService from '@/services/qua-tang-khoa-hoc.service';
import lopHocService from '@/services/lop-hoc.service';
import BulkMailModal from './components/BulkMailModal';
import { layChuCaiAvatar, layMauAvatar } from '@/utils/avatarHelper';
import { getAccessToken } from '@/utils/authStorage';

interface KhoaHoc {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  soLuongHocVien: number;
}

type TagFilter = 'all' | 'xuat_sac' | 'giam_chan' | 'moi_dang_ky';

interface HocVien {
  maNguoiDung: number;
  hoTen: string;
  email: string;
  anhDaiDien: string | null;
  ngayDangKy: string;
  tenKhoaHoc: string;
  trangThai: string;
  phanTramTienDo?: number;
  soBaiDaHoc?: number;
  tongSoBai?: number;
  ngayHocCuoi?: string | null;
  tag?: string | null;
  tagLabel?: string | null;
}

interface KhoaHocHocVien {
  maKhoaHoc: number;
  tenKhoaHoc: string;
  ngayDangKy: string;
  trangThai: string;
}
interface LichSuQuaTang {
  maQuaTang: number;
  maKhoaHoc: number;
  tenKhoaHoc: string;
  tenNguoiNhan: string;
  emailNguoiNhan?: string;
  trangThai: string;
  createdAt: string;
}

// Interfaces cho dữ liệu Popup Tiến độ (Cập nhật có thời gian)
interface TienDoKhoaHocHocVienDTO {
  tongThoiGianHocPhut: number;
  danhSachChuong: ChuongHocTienDoDTO[];
}

interface ChuongHocTienDoDTO {
  maChuong: number;
  tenChuong: string;
  danhSachBaiHoc: BaiHocTienDoDTO[];
}

interface BaiHocTienDoDTO {
  maBaiHoc: number;
  tenBaiHoc: string;
  daHoanThanh: boolean;
}

const ALL_COURSES_VALUE = '0';
const ITEMS_PER_PAGE = 5;

const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

const getAnhDaiDienUrl = (path?: string | null): string => {
  if (!path?.trim()) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
};

function HocVienAvatar({ hoTen, anhDaiDien }: { hoTen: string; anhDaiDien: string | null }) {
  const [loiAnh, setLoiAnh] = useState(false);
  const url = getAnhDaiDienUrl(anhDaiDien);
  const initials = layChuCaiAvatar(hoTen);
  const mau = layMauAvatar(hoTen);

  if (url && !loiAnh) {
    return (
      <img
        src={url}
        alt=""
        onError={() => setLoiAnh(true)}
      />
    );
  }

  return (
    <span
      className="qllh-avatar-fallback"
      aria-hidden="true"
      style={{ backgroundColor: mau.bg, color: mau.color }}
    >
      {initials}
    </span>
  );
}

const getSmartTagMeta = (tag?: string | null) => {
  switch (tag) {
    case 'xuat_sac':
      return { className: 'tag-xuat-sac', label: 'Xuất sắc', icon: <i className="bi bi-award" style={{ fontSize: 11 }} aria-hidden="true" /> };
    case 'giam_chan':
      return { className: 'tag-giam-chan', label: 'Cần nhắc', icon: <i className="bi bi-hourglass-split" style={{ fontSize: 11 }} aria-hidden="true" /> };
    case 'moi_dang_ky':
      return { className: 'tag-moi-dk', label: 'Mới đăng ký', icon: <i className="bi bi-person-plus" style={{ fontSize: 11 }} aria-hidden="true" /> };
    default:
      return null;
  }
};

const formatNgayHocCuoi = (raw?: string | null) => {
  if (!raw) return 'Chưa học';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff <= 0) return 'Hôm nay';
  if (diff === 1) return 'Hôm qua';
  return `${diff} ngày trước`;
};

const getTrangThaiMeta = (raw: string) => {
  const normalized = (raw ?? '').trim().toLowerCase();
  if (['hoanthanh', 'hoàn thành', 'hoan thanh', 'completed'].includes(normalized)) {
    return { className: 'hoan-thanh', label: 'Hoàn thành' };
  }
  if (['danghoc', 'đang học', 'dang hoc', 'learning'].includes(normalized)) {
    return { className: 'dang-hoc', label: 'Đang học' };
  }
  if (['bikhoa', 'bị khóa', 'bi khoa', 'locked'].includes(normalized)) {
    return { className: 'bi-khoa', label: 'Bị khóa' };
  }
  return { className: 'khong-xac-dinh', label: raw || 'Không xác định' };
};

const getQuaTangTrangThaiMeta = (raw: string) => {
  const normalized = (raw ?? '').trim().toUpperCase();
  if (normalized === 'COMPLETED') return { className: 'qllh-gift-badge--done', label: 'Đã tặng' };
  if (normalized === 'PENDING') return { className: 'qllh-gift-badge--pending', label: 'Đang xử lý' };
  if (normalized === 'FAILED') return { className: 'qllh-gift-badge--fail', label: 'Thất bại' };
  return { className: 'qllh-gift-badge--default', label: raw || '—' };
};

const formatGiftTime = (raw: string) => {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function QuanLyHocVienKhoaHoc() {
  const [khoaHocs, setKhoaHocs] = useState<KhoaHoc[]>([]);
  const [hocViens, setHocViens] = useState<HocVien[]>([]);
  const [selectedKhoaHoc, setSelectedKhoaHoc] = useState<string>('0');
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // --- STATE CHO PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState<number>(1);

  // --- STATE CHO POPUP CHI TIẾT ---
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'TIEN_DO' | 'DANH_SACH_KHOA'>('TIEN_DO');
  const [selectedHocVienInfo, setSelectedHocVienInfo] = useState<HocVien | null>(null);

  const [tienDoKhoaHoc, setTienDoKhoaHoc] = useState<TienDoKhoaHocHocVienDTO | null>(null);
  const [studentCourses, setStudentCourses] = useState<KhoaHocHocVien[]>([]);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]); // Quản lý trạng thái đóng/mở chương
  const [dangTangCho, setDangTangCho] = useState<number | null>(null);
  const [lichSuQuaTang, setLichSuQuaTang] = useState<LichSuQuaTang[]>([]);
  const [dangTaiLichSu, setDangTaiLichSu] = useState<boolean>(false);
  const [tuKhoaLichSu, setTuKhoaLichSu] = useState<string>('');
  const [trangLichSu, setTrangLichSu] = useState<number>(1);
  const pageSizeLichSu = 10;

  const [filterTag, setFilterTag] = useState<TagFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [dangGuiMail, setDangGuiMail] = useState(false);

  const daChonKhoaCuThe = selectedKhoaHoc !== ALL_COURSES_VALUE;

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { setCurrentPage(1); }, [searchInput, filterTag]);

  const fetchKhoaHocs = useCallback(async () => {
    try {
      const data = (await lopHocService.layDanhSachKhoa()) as KhoaHoc[];
      if (Array.isArray(data) && data.length > 0) {
        setKhoaHocs(data);
        return;
      }

      // Fallback: nếu giảng viên chưa có lớp học / API trả rỗng,
      // vẫn xổ ra toàn bộ khóa học có sẵn để lựa chọn.
      const token = getAccessToken();
      const resAll = await fetch(`${API_URL}/api/giangvien/quan-ly-lo-trinh/danh-sach-khoa-hoc-co-san`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (resAll.ok) {
        const all = await resAll.json();
        const mapped: KhoaHoc[] = ((all?.data ?? []) as any[]).map((x) => ({
          maKhoaHoc: Number(x.maKhoaHoc),
          tenKhoaHoc: String(x.tenKhoaHoc ?? ''),
          soLuongHocVien: 0,
        })).filter((x) => Number.isFinite(x.maKhoaHoc) && x.maKhoaHoc > 0 && x.tenKhoaHoc);
        setKhoaHocs(mapped);
      } else {
        setKhoaHocs([]);
      }
    } catch (error) { console.error(error); }
  }, [API_URL]);

  const fetchHocViens = useCallback(async (maKhoa: string) => {
    setLoading(true);
    try {
      const maKhoaHoc = maKhoa === ALL_COURSES_VALUE ? undefined : Number(maKhoa);
      const data = await lopHocService.layDanhSachHocVien(maKhoaHoc);
      setHocViens(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKhoaHocs(); }, [fetchKhoaHocs]);

  useEffect(() => {
    fetchHocViens(selectedKhoaHoc);
    setCurrentPage(1);
    setFilterTag('all');
    setSelectedIds(new Set());
  }, [fetchHocViens, selectedKhoaHoc]);

  useEffect(() => {
    void fetchLichSuQuaTang(selectedKhoaHoc !== ALL_COURSES_VALUE ? Number(selectedKhoaHoc) : undefined, tuKhoaLichSu || undefined);
  }, [selectedKhoaHoc]);

  const openStudentCoursesModal = useCallback(async (maNguoiDung: number) => {
    setModalMode('DANH_SACH_KHOA');
    setStudentCourses([]);
    const data = await lopHocService.layCacKhoaHocCuaHocVien(maNguoiDung);
    setStudentCourses(data);
  }, []);

  const openProgressModal = useCallback(async (maNguoiDung: number) => {
    setModalMode('TIEN_DO');
    setTienDoKhoaHoc(null);
    setExpandedChapters([]);
    const data = await lopHocService.layTienDoChiTiet(Number(selectedKhoaHoc), maNguoiDung);
    setTienDoKhoaHoc(data);
  }, [selectedKhoaHoc]);

  // --- XỬ LÝ KHI BẤM ICON CON MẮT ---
  const handleViewDetailClick = useCallback(async (hv: HocVien) => {
    setSelectedHocVienInfo(hv);
    setShowModal(true);
    setLoadingModal(true);

    try {
      if (selectedKhoaHoc === ALL_COURSES_VALUE) {
        await openStudentCoursesModal(hv.maNguoiDung);
      } else {
        await openProgressModal(hv.maNguoiDung);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingModal(false);
    }
  }, [openProgressModal, openStudentCoursesModal, selectedKhoaHoc]);

  const closeModal = () => {
    setShowModal(false);
    setSelectedHocVienInfo(null);
    setTienDoKhoaHoc(null);
    setStudentCourses([]);
  };

  const toggleChapter = useCallback((maChuong: number) => {
    setExpandedChapters(prev =>
      prev.includes(maChuong) ? prev.filter(id => id !== maChuong) : [...prev, maChuong]
    );
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} phút`;
    if (mins === 0) return `${hours} tiếng`;
    return `${hours} tiếng ${mins} phút`;
  };

  const tienDoPhanTramKhoaHoc = useMemo(() => {
    if (!tienDoKhoaHoc?.danhSachChuong?.length) return 0;
    let tong = 0;
    let xong = 0;
    for (const ch of tienDoKhoaHoc.danhSachChuong) {
      for (const b of ch.danhSachBaiHoc) {
        tong += 1;
        if (b.daHoanThanh) xong += 1;
      }
    }
    if (tong === 0) return 0;
    return Math.round((xong / tong) * 100);
  }, [tienDoKhoaHoc]);

  const filteredHocViens = useMemo(() => {
    const normalizedQuery = normalizeText(searchInput);
    return hocViens.filter((hv) => {
      if (filterTag !== 'all' && hv.tag !== filterTag) return false;
      if (!normalizedQuery) return true;
      const name = normalizeText(hv.hoTen ?? '');
      const email = normalizeText(hv.email ?? '');
      return name.includes(normalizedQuery) || email.includes(normalizedQuery);
    });
  }, [hocViens, searchInput, filterTag]);

  const thongKeHocVien = useMemo(() => ({
    tong: hocViens.length,
    xuatSac: hocViens.filter((h) => h.tag === 'xuat_sac').length,
    canNhac: hocViens.filter((h) => h.tag === 'giam_chan').length,
    moiDangKy: hocViens.filter((h) => h.tag === 'moi_dang_ky').length,
  }), [hocViens]);

  const theSoLieu = useMemo(() => ([
    { key: 'all' as TagFilter, mod: 'total', icon: 'bi-people', label: 'Tổng học viên', value: thongKeHocVien.tong },
    { key: 'xuat_sac' as TagFilter, mod: 'good', icon: 'bi-award', label: 'Học viên xuất sắc', value: thongKeHocVien.xuatSac },
    { key: 'giam_chan' as TagFilter, mod: 'warn', icon: 'bi-bell', label: 'Cần nhắc nhở', value: thongKeHocVien.canNhac },
    { key: 'moi_dang_ky' as TagFilter, mod: 'new', icon: 'bi-person-plus', label: 'Mới đăng ký', value: thongKeHocVien.moiDangKy },
  ]), [thongKeHocVien]);

  const tenKhoaHocHienTai = useMemo(
    () => khoaHocs.find((k) => String(k.maKhoaHoc) === selectedKhoaHoc)?.tenKhoaHoc ?? '',
    [khoaHocs, selectedKhoaHoc]
  );

  const selectedHocViens = useMemo(
    () => hocViens.filter((h) => selectedIds.has(h.maNguoiDung)),
    [hocViens, selectedIds]
  );

  const toggleSelect = useCallback((maNguoiDung: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(maNguoiDung)) next.delete(maNguoiDung);
      else next.add(maNguoiDung);
      return next;
    });
  }, []);

  const chonTatCaGiamChan = useCallback(() => {
    const ids = filteredHocViens.filter((h) => h.tag === 'giam_chan').map((h) => h.maNguoiDung);
    setSelectedIds(new Set(ids));
    setFilterTag('giam_chan');
  }, [filteredHocViens]);

  const handleGuiMailHangLoat = useCallback(async (tieuDe: string, noiDungHtml: string) => {
    if (!daChonKhoaCuThe || selectedIds.size === 0) return;
    const soNguoiGui = selectedIds.size;
    try {
      setDangGuiMail(true);
      await lopHocService.guiMailHangLoat({
        maKhoaHoc: Number(selectedKhoaHoc),
        danhSachMaNguoiDung: Array.from(selectedIds),
        tieuDe,
        noiDungHtml,
      });
      setShowBulkModal(false);
      setSelectedIds(new Set());
      await Swal.fire({
        title: 'Gửi thành công',
        html: `<p class="qllh-swal-text">Email đang được gửi đến <strong>${soNguoiGui}</strong> học viên.</p>`,
        icon: 'success',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#3b82f6',
        buttonsStyling: true,
        customClass: {
          popup: 'qllh-swal-popup',
          title: 'qllh-swal-title',
          htmlContainer: 'qllh-swal-html',
          confirmButton: 'qllh-swal-confirm',
          icon: 'qllh-swal-icon',
        },
      });
    } catch (error: any) {
      await Swal.fire({
        title: 'Không gửi được',
        text: error?.response?.data?.message || 'Đã có lỗi xảy ra.',
        icon: 'error',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#3b82f6',
        customClass: { popup: 'qllh-swal-popup', confirmButton: 'qllh-swal-confirm' },
      });
    } finally {
      setDangGuiMail(false);
    }
  }, [daChonKhoaCuThe, selectedIds, selectedKhoaHoc]);

  const totalPages = useMemo(
    () => Math.ceil(filteredHocViens.length / ITEMS_PER_PAGE),
    [filteredHocViens.length]
  );

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return filteredHocViens.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, filteredHocViens]);

  const toggleSelectPage = useCallback(() => {
    const pageIds = currentItems.map((h) => h.maNguoiDung);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }, [currentItems, selectedIds]);

  const pageAllSelected = currentItems.length > 0 && currentItems.every((h) => selectedIds.has(h.maNguoiDung));

  const paginationInfo = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return {
      from: filteredHocViens.length === 0 ? 0 : indexOfFirstItem + 1,
      to: Math.min(indexOfLastItem, filteredHocViens.length),
      total: filteredHocViens.length,
    };
  }, [currentPage, filteredHocViens.length]);

  const paginate = useCallback((pageNumber: number) => setCurrentPage(pageNumber), []);

  const fetchLichSuQuaTang = useCallback(async (maKhoaHoc?: number, tuKhoa?: string) => {
    try {
      setDangTaiLichSu(true);
      const data = await quaTangKhoaHocService.lichSuGiangVien(maKhoaHoc, tuKhoa);
      setLichSuQuaTang(data);
      setTrangLichSu(1);
    } catch {
      setLichSuQuaTang([]);
    } finally {
      setDangTaiLichSu(false);
    }
  }, []);

  const tongTrangLichSu = Math.max(1, Math.ceil(lichSuQuaTang.length / pageSizeLichSu));
  const lichSuTrangHienTai = lichSuQuaTang.slice((trangLichSu - 1) * pageSizeLichSu, trangLichSu * pageSizeLichSu);

  const xuatCsvLichSu = useCallback(() => {
    if (lichSuQuaTang.length === 0) {
      void Swal.fire('Không có dữ liệu', 'Hiện chưa có lịch sử để xuất.', 'info');
      return;
    }
    const headers = ["MaQuaTang", "MaKhoaHoc", "TenKhoaHoc", "TenNguoiNhan", "EmailNguoiNhan", "TrangThai", "CreatedAt"];
    const rows = lichSuQuaTang.map((x) => [
      x.maQuaTang,
      x.maKhoaHoc,
      `"${(x.tenKhoaHoc || "").replace(/"/g, '""')}"`,
      `"${(x.tenNguoiNhan || "").replace(/"/g, '""')}"`,
      `"${(x.emailNguoiNhan || "").replace(/"/g, '""')}"`,
      x.trangThai,
      x.createdAt
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lich-su-qua-tang-giang-vien-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lichSuQuaTang]);

  const handleTangKhoaHoc = useCallback(async (hocVien: HocVien) => {
    if (selectedKhoaHoc === ALL_COURSES_VALUE) {
      await Swal.fire('Chưa thể tặng', 'Vui lòng chọn cụ thể một khóa học trước khi tặng.', 'warning');
      return;
    }

    const ketQua = await Swal.fire({
      title: `Tặng khóa học cho ${hocVien.hoTen}`,
      html: `<textarea id="gv-tang-loi-nhan" class="swal2-textarea" placeholder="Lời nhắn (tùy chọn)"></textarea>`,
      showCancelButton: true,
      confirmButtonText: 'Xác nhận tặng',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const loiNhan = (document.getElementById('gv-tang-loi-nhan') as HTMLTextAreaElement | null)?.value?.trim() ?? '';
        return { loiNhan };
      }
    });

    if (!ketQua.isConfirmed) return;

    try {
      setDangTangCho(hocVien.maNguoiDung);
      const res = await quaTangKhoaHocService.giangVienTang({
        maKhoaHoc: Number(selectedKhoaHoc),
        maNguoiNhan: hocVien.maNguoiDung,
        loiNhan: ketQua.value?.loiNhan || undefined
      });

      await Swal.fire('Thành công', res.thongBao || 'Đã tặng khóa học thành công.', 'success');
      await fetchLichSuQuaTang(Number(selectedKhoaHoc), tuKhoaLichSu || undefined);
    } catch (error: any) {
      await Swal.fire('Không thể tặng', error?.response?.data?.thongBao || 'Đã có lỗi xảy ra.', 'error');
    } finally {
      setDangTangCho(null);
    }
  }, [selectedKhoaHoc, fetchLichSuQuaTang, tuKhoaLichSu]);

  return (
    <div className="qllh-container">
      <div className="qllh-header">
        <div className="qllh-header__main">
          <h1 className="qllh-title">
            <i className="bi bi-mortarboard" aria-hidden="true" />
            Quản lý lớp học
          </h1>
          <p className="qllh-subtitle">
            Theo dõi tiến độ, phân loại học viên thông minh và gửi mail nhắc nhở hàng loạt.
          </p>
        </div>
      </div>

      <div className="qllh-stats">
        {theSoLieu.map((the) => {
          const laTongSo = the.key === 'all';
          // Backend chỉ tính nhãn thông minh khi lọc theo một khóa học cụ thể
          // (GanTienDoVaTagAsync), nên ở chế độ "Tất cả học viên" phải hiện "—" thay vì số 0.
          const coSoLieu = laTongSo || daChonKhoaCuThe;
          const dangLoc = filterTag === the.key;
          return (
            <button
              key={the.key}
              type="button"
              className={`qllh-stat-card qllh-stat-card--${the.mod}${dangLoc ? ' is-active' : ''}`}
              onClick={() => setFilterTag(dangLoc && !laTongSo ? 'all' : the.key)}
              disabled={!coSoLieu}
              aria-pressed={dangLoc}
              title={
                coSoLieu
                  ? (laTongSo ? 'Xem tất cả học viên' : `Lọc học viên nhãn "${the.label}"`)
                  : 'Chọn một khóa học cụ thể để xem phân loại học viên'
              }
            >
              <span className="qllh-stat-card__head">
                <i className={`bi ${the.icon}`} aria-hidden="true" />
                <span className="qllh-stat-card__label">{the.label}</span>
              </span>
              <span className="qllh-stat-card__value">{coSoLieu ? the.value : '—'}</span>
            </button>
          );
        })}
      </div>

      <div className="qllh-filter-bar">
        <div className="qllh-search-form">
          <div className="qllh-search-wrap">
            <i className="bi bi-search qllh-search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Tìm theo Họ tên hoặc Email học viên..."
              className="qllh-search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Tìm học viên theo họ tên hoặc email"
            />
          </div>
        </div>

        <select
          className="qllh-select-course"
          value={selectedKhoaHoc}
          onChange={(e) => setSelectedKhoaHoc(e.target.value)}
          aria-label="Lọc theo khóa học"
        >
          <option value="0">Tất cả học viên</option>
          {khoaHocs.map(k => (
            <option key={k.maKhoaHoc} value={k.maKhoaHoc}>
              {k.tenKhoaHoc} ({k.soLuongHocVien} HV)
            </option>
          ))}
        </select>

        {daChonKhoaCuThe && !loading && thongKeHocVien.canNhac > 0 && (
          <div className="qllh-quick-actions">
            <button type="button" className="qllh-btn-quick-select" onClick={chonTatCaGiamChan}>
              <i className="bi bi-hourglass-split" style={{ fontSize: 14 }} aria-hidden="true" />
              Chọn học viên cần nhắc ({thongKeHocVien.canNhac})
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="qllh-skeleton-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="qllh-skeleton-row" />
          ))}
        </div>
      )}

      {!loading && (
        <div className="qllh-table-wrapper">
          <div className="qllh-table-head">
            <h2 className="qllh-table-head__title">
              <i className="bi bi-list-check" style={{ fontSize: 17 }} aria-hidden="true" />
              Danh sách học viên
              <span className="qllh-table-head__count">{filteredHocViens.length}</span>
            </h2>
            <span className="qllh-table-head__scope">
              {daChonKhoaCuThe
                ? <>Khóa học: <b>{tenKhoaHocHienTai}</b></>
                : 'Đang xem học viên của tất cả khóa học'}
            </span>
          </div>

          <div className="qllh-table-scroll">
          <table className="qllh-table">
            <thead>
              <tr>
                {daChonKhoaCuThe && (
                  <th className="qllh-col-check">
                    <input type="checkbox" checked={pageAllSelected} onChange={toggleSelectPage} aria-label="Chọn trang" />
                  </th>
                )}
                <th className="qllh-col-student">Học viên</th>
                <th>Email</th>
                {daChonKhoaCuThe && <th>Tiến độ</th>}
                {daChonKhoaCuThe && <th>Học gần nhất</th>}
                {daChonKhoaCuThe && <th>Nhãn</th>}
                <th className="qllh-col-status">Trạng thái</th>
                {!daChonKhoaCuThe && <th>Ngày tham gia</th>}
                <th className="qllh-col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={daChonKhoaCuThe ? 8 : 5} className="qllh-empty-cell">
                    <div className="qllh-empty-state">
                      <span className="qllh-empty-state__icon" aria-hidden="true">
                        <i className="bi bi-person-x" aria-hidden="true" />
                      </span>
                      <p className="qllh-empty-state__title">
                        {filterTag !== 'all'
                          ? 'Không có học viên thuộc nhãn này'
                          : searchInput.trim()
                            ? 'Không tìm thấy học viên phù hợp'
                            : 'Chưa có học viên'}
                      </p>
                      <p className="qllh-empty-state__desc">
                        {filterTag !== 'all'
                          ? 'Thử bỏ lọc nhãn để xem toàn bộ học viên trong khóa học.'
                          : searchInput.trim()
                            ? 'Kiểm tra lại từ khóa tìm kiếm hoặc chọn khóa học khác.'
                            : 'Danh sách sẽ hiện khi có học viên đăng ký khóa học của bạn.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((hv, index) => {
                  const pct = hv.phanTramTienDo ?? 0;
                  const tagMeta = getSmartTagMeta(hv.tag);
                  return (
                  <tr key={`${hv.maNguoiDung}-${index}`} className={selectedIds.has(hv.maNguoiDung) ? 'is-selected' : ''}>
                    {daChonKhoaCuThe && (
                      <td className="qllh-col-check">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(hv.maNguoiDung)}
                          onChange={() => toggleSelect(hv.maNguoiDung)}
                          aria-label={`Chọn ${hv.hoTen}`}
                        />
                      </td>
                    )}
                    <td className="qllh-col-student">
                      <div className="qllh-user-info">
                        <div className="qllh-avatar">
                          <HocVienAvatar hoTen={hv.hoTen} anhDaiDien={hv.anhDaiDien} />
                        </div>
                        <span className="qllh-user-name">{hv.hoTen}</span>
                      </div>
                    </td>
                    <td style={{ color: '#4b5563' }}>{hv.email}</td>
                    {daChonKhoaCuThe && (
                      <td>
                        <div className="qllh-progress-cell">
                          <div className="qllh-progress-track">
                            <div className="qllh-progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="qllh-progress-text">{pct}% · {hv.soBaiDaHoc ?? 0}/{hv.tongSoBai ?? 0}</span>
                        </div>
                      </td>
                    )}
                    {daChonKhoaCuThe && (
                      <td style={{ color: '#6b7280', fontSize: 13 }}>{formatNgayHocCuoi(hv.ngayHocCuoi)}</td>
                    )}
                    {daChonKhoaCuThe && (
                      <td>
                        {tagMeta ? (
                          <span className={`qllh-smart-tag ${tagMeta.className}`} title={`${hv.soBaiDaHoc ?? 0}/${hv.tongSoBai ?? 0} bài`}>
                            {tagMeta.icon} {tagMeta.label}
                          </span>
                        ) : <span className="qllh-smart-tag tag-none">Đang học</span>}
                      </td>
                    )}
                    <td className="qllh-col-status">
                      {(() => {
                        const meta = getTrangThaiMeta(hv.trangThai);
                        return <span className={`qllh-badge ${meta.className}`}>{meta.label}</span>;
                      })()}
                    </td>
                    {!daChonKhoaCuThe && (
                      <td style={{ color: '#4b5563' }}>{new Date(hv.ngayDangKy).toLocaleDateString('vi-VN')}</td>
                    )}

                    <td className="qllh-col-actions">
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', padding: '8px' }}
                        title="Tặng khóa học"
                        onClick={() => void handleTangKhoaHoc(hv)}
                        disabled={dangTangCho === hv.maNguoiDung}
                      >
                        <i className="bi bi-gift" style={{ fontSize: 18 }} aria-hidden="true" />
                      </button>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '8px' }}
                        title={!daChonKhoaCuThe ? "Xem các khóa đã đăng ký" : "Xem tiến độ chi tiết"}
                        onClick={() => handleViewDetailClick(hv)}
                      >
                        <i className="bi bi-eye" style={{ fontSize: 18 }} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );})
              )}
            </tbody>
          </table>
          </div>

          {filteredHocViens.length > 0 && (
            <div className="qllh-pagination">
              <span className="qllh-page-info">
                Đang hiển thị {paginationInfo.from} - {paginationInfo.to} trong {paginationInfo.total} học viên
              </span>
              <button className="qllh-page-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}><i className="bi bi-chevron-left" style={{ fontSize: 12 }} aria-hidden="true" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button key={number} className={`qllh-page-btn ${currentPage === number ? 'active' : ''}`} onClick={() => paginate(number)}>{number}</button>
              ))}
              <button className="qllh-page-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}><i className="bi bi-chevron-right" style={{ fontSize: 12 }} aria-hidden="true" /></button>
            </div>
          )}
        </div>
      )}

      <section className="qllh-gift-section">
        <div className="qllh-gift-section__head">
          <div className="qllh-gift-section__title-wrap">
            <div className="qllh-gift-section__icon" aria-hidden="true">
              <i className="bi bi-gift" aria-hidden="true" />
            </div>
            <div>
              <h3 className="qllh-gift-section__title">Lịch sử tặng khóa học</h3>
              <p className="qllh-gift-section__subtitle">Theo dõi các lượt tặng gần đây</p>
            </div>
          </div>

          <form
            className="qllh-gift-toolbar"
            onSubmit={(e) => {
              e.preventDefault();
              void fetchLichSuQuaTang(selectedKhoaHoc !== ALL_COURSES_VALUE ? Number(selectedKhoaHoc) : undefined, tuKhoaLichSu || undefined);
            }}
          >
            <div className="qllh-gift-search">
              <i className="bi bi-search qllh-gift-search__icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Tìm mã, tên hoặc email người nhận..."
                className="qllh-gift-search__input"
                value={tuKhoaLichSu}
                onChange={(e) => setTuKhoaLichSu(e.target.value)}
              />
            </div>
            <button type="submit" className="qllh-gift-btn qllh-gift-btn--primary">Tìm</button>
            <button type="button" className="qllh-gift-btn qllh-gift-btn--outline" onClick={xuatCsvLichSu}>
              <i className="bi bi-download" style={{ fontSize: 14 }} aria-hidden="true" />
              Xuất CSV
            </button>
          </form>
        </div>

        <div className="qllh-gift-table-wrap">
          <table className="qllh-gift-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khóa học</th>
                <th>Người nhận</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {dangTaiLichSu ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`gift-skel-${i}`}>
                    <td colSpan={5}>
                      <div className="qllh-gift-skeleton" />
                    </td>
                  </tr>
                ))
              ) : lichSuQuaTang.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="qllh-gift-empty">
                      <i className="bi bi-gift" style={{ fontSize: 26 }} aria-hidden="true" />
                      <p>Chưa có lượt tặng khóa học</p>
                      <span>Danh sách sẽ hiện khi bạn tặng khóa cho học viên.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                lichSuTrangHienTai.map((item) => {
                  const status = getQuaTangTrangThaiMeta(item.trangThai);
                  const avatarMau = layMauAvatar(item.tenNguoiNhan);
                  const avatarChu = layChuCaiAvatar(item.tenNguoiNhan);
                  return (
                    <tr key={item.maQuaTang}>
                      <td>
                        <span className="qllh-gift-code">#{item.maQuaTang}</span>
                      </td>
                      <td>
                        <span className="qllh-gift-course" title={item.tenKhoaHoc}>{item.tenKhoaHoc}</span>
                      </td>
                      <td>
                        <div className="qllh-gift-recipient">
                          <span
                            className="qllh-gift-recipient__avatar"
                            style={{ backgroundColor: avatarMau.bg, color: avatarMau.color }}
                          >
                            {avatarChu}
                          </span>
                          <span className="qllh-gift-recipient__info">
                            <strong>{item.tenNguoiNhan}</strong>
                            <small>{item.emailNguoiNhan || '—'}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`qllh-gift-badge ${status.className}`}>{status.label}</span>
                      </td>
                      <td className="qllh-gift-time">{formatGiftTime(item.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!dangTaiLichSu && lichSuQuaTang.length > 0 && (
          <div className="qllh-gift-pagination">
            <span className="qllh-page-info">
              Trang {trangLichSu} / {tongTrangLichSu}
            </span>
            <button className="qllh-page-btn" onClick={() => setTrangLichSu((p) => Math.max(1, p - 1))} disabled={trangLichSu === 1}>
              <i className="bi bi-chevron-left" style={{ fontSize: 12 }} aria-hidden="true" />
            </button>
            <button className="qllh-page-btn" onClick={() => setTrangLichSu((p) => Math.min(tongTrangLichSu, p + 1))} disabled={trangLichSu >= tongTrangLichSu}>
              <i className="bi bi-chevron-right" style={{ fontSize: 12 }} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      {daChonKhoaCuThe && selectedIds.size > 0 && (
        <div className="qllh-floating-bar">
          <span className="qllh-floating-bar__count">
            <b>{selectedIds.size}</b> học viên được chọn
          </span>
          <button type="button" className="qllh-floating-bar__clear" onClick={() => setSelectedIds(new Set())}>
            Huỷ chọn
          </button>
          <button
            type="button"
            className="qllh-floating-bar__mail"
            onClick={() => setShowBulkModal(true)}
          >
            <i className="bi bi-envelope-paper" style={{ fontSize: 15 }} aria-hidden="true" />
            Gửi mail
          </button>
        </div>
      )}

      <BulkMailModal
        open={showBulkModal}
        tenKhoaHoc={tenKhoaHocHienTai}
        nguoiNhan={selectedHocViens.map((h) => ({
          maNguoiDung: h.maNguoiDung,
          hoTen: h.hoTen,
          email: h.email,
          tag: h.tag,
        }))}
        dangGui={dangGuiMail}
        onClose={() => setShowBulkModal(false)}
        onRemoveNguoiNhan={(ma) =>
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(ma);
            return next;
          })
        }
        onSend={handleGuiMailHangLoat}
      />

      {/* POPUP LINH HOẠT TÙY CHẾ ĐỘ */}
      {showModal && (
        <div className="qllh-modal-overlay" onClick={closeModal}>
          <div className="qllh-modal-box" onClick={(e) => e.stopPropagation()}>

            <div className="qllh-modal-header">
              <div>
                <h2>{modalMode === 'TIEN_DO' ? 'Tiến độ học tập chi tiết' : 'Các khóa học đã đăng ký'}</h2>
                <p style={{ margin: '4px 0 0 0' }}>Học viên: <b>{selectedHocVienInfo?.hoTen}</b>
                  {modalMode === 'TIEN_DO' && <span> - Khóa: <b>{selectedHocVienInfo?.tenKhoaHoc}</b></span>}
                </p>
                {modalMode === 'TIEN_DO' && !loadingModal && tienDoKhoaHoc && (
                  <>
                    <p style={{ marginTop: '8px', marginBottom: 0, color: '#3b82f6', fontSize: '14px', fontWeight: 'bold' }}>
                      Đã học được: {formatTime(tienDoKhoaHoc.tongThoiGianHocPhut)}
                    </p>
                    <div className="qllh-modal-progress">
                      <div className="qllh-modal-progress__label">
                        <span>Tiến độ khóa học</span>
                        <span className="qllh-modal-progress__pct">{tienDoPhanTramKhoaHoc}%</span>
                      </div>
                      <div className="qllh-progress-track qllh-progress-track--modal">
                        <div className="qllh-progress-fill" style={{ width: `${tienDoPhanTramKhoaHoc}%` }} />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button className="qllh-btn-close" onClick={closeModal}><i className="bi bi-x-lg" aria-hidden="true" /></button>
            </div>

            <div className="qllh-modal-body">
              {loadingModal && <p style={{ color: '#2563eb', textAlign: 'center' }}>Đang tải dữ liệu...</p>}

              {/* CHẾ ĐỘ TIẾN ĐỘ BÀI HỌC  */}
              {!loadingModal && modalMode === 'TIEN_DO' && tienDoKhoaHoc && (
                <>
                  {tienDoKhoaHoc.danhSachChuong.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6b7280' }}>Khóa học này chưa cập nhật nội dung bài học.</p>
                  ) : (
                    tienDoKhoaHoc.danhSachChuong.map((chuong, index) => {
                      const isOpen = expandedChapters.includes(chuong.maChuong);
                      return (
                        <div key={index} className="qllh-chuong-item">
                          <div
                            className="qllh-chuong-title"
                            onClick={() => toggleChapter(chuong.maChuong)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}
                          >
                            <span style={{ color: '#111827', display: 'flex', alignItems: 'center' }}>
                              <i className="bi bi-chevron-down" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', marginRight: '10px', color: '#2563eb' }} aria-hidden="true" />
                              {chuong.tenChuong}
                            </span>
                            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'normal' }}>
                              {chuong.danhSachBaiHoc.length} bài
                            </span>
                          </div>

                          {isOpen && (
                            <ul className="qllh-bai-list" style={{ display: 'block', paddingLeft: '12px', marginTop: '8px' }}>
                              {chuong.danhSachBaiHoc.map(bai => (
                                <li key={bai.maBaiHoc} className="qllh-bai-item" style={{ padding: '10px 12px' }}>
                                  {bai.daHoanThanh ? <i className="bi bi-check-circle-fill" style={{ fontSize: 16, color: '#10b981' }} aria-hidden="true" /> : <i className="bi bi-circle" style={{ fontSize: 16, color: '#d1d5db' }} aria-hidden="true" />}
                                  <span className="qllh-bai-name" style={{ marginLeft: '12px', color: '#374151' }}>{bai.tenBaiHoc}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {/* CHẾ ĐỘ DANH SÁCH KHÓA HỌC */}
              {!loadingModal && modalMode === 'DANH_SACH_KHOA' && (
                <>
                  {studentCourses.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6b7280' }}>Học viên này chưa đăng ký khóa học nào.</p>
                  ) : (
                    <div className="qllh-chuong-item">
                      <ul className="qllh-bai-list" style={{ display: 'block' }}>
                        {studentCourses.map(k => (
                          <li key={k.maKhoaHoc} className="qllh-bai-item" style={{ justifyContent: 'space-between', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '8px', border: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <i className="bi bi-check-circle-fill" style={{ fontSize: 18, color: '#3b82f6' }} aria-hidden="true" />
                              <span className="qllh-bai-name" style={{ fontWeight: 'bold', fontSize: '15px' }}>{k.tenKhoaHoc}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                {new Date(k.ngayDangKy).toLocaleDateString('vi-VN')}
                              </span>
                              {(() => {
                                const meta = getTrangThaiMeta(k.trangThai);
                                return <span className={`qllh-badge ${meta.className}`}>{meta.label}</span>;
                              })()}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="qllh-modal-footer">
              <button className="qllh-page-btn active" onClick={closeModal} style={{ padding: '8px 20px' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
