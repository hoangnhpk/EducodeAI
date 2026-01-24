import { useState, useEffect } from 'react';
import { khoaHocCuaToiService } from '@/services/khoa-hoc.service';
import DanhSachKhoaHoc from './components/DanhSachKhoaHoc';
import ChiTietKhoaHoc from './components/ChiTietKhoaHoc';
import './KhoaHocCuaToi.css';

const KhoaHocCuaToi = () => {
    const [danhSach, setDanhSach] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [idSelected, setIdSelected] = useState<number | null>(null);

    useEffect(() => {
        const layDuLieuThat = async () => { 
            try {
                setIsLoading(true);
                const data: any = await khoaHocCuaToiService.getDanhSach(1);
                setDanhSach(data);
            } catch (error) {
                console.error("Không lấy được dữ liệu thật:", error);
                setDanhSach([]);
            } finally {
                setIsLoading(false);
            }
        };
        layDuLieuThat();
    }, []);

    if (isLoading) return <div className="p-5 text-center">Đang tải danh sách khóa học...</div>;

    return (
        <div className="container-fluid mt-4">
            {idSelected === null ? (
                <div className="fade-in">
                    <h2 className="mb-4 font-weight-bold">Khóa học của tôi</h2>
                    {danhSach.length > 0 ? (
                        <DanhSachKhoaHoc
                            DuLieu={danhSach}
                            onXemChiTiet={(id) => setIdSelected(id)}
                        />
                    ) : (
                        <div className="alert alert-info">Bạn chưa có khóa học nào.</div>
                    )}
                </div>
            ) : (
                <div className="fade-in">
                    <button className="btn btn-outline-primary mb-3" onClick={() => setIdSelected(null)}>
                        <i className="fa fa-arrow-left"></i> Quay lại
                    </button>
                    <ChiTietKhoaHoc
                        maKhoaHoc={idSelected}
                        onQuayLai={() => setIdSelected(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default KhoaHocCuaToi;