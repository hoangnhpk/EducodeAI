import { useEffect, useState, useMemo } from 'react';
import { KhoaHocService } from '@/services/khoa-hoc.service';
import type { KhoaHocData } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO';
import '@/pages/hoc-vien/noi-dung-khoa-hoc/style.css';

import { ThanhTieuDe } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/ThanhTieuDe'; 
import { DanhSachBaiHoc } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/DanhSachBaiHoc';
import { NoiDungVideo } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/NoiDungVideo';
// import { NoiDungLyThuyet } from './CacThanhPhan/NoiDungLyThuyet';
// import { BaiTapThucHanh } from './CacThanhPhan/BaiTapThucHanh';
// import { BaiTapTracNghiem } from './CacThanhPhan/BaiTapTracNghiem';
import { DieuHuongNhanh } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components//DieuHuongNhanh';

const NoiDungKhoaHoc = () => {
    const [khoaHoc, setKhoaHoc] = useState<KhoaHocData | null>(null);
    const [idBaiHoc, setIdBaiHoc] = useState<number>(0);

    useEffect(() => {
        KhoaHocService.layDuLieuKhoaHoc(1).then(data => {
            setKhoaHoc(data);
            if (!data) return;
            if (data.danhSachChuongHoc[0]?.danhSachBaiHoc[0]) {
                setIdBaiHoc(data.danhSachChuongHoc[0].danhSachBaiHoc[0].id);
            }
        });
    }, []);

    const flatList = useMemo(() => 
        khoaHoc ? KhoaHocService.lamPhangDanhSachBaiHoc(khoaHoc.danhSachChuongHoc) : [], 
    [khoaHoc]);

    const baiHocHienTai = KhoaHocService.timBaiHocTheoId(flatList, idBaiHoc);
    const nextId = KhoaHocService.timBaiTiepTheo(flatList, idBaiHoc);
    const prevId = KhoaHocService.timBaiTruoc(flatList, idBaiHoc);
    const progress = KhoaHocService.tinhPhanTramTienDo(flatList, idBaiHoc);

    if (!khoaHoc || !baiHocHienTai) return <div>Đang tải khóa học...</div>;

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
                <section className="cp-left">
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

                <DanhSachBaiHoc 
                    cacChuong={khoaHoc.danhSachChuongHoc}
                    idBaiHocHienTai={idBaiHoc}
                    onChonBaiHoc={setIdBaiHoc}
                    
                />
            </main>

            <DieuHuongNhanh 
                onPrev={() => prevId && setIdBaiHoc(prevId)}
                onNext={() => nextId && setIdBaiHoc(nextId)}
                hasPrev={!!prevId}
                hasNext={!!nextId}
                daHoanThanhBaiHienTai={true}
            />
        </div>
    );
};

export default NoiDungKhoaHoc;