import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    const navigate = useNavigate();
    const [khoaHoc, setKhoaHoc] = useState<KhoaHocData | null>(null);
    const [idBaiHoc, setIdBaiHoc] = useState(0);
    const [hienSidebar, setHienSidebar] = useState(false);
    const [tabActive, setTabActive] = useState<'hoc' | 'tomtat' | 'danhgia' | 'quiz' | 'chungchi' | 'ide'>('hoc');
    const [hienGhiChuAI, setHienGhiChuAI] = useState(false);
    const [hienSidebarMobile, setHienSidebarMobile] = useState(false);
    const [videoDaXongLocal, setVideoDaXongLocal] = useState<number[]>([]);
    const [dangLamKiemTraChungChi, setDangLamKiemTraChungChi] = useState(false);
    const [dangNopKiemTraChungChi, setDangNopKiemTraChungChi] = useState(false);
    const [hoTenHienThiChungChi, setHoTenHienThiChungChi] = useState('');
    const [emailNhanChungChi, setEmailNhanChungChi] = useState('');
    const videoRef = useRef<NoiDungVideoRef>(null);
    const initiallyFinishedRef = useRef<boolean | null>(null);

    const maNguoiDung = getUserId() ?? 0;
    const thongTinNguoiDung = getUserInfo();
    const tenHocVien = thongTinNguoiDung?.hoTen || thongTinNguoiDung?.taiKhoan || 'Học viên';
    const emailNguoiDung = thongTinNguoiDung?.email || '';

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
        initiallyFinishedRef.current = null;
    }, [id]);

    useEffect(() => {
        if (idBaiHoc !== 0 && id) {
            localStorage.setItem(`bai_hoc_dang_hoc_${id}`, idBaiHoc.toString());
        }
    }, [idBaiHoc, id]);

    useEffect(() => {
        if (!khoaHoc) return;
        setHoTenHienThiChungChi(khoaHoc.thongTinChungChi?.hoTenHienThi || tenHocVien);
        setEmailNhanChungChi(khoaHoc.thongTinChungChi?.emailNhan || emailNguoiDung);
    }, [khoaHoc, tenHocVien, emailNguoiDung]);

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
    const hienTabChungChi = khoaHoc?.coChungChi === true;

    useEffect(() => {
        if (!khoaHoc || !khoaHoc.coChungChi) return;

        if (!daHoanThanhKhoaHoc) {
            initiallyFinishedRef.current = false;
            return;
        }

        // Nếu đã hoàn thành từ đầu thì đánh dấu đã biết, không hiện thình lình
        if (initiallyFinishedRef.current === null) {
            initiallyFinishedRef.current = true;
            return;
        }

        // Nếu đã hiện thông báo trong phiên này hoặc đã lưu localStorage thì bỏ qua
        const modalKey = `shown_certificate_prompt_${khoaHoc.maKhoaHoc}`;
        if (localStorage.getItem(modalKey)) return;

        // Nếu khóa học đã được cấp chứng chỉ rồi thì thường không cần hiện lại thông báo "chúc mừng đã xong" 
        // trừ khi bạn muốn nhắc họ vào xem lại. Nhưng yêu cầu là "chỉ 1 lần" nên ta sẽ chặn.
        if (daCapChungChi) {
            localStorage.setItem(modalKey, 'true');
            return;
        }

        // Đánh dấu đã hiện ngay lập tức trước khi gọi Swal để tránh re-render gây chồng modal
        localStorage.setItem(modalKey, 'true');

        void Swal.fire({
            title: 'Chúc mừng bạn!',
            html: 'Bạn đã hoàn thành toàn bộ khóa học.<br/><br/>Hãy làm bài kiểm tra cuối khóa để nhận chứng chỉ nhé.',
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#f69050',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Làm bài kiểm tra',
            cancelButtonText: 'Để sau'
        }).then((result) => {
            if (result.isConfirmed) {
                setTabActive('chungchi');
            }
        });
    }, [daCapChungChi, daHoanThanhKhoaHoc, khoaHoc?.maKhoaHoc, khoaHoc?.coChungChi]);

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
                title: 'Đã hoàn thành lý thuyết!',
                text: 'Hãy hoàn thành bài trắc nghiệm để mở khóa bài học tiếp theo.',
                icon: 'info',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                setTabActive('quiz');
            });
            return;
        }

        if (baiHocVuaXong?.maBaiTapThucHanh) {
            setVideoDaXongLocal((prev) => [...prev, maBaiHocVuaXong]);

            void Swal.fire({
                title: 'Đã hoàn thành lý thuyết!',
                text: 'Hãy hoàn thành bài tập thực hành IDE để mở khóa bài học tiếp theo.',
                icon: 'info',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                setTabActive('ide');
            });
            return;
        }

        danhDauHoanThanhBai(maBaiHocVuaXong);
    }, [flatList]);

    const handleChonBaiHoc = (maBaiHoc: number, tabDeMo: 'hoc' | 'quiz' | 'ide' = 'hoc') => {
        const index = flatList.findIndex((bai) => bai.id === maBaiHoc);
        if (index < 0) return;

        if (index === 0 || flatList[index - 1].daXem === true) {
            setIdBaiHoc(maBaiHoc);
            setTabActive(tabDeMo);
            setDangLamKiemTraChungChi(false);
            return;
        }

        void Swal.fire({
            title: 'Bài học đang bị khóa',
            text: 'Vui lòng hoàn thành bài học trước đó.',
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
                    title: 'Tuyệt vời!',
                    text: 'Bạn đã vượt qua bài trắc nghiệm. Học bài tiếp theo chứ?',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Học bài tiếp theo',
                    cancelButtonText: 'Ở lại trang này',
                    confirmButtonColor: '#f69050'
                }).then((result) => {
                    if (result.isConfirmed) {
                        setIdBaiHoc(baiTiepTheo);
                        setTabActive('hoc');
                    }
                });
            }
        } catch (error) {
            console.error('Lỗi khi nộp bài quiz:', error);
        }
    };

    const xuLyBatDauKiemTraChungChi = () => {
        if (!hoTenHienThiChungChi.trim() || !emailNhanChungChi.trim()) {
            void Swal.fire({
                title: 'Thiếu thông tin',
                text: 'Vui lòng nhập họ tên và email nhận chứng chỉ trước khi bắt đầu bài kiểm tra.',
                icon: 'warning',
                confirmButtonColor: '#f69050'
            });
            return;
        }

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
                HoTenHienThi: hoTenHienThiChungChi.trim(),
                EmailNhan: emailNhanChungChi.trim(),
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

            // Lạc quan (optimistic UI update): Background worker sẽ gửi email rất nhanh (sau 1-2 giây)
            // nên ta tự động cập nhật trạng thái đã gửi để user trải nghiệm liền mạch
            if (ketQua.daDat) {
                setTimeout(() => {
                    setKhoaHoc((prevData) => {
                        if (!prevData || !prevData.thongTinChungChi) return prevData;
                        return {
                            ...prevData,
                            thongTinChungChi: {
                                ...prevData.thongTinChungChi,
                                daGuiEmail: true,
                                ngayGuiEmail: new Date().toISOString()
                            }
                        };
                    });
                }, 2500);
            }

            setDangLamKiemTraChungChi(false);

            void Swal.fire({
                title: ketQua.daDat ? 'Đã xử lý chứng chỉ' : 'Kết quả bài kiểm tra',
                text: ketQua.thongBao,
                icon: ketQua.daDat ? 'success' : 'info',
                confirmButtonColor: '#f69050'
            });
        } catch (error: any) {
            const thongBao = error?.response?.data?.thongBao || 'Không thể nộp bài kiểm tra chứng chỉ.';
            console.error('Lỗi khi nộp bài chứng chỉ:', error);
            void Swal.fire({
                title: 'Không thể lưu kết quả',
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

        const tenHocVienSafe = escapeHtml(khoaHoc.thongTinChungChi.hoTenHienThi || khoaHoc.thongTinChungChi.tenHocVien || tenHocVien);
        const tenKhoaHocSafe = escapeHtml(khoaHoc.thongTinChungChi.tenKhoaHoc || khoaHoc.tenKhoaHoc);
        const maChungChiSafe = escapeHtml(khoaHoc.thongTinChungChi.maChungChi || '');
        const ngayCapSafe = escapeHtml(
            khoaHoc.thongTinChungChi.ngayCap
                ? new Date(khoaHoc.thongTinChungChi.ngayCap).toLocaleDateString('vi-VN')
                : '--'
        );
        const tenChungChiSafe = escapeHtml(khoaHoc.thongTinChungChi.tenChungChi || 'Chứng nhận hoàn thành');

        popup.document.write(`
            <html>
                <head>
                    <title>${tenChungChiSafe}</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 32px;
                            background: #f4f5fb;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        }
                        .certificate {
                            max-width: 980px;
                            margin: 0 auto;
                            padding: 64px;
                            border-radius: 28px;
                            color: #fff;
                            background: linear-gradient(135deg, #181d38 0%, #26315f 54%, #f69050 125%);
                            border: 10px solid rgba(255,255,255,0.08);
                            text-align: center;
                            box-sizing: border-box;
                            position: relative;
                        }
                        .brand {
                            display: inline-block;
                            padding: 8px 24px;
                            border-radius: 999px;
                            background: rgba(255,255,255,0.12);
                            text-transform: uppercase;
                            letter-spacing: 0.12em;
                            font-size: 14px;
                            font-weight: 600;
                        }
                        h1 {
                            margin: 24px 0 12px;
                            font-size: 48px;
                            color: #f69050;
                        }
                        .subtitle {
                            color: rgba(255,255,255,0.85);
                            margin-bottom: 32px;
                            font-size: 20px;
                            font-style: italic;
                        }
                        .student {
                            font-size: 42px;
                            font-weight: 700;
                            margin: 16px 0;
                            text-decoration: underline;
                        }
                        .course-label {
                            font-size: 18px;
                            margin-top: 24px;
                            opacity: 0.9;
                        }
                        .course {
                            font-size: 28px;
                            font-weight: 600;
                            margin: 8px auto 32px;
                            max-width: 720px;
                        }
                        .meta {
                            display: flex;
                            justify-content: center;
                            gap: 40px;
                            margin-top: 40px;
                            padding-top: 24px;
                            border-top: 1px solid rgba(255,255,255,0.2);
                            color: rgba(255,255,255,0.82);
                            font-size: 16px;
                        }
                    </style>
                </head>
                <body>
                    <div class="certificate">
                        <div class="brand">EduCodeAI Learning Platform</div>
                        <h1>${tenChungChiSafe.toUpperCase()}</h1>
                        <p class="subtitle">Chứng nhận học viên đã hoàn thành xuất sắc khóa học và đạt yêu cầu kiểm tra cuối khóa.</p>
                        <p class="student">${tenHocVienSafe}</p>
                        <p class="course-label">Đã hoàn thành khóa học</p>
                        <p class="course">${tenKhoaHocSafe}</p>
                        <div class="meta">
                            <span>Mã chứng chỉ: ${maChungChiSafe}</span>
                            <span>Ngày cấp: ${ngayCapSafe}</span>
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
        return <NoiDungKhoaHocRequireLogin />;
    }

    if (!khoaHoc || !baiHocHienTai) {
        return <NoiDungKhoaHocLoading />;
    }

    const dangLamQuiz = tabActive === 'quiz' || dangLamKiemTraChungChi || (tabActive === 'hoc' && baiHocHienTai.loaiBaiHoc === 'Quiz');

    const renderMainContent = () => {
        switch (baiHocHienTai.loaiBaiHoc) {
            case 'Video':
                if (baiHocHienTai.biKhoa || !baiHocHienTai.linkVideo) {
                    return (
                        <BaiHocBiKhoaCard
                            tenKhoaHoc={khoaHoc.tenKhoaHoc}
                            maKhoaHoc={khoaHoc.maKhoaHoc}
                        />
                    );
                }
                return (
                    <NoiDungVideo
                        ref={videoRef}
                        key={baiHocHienTai.id}
                        videoUrl={baiHocHienTai.linkVideo}
                        videoSource={baiHocHienTai.videoSource}
                        subtitleUrl={baiHocHienTai.subtitleUrl}
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
                        maBaiTap={baiHocHienTai.maBaiTapThucHanh || 0}
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
                return <div className="p-5 text-center text-muted">Đang tải nội dung...</div>;
        }
    };

    return (
        <div style={{ background: '#f4f5fb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <ThanhTieuDe
                tenKhoaHoc={khoaHoc.tenKhoaHoc}
                soBaiDaHoc={soBaiDaHoc}
                tongSoBai={tongSoBai}
                laCheDoHocThu={khoaHoc.laCheDoHocThu}
                soVideoHocThu={khoaHoc.soVideoHocThu}
                onMuaKhoaHoc={() => navigate(`/mua-khoa-hoc/${khoaHoc.maKhoaHoc}`)}
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
                                <i className="fas fa-play-circle" /> Bài học
                            </button>

                            {baiHocHienTai.loaiBaiHoc === 'Video' && (
                                <button
                                    className={`cp-tab ${tabActive === 'tomtat' ? 'cp-tab-active' : ''}`}
                                    onClick={() => {
                                        setTabActive('tomtat');
                                        setDangLamKiemTraChungChi(false);
                                    }}
                                >
                                    <i className="fas fa-magic" /> Tóm tắt Video AI
                                </button>
                            )}

                            {hienTabChungChi && (
                                <button
                                    className={`cp-tab ${tabActive === 'chungchi' ? 'cp-tab-active' : ''}`}
                                    onClick={() => setTabActive('chungchi')}
                                >
                                    <i className="fas fa-award" /> Chứng chỉ
                                </button>
                            )}

                            <button
                                className={`cp-tab ${tabActive === 'danhgia' ? 'cp-tab-active' : ''}`}
                                onClick={() => {
                                    setTabActive('danhgia');
                                    setDangLamKiemTraChungChi(false);
                                }}
                            >
                                <i className="fas fa-star" /> Đánh giá
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
                        ) : tabActive === 'ide' ? (
                            <div style={{ height: '100%', overflowY: 'auto', backgroundColor: '#fff' }}>
                                {baiHocHienTai.maBaiTapThucHanh && (
                                    <BaiTapIDE
                                        maBaiTap={baiHocHienTai.maBaiTapThucHanh}
                                        khiHoanThanh={(_phanTram, daDat) => {
                                            if (daDat) handleVideoCompleted(idBaiHoc);
                                        }}
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
                                        subtitleUrl={baiHocHienTai.subtitleUrl || ''}
                                        tieuDe={baiHocHienTai.tieuDe || ''}
                                    />
                                </div>

                                <div style={{ display: tabActive === 'chungchi' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
                                    {hienTabChungChi && (
                                        <TabChungChi
                                            tenKhoaHoc={khoaHoc.tenKhoaHoc}
                                            tenHocVien={tenHocVien}
                                            baiKiemTraChungChi={khoaHoc.baiKiemTraChungChi}
                                            thongTinChungChi={khoaHoc.thongTinChungChi}
                                            daHoanThanhKhoaHoc={daHoanThanhKhoaHoc}
                                            dangLamBai={dangLamKiemTraChungChi}
                                            dangNopBai={dangNopKiemTraChungChi}
                                            hoTenHienThi={hoTenHienThiChungChi}
                                            emailNhan={emailNhanChungChi}
                                            onThayDoiHoTenHienThi={setHoTenHienThiChungChi}
                                            onThayDoiEmailNhan={setEmailNhanChungChi}
                                            onBatDauThi={xuLyBatDauKiemTraChungChi}
                                            onNopBai={xuLyNopBaiChungChi}
                                            onInChungChi={xuLyInChungChi}
                                        />
                                    )}
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
                getCurrentVideoTime={() => videoRef.current?.getCurrentTime() ?? null}
                isQuizMode={dangLamQuiz}
            />
        </div>
    );
};

const NoiDungKhoaHocLoading = () => {
    const [progress, setProgress] = useState(15);
    const [stepIndex, setStepIndex] = useState(0);

    const steps = [
        "Đang kết nối môi trường học tập EduCodeAI...",
        "Đang tải cấu trúc chương học & danh sách bài giảng...",
        "Đang chuẩn bị trình phát video & trợ lý AI...",
        "Sẵn sàng! Đang khởi chạy bài học..."
    ];

    const tips = [
        "Mẹo: Bạn có thể đặt câu hỏi cho Trợ lý AI bất cứ lúc nào trong khi học.",
        "Mẹo: Bạn có thể lưu lại các ghi chú trực tiếp tại mốc thời gian của video.",
        "Mẹo: Hoàn thành bài trắc nghiệm cuối khóa để nhận chứng chỉ chính thức từ EduCodeAI."
    ];

    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 92) return 92;
                return prev + Math.floor(Math.random() * 15) + 8;
            });
        }, 350);

        const stepTimer = setInterval(() => {
            setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 700);

        const tipTimer = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % tips.length);
        }, 2500);

        return () => {
            clearInterval(interval);
            clearInterval(stepTimer);
            clearInterval(tipTimer);
        };
    }, []);

    return (
        <div className="cp-modern-loader-container">
            <div className="cp-modern-loader-backdrop" />

            <div className="cp-modern-loader-card">
                <div className="cp-loader-orb-wrapper">
                    <div className="cp-loader-ring-outer" />
                    <div className="cp-loader-ring-inner" />
                    <div className="cp-loader-core-icon">
                        <i className="fas fa-graduation-cap" />
                    </div>
                </div>

                <h3 className="cp-loader-title">EduCodeAI Learning</h3>

                <div className="cp-loader-status-text">
                    <i className="fas fa-circle-notch fa-spin text-warning me-1" />
                    <span>{steps[stepIndex]}</span>
                </div>

                <div className="cp-loader-progress-track">
                    <div
                        className="cp-loader-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="cp-loader-step-dots">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`cp-loader-dot ${i <= stepIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>

                <div className="cp-loader-tip-box">
                    <i className="fas fa-lightbulb" />
                    <span>{tips[tipIndex]}</span>
                </div>
            </div>
        </div>
    );
};

const NoiDungKhoaHocRequireLogin = () => {
    const navigate = useNavigate();
    return (
        <div className="cp-modern-loader-container">
            <div className="cp-modern-loader-backdrop" />
            <div className="cp-modern-loader-card" style={{ maxWidth: 460 }}>
                <div
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: 'rgba(246, 144, 80, 0.15)',
                        border: '1px solid rgba(246, 144, 80, 0.4)',
                        color: '#f69050',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    <i className="fas fa-lock" />
                </div>
                <h3 className="cp-loader-title" style={{ fontSize: '1.3rem' }}>Yêu cầu đăng nhập</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                    Bạn cần đăng nhập tài khoản EduCodeAI để truy cập nội dung bài học và làm bài tập.
                </p>
                <button
                    type="button"
                    onClick={() => navigate('/dang-nhap')}
                    style={{
                        background: 'linear-gradient(135deg, #f69050, #ff7b2b)',
                        color: '#fff',
                        fontWeight: 600,
                        padding: '0.75rem 2.2rem',
                        borderRadius: '999px',
                        border: 'none',
                        boxShadow: '0 6px 20px rgba(246, 144, 80, 0.4)',
                        cursor: 'pointer',
                        fontSize: '0.95rem'
                    }}
                >
                    <i className="fas fa-sign-in-alt me-2" /> Đăng nhập ngay
                </button>
            </div>
        </div>
    );
};

const BaiHocBiKhoaCard = ({ tenKhoaHoc, maKhoaHoc }: { tenKhoaHoc: string; maKhoaHoc: number }) => {
    const navigate = useNavigate();
    return (
        <div
            style={{
                width: '100%',
                minHeight: '440px',
                height: '100%',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1.5rem',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(15, 23, 42, 0.15)'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '320px',
                    height: '320px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(246, 144, 80, 0.25) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }}
            />

            <div
                style={{
                    position: 'relative',
                    zIndex: 2,
                    maxWidth: '520px',
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(246, 144, 80, 0.3)',
                    borderRadius: '20px',
                    padding: '2.5rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
                }}
            >
                <div
                    style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f69050, #ff7b2b)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.9rem',
                        color: '#ffffff',
                        marginBottom: '1.25rem',
                        boxShadow: '0 0 25px rgba(246, 144, 80, 0.55)',
                        animation: 'cp-pulse-glow 2s infinite ease-in-out'
                    }}
                >
                    <i className="fas fa-crown" />
                </div>

                <div
                    style={{
                        display: 'inline-block',
                        padding: '4px 14px',
                        borderRadius: '999px',
                        background: 'rgba(246, 144, 80, 0.15)',
                        color: '#f69050',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '0.75rem',
                        border: '1px solid rgba(246, 144, 80, 0.3)'
                    }}
                >
                    Nội dung trả phí
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                    Mở khóa toàn bộ khóa học
                </h3>

                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    Bài học này thuộc nội dung chính thức của khóa <strong>{tenKhoaHoc}</strong>. Hãy mở khóa để truy cập trọn bộ video, thực hành IDE & nhận chứng chỉ.
                </p>

                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '12px',
                        padding: '0.9rem 1.2rem',
                        marginBottom: '1.75rem',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        fontSize: '0.85rem',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-check-circle" style={{ color: '#10b981' }} />
                        <span>Xem không giới hạn tất cả bài giảng chất lượng cao</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-check-circle" style={{ color: '#10b981' }} />
                        <span>Thực hành lập trình IDE tự động chấm & Trợ lý AI 24/7</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-check-circle" style={{ color: '#10b981' }} />
                        <span>Thi kiểm tra & cấp chứng chỉ hoàn thành EduCodeAI</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(`/mua-khoa-hoc/${maKhoaHoc}`)}
                    style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #f69050 0%, #ff7b2b 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.98rem',
                        padding: '0.85rem 1.75rem',
                        borderRadius: '999px',
                        border: 'none',
                        boxShadow: '0 8px 24px rgba(246, 144, 80, 0.4)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <i className="fas fa-unlock-alt" />
                    <span>Nâng cấp & Mở khóa ngay</span>
                </button>
            </div>
        </div>
    );
};

export default NoiDungKhoaHoc;
