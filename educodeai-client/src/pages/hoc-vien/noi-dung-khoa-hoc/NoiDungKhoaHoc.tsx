import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { KhoaHocService, type LuuKetQuaQuizDTO, type NopBaiKiemTraChungChiDTO } from '@/services/khoa-hoc.service';
import type { KhoaHocData } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO';
import { decodeId } from '@/utils/id-helper';
import '@/pages/hoc-vien/noi-dung-khoa-hoc/style.css';
import Swal from 'sweetalert2';
import { getUserId, getUserInfo } from '@/utils/authHelper';
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
import { TabChungChi } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/TabChungChi';

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

const NoiDungKhoaHoc = () => {
    const { id } = useParams<{ id: string }>();
    const [khoaHoc, setKhoaHoc] = useState<KhoaHocData | null>(null);
    const [idBaiHoc, setIdBaiHoc] = useState(0);
    const [hienSidebar, setHienSidebar] = useState(false);
    const [tabActive, setTabActive] = useState<'hoc' | 'tomtat' | 'danhgia' | 'quiz' | 'chungchi'>('hoc');
    const [hienGhiChuAI, setHienGhiChuAI] = useState(false);
    const [hienSidebarMobile, setHienSidebarMobile] = useState(false);
    const [videoDaXongLocal, setVideoDaXongLocal] = useState<number[]>([]);
    const [dangLamKiemTraChungChi, setDangLamKiemTraChungChi] = useState(false);
    const [dangNopKiemTraChungChi, setDangNopKiemTraChungChi] = useState(false);
    const videoRef = useRef<NoiDungVideoRef>(null);

    const maNguoiDung = getUserId() ?? 0;
    const thongTinNguoiDung = getUserInfo();
    const tenHocVien = thongTinNguoiDung?.hoTen || thongTinNguoiDung?.taiKhoan || 'Hoc vien';

    const layDuLieuKhoaHoc = useCallback(async () => {
        if (!id) return;

        const realId = decodeId(id);
        const data = await KhoaHocService.layDuLieuKhoaHoc(realId);
        setKhoaHoc(data);

        if (data?.danhSachChuongHoc.length && idBaiHoc === 0) {
            const storageKey = `bai_hoc_dang_hoc_${id}`;
            const savedLessonId = localStorage.getItem(storageKey);
            const allLessons = KhoaHocService.lamPhangDanhSachBaiHoc(data.danhSachChuongHoc);

            if (savedLessonId) {
                const existingLesson = allLessons.find((bai) => bai.id.toString() === savedLessonId);
                if (existingLesson) {
                    setIdBaiHoc(existingLesson.id);
                    return;
                }
            }

            const baiDauTien = data.danhSachChuongHoc[0]?.danhSachBaiHoc[0];
            if (baiDauTien) {
                setIdBaiHoc(baiDauTien.id);
            }
        }
    }, [id, idBaiHoc]);

    useEffect(() => {
        void layDuLieuKhoaHoc();
    }, [layDuLieuKhoaHoc]);

    useEffect(() => {
        if (idBaiHoc !== 0 && id) {
            localStorage.setItem(`bai_hoc_dang_hoc_${id}`, idBaiHoc.toString());
        }
    }, [idBaiHoc, id]);

    const flatList = useMemo(
        () => (khoaHoc ? KhoaHocService.lamPhangDanhSachBaiHoc(khoaHoc.danhSachChuongHoc) : []),
        [khoaHoc]
    );

    const tongSoBai = flatList.length;
    const soBaiDaHoc = flatList.filter((bai) => bai.daXem).length;
    const daHoanThanhKhoaHoc = tongSoBai > 0 && soBaiDaHoc === tongSoBai;
    const baiHocHienTai = KhoaHocService.timBaiHocTheoId(flatList, idBaiHoc);
    const nextId = KhoaHocService.timBaiTiepTheo(flatList, idBaiHoc);
    const prevId = KhoaHocService.timBaiTruoc(flatList, idBaiHoc);
    const daCapChungChi = khoaHoc?.thongTinChungChi?.daCap === true;

    useEffect(() => {
        if (!daHoanThanhKhoaHoc || !khoaHoc) return;

        const modalKey = `shown_certificate_prompt_${khoaHoc.maKhoaHoc}`;
        const hasShown = localStorage.getItem(modalKey);
        if (hasShown) return;

        void Swal.fire({
            title: daCapChungChi ? 'Khoa hoc da hoan thanh' : 'Chuc mung ban!',
            html: daCapChungChi
                ? 'Ban da hoan thanh khoa hoc va co the xem lai chung chi bat cu luc nao.'
                : 'Ban da hoan thanh toan bo khoa hoc.<br/><br/>Hay lam bai test cuoi khoa de nhan chung chi.',
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#f69050',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: daCapChungChi ? 'Xem chung chi' : 'Lam bai test',
            cancelButtonText: 'De sau'
        }).then((result) => {
            if (result.isConfirmed) {
                setTabActive('chungchi');
            }
        });

        localStorage.setItem(modalKey, 'true');
    }, [daCapChungChi, daHoanThanhKhoaHoc, khoaHoc]);

    const handleSeekVideo = (seconds: number) => {
        videoRef.current?.seekTo(seconds);
    };

    const danhDauHoanThanhBai = (maBaiHoc: number) => {
        setKhoaHoc((prevData) => {
            if (!prevData) return null;

            return {
                ...prevData,
                danhSachChuongHoc: prevData.danhSachChuongHoc.map((chuong) => ({
                    ...chuong,
                    danhSachBaiHoc: chuong.danhSachBaiHoc.map((bai) =>
                        bai.id === maBaiHoc ? { ...bai, daXem: true } : bai
                    )
                }))
            };
        });
    };

    const handleVideoCompleted = useCallback((maBaiHocVuaXong: number) => {
        const baiHocVuaXong = flatList.find((bai) => bai.id === maBaiHocVuaXong);

        if (baiHocVuaXong?.thongTinQuiz) {
            setVideoDaXongLocal((prev) => [...prev, maBaiHocVuaXong]);

            void Swal.fire({
                title: 'Da hoan thanh ly thuyet!',
                text: 'Hay hoan thanh bai trac nghiem de mo khoa bai hoc tiep theo.',
                icon: 'info',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                setTabActive('quiz');
            });
            return;
        }

        danhDauHoanThanhBai(maBaiHocVuaXong);
    }, [flatList]);

    const handleChonBaiHoc = (maBaiHoc: number, tabDeMo: 'hoc' | 'quiz' = 'hoc') => {
        const index = flatList.findIndex((bai) => bai.id === maBaiHoc);
        if (index < 0) return;

        if (index === 0 || flatList[index - 1].daXem === true) {
            setIdBaiHoc(maBaiHoc);
            setTabActive(tabDeMo);
            setDangLamKiemTraChungChi(false);
            return;
        }

        void Swal.fire({
            title: 'Bai hoc dang bi khoa',
            text: 'Vui long hoan thanh bai hoc truoc do.',
            icon: 'warning'
        });
    };

    const xuLyNopBaiTap = async (
        phanTramDiem: number,
        daDat: boolean,
        soCauDung: number,
        tongSoCau: number,
        chiTietTraLoi: { IdCauHoi: number; IndexLuaChon: number }[]
    ) => {
        if (!baiHocHienTai?.thongTinQuiz) return;

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

            if (!daDat) return;

            danhDauHoanThanhBai(idBaiHoc);

            const baiTiepTheo = KhoaHocService.timBaiTiepTheo(flatList, idBaiHoc);
            if (baiTiepTheo) {
                void Swal.fire({
                    title: 'Tuyet voi!',
                    text: 'Ban da vuot qua bai trac nghiem. Hoc bai tiep theo chu?',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Hoc bai tiep theo',
                    cancelButtonText: 'O lai trang nay',
                    confirmButtonColor: '#f69050'
                }).then((result) => {
                    if (result.isConfirmed) {
                        setIdBaiHoc(baiTiepTheo);
                        setTabActive('hoc');
                    }
                });
            }
        } catch (error) {
            console.error('Loi khi nop bai quiz:', error);
        }
    };

    const xuLyBatDauKiemTraChungChi = () => {
        setTabActive('chungchi');
        setDangLamKiemTraChungChi(true);
    };

    const xuLyNopBaiChungChi = async (
        _diem: number,
        _daDat: boolean,
        _soCauDung: number,
        _tongSoCau: number,
        chiTietTraLoi: { IdCauHoi: number; IndexLuaChon: number }[]
    ) => {
        if (!khoaHoc) return;

        setDangNopKiemTraChungChi(true);
        try {
            const payload: NopBaiKiemTraChungChiDTO = {
                MaKhoaHoc: khoaHoc.maKhoaHoc,
                MaNguoiDung: maNguoiDung,
                ChiTietLamBai: chiTietTraLoi
            };

            const ketQua = await KhoaHocService.nopBaiKiemTraChungChi(payload);

            setKhoaHoc((prevData) => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    thongTinChungChi: ketQua.thongTinChungChi ?? prevData.thongTinChungChi
                };
            });

            setDangLamKiemTraChungChi(false);

            if (ketQua.daDat) {
                setTimeout(() => {
                    void Swal.fire({
                        title: 'Chung chi da san sang',
                        text: ketQua.thongBao,
                        icon: 'success',
                        confirmButtonColor: '#f69050'
                    });
                }, 250);
            }
        } catch (error: any) {
            const thongBao = error?.response?.data?.thongBao || 'Khong the nop bai kiem tra chung chi.';
            console.error('Loi khi nop bai chung chi:', error);
            void Swal.fire({
                title: 'Khong the luu ket qua',
                text: thongBao,
                icon: 'error',
                confirmButtonColor: '#f69050'
            });
        } finally {
            setDangNopKiemTraChungChi(false);
        }
    };

    const xuLyInChungChi = () => {
        if (!khoaHoc?.thongTinChungChi?.daCap) return;

        const popup = window.open('', '_blank', 'width=1100,height=800');
        if (!popup) return;

        const tenHocVienSafe = escapeHtml(khoaHoc.thongTinChungChi.tenHocVien || tenHocVien);
        const tenKhoaHocSafe = escapeHtml(khoaHoc.thongTinChungChi.tenKhoaHoc || khoaHoc.tenKhoaHoc);
        const maChungChiSafe = escapeHtml(khoaHoc.thongTinChungChi.maChungChi || '');
        const ngayCapSafe = escapeHtml(
            khoaHoc.thongTinChungChi.ngayCap
                ? new Date(khoaHoc.thongTinChungChi.ngayCap).toLocaleDateString('vi-VN')
                : '--'
        );

        popup.document.write(`
            <html>
                <head>
                    <title>Chung chi khoa hoc</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 32px;
                            background: #f4f5fb;
                            font-family: Georgia, serif;
                        }
                        .certificate {
                            max-width: 980px;
                            margin: 0 auto;
                            padding: 56px;
                            border-radius: 28px;
                            color: #fff;
                            background: linear-gradient(135deg, #181d38 0%, #26315f 54%, #f69050 125%);
                            border: 10px solid rgba(255,255,255,0.08);
                            text-align: center;
                            box-sizing: border-box;
                        }
                        .brand {
                            display: inline-block;
                            padding: 8px 18px;
                            border-radius: 999px;
                            background: rgba(255,255,255,0.12);
                            text-transform: uppercase;
                            letter-spacing: 0.08em;
                            font-size: 12px;
                        }
                        h1 {
                            margin: 20px 0 8px;
                            font-size: 42px;
                        }
                        .subtitle {
                            color: rgba(255,255,255,0.82);
                            margin-bottom: 28px;
                            font-size: 18px;
                        }
                        .student {
                            font-size: 36px;
                            font-weight: 700;
                            margin: 0 0 14px;
                        }
                        .course {
                            font-size: 24px;
                            line-height: 1.7;
                            margin: 0 auto 24px;
                            max-width: 720px;
                        }
                        .meta {
                            display: flex;
                            justify-content: center;
                            gap: 28px;
                            flex-wrap: wrap;
                            color: rgba(255,255,255,0.82);
                            font-size: 16px;
                        }
                    </style>
                </head>
                <body>
                    <div class="certificate">
                        <div class="brand">EduCodeAI</div>
                        <h1>Certificate of Completion</h1>
                        <p class="subtitle">Chung nhan hoc vien da hoan thanh khoa hoc va dat yeu cau bai test cuoi khoa.</p>
                        <p class="student">${tenHocVienSafe}</p>
                        <p class="course">${tenKhoaHocSafe}</p>
                        <div class="meta">
                            <span>Ma chung chi: ${maChungChiSafe}</span>
                            <span>Ngay cap: ${ngayCapSafe}</span>
                        </div>
                    </div>
                </body>
            </html>
        `);
        popup.document.close();
        popup.focus();
        popup.print();
    };

    if (!maNguoiDung) {
        return <div>Vui long dang nhap de xem noi dung khoa hoc.</div>;
    }

    if (!khoaHoc || !baiHocHienTai) {
        return <div>Dang tai khoa hoc...</div>;
    }

    const dangLamQuiz = tabActive === 'quiz' || dangLamKiemTraChungChi || (tabActive === 'hoc' && baiHocHienTai.loaiBaiHoc === 'Quiz');

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
                return <div dangerouslySetInnerHTML={{ __html: baiHocHienTai.noiDung || '' }} />;
            case 'Ide':
                return (
                    <BaiTapIDE
                        duLieu={{
                            tieuDe: baiHocHienTai.tieuDe || 'Bai tap thuc hanh',
                            moTa: baiHocHienTai.noiDung || '',
                            ngonNgu: 'python',
                            templateCode: '# Viet code cua ban tai day\n',
                            testCases: []
                        }}
                        khiHoanThanh={(_phanTram: number, daDat: boolean) => {
                            if (daDat) {
                                handleVideoCompleted(idBaiHoc);
                            }
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
                return <div className="p-5 text-center text-muted">Dang tai noi dung...</div>;
        }
    };

    return (
        <div style={{ background: '#f4f5fb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <ThanhTieuDe
                tenKhoaHoc={khoaHoc.tenKhoaHoc}
                soBaiDaHoc={soBaiDaHoc}
                tongSoBai={tongSoBai}
                onMoGhiChu={() => setHienSidebar(true)}
            />

            <button
                className="cp-mobile-toggle-sidebar btn btn-sm"
                onClick={() => setHienSidebarMobile(true)}
                style={{
                    position: 'fixed',
                    bottom: 72,
                    right: 16,
                    zIndex: 250,
                    background: '#f69050',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 50,
                    width: 46,
                    height: 46,
                    boxShadow: '0 4px 14px rgba(246,144,80,0.45)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem'
                }}
            >
                <i className="fas fa-list" />
            </button>

            <div
                className={`cp-drawer-overlay${hienSidebarMobile ? ' show' : ''}`}
                onClick={() => setHienSidebarMobile(false)}
            />

            <main className="cp-shell">
                <section className="cp-left">
                    {tabActive !== 'quiz' && (
                        <div className="cp-tabs">
                            <button
                                className={`cp-tab ${tabActive === 'hoc' ? 'cp-tab-active' : ''}`}
                                onClick={() => {
                                    setTabActive('hoc');
                                    setDangLamKiemTraChungChi(false);
                                }}
                            >
                                <i className="fas fa-play-circle" /> Bai hoc
                            </button>

                            {baiHocHienTai.loaiBaiHoc === 'Video' && (
                                <button
                                    className={`cp-tab ${tabActive === 'tomtat' ? 'cp-tab-active' : ''}`}
                                    onClick={() => {
                                        setTabActive('tomtat');
                                        setDangLamKiemTraChungChi(false);
                                    }}
                                >
                                    <i className="fas fa-magic" /> Tom tat Video AI
                                </button>
                            )}

                            {(daHoanThanhKhoaHoc || daCapChungChi) && (
                                <button
                                    className={`cp-tab ${tabActive === 'chungchi' ? 'cp-tab-active' : ''}`}
                                    onClick={() => setTabActive('chungchi')}
                                >
                                    <i className="fas fa-award" /> Chung chi
                                </button>
                            )}

                            <button
                                className={`cp-tab ${tabActive === 'danhgia' ? 'cp-tab-active' : ''}`}
                                onClick={() => {
                                    setTabActive('danhgia');
                                    setDangLamKiemTraChungChi(false);
                                }}
                            >
                                <i className="fas fa-star" /> Danh gia
                            </button>
                        </div>
                    )}

                    <div className="cp-main-content">
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
                                <div style={{ display: tabActive === 'hoc' ? 'block' : 'none', height: '100%' }}>
                                    {renderMainContent()}
                                </div>

                                <div style={{ display: tabActive === 'tomtat' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
                                    <VideoSummary
                                        maBaiHoc={baiHocHienTai.id || 0}
                                        phuDeGoc={baiHocHienTai.noiDung || ''}
                                        linkVideo={baiHocHienTai.linkVideo || ''}
                                        tieuDe={baiHocHienTai.tieuDe || ''}
                                    />
                                </div>

                                <div style={{ display: tabActive === 'chungchi' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
                                    <TabChungChi
                                        tenKhoaHoc={khoaHoc.tenKhoaHoc}
                                        tenHocVien={tenHocVien}
                                        baiKiemTraChungChi={khoaHoc.baiKiemTraChungChi}
                                        thongTinChungChi={khoaHoc.thongTinChungChi}
                                        daHoanThanhKhoaHoc={daHoanThanhKhoaHoc}
                                        dangLamBai={dangLamKiemTraChungChi}
                                        dangNopBai={dangNopKiemTraChungChi}
                                        onBatDauThi={xuLyBatDauKiemTraChungChi}
                                        onNopBai={xuLyNopBaiChungChi}
                                        onInChungChi={xuLyInChungChi}
                                    />
                                </div>

                                <div style={{ display: tabActive === 'danhgia' ? 'block' : 'none', height: '100%', overflowY: 'auto', padding: '20px' }}>
                                    <TabDanhGia
                                        maKhoaHoc={khoaHoc.maKhoaHoc}
                                        maNguoiDung={maNguoiDung}
                                        daHoanThanhKhoaHoc={daHoanThanhKhoaHoc}
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
                    onChonBaiHoc={(maBaiHoc, tab) => {
                        handleChonBaiHoc(maBaiHoc, tab);
                        setHienSidebarMobile(false);
                    }}
                    className={hienSidebarMobile ? 'mobile-open' : ''}
                />
            </main>

            <DieuHuongNhanh
                onPrev={() => prevId && setIdBaiHoc(prevId)}
                onNext={() => nextId && setIdBaiHoc(nextId)}
                hasPrev={!!prevId}
                hasNext={!!nextId}
                daHoanThanhBaiHienTai={baiHocHienTai.daXem === true}
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
