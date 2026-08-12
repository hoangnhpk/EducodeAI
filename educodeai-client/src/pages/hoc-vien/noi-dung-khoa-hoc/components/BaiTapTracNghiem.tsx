import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

// 1. Interface mô tả JSON câu hỏi lưu trong DB.
// Trong DB đang tồn tại 2 định dạng: quiz giảng viên gõ tay (cauHoi + dapAnA..D) và
// quiz sinh bằng AI đời cũ (NoiDung + LuaChon[]). Phải đọc được cả hai.
interface RawCauHoi {
    id?: number;
    cauHoi?: string;
    dapAnA?: string;
    dapAnB?: string;
    dapAnC?: string;
    dapAnD?: string;
    dapAnDung?: string; // "A", "B", "C" hoặc "D"
    giaiThich?: string;

    // Định dạng cũ do AI sinh ra
    Id?: number;
    NoiDung?: string;
    LuaChon?: string[];
    DapAnDung?: string; // chữ cái "A".."D" hoặc chỉ số "0".."3"
    GiaiThich?: string;
}

// 2. Interface sử dụng nội bộ trong Component
interface CauHoiDTO {
    Id: number;
    NoiDung: string;
    LuaChon: string[];
    DapAnDung: number; // Chuyển "A", "B", "C", "D" thành 0, 1, 2, 3
    GiaiThich: string;
}

// Props nhận từ Component Cha
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

    // --- EFFECT 1: Khởi tạo & Chuyển đổi dữ liệu ---
    useEffect(() => {
        try {
            if (duLieu.duLieuCauHoi) {
                const duLieuGoc = JSON.parse(duLieu.duLieuCauHoi);
                // Một số bản ghi cũ lưu cả cục { "Câu hỏi": [...] } thay vì mảng thuần.
                const rawData: RawCauHoi[] = Array.isArray(duLieuGoc)
                    ? duLieuGoc
                    : (duLieuGoc?.['Câu hỏi'] ?? []);
                const bangChuCai: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

                // Đáp án đúng có thể là chữ cái ("A".."D") hoặc chỉ số ("0".."3").
                const docDapAnDung = (giaTri?: string): number => {
                    const chuoi = (giaTri ?? '').trim().toUpperCase();
                    if (chuoi in bangChuCai) return bangChuCai[chuoi];
                    const chiSo = Number(chuoi);
                    return Number.isInteger(chiSo) && chiSo >= 0 && chiSo <= 3 ? chiSo : 0;
                };

                let cauHoiParsed: CauHoiDTO[] = rawData.map((item, index) => {
                    const luaChon = Array.isArray(item.LuaChon)
                        ? item.LuaChon
                        : [item.dapAnA, item.dapAnB, item.dapAnC, item.dapAnD];

                    return {
                        Id: item.id ?? item.Id ?? index + 1,
                        NoiDung: item.cauHoi ?? item.NoiDung ?? '',
                        LuaChon: [0, 1, 2, 3].map((i) => luaChon[i] ?? ''),
                        DapAnDung: docDapAnDung(item.dapAnDung ?? item.DapAnDung),
                        GiaiThich: item.giaiThich ?? item.GiaiThich ?? ''
                    };
                });

                if (duLieu.daoCauHoi) {
                    cauHoiParsed = [...cauHoiParsed].sort(() => Math.random() - 0.5);
                }
                setDanhSachCauHoi(cauHoiParsed);

                // THÊM LOGIC: Kiểm tra LocalStorage xem có dữ liệu cũ không
                const storageKey = `quiz_progress_${duLieu.maBaiTap}`;
                const savedProgress = localStorage.getItem(storageKey);
                let khoiPhuc = false;

                if (savedProgress) {
                    const parsedProgress = JSON.parse(savedProgress);
                    // Yêu cầu: "Lúc thi lại không nên hiện đáp án cũ. Chỉ hiện lúc vừa làm xong."
                    // -> Không khôi phục nếu dữ liệu trong storage báo là đã nộp bài.
                    if (!parsedProgress.daNopBai) {
                        setDapAnNguoiDung(parsedProgress.dapAnNguoiDung || {});
                        setDaNopBai(false);
                        setChiSoHienTai(parsedProgress.chiSoHienTai || 0);
                        khoiPhuc = true;
                    } else {
                        localStorage.removeItem(storageKey);
                    }
                }
                
                if (!khoiPhuc) {
                    setDapAnNguoiDung({});
                    setDaNopBai(false);
                    setChiSoHienTai(0);
                }

                if (duLieu.thoiGianLamBai && duLieu.thoiGianLamBai > 0) {
                    setThoiGianConLai(duLieu.thoiGianLamBai * 60);
                }
            }
        } catch (loi) {
            console.error("Lỗi parse dữ liệu câu hỏi:", loi);
        }
    }, [duLieu.maBaiTapQuiz, duLieu.duLieuCauHoi, duLieu.maBaiTap]);

    // THÊM EFFECT MỚI NÀY: Liên tục lưu tiến độ vào LocalStorage mỗi khi user chọn đáp án hoặc nộp bài
    useEffect(() => {
        if (danhSachCauHoi.length > 0) {
            const storageKey = `quiz_progress_${duLieu.maBaiTap}`;
            const dataToSave = {
                dapAnNguoiDung,
                daNopBai,
                chiSoHienTai
            };
            localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        }
    }, [dapAnNguoiDung, daNopBai, chiSoHienTai, duLieu.maBaiTap, danhSachCauHoi]);

    // --- EFFECT 2: Chạy đồng hồ đếm ngược ---
    useEffect(() => {
        if (thoiGianConLai !== null && !daNopBai) {
            if (thoiGianConLai <= 0) {
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

    // --- HELPER ---
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

    const xuLyNopBai = async (tuDongNop: boolean = false) => {
        if (!tuDongNop && Object.keys(dapAnNguoiDung).length < tongSoCau) {
            const result = await Swal.fire({
                title: 'Bạn chưa chọn hết đáp án. Vẫn muốn nộp bài?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Nộp',
                cancelButtonText: 'Quay lại'
            });
            if (!result.isConfirmed) return;
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

        if (khiHoanThanh) {
            khiHoanThanh(phanTramDatDuoc, daDat, soCauDung, tongSoCau, danhSachTraLoi);
        }

        Swal.fire({
            icon: daDat ? 'success' : 'error',
            title: tuDongNop ? 'Hết giờ!' : (daDat ? 'Chúc mừng!' : 'Chưa đạt'),
            text: `Kết quả: ${soCauDung}/${tongSoCau} câu đúng (${Math.round(phanTramDatDuoc)}%). Yêu cầu: ${duLieu.diemCanDat}%`,
            confirmButtonText: 'Xem lại bài làm',
            confirmButtonColor: '#f69050',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const lamLaiBai = () => {
        setDapAnNguoiDung({});
        setDaNopBai(false);
        setChiSoHienTai(0);
        
        // Xóa tiến độ cũ trong máy
        localStorage.removeItem(`quiz_progress_${duLieu.maBaiTap}`);

        if (duLieu.thoiGianLamBai) {
            setThoiGianConLai(duLieu.thoiGianLamBai * 60);
        }
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

            {/* BODY CÂU HỎI */}
            <div className="cp-quiz-body">
                <div key={chiSoHienTai} className="anim-enter">
                    <div className="cp-quiz-question">
                        {cauHoiHienTai.NoiDung}
                    </div>

                    <div className="cp-quiz-options">
                        {cauHoiHienTai.LuaChon.map((luaChon, index) => {
                            // Map index (0,1,2,3) thành ký tự (A,B,C,D) để hiển thị cho đẹp
                            
                            return (
                                <div
                                    key={index}
                                    className={`cp-option-card ${layClassDapAn(chiSoHienTai, index, cauHoiHienTai.DapAnDung)}`}
                                    onClick={() => xuLyChonDapAn(index)}
                                >
                                    <div className="cp-option-circle"></div>
                                    <span>{luaChon}</span>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* KHU VỰC HIỂN THỊ GIẢI THÍCH (Chỉ hiện sau khi nộp bài) */}
                    {daNopBai && cauHoiHienTai.GiaiThich && (
                        <div className="cp-quiz-explanation mt-4 p-3 rounded" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e' }}>
                            <strong style={{ color: '#166534', display: 'block', marginBottom: '8px' }}>
                                <i className="fas fa-lightbulb"></i> Giải thích đáp án:
                            </strong>
                            <span style={{ color: '#15803d', fontSize: '0.95rem' }}>
                                {cauHoiHienTai.GiaiThich}
                            </span>
                        </div>
                    )}
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
