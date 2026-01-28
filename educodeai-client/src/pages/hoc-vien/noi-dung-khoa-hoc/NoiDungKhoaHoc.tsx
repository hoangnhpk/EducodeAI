import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { KhoaHocService, type LuuKetQuaQuizDTO } from '@/services/khoa-hoc.service';
import type { KhoaHocData } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO';
import { decodeId } from '@/utils/id-helper';
import '@/pages/hoc-vien/noi-dung-khoa-hoc/style.css';

// Import Components
import { ThanhTieuDe } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/ThanhTieuDe';
import { DanhSachBaiHoc } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/DanhSachBaiHoc';
import { DieuHuongNhanh } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/DieuHuongNhanh';
import { NoiDungVideo, type NoiDungVideoRef } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/NoiDungVideo';
import { SidebarGhiChu } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/SidebarGhiChu';
import { BaiTapTracNghiem } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/BaiTapTracNghiem';

const NoiDungKhoaHoc = () => {
    const { id } = useParams<{ id: string }>();
    const [khoaHoc, setKhoaHoc] = useState<KhoaHocData | null>(null);
    const [idBaiHoc, setIdBaiHoc] = useState<number>(0);
    const [hienSidebar, setHienSidebar] = useState(false);
    const videoRef = useRef<NoiDungVideoRef>(null);
    // -----------------------------------------

    const layDuLieuKhoaHoc = async () => {
        if (!id) return;
        // const realId = decodeId(id); // Sử dụng ID thật từ URL
        const realId = decodeId("pnel5aKB"); // (Giả lập theo code của bạn)
        const data = await KhoaHocService.layDuLieuKhoaHoc(realId);
        setKhoaHoc(data);
        if (data && data.danhSachChuongHoc[0]?.danhSachBaiHoc[0]) {
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

    // --- XỬ LÝ TUA VIDEO TỪ SIDEBAR ---
    const handleSeekVideo = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.seekTo(seconds);
        }
    };
    // ----------------------------------

    const handleVideoCompleted = useCallback((maBaiHocVuaXong: number) => {
        setKhoaHoc((prevData) => {
            if (!prevData) return null;
            return {
                ...prevData,
                danhSachChuongHoc: prevData.danhSachChuongHoc.map((chuong) => ({
                    ...chuong,
                    danhSachBaiHoc: chuong.danhSachBaiHoc.map((bai) => {
                        if (bai.id === maBaiHocVuaXong) {
                            return { ...bai, daXem: true };
                        }
                        return bai;
                    }),
                })),
            };
        });
    }, [flatList]);

    const handleChonBaiHoc = (id: number) => {
        const index = flatList.findIndex(b => b.id === id);
        if (index < 0) return;
        if (index === 0 || flatList[index - 1].daXem === true) {
            setIdBaiHoc(id);
        } else {
            console.log('Bài trước chưa hoàn thành, không thể chuyển!');
        }
    };

    // Callback khi nộp bài thành công để lưu tiến độ
    const xuLyNopBaiTap = async (phanTramDiem: number, daDat: boolean, soCauDung: number, tongSoCau: number, chiTietTraLoi: { IdCauHoi: number; IndexLuaChon: number }[]) => {
        if (!baiHocHienTai || !baiHocHienTai.thongTinQuiz) {
            console.error("Dữ liệu bài tập chưa sẵn sàng");
            return;
        }
        try {
            // 1. Chuẩn bị dữ liệu gửi đi
            const payload: LuuKetQuaQuizDTO = {
                MaBaiHoc: idBaiHoc,
                MaBaiTap: baiHocHienTai.thongTinQuiz.maBaiTap ?? 0,
                MaNguoiDung: 2,
                DiemSo: phanTramDiem,
                SoCauDung: soCauDung,
                TongSoCau: tongSoCau,
                DaDat: daDat,
                ChiTietLamBai: chiTietTraLoi
            };

            // 2. Gọi Service
            await KhoaHocService.luuKetQuaQuiz(payload);

            if (daDat) {
                handleVideoCompleted(idBaiHoc);
            }

        } catch (error) {
            console.error("Lỗi khi nộp bài:", error);
        }
    };

    if (!khoaHoc || !baiHocHienTai) return <div>Đang tải khóa học...</div>;

    const renderMainContent = () => {
        switch (baiHocHienTai.loaiBaiHoc) {
            case 'Video':
                return (
                    <NoiDungVideo
                        ref={videoRef} // Gắn Ref vào đây để Sidebar điều khiển
                        key={baiHocHienTai.id}
                        videoUrl={baiHocHienTai.linkVideo}
                        maBaiHoc={baiHocHienTai.id}
                        maNguoiDung={2} // Thay bằng ID user thật từ Context/Redux
                        daXem={baiHocHienTai.daXem}
                        onVideoCompleted={handleVideoCompleted}
                    />
                );
            case 'Text':
                return <div dangerouslySetInnerHTML={{ __html: baiHocHienTai.noiDung || '' }}></div>;
            case 'Ide':
                return <div>Chức năng IDE đang phát triển...</div>;
            case 'Quiz':
                // Kiểm tra xem dữ liệu Quiz đã có sẵn chưa
                if (baiHocHienTai.thongTinQuiz) {
                    return (
                        <BaiTapTracNghiem
                            duLieu={{
                                ...baiHocHienTai.thongTinQuiz,
                                // Map trường dữ liệu cho khớp với Component con
                                duLieuCauHoi: baiHocHienTai.thongTinQuiz.duLieuCauHoiJSON,
                                maBaiTap: baiHocHienTai.thongTinQuiz.maBaiTap
                            }}
                            // Quan trọng: Truyền đủ 4 tham số lên hàm xử lý ở cha
                            khiHoanThanh={(diem, daDat, soCauDung, tongSoCau, chiTietTraLoi) =>
                                xuLyNopBaiTap(diem, daDat, soCauDung, tongSoCau, chiTietTraLoi)
                            }
                        />
                    );
                }

                return <div className="p-5 text-center text-muted">Đang tải dữ liệu bài tập...</div>;
            default:
                return <div className="p-5 text-center text-muted">Đang tải nội dung hoặc bài học không tồn tại...</div>;
        }
    };

    const daHoanThanhBaiHienTai = baiHocHienTai.daXem === true;

    return (
        <div style={{ background: '#f4f5fb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header: Truyền hàm mở Sidebar vào đây */}
            <ThanhTieuDe
                tenKhoaHoc={khoaHoc.tenKhoaHoc}
                soBaiDaHoc={soBaiDaHoc}
                tongSoBai={tongSoBai}
                onMoGhiChu={() => setHienSidebar(true)}
            />

            <main className="cp-shell">
                <section className="cp-left">
                    <div className="cp-tabs">
                        <button className="cp-tab cp-tab-active">
                            <i className="fas fa-play-circle"></i> Bài học
                        </button>
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

            {/* Render Sidebar Ghi Chú (Nằm đè lên giao diện) */}
            {baiHocHienTai && (
                <SidebarGhiChu
                    isOpen={hienSidebar}
                    onClose={() => setHienSidebar(false)}
                    maBaiHoc={baiHocHienTai.id}
                    maNguoiDung={2} // Thay bằng ID user thật
                    onSeek={handleSeekVideo} // Truyền hàm tua xuống
                />
            )}
        </div>
    );
};

export default NoiDungKhoaHoc;