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
    onInChungChi
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
                            {/* ── Google-Cloud-style certificate card ── */}
                            <div className="cp-cert-frame" id="certificate-print-card">
                                {/* outer navy border → inner accent border handled by CSS */}
                                <div className="cp-cert-inner">

                                    {/* Brand */}
                                    <div className="cp-cert-brand-row">
                                        <span className="cp-cert-brand">
                                            <span style={{ color: '#1A2B4A' }}>Edu</span>
                                            <span style={{ color: '#4A90D9' }}>Code</span>
                                            <span style={{ color: '#F5A623' }}>AI</span>
                                        </span>
                                        <span className="cp-cert-label">CERTIFICATE OF COMPLETION</span>
                                    </div>

                                    <div className="cp-cert-divider gold" />

                                    {/* Certify phrase */}
                                    <p className="cp-cert-phrase">This is to certify that</p>

                                    {/* Learner name */}
                                    <h2 className="cp-cert-name">{tenNguoiNhan}</h2>
                                    <div className="cp-cert-name-underline" />

                                    <p className="cp-cert-phrase" style={{ marginTop: '14px' }}>
                                        has successfully completed the course
                                    </p>

                                    {/* Course name */}
                                    <h3 className="cp-cert-course">
                                        {thongTinChungChi?.tenKhoaHoc || tenKhoaHoc}
                                    </h3>

                                    <div className="cp-cert-divider gold" style={{ marginTop: '18px' }} />

                                    {/* Bottom row */}
                                    <div className="cp-cert-bottom">
                                        {/* Meta info */}
                                        <div className="cp-cert-meta">
                                            <div className="cp-cert-meta-row">
                                                <span className="cp-cert-meta-key">Certificate ID</span>
                                                <span className="cp-cert-meta-val">{thongTinChungChi?.maChungChi}</span>
                                            </div>
                                            <div className="cp-cert-meta-row">
                                                <span className="cp-cert-meta-key">Issue Date</span>
                                                <span className="cp-cert-meta-val">{dinhDangNgay(thongTinChungChi?.ngayCap)}</span>
                                            </div>
                                            <div className="cp-cert-meta-row">
                                                <span className="cp-cert-meta-key">Certified As</span>
                                                <span className="cp-cert-meta-val">{tenNguoiNhan}</span>
                                            </div>
                                        </div>

                                        {/* Score badge */}
                                        <div className="cp-cert-badge">
                                            <span className="cp-cert-badge-label">SCORE</span>
                                            <span className="cp-cert-badge-score">
                                                {thongTinChungChi?.diemLanGanNhat != null
                                                    ? `${Math.round(thongTinChungChi.diemLanGanNhat)}%`
                                                    : '--'}
                                            </span>
                                            <div className="cp-cert-badge-divider" />
                                            <span className="cp-cert-badge-sub">FINAL EXAM</span>
                                        </div>

                                        {/* Signature */}
                                        <div className="cp-cert-sig">
                                            <div className="cp-cert-sig-line" />
                                            <span className="cp-cert-sig-name">EduCodeAI Board</span>
                                            <span className="cp-cert-sig-role">Authorized Signature</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="cp-certificate-email-status">
                                <div>
                                    <strong>Email nhận chứng chỉ</strong>
                                    <p>{thongTinChungChi?.emailNhan || emailNhan || '--'}</p>
                                </div>
                                <span className={thongTinChungChi?.daGuiEmail ? 'sent' : 'pending'}>
                                    {thongTinChungChi?.daGuiEmail ? 'Đã gửi PDF' : 'Chưa gửi được email'}
                                </span>
                            </div>

                            {thongTinChungChi?.ngayGuiEmail && (
                                <p className="cp-certificate-hint">PDF đã được gửi lúc {dinhDangNgay(thongTinChungChi.ngayGuiEmail)}.</p>
                            )}

                            <button className="cp-certificate-action secondary" onClick={onInChungChi}>
                                <i className="fas fa-download" /> Tải / In chứng chỉ
                            </button>
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
