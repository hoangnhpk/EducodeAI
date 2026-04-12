import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { KhoaHocService, type LuuKetQuaQuizDTO } from '@/services/khoa-hoc.service';
import type { KhoaHocData } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO';
import { decodeId } from '@/utils/id-helper';
import '@/pages/hoc-vien/noi-dung-khoa-hoc/style.css';
import Swal from 'sweetalert2';
import { getUserId } from '@/utils/authHelper';
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
    const [tabActive, setTabActive] = useState<'hoc' | 'tomtat' | 'danhgia' | 'quiz'>('hoc');
    const videoRef = useRef<NoiDungVideoRef>(null);
    const [hienGhiChuAI, setHienGhiChuAI] = useState(false);
    const [hienSidebarMobile, setHienSidebarMobile] = useState(false); // Drawer danh sách bài trên mobile

    // Mảng lưu vết những video đã xem trong phiên này để mở khóa quiz
    const [videoDaXongLocal, setVideoDaXongLocal] = useState<number[]>([]);

    const maNguoiDung = getUserId();

    if (!maNguoiDung) {
        return <div>Vui lòng đăng nhập để xem nội dung khóa học.</div>;
    }

    const layDuLieuKhoaHoc = async () => {
        if (!id) return;
        const realId = decodeId(id);
        const data = await KhoaHocService.layDuLieuKhoaHoc(realId);
        setKhoaHoc(data);

        if (data && data.danhSachChuongHoc.length > 0) {
            if (idBaiHoc === 0) {
                const storageKey = `bai_hoc_dang_hoc_${id}`;
                const savedLessonId = localStorage.getItem(storageKey);
                const allLessons = KhoaHocService.lamPhangDanhSachBaiHoc(data.danhSachChuongHoc);

                if (savedLessonId) {
                    const existingLesson = allLessons.find(b => b.id.toString() === savedLessonId);
                    if (existingLesson) {
                        setIdBaiHoc(existingLesson.id);
                        return;
                    }
                }
                if (data.danhSachChuongHoc[0]?.danhSachBaiHoc[0]) {
                    setIdBaiHoc(data.danhSachChuongHoc[0].danhSachBaiHoc[0].id);
                }
            }
        }
    };

    useEffect(() => {
        layDuLieuKhoaHoc();
    }, []);

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
        if (tongSoBai > 0 && soBaiDaHoc === tongSoBai) {
            const modalKey = `shown_congrats_modal_${khoaHoc?.maKhoaHoc}`;
            const hasShown = localStorage.getItem(modalKey);

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
                        setTabActive('danhgia');
                    }
                });
                localStorage.setItem(modalKey, 'true');
            }
        }
    }, [soBaiDaHoc, tongSoBai, khoaHoc?.maKhoaHoc]);

    const handleSeekVideo = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.seekTo(seconds);
        }
    };

    // Hàm gọi chung để mở khóa bài tiếp theo (Cập nhật CSDL qua API đã thực hiện ở nơi khác)
    const danhDauHoanThanhBai = (maBaiHoc: number) => {
        setKhoaHoc((prevData) => {
            if (!prevData) return null;
            return {
                ...prevData,
                danhSachChuongHoc: prevData.danhSachChuongHoc.map((chuong) => ({
                    ...chuong,
                    danhSachBaiHoc: chuong.danhSachBaiHoc.map((bai) => {
                        if (bai.id === maBaiHoc) {
                            return { ...bai, daXem: true };
                        }
                        return bai;
                    }),
                })),
            };
        });
    };

    // Khi Video chạy xong
    const handleVideoCompleted = useCallback((maBaiHocVuaXong: number) => {
        const baiHocVuaXong = flatList.find(b => b.id === maBaiHocVuaXong);

        if (baiHocVuaXong && baiHocVuaXong.thongTinQuiz) {
            // NẾU CÓ QUIZ -> Chỉ lưu tạm thời để mở khóa quiz, tự nhảy sang quiz
            setVideoDaXongLocal(prev => [...prev, maBaiHocVuaXong]);

            Swal.fire({
                title: 'Đã hoàn thành lý thuyết!',
                text: 'Hãy hoàn thành Bài tập Trắc nghiệm để mở khóa bài học tiếp theo nhé.',
                icon: 'info',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                setTabActive('quiz'); // Nhảy qua màn hình quiz
            });
        } else {
            // NẾU KHÔNG CÓ QUIZ -> Hoàn thành bài, mở khóa bài sau luôn
            danhDauHoanThanhBai(maBaiHocVuaXong);
        }
    }, [flatList]);

    const handleChonBaiHoc = (id: number, tabDeMo: 'hoc' | 'quiz' = 'hoc') => {
        const index = flatList.findIndex(b => b.id === id);
        if (index < 0) return;
        if (index === 0 || flatList[index - 1].daXem === true) {
            setIdBaiHoc(id);
            setTabActive(tabDeMo); // Chuyển luôn sang tab video hoặc quiz theo click
        } else {
            Swal.fire({ title: 'Bị khóa', text: 'Vui lòng hoàn thành bài học trước đó.', icon: 'warning' });
        }
    };

    const xuLyNopBaiTap = async (phanTramDiem: number, daDat: boolean, soCauDung: number, tongSoCau: number, chiTietTraLoi: { IdCauHoi: number; IndexLuaChon: number }[]) => {
        if (!baiHocHienTai || !baiHocHienTai.thongTinQuiz) return;
        try {
            const payload: LuuKetQuaQuizDTO = {
                MaBaiHoc: idBaiHoc,
                MaBaiTap: baiHocHienTai.thongTinQuiz.maBaiTap ?? 0,
                MaNguoiDung: maNguoiDung,
                DiemSo: phanTramDiem,
                SoCauDung: soCauDung,
                TongSoCau: tongSoCau,
                DaDat: daDat,
                ChiTietLamBai: chiTietTraLoi
            };
            await KhoaHocService.luuKetQuaQuiz(payload);

            if (daDat) {
                // Vượt qua Quiz -> Đánh dấu hoàn thành toàn bộ bài học
                danhDauHoanThanhBai(idBaiHoc);

                // Hỏi xem có muốn học bài tiếp theo không
                const nextId = KhoaHocService.timBaiTiepTheo(flatList, idBaiHoc);
                if (nextId) {
                    Swal.fire({
                        title: 'Tuyệt vời!',
                        text: 'Bạn đã vượt qua bài trắc nghiệm. Học bài tiếp theo chứ?',
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: 'Học bài tiếp theo',
                        cancelButtonText: 'Ở lại trang này',
                        confirmButtonColor: '#f69050'
                    }).then((res) => {
                        if (res.isConfirmed) {
                            setIdBaiHoc(nextId);
                            setTabActive('hoc');
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Lỗi khi nộp bài:", error);
        }
    };

    if (!khoaHoc || !baiHocHienTai) return <div>Đang tải khóa học...</div>;
    const dangLamQuiz = tabActive === 'quiz' || (tabActive === 'hoc' && baiHocHienTai?.loaiBaiHoc === 'Quiz');
    const renderMainContent = () => {
        switch (baiHocHienTai.loaiBaiHoc) {
            case 'Video':
                return (
                    <NoiDungVideo
                        ref={videoRef}
                        key={baiHocHienTai.id}
                        videoUrl={baiHocHienTai.linkVideo}
                        maBaiHoc={baiHocHienTai.id}
                        maNguoiDung={maNguoiDung}
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
                        khiHoanThanh={(_phanTram: number, daDat: boolean) => {
                            if (daDat) handleVideoCompleted(idBaiHoc);
                        }}
                    />
                );
            case 'Quiz':
                return (
                    <div style={{ height: '100%', overflowY: 'auto', backgroundColor: '#fff' }}>
                        {baiHocHienTai.thongTinQuiz && (
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
                        )}
                    </div>
                );
            default:
                return <div className="p-5 text-center text-muted">Đang tải nội dung...</div>;
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

            {/* Nút mở danh sách bài trên mobile */}
            <button
                className="cp-mobile-toggle-sidebar btn btn-sm"
                onClick={() => setHienSidebarMobile(true)}
                style={{
                    position: 'fixed', bottom: 72, right: 16, zIndex: 250,
                    background: '#f69050', color: '#fff', border: 'none',
                    borderRadius: 50, width: 46, height: 46,
                    boxShadow: '0 4px 14px rgba(246,144,80,0.45)',
                    alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                }}
            >
                <i className="fas fa-list" />
            </button>

            {/* Overlay mờ khi drawer mở trên mobile */}
            <div
                className={`cp-drawer-overlay${hienSidebarMobile ? ' show' : ''}`}
                onClick={() => setHienSidebarMobile(false)}
            />

            <main className="cp-shell">
                <section className="cp-left">
                    {/* CHỈ HIỆN TAB KHI KHÔNG LÀM QUIZ */}
                    {tabActive !== 'quiz' && (
                        <div className="cp-tabs">
                            <button
                                className={`cp-tab ${tabActive === 'hoc' ? 'cp-tab-active' : ''}`}
                                onClick={() => setTabActive('hoc')}
                            >
                                <i className="fas fa-play-circle"></i> Bài học
                            </button>

                            {baiHocHienTai.loaiBaiHoc === 'Video' && (
                                <button
                                    className={`cp-tab ${tabActive === 'tomtat' ? 'cp-tab-active' : ''}`}
                                    onClick={() => setTabActive('tomtat')}
                                >
                                    <i className="fas fa-magic"></i> Tóm tắt nội dung Video AI
                                </button>
                            )}

                            <button
                                className={`cp-tab ${tabActive === 'danhgia' ? 'cp-tab-active' : ''}`}
                                onClick={() => setTabActive('danhgia')}
                            >
                                <i className="fas fa-star"></i> Đánh giá
                            </button>
                        </div>
                    )}

                    <div className="cp-main-content">
                        {/* HIỂN THỊ GIAO DIỆN QUIZ FULL NẾU ĐANG Ở TAB QUIZ */}
                        {tabActive === 'quiz' ? (
                            <div style={{ height: '100%', overflowY: 'auto', backgroundColor: '#fff' }}>
                                {baiHocHienTai.thongTinQuiz && (
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
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Giao diện khi học bình thường */}
                                <div style={{ display: tabActive === 'hoc' ? 'block' : 'none', height: '100%' }}>
                                    {renderMainContent()}
                                </div>

                                <div style={{ display: tabActive === 'tomtat' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
                                    <VideoSummary
                                        maBaiHoc={baiHocHienTai?.id || 0}
                                        phuDeGoc={baiHocHienTai?.noiDung || ""}
                                        linkVideo={baiHocHienTai?.linkVideo || ""}
                                        tieuDe={baiHocHienTai?.tieuDe || ""}
                                    />
                                </div>

                                <div style={{ display: tabActive === 'danhgia' ? 'block' : 'none', height: '100%', overflowY: 'auto', padding: '20px' }}>
                                    <TabDanhGia
                                        maKhoaHoc={khoaHoc.maKhoaHoc}
                                        maNguoiDung={maNguoiDung}
                                        daHoanThanhKhoaHoc={tongSoBai > 0 && soBaiDaHoc === tongSoBai}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </section>

                <DanhSachBaiHoc
                    cacChuong={khoaHoc.danhSachChuongHoc}
                    idBaiHocHienTai={idBaiHoc}
                    tabActive={tabActive}
                    videoDaXongLocal={videoDaXongLocal}
                    onChonBaiHoc={(id, tab) => {
                        handleChonBaiHoc(id, tab);
                        setHienSidebarMobile(false); // Đóng drawer sau khi chọn bài
                    }}
                    className={hienSidebarMobile ? 'mobile-open' : ''}
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
                    maNguoiDung={maNguoiDung}
                    onSeek={handleSeekVideo}
                />
            )}

            <SidebarGhiChuAI
                isOpen={hienGhiChuAI}
                onClose={() => setHienGhiChuAI(false)}
                maNguoiDung={maNguoiDung}
            />

            <ChatBot
                maBaiHoc={baiHocHienTai.id}
                tieuDeBaiHoc={baiHocHienTai.tieuDe}
                noiDungBaiHoc={baiHocHienTai.noiDung}
                isQuizMode={dangLamQuiz}
            />
        </div>
    );
};

export default NoiDungKhoaHoc;