import React, { useState } from 'react';
import './KhoaHocCuaToi.css';
import DanhSachKhoaHoc from './DanhSachKhoaHoc';
import ChiTietKhoaHoc from './ChiTietKhoaHoc';

const KhoaHocCuaToi: React.FC = () => {
    const [idKhoaHocChon, setIdKhoaHocChon] = useState<number | null>(null);

    return (
        <div className="course-container">
            {idKhoaHocChon === null ? (
                <DanhSachKhoaHoc onXemChiTiet={(id) => setIdKhoaHocChon(id)} />
            ) : (
                <ChiTietKhoaHoc idKhoaHoc={idKhoaHocChon} onQuayLai={() => setIdKhoaHocChon(null)} />
            )}
        </div>
    );
};
export default KhoaHocCuaToi;