import { BaiTapTracNghiem } from '@/pages/hoc-vien/noi-dung-khoa-hoc/components/BaiTapTracNghiem';
import type { BaiKiemTraChungChiDTO, ThongTinChungChiDTO } from '@/pages/hoc-vien/noi-dung-khoa-hoc/NoiDungKhoaHocDTO';

interface TabChungChiProps {
    tenKhoaHoc: string;
    tenHocVien: string;
    baiKiemTraChungChi?: BaiKiemTraChungChiDTO | null;
    thongTinChungChi?: ThongTinChungChiDTO | null;
    daHoanThanhKhoaHoc: boolean;
    dangLamBai: boolean;
    dangNopBai: boolean;
    hoTenHienThi: string;
    emailNhan: string;
    onThayDoiHoTenHienThi: (value: string) => void;
    onThayDoiEmailNhan: (value: string) => void;
    onBatDauThi: () => void;
    onNopBai: (
        diem: number,
        daDat: boolean,
        soCauDung: number,
        tongSoCau: number,
        chiTietTraLoi: { IdCauHoi: number; IndexLuaChon: number }[]
    ) => void;
    onInChungChi: () => void;
}

const dinhDangNgay = (ngay?: string | null) => {
    if (!ngay) return '--';
    const date = new Date(ngay);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleDateString('vi-VN');
};

const xepLoaiDiem = (diem?: number | null): string => {
    if (diem == null) return '--';
    if (diem >= 90) return 'Xuất sắc';
    if (diem >= 80) return 'Giỏi';
    if (diem >= 70) return 'Khá';
    return 'Đạt';
};

export const TabChungChi = ({
    tenKhoaHoc,
    tenHocVien,
    baiKiemTraChungChi,
    thongTinChungChi,
    daHoanThanhKhoaHoc,
    dangLamBai,
    dangNopBai,
    hoTenHienThi,
    emailNhan,
    onThayDoiHoTenHienThi,
    onThayDoiEmailNhan,
    onBatDauThi,
    onNopBai,
    onInChungChi: _onInChungChi
}: TabChungChiProps) => {
    if (!baiKiemTraChungChi) {
        return (
            <div className="cp-certificate-empty">
                <i className="fas fa-award" />
                <h3>Chứng chỉ đang được chuẩn bị</h3>
                <p>Khóa học này chưa được cấu hình bài kiểm tra cuối khóa.</p>
            </div>
        );
    }

    if (dangLamBai) {
        return (
            <div className="cp-certificate-exam">
                <div className="cp-certificate-exam-head">
                    <div>
                        <span className="cp-certificate-kicker">Bài kiểm tra cuối khóa</span>
                        <h3>{baiKiemTraChungChi.tieuDe}</h3>
                        <p>{baiKiemTraChungChi.moTa}</p>
                    </div>
                    <div className="cp-certificate-exam-badges">
                        <span>{baiKiemTraChungChi.soCauHoi} câu</span>
                        <span>{baiKiemTraChungChi.thoiGianLamBai ?? 0} phút</span>
                        <span>Cần {baiKiemTraChungChi.diemCanDat}%</span>
                    </div>
                </div>

                <div className={dangNopBai ? 'cp-certificate-submitting' : ''}>
                    <BaiTapTracNghiem
                        duLieu={{
                            maBaiTapQuiz: baiKiemTraChungChi.maBaiKiemTra,
                            maBaiTap: baiKiemTraChungChi.maBaiKiemTra,
                            thoiGianLamBai: baiKiemTraChungChi.thoiGianLamBai,
                            diemCanDat: baiKiemTraChungChi.diemCanDat,
                            choPhepLamLai: baiKiemTraChungChi.choPhepLamLai,
                            daoCauHoi: baiKiemTraChungChi.daoCauHoi,
                            duLieuCauHoi: baiKiemTraChungChi.duLieuCauHoiJSON
                        }}
                        khiHoanThanh={onNopBai}
                    />
                </div>
            </div>
        );
    }

    const daCapChungChi = thongTinChungChi?.daCap === true;
    const tenNguoiNhan = thongTinChungChi?.hoTenHienThi || thongTinChungChi?.tenHocVien || hoTenHienThi || tenHocVien;

    return (
        <div className="cp-certificate-tab">
            <section className="cp-certificate-hero">
                <div>
                    <span className="cp-certificate-kicker">Chứng chỉ hoàn thành</span>
                    <h3>Nhận chứng chỉ sau khi vượt qua bài kiểm tra cuối khóa</h3>
                    <p>
                        Hoàn thành toàn bộ bài học, làm bài kiểm tra cuối khóa và đạt tối thiểu{' '}
                        <strong>{baiKiemTraChungChi.diemCanDat}%</strong> để mở chứng chỉ.
                    </p>
                </div>

                <div className="cp-certificate-stats">
                    <div className="cp-certificate-stat">
                        <strong>{baiKiemTraChungChi.soCauHoi}</strong>
                        <span>Câu hỏi</span>
                    </div>
                    <div className="cp-certificate-stat">
                        <strong>{baiKiemTraChungChi.thoiGianLamBai ?? 0} phút</strong>
                        <span>Thời gian</span>
                    </div>
                    <div className="cp-certificate-stat">
                        <strong>{thongTinChungChi?.soLanThi ?? 0}</strong>
                        <span>Lần thi</span>
                    </div>
                </div>
            </section>

            <section className="cp-certificate-grid">
                <div className="cp-certificate-panel">
                    <h4>Điều kiện nhận chứng chỉ</h4>
                    <ul className="cp-certificate-checklist">
                        <li className={daHoanThanhKhoaHoc ? 'done' : ''}>
                            <i className={`fas ${daHoanThanhKhoaHoc ? 'fa-check-circle' : 'fa-circle'}`} />
                            Hoàn thành 100% bài học trong khóa.
                        </li>
                        <li className={daCapChungChi || baiKiemTraChungChi.duDieuKienDuThi ? 'done' : ''}>
                            <i className={`fas ${daCapChungChi || baiKiemTraChungChi.duDieuKienDuThi ? 'fa-check-circle' : 'fa-circle'}`} />
                            Làm bài kiểm tra cuối khóa.
                        </li>
                        <li className={daCapChungChi ? 'done' : ''}>
                            <i className={`fas ${daCapChungChi ? 'fa-check-circle' : 'fa-circle'}`} />
                            Đạt tối thiểu {baiKiemTraChungChi.diemCanDat}% số điểm.
                        </li>
                    </ul>

                    {thongTinChungChi?.diemLanGanNhat != null && (
                        <div className={`cp-certificate-last-result ${thongTinChungChi.datLanGanNhat ? 'pass' : 'fail'}`}>
                            <div>
                                <strong>Kết quả gần nhất</strong>
                                <p>
                                    {thongTinChungChi.soCauDungLanGanNhat ?? 0}/{thongTinChungChi.tongSoCauHoi} câu đúng ({Math.round(thongTinChungChi.diemLanGanNhat)}%)
                                </p>
                            </div>
                            <span>{thongTinChungChi.datLanGanNhat ? 'Đạt' : 'Chưa đạt'}</span>
                        </div>
                    )}

                    <div className="cp-certificate-form">
                        <h5>Thông tin phát hành chứng chỉ</h5>
                        <label className="cp-certificate-field">
                            <span>Họ và tên hiển thị</span>
                            <input
                                type="text"
                                value={hoTenHienThi}
                                onChange={(event) => onThayDoiHoTenHienThi(event.target.value)}
                                placeholder="Nhập họ và tên trên chứng chỉ"
                            />
                        </label>
                        <label className="cp-certificate-field">
                            <span>Email nhận chứng chỉ</span>
                            <input
                                type="email"
                                value={emailNhan}
                                onChange={(event) => onThayDoiEmailNhan(event.target.value)}
                                placeholder="Nhập email nhận file PDF"
                            />
                        </label>
                    </div>

                    <button
                        className="cp-certificate-action"
                        disabled={!baiKiemTraChungChi.duDieuKienDuThi || !hoTenHienThi.trim() || !emailNhan.trim()}
                        onClick={onBatDauThi}
                    >
                        <i className="fas fa-file-signature" />
                        {daCapChungChi ? 'Thi lại để cập nhật chứng chỉ' : 'Bắt đầu bài test cuối khóa'}
                    </button>

                    {!baiKiemTraChungChi.duDieuKienDuThi && baiKiemTraChungChi.lyDoChuaDuDieuKien && (
                        <p className="cp-certificate-hint">{baiKiemTraChungChi.lyDoChuaDuDieuKien}</p>
                    )}
                    {baiKiemTraChungChi.duDieuKienDuThi && (!hoTenHienThi.trim() || !emailNhan.trim()) && (
                        <p className="cp-certificate-hint">Vui lòng nhập đủ họ tên và email trước khi bắt đầu bài kiểm tra.</p>
                    )}
                </div>

                <div className="cp-certificate-panel">
                    <h4>Chứng chỉ của bạn</h4>

                    {daCapChungChi ? (
                        <>
                            {/* ── Certificate card ── */}
                            <div className="cp-cert-v2" id="certificate-print-card">
                                {/* Decorative corner ornaments */}
                                <div className="cp-cert-v2__corner tl">✦</div>
                                <div className="cp-cert-v2__corner tr">✦</div>
                                <div className="cp-cert-v2__corner bl">✦</div>
                                <div className="cp-cert-v2__corner br">✦</div>

                                {/* Top border line pair */}
                                <div className="cp-cert-v2__lines" />

                                {/* Logo row */}
                                <div className="cp-cert-v2__brand">
                                    <span style={{ color: '#1A2B4A', fontWeight: 800 }}>Edu</span>
                                    <span style={{ color: '#4A90D9', fontWeight: 800 }}>Code</span>
                                    <span style={{ color: '#F5A623', fontWeight: 800 }}>AI</span>
                                </div>

                                {/* Title */}
                                <h2 className="cp-cert-v2__title">Chứng Chỉ</h2>

                                {/* Gold divider */}
                                <div className="cp-cert-v2__gold-rule" />

                                {/* Sub heading */}
                                <p className="cp-cert-v2__sub">CHỨNG NHẬN TRÂN TRỌNG TRAO ĐẾN</p>

                                {/* Recipient name */}
                                <h3 className="cp-cert-v2__name">{tenNguoiNhan}</h3>

                                {/* Course label */}
                                <p className="cp-cert-v2__course-label">Khóa học</p>
                                <p className="cp-cert-v2__course-name">
                                    {thongTinChungChi?.tenKhoaHoc || tenKhoaHoc}
                                </p>

                                {/* Bottom row: date | gold seal | signature */}
                                <div className="cp-cert-v2__bottom">
                                    {/* Date */}
                                    <div className="cp-cert-v2__date-col">
                                        <span className="cp-cert-v2__date-val">{dinhDangNgay(thongTinChungChi?.ngayCap)}</span>
                                        <div className="cp-cert-v2__date-line" />
                                        <span className="cp-cert-v2__date-label">NGÀY CẤP</span>
                                    </div>

                                    {/* Gold seal */}
                                    <div className="cp-cert-v2__seal">
                                        <div className="cp-cert-v2__seal-outer">
                                            <div className="cp-cert-v2__seal-inner">
                                                <span className="cp-cert-v2__seal-grade">{xepLoaiDiem(thongTinChungChi?.diemLanGanNhat)}</span>
                                                <span className="cp-cert-v2__seal-sub">XẾP LOẠI</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signature */}
                                    <div className="cp-cert-v2__sig-col">
                                        <svg width="110" height="32" viewBox="0 0 110 32" fill="none">
                                            <path d="M6 24 C12 8,20 4,28 16 C34 24,38 6,48 10 C56 13,58 22,66 18 C74 14,78 6,88 12 C96 16,102 20,108 14"
                                                stroke="#8B6914" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M28 20 C32 26,36 28,42 24" stroke="#8B6914" strokeWidth="1.2" strokeLinecap="round"/>
                                        </svg>
                                        <div className="cp-cert-v2__sig-line" />
                                        <span className="cp-cert-v2__sig-label">CHỮ KÝ XÁC NHẬN</span>
                                    </div>
                                </div>

                                {/* Bottom border line pair */}
                                <div className="cp-cert-v2__lines" />
                            </div>

                            <div className="cp-certificate-email-status">
                                <div>
                                    <strong>Email nhận chứng chỉ</strong>
                                    <p>{thongTinChungChi?.emailNhan || emailNhan || '--'}</p>
                                </div>
                                <span className={thongTinChungChi?.daGuiEmail ? 'sent' : 'pending'}>
                                    {thongTinChungChi?.daGuiEmail ? '✅ Đã gửi PDF' : '⏳ Đang chuẩn bị gửi PDF...'}
                                </span>
                            </div>

                            {thongTinChungChi?.ngayGuiEmail && (
                                <p className="cp-certificate-hint">PDF đã được gửi lúc {dinhDangNgay(thongTinChungChi.ngayGuiEmail)}.</p>
                            )}

                            {/* Nút hành động chứng chỉ */}
                            <div className="cp-certificate-actions-row">
                                <button className="cp-certificate-action secondary" onClick={_onInChungChi}>
                                    <i className="fas fa-download" /> Tải / In chứng chỉ
                                </button>

                                {thongTinChungChi?.maChungChi && (
                                    <button
                                        className="cp-certificate-action ghost"
                                        onClick={() => {
                                            navigator.clipboard.writeText(thongTinChungChi.maChungChi || '');
                                            const btn = document.activeElement as HTMLButtonElement;
                                            const orig = btn.innerHTML;
                                            btn.innerHTML = '<i class="fas fa-check"></i> Đã sao chép!';
                                            setTimeout(() => { btn.innerHTML = orig; }, 2000);
                                        }}
                                    >
                                        <i className="fas fa-copy" /> Sao chép mã CC
                                    </button>
                                )}

                                <a
                                    className="cp-certificate-action linkedin"
                                    href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(thongTinChungChi?.tenKhoaHoc || tenKhoaHoc)}&organizationName=EducodeAI&issueYear=${new Date(thongTinChungChi?.ngayCap || Date.now()).getFullYear()}&certUrl=${encodeURIComponent(window.location.href)}&certId=${encodeURIComponent(thongTinChungChi?.maChungChi || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className="fab fa-linkedin" /> Chia sẻ LinkedIn
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="cp-certificate-placeholder">
                            <i className="fas fa-scroll" />
                            <h5>Chưa có chứng chỉ</h5>
                            <p>Vượt qua bài test cuối khóa để hệ thống tạo chứng chỉ và gửi file PDF về email của bạn.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
