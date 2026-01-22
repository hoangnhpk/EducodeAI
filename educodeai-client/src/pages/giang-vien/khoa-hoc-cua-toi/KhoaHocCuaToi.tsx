import React, { useState } from 'react';
import './KhoaHocCuaToi.css';
import DanhSachKhoaHoc from './DanhSachKhoaHoc';
import ChiTietKhoaHoc from './ChiTietKhoaHoc';

const KhoaHocCuaToi: React.FC = () => {
    // Lưu ID dưới dạng number để khớp với Database
    const [idKhoaHocChon, setIdKhoaHocChon] = useState<number | null>(null);

    return (
        <div className="course-container">
            {idKhoaHocChon === null ? (
                // Khi bấm "Chi tiết", ID sẽ được set vào state
                <DanhSachKhoaHoc onXemChiTiet={(id) => setIdKhoaHocChon(id)} />
            ) : (
                // Truyền ID thật xuống để API gọi đúng link chi tiết
                <ChiTietKhoaHoc idKhoaHoc={idKhoaHocChon} onQuayLai={() => setIdKhoaHocChon(null)} />
            )}
        </div>
    );
};
export default KhoaHocCuaToi;