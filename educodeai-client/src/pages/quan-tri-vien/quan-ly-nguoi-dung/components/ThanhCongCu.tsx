type Props = {
    tuKhoa: string;
    onThayDoiTuKhoa: (v: string) => void;
    vaiTroLoc: "ALL" | "Admin" | "Giảng viên" | "Học viên";
    onThayDoiVaiTro: (v: "ALL" | "Admin" | "Giảng viên" | "Học viên") => void;
    onThemMoi: () => void;
};

const ThanhCongCu = ({
    tuKhoa,
    onThayDoiTuKhoa,
    vaiTroLoc,
    onThayDoiVaiTro,
    onThemMoi
}: Props) => {

    return (
        <div className="toolbar">

            <input
                className="search-input"
                placeholder="Tìm theo tên hoặc email..."
                value={tuKhoa}
                onChange={(e) =>
                    onThayDoiTuKhoa(e.target.value)
                }
            />

            <select
                className="filter-select"
                value={vaiTroLoc}
                onChange={(e) =>
                    onThayDoiVaiTro(
                        e.target.value as
                        "ALL" | "Admin" | "Giảng viên" | "Học viên"
                    )
                }
            >
                <option value="ALL">Tất cả vai trò</option>
                <option value="Admin">Admin</option>
                <option value="Giảng viên">Giảng viên</option>
                <option value="Học viên">Học viên</option>
            </select>

            <button className="btn-add"onClick={onThemMoi} >Thêm Người Dùng</button>

        </div>
    );
};

export default ThanhCongCu;