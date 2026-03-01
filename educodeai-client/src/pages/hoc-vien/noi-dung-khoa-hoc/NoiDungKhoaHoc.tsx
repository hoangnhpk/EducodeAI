import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { KhoaHocService, type LuuKetQuaQuizDTO } from '@/services/khoa-hoc.service';
import type { KhoaHocData } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO';
import { decodeId } from '@/utils/id-helper';
import '@/pages/hoc-vien/noi-dung-khoa-hoc/style.css';
import Swal from 'sweetalert2';
// Import Components
import { VideoSummary } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/TomTatVideoAI';
import { ThanhTieuDe } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/ThanhTieuDe';
import { DanhSachBaiHoc } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/DanhSachBaiHoc';
import { DieuHuongNhanh } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/DieuHuongNhanh';
import { NoiDungVideo, type NoiDungVideoRef } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/NoiDungVideo';
import { SidebarGhiChu } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/SidebarGhiChu';
import { SidebarGhiChuAI } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/SidebarGhiChuAI';
import { BaiTapTracNghiem } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/BaiTapTracNghiem';
import { BaiTapIDE } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/BaiTapThucHanh';
import { ChatBot } from '@/pages/hoc-vien/tro-ly-hoi-dap-ai/TroLyAI';
import { TabDanhGia } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/DanhGia';

const NoiDungKhoaHoc = () => {
    const { id } = useParams<{ id: string }>();
    const [khoaHoc, setKhoaHoc] = useState<KhoaHocData | null>(null);
    const [idBaiHoc, setIdBaiHoc] = useState<number>(0);
    const [hienSidebar, setHienSidebar] = useState(false);
    const [tabActive, setTabActive] = useState<'hoc' | 'tomtat' | 'danhgia'>('hoc');
    const videoRef = useRef<NoiDungVideoRef>(null);
    const [hienGhiChuAI, setHienGhiChuAI] = useState(false);
    const layDuLieuKhoaHoc = async () => {
        if (!id) return;
        const realId = decodeId("pnel5aKB");
        const data = await KhoaHocService.layDuLieuKhoaHoc(realId);
        setKhoaHoc(data);

        // --- ĐÃ FIX: Logic khôi phục bài học cũ khi F5 ---
        if (data && data.danhSachChuongHoc.length > 0) {
            if (idBaiHoc === 0) {
                const storageKey = `bai_hoc_dang_hoc_${id}`;
                const savedLessonId = localStorage.getItem(storageKey);

                // Gom tất cả bài học lại để tìm kiếm
                const allLessons = KhoaHocService.lamPhangDanhSachBaiHoc(data.danhSachChuongHoc);

                if (savedLessonId) {
                    // Kiểm tra xem ID lưu trong máy có thực sự thuộc khóa học này không
                    const existingLesson = allLessons.find(b => b.id.toString() === savedLessonId);
                    if (existingLesson) {
                        setIdBaiHoc(existingLesson.id);
                        return; // Đã tìm thấy bài cũ thì dừng tại đây
                    }
                }

                // Nếu chưa từng học hoặc bài cũ không tồn tại, lấy bài đầu tiên
                if (data.danhSachChuongHoc[0]?.danhSachBaiHoc[0]) {
                    setIdBaiHoc(data.danhSachChuongHoc[0].danhSachBaiHoc[0].id);
                }
            }
        }
    };

    useEffect(() => {
        layDuLieuKhoaHoc();
    }, []);

    // --- ĐÃ FIX: Tự động lưu ID bài học mỗi khi người dùng chuyển bài ---
    useEffect(() => {
        if (idBaiHoc !== 0 && id) {
            const storageKey = `bai_hoc_dang_hoc_${id}`;
            localStorage.setItem(storageKey, idBaiHoc.toString());
        }
    }, [idBaiHoc, id]);

    const flatList = useMemo(() =>
        khoaHoc ? KhoaHocService.lamPhangDanhSachBaiHoc(khoaHoc.danhSachChuongHoc) : [],
        [khoaHoc]);

    const tongSoBai = flatList.length;
    const soBaiDaHoc = flatList.filter(bai => bai.daXem).length;
    const baiHocHienTai = KhoaHocService.timBaiHocTheoId(flatList, idBaiHoc);
    const nextId = KhoaHocService.timBaiTiepTheo(flatList, idBaiHoc);
    const prevId = KhoaHocService.timBaiTruoc(flatList, idBaiHoc);
    useEffect(() => {
        // Nếu tổng số bài > 0 và số bài đã học bằng đúng tổng số bài (Hoàn thành 100%)
        if (tongSoBai > 0 && soBaiDaHoc === tongSoBai) {

            // Đảm bảo tên biến khoaHoc.id và user.id khớp với biến trong file của bạn
            const modalKey = `shown_congrats_modal_${khoaHoc?.maKhoaHoc}`;
            const hasShown = localStorage.getItem(modalKey);

            // Nếu chưa từng hiện Modal chúc mừng này
            if (!hasShown) {
                Swal.fire({
                    title: '🎉 Chúc mừng bạn!',
                    html: 'Bạn đã hoàn thành xuất sắc toàn bộ khóa học.<br/><br/>Hãy để lại vài lời đánh giá để giúp khóa học phát triển hơn nhé!',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonColor: '#f69050',
                    cancelButtonColor: '#94a3b8',
                    confirmButtonText: '<i class="fas fa-star"></i> Đánh giá ngay',
                    cancelButtonText: 'Để sau'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Chuyển hướng sang tab đánh giá
                        setTabActive('danhgia');
                    }
                });

                // Lưu trạng thái để không hiện lại khi F5
                localStorage.setItem(modalKey, 'true');
            }
        }
    }, [soBaiDaHoc, tongSoBai, khoaHoc?.maKhoaHoc]);

    const handleSeekVideo = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.seekTo(seconds);
        }
    };

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
            setTabActive('hoc'); // Luôn chuyển về tab học khi sang bài mới
        } else {
            console.log('Bài trước chưa hoàn thành, không thể chuyển!');
        }
    };

    const xuLyNopBaiTap = async (phanTramDiem: number, daDat: boolean, soCauDung: number, tongSoCau: number, chiTietTraLoi: { IdCauHoi: number; IndexLuaChon: number }[]) => {
        if (!baiHocHienTai || !baiHocHienTai.thongTinQuiz) {
            console.error("Dữ liệu bài tập chưa sẵn sàng");
            return;
        }
        try {
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
                        ref={videoRef}
                        key={baiHocHienTai.id}
                        videoUrl={baiHocHienTai.linkVideo}
                        maBaiHoc={baiHocHienTai.id}
                        maNguoiDung={2}
                        daXem={baiHocHienTai.daXem}
                        onVideoCompleted={handleVideoCompleted}
                    />
                );
            case 'Text':
                return <div dangerouslySetInnerHTML={{ __html: baiHocHienTai.noiDung || '' }}></div>;
            case 'Ide':
                return (
                    <BaiTapIDE
                        duLieu={{
                            tieuDe: baiHocHienTai.tieuDe || "Bài tập thực hành",
                            moTa: baiHocHienTai.noiDung || "",
                            ngonNgu: "python",
                            templateCode: "# Viết code của bạn tại đây\n",
                            testCases: []
                        }}
                        khiHoanThanh={(phanTram: number, daDat: boolean) => {
                            if (daDat) {
                                handleVideoCompleted(idBaiHoc);
                            }
                        }}
                    />
                );
            case 'Quiz':
                if (baiHocHienTai.thongTinQuiz) {
                    return (
                        <BaiTapTracNghiem
                            duLieu={{
                                ...baiHocHienTai.thongTinQuiz,
                                duLieuCauHoi: baiHocHienTai.thongTinQuiz.duLieuCauHoiJSON,
                                maBaiTap: baiHocHienTai.thongTinQuiz.maBaiTap
                            }}
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
            <ThanhTieuDe
                tenKhoaHoc={khoaHoc.tenKhoaHoc}
                soBaiDaHoc={soBaiDaHoc}
                tongSoBai={tongSoBai}
                onMoGhiChu={() => setHienSidebar(true)}
                onMoGhiChuAI={() => setHienGhiChuAI(true)}
            />

            <main className="cp-shell">
                <section className="cp-left">
                    <div className="cp-tabs">
                        <button
                            className={`cp-tab ${tabActive === 'hoc' ? 'cp-tab-active' : ''}`}
                            onClick={() => setTabActive('hoc')}
                        >
                            <i className="fas fa-play-circle"></i> Bài học
                        </button>

                        {/* Tab Tóm tắt chỉ hiện khi là Video */}
                        {baiHocHienTai.loaiBaiHoc === 'Video' && (
                            <button
                                className={`cp-tab ${tabActive === 'tomtat' ? 'cp-tab-active' : ''}`}
                                onClick={() => setTabActive('tomtat')}
                            >
                                <i className="fas fa-magic"></i> Tóm tắt nội dung Video AI
                            </button>
                        )}

                        {/* Tab Đánh giá khóa học (Luôn hiện) */}
                        <button
                            className={`cp-tab ${tabActive === 'danhgia' ? 'cp-tab-active' : ''}`}
                            onClick={() => setTabActive('danhgia')}
                        >
                            <i className="fas fa-star"></i> Đánh giá
                        </button>
                    </div>
                    <div className="cp-main-content">
                        <div style={{ display: tabActive === 'hoc' ? 'block' : 'none', height: '100%' }}>
                            {renderMainContent()}
                        </div>

                        {/* 2. KHUNG CHỨA TÓM TẮT: Chỉ hiện khi tabActive khác 'hoc' */}
                        <div style={{ display: tabActive === 'tomtat' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
                            <VideoSummary
                                maBaiHoc={baiHocHienTai?.id || 0}
                                phuDeGoc={baiHocHienTai?.noiDung || ""}
                                linkVideo={baiHocHienTai?.linkVideo || ""}
                                tieuDe={baiHocHienTai?.tieuDe || ""}
                            />
                        </div>
                        {/* 3. Nội dung Đánh giá khóa học */}
                        <div style={{ display: tabActive === 'danhgia' ? 'block' : 'none', height: '100%', overflowY: 'auto', padding: '20px' }}>
                            <TabDanhGia
                                maKhoaHoc={khoaHoc.maKhoaHoc}
                                maNguoiDung={2}
                                daHoanThanhKhoaHoc={tongSoBai > 0 && soBaiDaHoc === tongSoBai}
                            />
                        </div>
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

            {baiHocHienTai && (
                <SidebarGhiChu
                    isOpen={hienSidebar}
                    onClose={() => setHienSidebar(false)}
                    maBaiHoc={baiHocHienTai.id}
                    maNguoiDung={2}
                    onSeek={handleSeekVideo}
                />
            )}

            <SidebarGhiChuAI
                isOpen={hienGhiChuAI}
                onClose={() => setHienGhiChuAI(false)}
                maNguoiDung={2}
            />

            <ChatBot
                maBaiHoc={baiHocHienTai.id}
                tieuDeBaiHoc={baiHocHienTai.tieuDe}
                noiDungBaiHoc={baiHocHienTai.noiDung}
            />
        </div>
    );
};

export default NoiDungKhoaHoc;