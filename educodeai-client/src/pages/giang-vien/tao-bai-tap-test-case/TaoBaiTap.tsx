import { useState, useEffect } from 'react';
import { BaiTapService } from '@/services/bai-tap.service';
import type { DanhSachBaiTapDTO } from '@/pages/giang-vien/tao-bai-tap-test-case/BaiTap';
import './QuanLyBaiTap.css';

const QuanLyBaiTapContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [chiTietQuiz, setChiTietQuiz] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
      
        const isConfirm = window.confirm(`bạn có chắc muốn xoá bài tập "${tenBaiTap}" không?`);
        
        if (isConfirm) {
            try {
                // Gọi API chém xuống Backend
                const response = await BaiTapService.deleteBaiTap(maBaiTap);
                
                // Giả sử BE của ông trả về cục { success: true, message: "..." }
                // Nếu BE chỉ trả status 200/204 không có body thì chỉ cần check try catch là đủ nha!
                if (response.success !== false) { 
                    alert(`Đã tiễn ẻm bay màu thành công!`);
                    
                    setDanhSachBaiTap(prevList => prevList.filter(bt => bt.maBaiTap !== maBaiTap));
                } else {
                    alert("Úi, có lỗi cản địa: " + response.message);
                }
            } catch (error: any) {
                console.error("Lỗi sập nguồn khi xóa:", error);
                alert("Server đang hờn dỗi, giấu không cho xóa rồi sếp ơi!");
            }
        }
    };

    const handleViewClick = async (maBaiTap: number) => {
        setIsModalOpen(true);
        setIsLoadingDetails(true);
        setCurrentQuestionIndex(0); // Mở lên thì luôn bắt đầu từ câu 1
        
        try {
            const response = await BaiTapService.getChiTietBaiTap(maBaiTap);
            // Giả sử Backend trả về một object có chứa "duLieuCauHoiJSON" (dạng string) 
            // Cần parse nó ra thành mảng Object. (Ông check lại tên biến BE nha)
            let danhSachCauHoi = [];
            
            // Xử lý an toàn: Nếu nó là chuỗi thì parse, nếu nó là mảng sẵn thì lụm luôn
            const rawData = response.data?.duLieuCauHoiJSON || response.duLieuCauHoiJSON || response.data?.danhSachCauHoi || '[]';
            
            if (typeof rawData === 'string') {
                danhSachCauHoi = JSON.parse(rawData);
            } else if (Array.isArray(rawData)) {
                danhSachCauHoi = rawData;
            }

            setChiTietQuiz({ ...response.data, danhSachCauHoi });
        } catch (error) {
            console.error("Lỗi lấy chi tiết:", error);
            alert("Lỗi kéo chi tiết bài tập rồi sếp ơi!");
            setIsModalOpen(false);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setChiTietQuiz(null);
    };

    // Hàm tiện ích để lướt câu hỏi trong Modal
    const nextQuestion = () => {
        if (chiTietQuiz && currentQuestionIndex < chiTietQuiz.danhSachCauHoi.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
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
                        
                        <div className="quiz-modal-header">
                            <h3>Chi tiết bài tập</h3>
                            <button className="btn-close-modal" onClick={closeModal}>×</button>
                        </div>

                        <div className="quiz-modal-body">
                            {/* ... (Toàn bộ phần logic if-else isLoadingDetails, currentQ... giữ nguyên y chang nha sếp) ... */}
                            
                            {/* Copy lại cho ông đỡ rối phần ruột nè */}
                            {isLoadingDetails ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite', fontSize: '24px', color: '#0066FF' }}></i>
                                    <p style={{ marginTop: '12px', fontWeight: 600 }}>Đang mở khóa dữ liệu...</p>
                                </div>
                            ) : !chiTietQuiz?.danhSachCauHoi || chiTietQuiz.danhSachCauHoi.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                                    Bài tập này chưa có câu hỏi nào hoặc dữ liệu bị lỗi! 🥺
                                </div>
                            ) : (
                                (() => {
                                    const currentQ = chiTietQuiz.danhSachCauHoi[currentQuestionIndex];
                                    return (
                                        <div className="quiz-preview-wrapper">
                                            <div className="q-header">
                                                <div className="q-number">Câu {currentQuestionIndex + 1} / {chiTietQuiz.danhSachCauHoi.length}</div>
                                            </div>
                                            <div className="q-text">{currentQ.cauHoi}</div>
                                            <div className="q-options">
                                                {['A', 'B', 'C', 'D'].map(opt => (
                                                    <div key={opt} className="q-opt-item">
                                                        <div className="q-opt-label" style={{ background: currentQ.dapAnDung === opt ? '#E8EEFF' : '' }}>{opt}</div>
                                                        <div className="q-opt-text" style={{ fontWeight: currentQ.dapAnDung === opt ? 700 : 500 }}>
                                                            {currentQ[`dapAn${opt}`]}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="q-answer-box">
                                                <div className="q-ans-label">Đáp án đúng & Giải thích:</div>
                                                <div className="q-ans-value">✅ {currentQ.dapAnDung}</div>
                                                <div className="q-ans-explain">💡 {currentQ.giaiThich}</div>
                                            </div>
                                        </div>
                                    );
                                })()
                            )}
                        </div>

                        {chiTietQuiz?.danhSachCauHoi && chiTietQuiz.danhSachCauHoi.length > 0 && (
                            <div className="quiz-modal-footer">
                                <button className="btn-modal-nav" onClick={prevQuestion} disabled={currentQuestionIndex === 0}>
                                    ← Câu trước
                                </button>
                                <button className="btn-modal-nav btn-modal-next" onClick={nextQuestion} disabled={currentQuestionIndex === chiTietQuiz.danhSachCauHoi.length - 1}>
                                    Câu tiếp →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuanLyBaiTapContent;