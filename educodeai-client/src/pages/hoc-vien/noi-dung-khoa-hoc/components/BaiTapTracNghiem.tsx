import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

// 1. Interface khớp với cấu trúc JSON trong Database (C# Seed Data)
interface CauHoiDTO {
    Id: number;
    NoiDung: string;
    LuaChon: string[];
    DapAnDung: number;
}

// 2. Props nhận từ Component Cha
interface DuLieuQuiz {
    maBaiTapQuiz: number;
    maBaiTap: number;
    thoiGianLamBai?: number | null; // Phút
    diemCanDat: number;
    choPhepLamLai: boolean;
    daoCauHoi: boolean;
    duLieuCauHoi: string;    // JSON string
}

interface DaoCu {
    duLieu: DuLieuQuiz;
    khiHoanThanh?: (
        diem: number,
        daDat: boolean,
        soCauDung: number,
        tongSoCau: number,
        chiTietTraLoi: { IdCauHoi: number; IndexLuaChon: number }[]
    ) => void;
}

export const BaiTapTracNghiem: React.FC<DaoCu> = ({ duLieu, khiHoanThanh }) => {
    // --- STATE ---
    const [danhSachCauHoi, setDanhSachCauHoi] = useState<CauHoiDTO[]>([]);
    const [chiSoHienTai, setChiSoHienTai] = useState(0);
    const [dapAnNguoiDung, setDapAnNguoiDung] = useState<Record<number, number>>({});
    const [daNopBai, setDaNopBai] = useState(false);

    // State cho đồng hồ đếm ngược (tính bằng giây)
    const [thoiGianConLai, setThoiGianConLai] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- EFFECT 1: Khởi tạo dữ liệu & Đồng hồ ---
    useEffect(() => {
        try {
            if (duLieu.duLieuCauHoi) {
                let cauHoiParsed: CauHoiDTO[] = JSON.parse(duLieu.duLieuCauHoi);

                // Chỉ đảo câu hỏi lúc khởi tạo
                if (duLieu.daoCauHoi) {
                    cauHoiParsed = [...cauHoiParsed].sort(() => Math.random() - 0.5);
                }
                setDanhSachCauHoi(cauHoiParsed);

                // Reset các state khác khi bài tập thay đổi ID
                setDapAnNguoiDung({});
                setDaNopBai(false);
                setChiSoHienTai(0);

                if (duLieu.thoiGianLamBai && duLieu.thoiGianLamBai > 0) {
                    setThoiGianConLai(duLieu.thoiGianLamBai * 60);
                }
            }
        } catch (loi) {
            console.error("Lỗi parse dữ liệu câu hỏi:", loi);
            Swal.fire("Lỗi", "Dữ liệu bài tập không hợp lệ.", "error");
        }
        // CHỈ CHẠY LẠI KHI ID BÀI TẬP HOẶC NỘI DUNG CÂU HỎI THAY ĐỔI
    }, [duLieu.maBaiTapQuiz, duLieu.duLieuCauHoi]);

    // --- EFFECT 2: Chạy đồng hồ đếm ngược ---
    useEffect(() => {
        if (thoiGianConLai !== null && !daNopBai) {
            if (thoiGianConLai <= 0) {
                // Hết giờ -> Tự động nộp
                xuLyNopBai(true);
                return;
            }

            timerRef.current = setInterval(() => {
                setThoiGianConLai((prev) => (prev !== null ? prev - 1 : null));
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [thoiGianConLai, daNopBai]);

    // --- HELPER: Định dạng giây sang MM:SS ---
    const dinhDangThoiGian = (tongGiay: number) => {
        const phut = Math.floor(tongGiay / 60);
        const giay = tongGiay % 60;
        return `${phut < 10 ? '0' : ''}${phut}:${giay < 10 ? '0' : ''}${giay}`;
    };

    // --- LOGIC ---
    const cauHoiHienTai = danhSachCauHoi[chiSoHienTai];
    const tongSoCau = danhSachCauHoi.length;

    const xuLyChonDapAn = (chiSoLuaChon: number) => {
        if (daNopBai) return;
        setDapAnNguoiDung({
            ...dapAnNguoiDung,
            [chiSoHienTai]: chiSoLuaChon
        });
    };

    const chuyenCauHoi = (buoc: number) => {
        const chiSoMoi = chiSoHienTai + buoc;
        if (chiSoMoi >= 0 && chiSoMoi < tongSoCau) {
            setChiSoHienTai(chiSoMoi);
        }
    };

    const xuLyNopBai = (tuDongNop: boolean = false) => {
        // Nếu không phải tự động nộp (do hết giờ) thì hỏi xác nhận
        if (!tuDongNop && Object.keys(dapAnNguoiDung).length < tongSoCau) {
            if (!window.confirm("Bạn chưa chọn hết đáp án. Vẫn muốn nộp bài?")) return;
        }

        setDaNopBai(true);
        if (timerRef.current) clearInterval(timerRef.current);
        const danhSachTraLoi: { IdCauHoi: number; IndexLuaChon: number }[] = [];
        let soCauDung = 0;
        danhSachCauHoi.forEach((cau, index) => {
            const luaChonCuaUser = dapAnNguoiDung[index];

            if (luaChonCuaUser !== undefined) {
                danhSachTraLoi.push({
                    IdCauHoi: cau.Id,
                    IndexLuaChon: luaChonCuaUser
                });
            }

            if (luaChonCuaUser === cau.DapAnDung) soCauDung++;
        });

        const phanTramDatDuoc = (soCauDung / tongSoCau) * 100;
        const daDat = phanTramDatDuoc >= duLieu.diemCanDat;

        // --- SỬA LỖI TẠI ĐÂY: Truyền đủ 4 tham số ---
        if (khiHoanThanh) {
            khiHoanThanh(phanTramDatDuoc, daDat, soCauDung, tongSoCau, danhSachTraLoi);
        }
        // -------------------------------------------

        Swal.fire({
            icon: daDat ? 'success' : 'error',
            title: tuDongNop ? 'Hết giờ!' : (daDat ? 'Chúc mừng!' : 'Chưa đạt'),
            text: `Kết quả: ${soCauDung}/${tongSoCau} câu đúng (${Math.round(phanTramDatDuoc)}%). Yêu cầu: ${duLieu.diemCanDat}%`,
            confirmButtonText: 'Xem lại bài làm',
            confirmButtonColor: '#f69050'
        });
    };

    const lamLaiBai = () => {
        setDapAnNguoiDung({});
        setDaNopBai(false);
        setChiSoHienTai(0);
        // Reset thời gian
        if (duLieu.thoiGianLamBai) {
            setThoiGianConLai(duLieu.thoiGianLamBai * 60);
        }
        // Đảo lại câu hỏi nếu cần
        if (duLieu.daoCauHoi) {
            setDanhSachCauHoi([...danhSachCauHoi].sort(() => Math.random() - 0.5));
        }
    };

    const layClassDapAn = (chiSoCau: number, chiSoLuaChon: number, dapAnDung: number) => {
        const classCoBan = "cp-quiz-option";
        const duocChon = dapAnNguoiDung[chiSoCau] === chiSoLuaChon;

        if (!daNopBai) {
            return duocChon ? `${classCoBan} selected` : classCoBan;
        }

        // Logic hiển thị màu sau khi nộp
        if (chiSoLuaChon === dapAnDung) return `${classCoBan} correct`;
        if (duocChon && chiSoLuaChon !== dapAnDung) return `${classCoBan} wrong`;

        return classCoBan;
    };
    const phanTramTienDo = ((chiSoHienTai + 1) / tongSoCau) * 100;

    // --- RENDER ---
    if (danhSachCauHoi.length === 0) return <div className="p-4 text-center">Đang tải câu hỏi...</div>;

    return (
        <div className="cp-quiz-wrapper">
            {/* HEADER */}
            <div className="cp-quiz-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Trắc nghiệm kiến thức
                    </h2>

                    {/* Timer Badge */}
                    {thoiGianConLai !== null && !daNopBai ? (
                        <div className={`cp-timer-badge ${thoiGianConLai < 60 ? 'warning' : 'normal'}`}>
                            <i className="fas fa-stopwatch"></i>
                            <span>{dinhDangThoiGian(thoiGianConLai)}</span>
                        </div>
                    ) : (
                        duLieu.thoiGianLamBai && (
                            <div className="text-muted small">
                                <i className="far fa-clock me-1"></i> {duLieu.thoiGianLamBai} phút
                            </div>
                        )
                    )}
                </div>

                {/* Progress Bar & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: '#f69050' }}>Câu hỏi {chiSoHienTai + 1}</span>
                    <span style={{ color: '#aaa' }}>Tổng {tongSoCau}</span>
                </div>
                <div className="cp-progress-track">
                    <div className="cp-progress-fill" style={{ width: `${phanTramTienDo}%` }}></div>
                </div>
            </div>

            {/* BODY CÂU HỎI (Thêm animation key để reset hiệu ứng khi đổi câu) */}
            <div className="cp-quiz-body">
                <div key={chiSoHienTai} className="anim-enter">
                    <div className="cp-quiz-question">
                        {cauHoiHienTai.NoiDung}
                    </div>

                    <div className="cp-quiz-options">
                        {cauHoiHienTai.LuaChon.map((luaChon, index) => (
                            <div
                                key={index}
                                className={`cp-option-card ${layClassDapAn(chiSoHienTai, index, cauHoiHienTai.DapAnDung)}`}
                                onClick={() => xuLyChonDapAn(index)}
                            >
                                <div className="cp-option-circle"></div>
                                <span>{luaChon}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="cp-quiz-footer">
                <button
                    className="cp-btn-nav secondary"
                    disabled={chiSoHienTai === 0}
                    onClick={() => chuyenCauHoi(-1)}
                >
                    <i className="fas fa-arrow-left"></i> Quay lại
                </button>

                {chiSoHienTai < tongSoCau - 1 ? (
                    <button
                        className="cp-btn-nav primary"
                        onClick={() => chuyenCauHoi(1)}
                    >
                        Tiếp theo <i className="fas fa-arrow-right"></i>
                    </button>
                ) : (
                    !daNopBai ? (
                        <button
                            className="cp-btn-nav primary"
                            onClick={() => xuLyNopBai(false)}
                        >
                            <i className="fas fa-paper-plane"></i> Nộp bài
                        </button>
                    ) : (
                        duLieu.choPhepLamLai && (
                            <button
                                className="cp-btn-nav secondary"
                                style={{ color: '#f69050', background: '#fff5eb' }}
                                onClick={lamLaiBai}
                            >
                                <i className="fas fa-redo"></i> Làm lại
                            </button>
                        )
                    )
                )}
            </div>
        </div>
    );
};