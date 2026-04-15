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
    onBatDauThi,
    onNopBai,
    onInChungChi
}: TabChungChiProps) => {
    if (!baiKiemTraChungChi) {
        return (
            <div className="cp-certificate-empty">
                <i className="fas fa-award" />
                <h3>Chứng chỉ đang được chuẩn bị</h3>
                <p>Khóa học này chưa cấu hình bài kiểm tra cuối khóa.</p>
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

    return (
        <div className="cp-certificate-tab">
            <section className="cp-certificate-hero">
                <div>
                    <span className="cp-certificate-kicker">Chứng chỉ hoàn thành</span>
                    <h3>Nhận chứng chỉ sau khi vượt qua bài test cuối khóa</h3>
                    <p>
                        Hoàn thành toàn bộ bài học, làm bài kiểm tra cuối khóa và đạt tối thiểu
                        {' '}
                        <strong>{baiKiemTraChungChi.diemCanDat}%</strong>
                        {' '}
                        để mở chứng chỉ.
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
                            Làm bài test cuối khóa.
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
                                    {thongTinChungChi.soCauDungLanGanNhat ?? 0}/{thongTinChungChi.tongSoCauHoi} câu đúng
                                    {' '}
                                    ({Math.round(thongTinChungChi.diemLanGanNhat)}%)
                                </p>
                            </div>
                            <span>{thongTinChungChi.datLanGanNhat ? 'Đạt' : 'Chưa đạt'}</span>
                        </div>
                    )}

                    <button
                        className="cp-certificate-action"
                        disabled={!baiKiemTraChungChi.duDieuKienDuThi}
                        onClick={onBatDauThi}
                    >
                        <i className="fas fa-file-signature" />
                        {daCapChungChi ? 'Thi lại để cải thiện' : 'Bắt đầu bài test cuối khóa'}
                    </button>

                    {!baiKiemTraChungChi.duDieuKienDuThi && baiKiemTraChungChi.lyDoChuaDuDieuKien && (
                        <p className="cp-certificate-hint">{baiKiemTraChungChi.lyDoChuaDuDieuKien}</p>
                    )}
                </div>

                <div className="cp-certificate-panel">
                    <h4>Chứng chỉ của bạn</h4>

                    {daCapChungChi ? (
                        <>
                            <div className="cp-certificate-card" id="certificate-print-card">
                                <span className="cp-certificate-brand">EduCodeAI</span>
                                <h3>CHỨNG NHẬN HOÀN THÀNH</h3>
                                <p className="cp-certificate-card-subtitle">Chứng nhận học viên đã hoàn thành khóa học</p>
                                <strong>{thongTinChungChi?.tenHocVien || tenHocVien}</strong>
                                <p className="cp-certificate-course-name">{thongTinChungChi?.tenKhoaHoc || tenKhoaHoc}</p>
                                <div className="cp-certificate-meta">
                                    <span>Mã chứng chỉ: {thongTinChungChi?.maChungChi}</span>
                                    <span>Ngày cấp: {dinhDangNgay(thongTinChungChi?.ngayCap)}</span>
                                </div>
                            </div>

                            <button className="cp-certificate-action secondary" onClick={onInChungChi}>
                                <i className="fas fa-print" /> In chứng chỉ
                            </button>
                        </>
                    ) : (
                        <div className="cp-certificate-placeholder">
                            <i className="fas fa-scroll" />
                            <h5>Chưa có chứng chỉ</h5>
                            <p>Vượt qua bài test cuối khóa để mở khóa chứng chỉ hoàn thành của bạn.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
