import { memo } from "react";

type Props = {
    tuKhoa: string;
    onThayDoiTuKhoa: (v: string) => void;
    vaiTroLoc: "ALL" | "Admin" | "Giảng viên" | "Học viên";
    onThayDoiVaiTro: (v: "ALL" | "Admin" | "Giảng viên" | "Học viên") => void;
    trangThaiLoc: "ALL" | "Hoạt động" | "Bị khóa" | "Khóa vĩnh viễn";
    onThayDoiTrangThai: (v: "ALL" | "Hoạt động" | "Bị khóa" | "Khóa vĩnh viễn") => void;
};

const ThanhCongCu = memo(({
    tuKhoa,
    onThayDoiTuKhoa,
    vaiTroLoc,
    onThayDoiVaiTro,
    trangThaiLoc,
    onThayDoiTrangThai
}: Props) => {

    return (
        <div className="toolbar">
            <input
                className="search-input"
                placeholder="Tìm theo tên hoặc email..."
                value={tuKhoa}
                onChange={(e) => onThayDoiTuKhoa(e.target.value)}
            />
            <select className="filter-select" value={vaiTroLoc} onChange={(e) => onThayDoiVaiTro(e.target.value as Props["vaiTroLoc"])}>
                <option value="ALL">Tất cả vai trò</option>
                <option value="Giảng viên">Giảng viên</option>
                <option value="Học viên">Học viên</option>
                <option value="Admin">Admin</option>
            </select>
            <select className="filter-select" value={trangThaiLoc} onChange={(e) => onThayDoiTrangThai(e.target.value as Props["trangThaiLoc"])}>
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Bị khóa">Tạm khóa</option>
                <option value="Khóa vĩnh viễn">Khóa vĩnh viễn</option>
            </select>
        </div>
    );
});

export default ThanhCongCu;
