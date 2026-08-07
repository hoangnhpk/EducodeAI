import React from 'react';

interface ExerciseFilterProps {
    tuKhoa: string;
    setTuKhoa: (val: string) => void;
    locKhoaHoc: string;
    setLocKhoaHoc: (val: string) => void;
    locLoai: string;
    setLocLoai: (val: string) => void;
    locTrangThai: string;
    setLocTrangThai: (val: string) => void;
    danhSachKhoaHocFilter: string[];
}

export const ExerciseFilter: React.FC<ExerciseFilterProps> = ({
    tuKhoa, setTuKhoa,
    locKhoaHoc, setLocKhoaHoc,
    locLoai, setLocLoai,
    locTrangThai, setLocTrangThai,
    danhSachKhoaHocFilter
}) => {
    return (
        <div className="card mb-3" style={{ padding: 16 }}>
            <div className="row g-3">
                <div className="col-md-4">
                    <input 
                        className="form-control" 
                        placeholder="Tìm theo tên bài tập, khóa học, chương, bài học..." 
                        value={tuKhoa} 
                        onChange={e => setTuKhoa(e.target.value)} 
                    />
                </div>
                <div className="col-md-3">
                    <select className="form-select" value={locKhoaHoc} onChange={e => setLocKhoaHoc(e.target.value)}>
                        <option value="TatCa">Tất cả khóa học</option>
                        {danhSachKhoaHocFilter.map(kh => <option key={kh} value={kh}>{kh}</option>)}
                    </select>
                </div>
                <div className="col-md-2">
                    <select className="form-select" value={locLoai} onChange={e => setLocLoai(e.target.value)}>
                        <option value="TatCa">Tất cả loại</option>
                        <option value="Quiz">Quiz</option>
                        <option value="IDE">Thực hành IDE</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <select className="form-select" value={locTrangThai} onChange={e => setLocTrangThai(e.target.value)}>
                        <option value="TatCa">Tất cả trạng thái</option>
                        <option value="Draft">Nháp</option>
                        <option value="Published">Đã xuất bản</option>
                        <option value="Hidden">Đã ẩn</option>
                    </select>
                </div>
                <div className="col-md-1">
                    <button 
                        className="btn btn-outline-secondary w-100" 
                        onClick={() => { setTuKhoa(''); setLocLoai('TatCa'); setLocTrangThai('TatCa'); setLocKhoaHoc('TatCa'); }}
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};
