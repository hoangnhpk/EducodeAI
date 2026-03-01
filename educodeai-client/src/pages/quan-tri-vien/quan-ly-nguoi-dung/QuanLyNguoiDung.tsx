import { useEffect, useState } from "react";
import { type NguoiDung } from '@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO'
import { NguoiDungService } from "@/services/quan-ly-nguoi-dung.service";

import ThanhCongCu from "./components/ThanhCongCu";
import DanhSachNguoiDung from "./components/DanhSachNguoiDung";
import ModalNguoiDung from "./components/ModalNguoiDung";
import "./QuanLyNguoiDung.css";

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
                HoTen: data.hoTen,
                Email: data.email,
                MatKhau: data.matKhau,
                VaiTro:
                    data.vaiTro === "Admin" ? 0 :
                    data.vaiTro === "Giảng viên" ? 1 : 2
            };

            if (dangSua) {
                await NguoiDungService.capNhatNguoiDung(
                    dangSua.maNguoiDung,
                    payload
                );
                alert("Cập nhật thành công");
            } else {
                await NguoiDungService.themNguoiDung(payload);
                alert("Thêm mới thành công");
            }

            setMoModal(false);
            taiDanhSach();
        } catch (error: any) {
            alert(error.response?.data || "Có lỗi xảy ra");
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
                    if (confirm("Xóa người dùng này?")) {
                        await NguoiDungService.xoaNguoiDung(u.maNguoiDung);
                        taiDanhSach();
                    }
                }}
                onDoiTrangThai={async (u) => {
                    await NguoiDungService.thayDoiTrangThai(u.maNguoiDung);
                    taiDanhSach();
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