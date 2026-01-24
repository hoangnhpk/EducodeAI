import React, { useState, useEffect } from 'react';
import { khoaHocCuaToiService } from '@/services/khoa-hoc.service';
import BangHocVien from './BangHocVien';
import ModalChiTietHocVien from './ChiTietHocVien';

const ChiTietKhoaHoc: React.FC<{ maKhoaHoc: number; onQuayLai: () => void }> = ({ maKhoaHoc, onQuayLai }) => {
    const [detail, setDetail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedHocVien, setSelectedHocVien] = useState<any>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setIsLoading(true);
                const data = await khoaHocCuaToiService.getChiTiet(maKhoaHoc);
                setDetail(data);
            } catch (error) {
                console.error("Lỗi lấy chi tiết:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [maKhoaHoc]);

    if (isLoading) return <div className="p-5 text-center">Đang tải chi tiết...</div>;

    return (
        <div>
            <button className="btn btn-link text-dark p-0 mb-4" onClick={onQuayLai}></button>
            <h2 className="section-title mb-4">{detail?.tenKhoaHoc}</h2>

            <div className="stat-row">
                <div className="stat-card">
                    <div className="small text-muted">SĨ SỐ</div>
                    <div className="stat-value">{detail?.siSo || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="small text-muted">HOÀN THÀNH</div>
                    <div className="stat-value">{detail?.tiLeHoanThanh || 0}%</div>
                </div>
                <div className="stat-card">
                    <div className="small text-muted">ĐÁNH GIÁ</div>
                    <div className="stat-value text-warning">{detail?.diemDanhGia || 0} ★</div>
                </div>
            </div>

            <h4 className="fw-bold mb-3">Danh sách học viên</h4>
            <BangHocVien danhSach={detail?.danhSachHocVien || []} onXemChiTiet={(hv) => setSelectedHocVien(hv)} />
            <ModalChiTietHocVien hocVien={selectedHocVien} onClose={() => setSelectedHocVien(null)}
            />
        </div>
    );
};

export default ChiTietKhoaHoc;