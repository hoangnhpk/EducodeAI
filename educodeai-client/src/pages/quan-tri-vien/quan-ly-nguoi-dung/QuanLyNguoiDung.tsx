import { useEffect, useState } from "react";
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
    const [tuKhoa, setTuKhoa] = useState("");
    const [vaiTroLoc, setVaiTroLoc] =
        useState<"ALL" | "Admin" | "Giảng viên" | "Học viên">("ALL");
    const [dangSua, setDangSua] = useState<NguoiDung | null>(null);
    const [moModal, setMoModal] = useState(false);

    const taiDanhSach = async () => {
        setDangTai(true);
        try {
            const res = await NguoiDungService.layDanhSach();
            setDs(res);
        } catch (error) {
            console.error(error);
        } finally {
            setDangTai(false);
        }
    };

    useEffect(() => {
        taiDanhSach();
    }, []);

    const danhSachSauLoc = ds.filter(u => {
        const keyword = tuKhoa.toLowerCase();

        const matchKeyword =
            (u.hoTen || "").toLowerCase().includes(keyword) ||
            (u.email || "").toLowerCase().includes(keyword);

        const matchVaiTro =
            vaiTroLoc === "ALL" || u.vaiTro === vaiTroLoc;

        return matchKeyword && matchVaiTro;
    });

    const luuNguoiDung = async (data: any) => {
    try {
        const payload = {
            HoTen:   data.hoTen,
            Email:   data.email,
            MatKhau: data.matKhau,
            VaiTro:  data.vaiTro === "Admin" ? 0 : data.vaiTro === "Giảng viên" ? 1 : 2
        };

        if (dangSua) {
            await NguoiDungService.capNhatNguoiDung(dangSua.maNguoiDung, payload);
            Swal.fire({ title: 'Cập nhật thành công!', icon: 'success', timer: 1500, showConfirmButton: false });
        } else {
            await NguoiDungService.themNguoiDung(payload);
            Swal.fire({ title: 'Thêm người dùng thành công!', icon: 'success', timer: 1500, showConfirmButton: false });
        }

        setMoModal(false);
        taiDanhSach();
    } catch (error: any) {
        Swal.fire({ title: 'Thất bại!', text: error.response?.data || 'Có lỗi xảy ra.', icon: 'error' });
    }
};

    return (
        <div className="user-management-container">
            <h2 className="page-title">Quản lý người dùng</h2>

            <ThanhCongCu
                tuKhoa={tuKhoa}
                onThayDoiTuKhoa={setTuKhoa}
                vaiTroLoc={vaiTroLoc}
                onThayDoiVaiTro={setVaiTroLoc}
                onThemMoi={() => {
                    setDangSua(null);
                    setMoModal(true);
                }}
            />

            <DanhSachNguoiDung
                duLieu={danhSachSauLoc}
                dangTai={dangTai}
                onSua={(u) => {
                    setDangSua(u);
                    setMoModal(true);
                }}
                onXoa={async (u) => {
    const { isConfirmed } = await Swal.fire({
        title: 'Xóa người dùng này?',
        text: `${u.hoTen} sẽ bị xóa vĩnh viễn.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
    });
    if (!isConfirmed) return;
    try {
        await NguoiDungService.xoaNguoiDung(u.maNguoiDung);
        taiDanhSach();
        Swal.fire({ title: 'Đã xóa!', icon: 'success', timer: 1200, showConfirmButton: false });
    } catch {
        Swal.fire('Lỗi', 'Không thể xóa người dùng.', 'error');
    }
}}
                onDoiTrangThai={async (u: NguoiDung) => {  // ← thêm type rõ ràng
    try {
        await NguoiDungService.thayDoiTrangThai(u.maNguoiDung);
        taiDanhSach();
        Swal.fire({
            title: u.trangThai ? 'Đã khóa tài khoản!' : 'Đã mở tài khoản!',
            icon: 'success', timer: 1200, showConfirmButton: false
        });
    } catch {
        Swal.fire('Lỗi', 'Không thể thay đổi trạng thái.', 'error');
    }
}}
            />

            <ModalNguoiDung
                hienThi={moModal}
                dangSua={dangSua}
                onDong={() => setMoModal(false)}
                onHoanThanh={luuNguoiDung}
            />
        </div>
    );
};

export default QuanLyNguoiDung;