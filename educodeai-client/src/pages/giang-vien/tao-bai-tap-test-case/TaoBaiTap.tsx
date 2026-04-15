import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { BaiTapService } from '@/services/bai-tap.service';
import type { DanhSachBaiTapDTO } from '@/pages/giang-vien/tao-bai-tap-test-case/BaiTap';
import './QuanLyBaiTap.css';
import { BaiTapThucHanhService } from '@/services/bai-tap-thuc-hanh.service';
import QuizDetailView from './QuizDetailView';
import { Suspense, lazy } from 'react';

const PreviewBaiTapAI = lazy(() => import('../bai-tap-thuc-hanh/PreviewBaiTapAI'));

const QuanLyBaiTapContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [chiTietQuiz, setChiTietQuiz] = useState<any>(null);

    const [danhSachBaiTap, setDanhSachBaiTap] = useState<DanhSachBaiTapDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDanhSach = async () => {
            try {
                setIsLoading(true);

                const data = await BaiTapService.getDanhSachByGiangVien();
                setDanhSachBaiTap(data);
            } catch (error) {
                console.error("Úi dồi ôi lỗi kéo data Bài Tập:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDanhSach();
    }, []);

    const handleDeleteClick = async (maBaiTap: number, tenBaiTap: string) => {
        Swal.fire({
            title: `bạn có chắc muốn xoá bài tập "${tenBaiTap}" không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then(async result => {
            if (result.isConfirmed) {
                try {
                    // Gọi API chém xuống Backend
                    const response = await BaiTapService.deleteBaiTap(maBaiTap);

                    // Giả sử BE của ông trả về cục { success: true, message: "..." }
                    // Nếu BE chỉ trả status 200/204 không có body thì chỉ cần check try catch là đủ nha!
                    if (response.success !== false) {
                        Swal.fire({ icon: 'success', text: `Đã tiễn ẻm bay màu thành công!` });

                        setDanhSachBaiTap(prevList => prevList.filter(bt => bt.maBaiTap !== maBaiTap));
                    } else {
                        Swal.fire({ icon: 'error', text: "Úi, có lỗi cản địa: " + response.message });
                    }
                } catch (error: any) {
                    console.error("Lỗi sập nguồn khi xóa:", error);
                    Swal.fire({ icon: 'error', text: "Server đang hờn dỗi, giấu không cho xóa rồi sếp ơi!" });
                }
            }
        });
    };

    const handleViewClick = async (maBaiTap: number) => {
        setIsModalOpen(true);
        setIsLoadingDetails(true);

        // Lấy loại bài tập từ danh sách hiện có
        const baiTap = danhSachBaiTap.find(b => b.maBaiTap === maBaiTap);
        if (!baiTap) return;

        try {
            let response;
            if (baiTap.loaiBaiTap === 'IDE') {
                response = await BaiTapThucHanhService.getChiTiet(maBaiTap);
                setChiTietQuiz({ ...response.data, loaiBaiTap: 'IDE' });
            } else {
                response = await BaiTapService.getChiTietBaiTap(maBaiTap);

                // Xử lý Quiz questions
                let danhSachCauHoi = [];
                const rawData = response.data?.duLieuCauHoiJSON || response.duLieuCauHoiJSON || response.data?.danhSachCauHoi || '[]';

                if (typeof rawData === 'string') {
                    danhSachCauHoi = JSON.parse(rawData);
                } else if (Array.isArray(rawData)) {
                    danhSachCauHoi = rawData;
                }

                setChiTietQuiz({ ...response.data, danhSachCauHoi, loaiBaiTap: 'Quiz' });
            }
        } catch (error) {
            console.error("Lỗi lấy chi tiết:", error);
            Swal.fire({ icon: 'error', text: "Lỗi kéo chi tiết bài tập rồi sếp ơi!" });
            setIsModalOpen(false);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setChiTietQuiz(null);
    };

    return (
        <div className="main-content" style={{ padding: '40px 48px', animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div className="tabs">
                <a href="/giang-vien/quiz" className="tab active text-decoration-none">+ Tạo Quiz</a>
                {/* <button className="tab">+ Tạo Bài Thực Hành</button> */}
            </div>
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tên BT</th>
                                <th>Loại</th>
                                <th>Khóa học</th>
                                <th>Chương</th>
                                <th>Bài học</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#0066FF', fontWeight: 600 }}>
                                        <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '8px' }}></i>
                                        Đang thỉnh data từ server về...
                                    </td>
                                </tr>
                            ) : danhSachBaiTap.length === 0 ? (
                                <tr className="empty-row">
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                                        Chưa có bài tập nào, tạo mới ngay đi sếp ơi!
                                    </td>
                                </tr>
                            ) : (
                                danhSachBaiTap.map((baiTap) => (
                                    <tr key={baiTap.maBaiTap}>
                                        {/* Cột Tên Bài Tập */}
                                        <td>
                                            <div className="truncate-text col-ten" title={baiTap.tenBaiTap}>
                                                <strong>{baiTap.tenBaiTap}</strong>
                                            </div>
                                        </td>

                                        {/* Cột Loại */}
                                        <td>{baiTap.loaiBaiTap}</td>

                                        {/* Cột Khóa Học */}
                                        <td>
                                            <div className="truncate-text col-khoahoc" title={baiTap.tenKhoaHoc}>
                                                {baiTap.tenKhoaHoc}
                                            </div>
                                        </td>

                                        {/* Cột Chương */}
                                        <td>
                                            <div className="truncate-text col-chuong" title={baiTap.tenChuong}>
                                                {baiTap.tenChuong}
                                            </div>
                                        </td>

                                        {/* Cột Bài Học */}
                                        <td>
                                            <div className="truncate-text col-ten" title={baiTap.tenBaiHoc}>
                                                {baiTap.tenBaiHoc}
                                            </div>
                                        </td>

                                        {/* Cột Trạng Thái */}
                                        <td>
                                            <span className={`badge ${baiTap.trangThai === 'Draft' ? 'badge-draft' : 'badge-published'}`}>
                                                {baiTap.trangThai}
                                            </span>
                                        </td>

                                        {/* Cột Hành Động */}
                                        <td>
                                            <div className="actions-group">
                                                <button className="action-btn view-btn" onClick={() => handleViewClick(baiTap.maBaiTap)}>
                                                    <i className="bi bi-eye"></i> Xem
                                                </button>
                                                <button className="action-btn delete-btn"
                                                    onClick={() => handleDeleteClick(baiTap.maBaiTap, baiTap.tenBaiTap)}
                                                >
                                                    <i className="bi bi-trash"></i> Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <div className="quiz-modal-overlay" onClick={closeModal}>
                    <div className="quiz-modal-content" onClick={(e) => e.stopPropagation()}>

                        <div className="quiz-modal-header d-flex justify-content-between align-items-center" style={{ padding: '20px 24px', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                                    <i className="bi bi-file-earmark-text text-primary fs-5" />
                                </div>
                                <h3 className="m-0" style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
                                    {chiTietQuiz?.loaiBaiTap === 'IDE' ? 'Chi tiết Bài tập Thực hành' : 'Chi tiết Bài tập Quiz'}
                                </h3>
                            </div>
                            <button className="btn-close-modal" onClick={closeModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><i className="bi bi-x-lg" /></button>
                        </div>

                        <div className="quiz-modal-body" style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
                            {isLoadingDetails ? (
                                <div style={{ textAlign: 'center', padding: '60px' }}>
                                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                                    <p className="mt-4 fw-bold text-muted">Đang thỉnh dữ liệu chi tiết...</p>
                                </div>
                            ) : chiTietQuiz?.loaiBaiTap === 'IDE' ? (
                                <Suspense fallback={<div className="p-5 text-center">Đang tải trình biên dịch...</div>}>
                                    <PreviewBaiTapAI
                                        data={chiTietQuiz}
                                        editable={false}
                                        onSave={() => { }}
                                        onCancel={() => setIsModalOpen(false)}
                                    />
                                </Suspense>
                            ) : (
                                <QuizDetailView data={chiTietQuiz} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuanLyBaiTapContent;
