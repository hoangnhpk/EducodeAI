import React, { useEffect, useState, useMemo } from 'react';
import { KhoaHocService } from '@/services/khoa-hoc.service';
import type { KhoaHocData } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO';

// Import CSS
import '@/pages/hoc-vien/noi-dung-khoa-hoc/style.css';

// Import Components
import { ThanhTieuDe } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/ThanhTieuDe'; 
import { DanhSachBaiHoc } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/DanhSachBaiHoc';
import { NoiDungVideo } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/NoiDungVideo';
// import { NoiDungLyThuyet } from './CacThanhPhan/NoiDungLyThuyet';
// import { BaiTapThucHanh } from './CacThanhPhan/BaiTapThucHanh';
// import { BaiTapTracNghiem } from './CacThanhPhan/BaiTapTracNghiem';
// import { DieuHuongNhanh } from './CacThanhPhan/DieuHuongNhanh';

const NoiDungKhoaHoc = () => {
    const [khoaHoc, setKhoaHoc] = useState<KhoaHocData | null>(null);
    const [idBaiHoc, setIdBaiHoc] = useState<number>(0);

    // 1. Load Data
    useEffect(() => {
        KhoaHocService.layDuLieuKhoaHoc(7).then(data => {
            setKhoaHoc(data);
            console.log('🚀🚀🚀 KhoaHocData:', data);
            if (!data) return;
            // Mặc định chọn bài đầu tiên
            if (data.danhSachChuongHoc[0]?.danhSachBaiHoc[0]) {
                setIdBaiHoc(data.danhSachChuongHoc[0].danhSachBaiHoc[0].id);
            }
        });
    }, []);

    // 2. Logic tính toán (Gọi Service)
    const flatList = useMemo(() => 
        khoaHoc ? KhoaHocService.lamPhangDanhSachBaiHoc(khoaHoc.danhSachChuongHoc) : [], 
    [khoaHoc]);

    const baiHocHienTai = KhoaHocService.timBaiHocTheoId(flatList, idBaiHoc);
    // const nextId = KhoaHocService.timBaiTiepTheo(flatList, idBaiHoc);
    // const prevId = KhoaHocService.timBaiTruoc(flatList, idBaiHoc);
    const progress = KhoaHocService.tinhPhanTramTienDo(flatList, idBaiHoc);

    if (!khoaHoc || !baiHocHienTai) return <div>Đang tải khóa học...</div>;

    // 3. Render nội dung giữa màn hình
    const renderMainContent = () => {
        switch (baiHocHienTai.loaiBaiHoc) {
            case 'Video': return <NoiDungVideo videoUrl={baiHocHienTai.linkVideo} />;
            default: return <div>Loại bài học không hỗ trợ</div>;
        }
    };

    return (
        <div style={{ background: '#f4f5fb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <ThanhTieuDe tenKhoaHoc={khoaHoc.tenKhoaHoc} tienDo={progress} />

            <main className="cp-shell">
                {/* CỘT TRÁI */}
                <section className="cp-left">
                    {/* Tab Navigation giả lập (cho giống HTML cũ) */}
                    <div className="cp-tabs">
                        <button className="cp-tab cp-tab-active">
                            <i className="fas fa-play-circle"></i> Bài học
                        </button>
                        <button className="cp-tab">
                            <i className="fas fa-star"></i> Đánh giá
                        </button>
                    </div>

                    <div className="cp-main-content">
                        {renderMainContent()}
                    </div>
                </section>

                {/* CỘT PHẢI: SIDEBAR */}
                <DanhSachBaiHoc 
                    cacChuong={khoaHoc.danhSachChuongHoc}
                    idBaiHocHienTai={idBaiHoc}
                    onChonBaiHoc={setIdBaiHoc}
                />
            </main>

            {/* <DieuHuongNhanh 
                onPrev={() => prevId && setIdBaiHoc(prevId)}
                onNext={() => nextId && setIdBaiHoc(nextId)}
                hasPrev={!!prevId}
                hasNext={!!nextId}
            /> */}
        </div>
    );
};

export default NoiDungKhoaHoc;