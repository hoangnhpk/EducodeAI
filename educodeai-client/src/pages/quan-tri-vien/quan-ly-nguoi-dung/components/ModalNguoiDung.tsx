import { useEffect, useState } from "react";
import { type NguoiDung } from "@/pages/quan-tri-vien/quan-ly-nguoi-dung/DuLieuNguoiDungDTO";
import "../QuanLyNguoiDung.css"; // import css riêng

type Props = {
    hienThi: boolean;
    dangSua: NguoiDung | null;
    onDong: () => void;
    onHoanThanh: (data: {
        hoTen: string;
        email: string;
        matKhau?: string;
        vaiTro: "Admin" | "Giảng viên" | "Học viên";
    }) => void;
};

const ModalNguoiDung = ({
    hienThi,
    dangSua,
    onDong,
    onHoanThanh
}: Props) => {

    const [hoTen, setHoTen] = useState("");
    const [email, setEmail] = useState("");
    const [matKhau, setMatKhau] = useState("");
    const [vaiTro, setVaiTro] =
        useState<"Admin" | "Giảng viên" | "Học viên">("Học viên");

    useEffect(() => {
        if (dangSua) {
            setHoTen(dangSua.hoTen || "");
            setEmail(dangSua.email || "");
            setVaiTro(
                dangSua.vaiTro as "Admin" | "Giảng viên" | "Học viên"
            );
            setMatKhau("");
        } else {
            setHoTen("");
            setEmail("");
            setVaiTro("Học viên");
            setMatKhau("");
        }
    }, [dangSua]);

    if (!hienThi) return null;

    const handleSubmit = () => {
        if (!hoTen || !email) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        onHoanThanh({
            hoTen,
            email,
            matKhau,
            vaiTro
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3 className="modal-title">
                    {dangSua ? "Cập nhật người dùng" : "Thêm người dùng"}
                </h3>

                <div className="form-group">
                    <label>Họ tên</label>
                    <input
                        value={hoTen}
                        onChange={(e) => setHoTen(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {!dangSua && (
                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            value={matKhau}
                            onChange={(e) => setMatKhau(e.target.value)}
                        />
                    </div>
                )}

                <div className="form-group">
                    <label>Vai trò</label>
                    <select
                        value={vaiTro}
                        onChange={(e) =>
                            setVaiTro(
                                e.target.value as
                                    "Admin" | "Giảng viên" | "Học viên"
                            )
                        }
                    >
                        <option value="Admin">Admin</option>
                        <option value="Giảng viên">Giảng viên</option>
                        <option value="Học viên">Học viên</option>
                    </select>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onDong}>
                        Hủy
                    </button>
                    <button className="btn-save" onClick={handleSubmit}>
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalNguoiDung;