import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { KhoaHocService } from '@/services/khoa-hoc.service';
import type { KhoaHocData } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO';
import { decodeId } from '@/utils/id-helper';
import '@/pages/hoc-vien/noi-dung-khoa-hoc/style.css';

import { ThanhTieuDe } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/ThanhTieuDe';
import { DanhSachBaiHoc } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/DanhSachBaiHoc';
import { NoiDungVideo } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/NoiDungVideo';
import { DieuHuongNhanh } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/DieuHuongNhanh';

const NoiDungKhoaHoc = () => {
    const [khoaHoc, setKhoaHoc] = useState<KhoaHocData | null>(null);
    const [idBaiHoc, setIdBaiHoc] = useState<number>(0);

    const { id } = useParams<{ id: string }>();

    // ... (giữ nguyên hàm layDuLieuKhoaHoc và useEffect)
    const layDuLieuKhoaHoc = async () => {
        if (!id) return;
        const realId = decodeId("8mep2bMy");
        const data = await KhoaHocService.layDuLieuKhoaHoc(realId);
        setKhoaHoc(data);
        if (data && data.danhSachChuongHoc[0]?.danhSachBaiHoc[0]) {
            // Chỉ set ID lần đầu nếu chưa có ID nào được chọn
            if (idBaiHoc === 0) {
                setIdBaiHoc(data.danhSachChuongHoc[0].danhSachBaiHoc[0].id);
            }
        }
    };

    useEffect(() => {
        layDuLieuKhoaHoc();
    }, []);

    const flatList = useMemo(() =>
        khoaHoc ? KhoaHocService.lamPhangDanhSachBaiHoc(khoaHoc.danhSachChuongHoc) : [],
        [khoaHoc]);
    const tongSoBai = flatList.length;
    const soBaiDaHoc = flatList.filter(bai => bai.daXem).length;
    const baiHocHienTai = KhoaHocService.timBaiHocTheoId(flatList, idBaiHoc);
    const nextId = KhoaHocService.timBaiTiepTheo(flatList, idBaiHoc);
    const prevId = KhoaHocService.timBaiTruoc(flatList, idBaiHoc);

    // --- LOGIC MỚI: Xử lý khi video hoàn thành ---
    const handleVideoCompleted = useCallback((maBaiHocVuaXong: number) => {
        // 1. Cập nhật State cục bộ (để UI mở khóa ngay lập tức)
        setKhoaHoc((prevData) => {
            if (!prevData) return null;
            return {
                ...prevData,
                danhSachChuongHoc: prevData.danhSachChuongHoc.map((chuong) => ({
                    ...chuong,
                    danhSachBaiHoc: chuong.danhSachBaiHoc.map((bai) => {
                        if (bai.id === maBaiHocVuaXong) {
                            return { ...bai, daXem: true }; // Đánh dấu đã xem
                        }
                        return bai;
                    }),
                })),
            };
        });

        // 2. Tự động chuyển sang bài tiếp theo (sau 1.5s cho mượt)
        // setTimeout(() => {
        //     const nextLessonId = KhoaHocService.timBaiTiepTheo(flatList, maBaiHocVuaXong);
        //     if (nextLessonId) {
        //         setIdBaiHoc(nextLessonId);
        //     }
        // }, 1500);

    }, [flatList]);
    // ---------------------------------------------

    const handleChonBaiHoc = (id: number) => {
        const index = flatList.findIndex(b => b.id === id);
        if (index < 0) return;

        if (index === 0 || flatList[index - 1].daXem === true) {
            setIdBaiHoc(id);
        } else {
            console.log('Bài trước chưa hoàn thành, không thể chuyển!');
        }
    };

    if (!khoaHoc || !baiHocHienTai) return <div>Đang tải khóa học...</div>;

    const renderMainContent = () => {
        switch (baiHocHienTai.loaiBaiHoc) {
            case 'Video':
                return (
                    <NoiDungVideo
                        key={baiHocHienTai.id}
                        videoUrl={baiHocHienTai.linkVideo}
                        maBaiHoc={baiHocHienTai.id}
                        maNguoiDung={9}
                        daXem={baiHocHienTai.daXem}
                        onVideoCompleted={handleVideoCompleted}
                    />
                );
            default:
                return <div>Loại bài học không hỗ trợ</div>;
        }
    };

    const daHoanThanhBaiHienTai = baiHocHienTai.daXem === true;

    return (
        <div style={{ background: '#f4f5fb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <ThanhTieuDe
                tenKhoaHoc={khoaHoc.tenKhoaHoc}
                soBaiDaHoc={soBaiDaHoc}
                tongSoBai={tongSoBai}
            />

            <main className="cp-shell">
                <section className="cp-left">
                    <div className="cp-tabs">
                        <button className="cp-tab cp-tab-active">
                            <i className="fas fa-play-circle"></i> Bài học
                        </button>
                        {/* <button className="cp-tab">
                            <i className="fas fa-star"></i> Đánh giá
                        </button> */}
                    </div>

                    <div className="cp-main-content">
                        {renderMainContent()}
                    </div>
                </section>

                <DanhSachBaiHoc
                    cacChuong={khoaHoc.danhSachChuongHoc}
                    idBaiHocHienTai={idBaiHoc}
                    onChonBaiHoc={handleChonBaiHoc}
                />
            </main>

            <DieuHuongNhanh
                onPrev={() => prevId && setIdBaiHoc(prevId)}
                onNext={() => nextId && setIdBaiHoc(nextId)}
                hasPrev={!!prevId}
                hasNext={!!nextId}
                daHoanThanhBaiHienTai={daHoanThanhBaiHienTai}
            />
        </div>
    );
};

export default NoiDungKhoaHoc;