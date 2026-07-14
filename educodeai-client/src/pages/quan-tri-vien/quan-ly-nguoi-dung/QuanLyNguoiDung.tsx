import { useEffect, useState, useMemo, useCallback } from "react";
import { type NguoiDung } from '@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO'
import { NguoiDungService } from "@/services/quan-ly-nguoi-dung.service";

import ThanhCongCu from "./components/ThanhCongCu";
import DanhSachNguoiDung from "./components/DanhSachNguoiDung";
import ModalNguoiDung from "./components/ModalNguoiDung";
import "./QuanLyNguoiDung.css";
import Swal from 'sweetalert2';

const QuanLyNguoiDung = () => {
    const [ds, setDs] = useState<NguoiDung[]>([]);
    const [dangTai, setDangTai] = useState(false);
    const [loi, setLoi] = useState(false);
    const [tuKhoa, setTuKhoa] = useState("");
    const [vaiTroLoc, setVaiTroLoc] = useState<"ALL" | "Admin" | "Giảng viên" | "Học viên">("ALL");
    const [trangThaiLoc, setTrangThaiLoc] = useState<"ALL" | "Hoạt động" | "Bị khóa" | "Khóa vĩnh viễn">("ALL");
    const [dangSua, setDangSua] = useState<NguoiDung | null>(null);
    const [moModal, setMoModal] = useState(false);
    const [trangHienTai, setTrangHienTai] = useState(1);
    const soLuongMoiTrang = 10;

    // Hàm trợ giúp tính toán văn bản trạng thái đồng nhất với bộ lọc
    const getStatusInfo = useCallback((trangThaiRaw: string, thoiGianMoKhoaRaw: any) => {
        // Nếu DB trả về "Hoạt động" hoặc "Khóa vĩnh viễn" thì giữ nguyên
        if (trangThaiRaw === "Hoạt động") return "Hoạt động";
        if (trangThaiRaw === "Khóa vĩnh viễn") return "Khóa vĩnh viễn";

        // Nếu là "Bị khóa" hoặc "Tạm khóa", tính toán thời gian còn lại
        if (trangThaiRaw === "Bị khóa" || trangThaiRaw === "Tạm khóa") {
            if (thoiGianMoKhoaRaw) {
                const moKhoa = new Date(thoiGianMoKhoaRaw);
                const bayGio = new Date();
                const diff = moKhoa.getTime() - bayGio.getTime();

                if (diff > 0) {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                    if (days > 0) return `Tạm khóa (còn ${days} ngày)`;
                    if (hours > 0) return `Tạm khóa (còn ${hours} giờ)`;
                    return `Tạm khóa (còn ${mins} phút)`;
                }
            }
            return "Tạm khóa";
        }
        
        return trangThaiRaw || "Không xác định";
    }, []);

    const normalizeUser = useCallback((u: any): NguoiDung => {
        const rawStatus = u.trangThai || u.TrangThai || "Hoạt động";
        const rawUnlockTime = u.thoiGianMoKhoa || u.ThoiGianMoKhoa || null;
        
        return {
            maNguoiDung: String(u.maNguoiDung || u.MaNguoiDung || ""),
            hoTen: u.hoTen || u.HoTen || "Người dùng",
            email: u.email || u.Email || "",
            anhDaiDien: u.anhDaiDien || u.AnhDaiDien || "",
            vaiTro: u.vaiTro || u.VaiTro || "Học viên",
            trangThai: rawStatus,
            ngayTao: u.ngayTao || u.NgayTao || "",
            lyDoKhoa: u.lyDoKhoa || u.LyDoKhoa || "",
            thoiGianMoKhoa: rawUnlockTime,
            statusText: getStatusInfo(rawStatus, rawUnlockTime)
        } as any;
    }, [getStatusInfo]);

    const taiDanhSach = useCallback(async () => {
        setDangTai(true);
        setLoi(false);
        try {
            const res = await NguoiDungService.layDanhSach();
            const rawData = Array.isArray(res) ? res : (res as any)?.data || [];
            const normalized = rawData.map(normalizeUser);
            setDs(normalized);
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
            setLoi(true);
        } finally {
            setDangTai(false);
        }
    }, [normalizeUser]);

    useEffect(() => {
        taiDanhSach();
    }, [taiDanhSach]);

    const danhSachSauLoc = useMemo(() => {
        const keyword = tuKhoa.toLowerCase().trim();
        return ds.filter(u => {
            const matchKeyword = !keyword || (u.hoTen?.toLowerCase().includes(keyword)) || (u.email?.toLowerCase().includes(keyword));
            const matchVaiTro = vaiTroLoc === "ALL" || u.vaiTro === vaiTroLoc;
            const matchTrangThai = trangThaiLoc === "ALL" || 
                                 u.trangThai === trangThaiLoc || 
                                 (trangThaiLoc === "Bị khóa" && (u.trangThai === "Bị khóa" || u.trangThai === "Tạm khóa"));
            return matchKeyword && matchVaiTro && matchTrangThai;
        });
    }, [ds, tuKhoa, vaiTroLoc, trangThaiLoc]);

    const danhSachPhanTrang = useMemo(() => {
        const start = (trangHienTai - 1) * soLuongMoiTrang;
        return danhSachSauLoc.slice(start, start + soLuongMoiTrang);
    }, [danhSachSauLoc, trangHienTai]);

    const tongSoTrang = Math.ceil(danhSachSauLoc.length / soLuongMoiTrang);

    const handleSua = useCallback((u: NguoiDung) => { 
        setDangSua(u);
        setMoModal(true);
    }, []);

    const handleThemMoi = useCallback(() => { 
        setDangSua(null);
        setMoModal(true);
    }, []);

    const handleDongModal = useCallback(() => { 
        setMoModal(false);
        setDangSua(null);
    }, []);

    const luuNguoiDung = useCallback(async (data: any) => {
        try {
            const payload = {
                HoTen: data.hoTen,
                Email: data.email,
                MatKhau: data.matKhau,
                VaiTro: data.vaiTro === "Admin" ? 0 : data.vaiTro === "Giảng viên" ? 1 : 2
            };
            if (dangSua) {
                await NguoiDungService.capNhatNguoiDung(dangSua.maNguoiDung, payload);
                Swal.fire({ title: 'Thành công', text: 'Cập nhật thành công', icon: 'success', timer: 1200, showConfirmButton: false });
            } else {
                await NguoiDungService.themNguoiDung(payload);
                Swal.fire({ title: 'Thành công', text: 'Thêm mới thành công', icon: 'success', timer: 1200, showConfirmButton: false });
            }
            handleDongModal();
            taiDanhSach();
        } catch (error: any) {
            Swal.fire({ title: 'Lỗi', text: error.response?.data || 'Có lỗi xảy ra', icon: 'error' });
        }
    }, [dangSua, taiDanhSach, handleDongModal]);

    const handleXoa = useCallback(async (u: NguoiDung) => {
        if (u.trangThai !== "Khóa vĩnh viễn") {
            Swal.fire({ title: 'Lưu ý', text: 'Chỉ có thể xóa tài khoản đã bị khóa vĩnh viễn', icon: 'warning' });
            return;
        }
        const { isConfirmed } = await Swal.fire({ title: 'Xác nhận xóa?', text: `Bạn có chắc muốn xóa ${u.hoTen}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
        if (isConfirmed) {
            try {
                await NguoiDungService.xoaNguoiDung(u.maNguoiDung);
                taiDanhSach();
                Swal.fire('Đã xóa!', '', 'success');
            } catch { Swal.fire('Lỗi', 'Không thể xóa người dùng', 'error'); }
        }
    }, [taiDanhSach]);

    const handleDoiTrangThai = useCallback(async (u: NguoiDung, lyDo?: string, thoiHan?: string) => {
        try {
            await NguoiDungService.thayDoiTrangThai(u.maNguoiDung, lyDo, thoiHan);
            taiDanhSach();
        } catch { Swal.fire('Lỗi', 'Thao tác thất bại', 'error'); }
    }, [taiDanhSach]);

    const handleThayDoiTuKhoa = useCallback((v: string) => { setTuKhoa(v); setTrangHienTai(1); }, []);
    const handleThayDoiVaiTro = useCallback((v: any) => { setVaiTroLoc(v); setTrangHienTai(1); }, []);
    const handleThayDoiTrangThai = useCallback((v: any) => { setTrangThaiLoc(v); setTrangHienTai(1); }, []);

    return (
        <div className="user-management-container">
            <h2 className="page-title">Quản lý người dùng</h2>
            <ThanhCongCu tuKhoa={tuKhoa} onThayDoiTuKhoa={handleThayDoiTuKhoa} vaiTroLoc={vaiTroLoc} onThayDoiVaiTro={handleThayDoiVaiTro} trangThaiLoc={trangThaiLoc} onThayDoiTrangThai={handleThayDoiTrangThai} onThemMoi={handleThemMoi} />
            {loi ? (
                <div style={{
                    padding: '48px 24px', textAlign: 'center',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ fontSize: 40, color: 'var(--danger)', marginBottom: 12 }}>
                        <i className="bi bi-exclamation-triangle-fill" aria-hidden></i>
                    </div>
                    <p style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: 4 }}>Không tải được danh sách người dùng</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng thử lại.</p>
                    <button className="btn-add" style={{ marginLeft: 0 }} onClick={taiDanhSach}>
                        <i className="bi bi-arrow-clockwise" aria-hidden style={{ marginRight: 6 }}></i>Thử lại
                    </button>
                </div>
            ) : (
            <DanhSachNguoiDung duLieu={danhSachPhanTrang} dangTai={dangTai} onSua={handleSua} onXoa={handleXoa} onDoiTrangThai={handleDoiTrangThai} />
            )}
            {!loi && !dangTai && tongSoTrang > 1 && (
                <div className="pagination-wrapper">
                    <button disabled={trangHienTai === 1} onClick={() => setTrangHienTai(p => p - 1)} className="btn-pagination-nav">Trước</button>
                    <div className="pagination-pages">
                        {Array.from({ length: tongSoTrang }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setTrangHienTai(p)} className={`btn-pagination-page ${p === trangHienTai ? 'active' : ''}`}>{p}</button>
                        ))}
                    </div>
                    <button disabled={trangHienTai === tongSoTrang} onClick={() => setTrangHienTai(p => p + 1)} className="btn-pagination-nav">Sau</button>
                </div>
            )}
            {moModal && <ModalNguoiDung hienThi={moModal} dangSua={dangSua} onDong={handleDongModal} onHoanThanh={luuNguoiDung} />}
        </div>
    );
};

export default QuanLyNguoiDung;
