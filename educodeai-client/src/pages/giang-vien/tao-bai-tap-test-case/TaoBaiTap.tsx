import { useState, useEffect } from 'react';
import { BaiTapService } from '@/services/bai-tap.service';
import type { DanhSachBaiTapDTO } from '@/pages/giang-vien/tao-bai-tap-test-case/BaiTap';
import './QuanLyBaiTap.css';

const QuanLyBaiTapContent = () => {
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

    return (
        <div className="main-content" style={{ padding: '40px 48px', animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div className="tabs">
                <a href="/giang-vien/quiz" className="tab active text-decoration-none">+ Tạo Quiz</a>
                <button className="tab">+ Tạo Bài Thực Hành</button>
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
                                                <button className="action-btn edit-btn">
                                                    <i className="bi bi-pencil-square"></i> Sửa
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
        </div>
    );
};

export default QuanLyBaiTapContent;