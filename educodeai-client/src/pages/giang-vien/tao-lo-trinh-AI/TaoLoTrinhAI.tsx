import { useState, useEffect } from 'react';
import './QuanLyLoTrinh.css';

interface KhoaHocCon {
    id: number;
    ten: string;
    trangThai: string;
}

interface LoTrinhAI {
    maLoTrinh: number;
    yeuCau: string;
    trangThai: string;
    ngayTao: string;
    noiDungJSON: string;
}

const QuanLyLoTrinh = () => {
    const [danhSach, setDanhSach] = useState<LoTrinhAI[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // State phân biệt đang "Thêm mới" hay "Chỉnh sửa"
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<LoTrinhAI> | null>(null);
    const [tempCourses, setTempCourses] = useState<KhoaHocCon[]>([]);

    const fetchDanhSach = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('user_token');
            const response = await fetch('https://localhost:7284/api/giangvien/quan-ly-lo-trinh/danh-sach', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                // Sắp xếp ID tăng dần từ thấp đến cao
                const sorted = result.data.sort((a: any, b: any) => a.maLoTrinh - b.maLoTrinh);
                setDanhSach(sorted);
            }
        } catch (error) { console.error(error); } 
        finally { setTimeout(() => setIsLoading(false), 500); }
    };

    // --- MỞ MODAL THÊM MỚI ---
    const handleAddClick = () => {
        setIsEditMode(false);
        setEditingItem({ yeuCau: '', trangThai: 'Hoạt động' });
        setTempCourses([]); // Khởi tạo danh sách khóa học con trống
        setIsModalOpen(true);
    };

    // --- MỞ MODAL SỬA ---
    const handleEditClick = (item: LoTrinhAI) => {
        setIsEditMode(true);
        setEditingItem({ ...item });
        try {
            setTempCourses(JSON.parse(item.noiDungJSON || "[]"));
        } catch (e) { setTempCourses([]); }
        setIsModalOpen(true);
    };

    // --- XỬ LÝ LƯU (CẢ THÊM VÀ SỬA) ---
    const handleSave = async () => {
        if (!editingItem?.yeuCau) return alert("Vui lòng nhập yêu cầu lộ trình!");
        
        try {
            const token = localStorage.getItem('user_token');
            const finalJSON = JSON.stringify(tempCourses);
            
            // Tự động chuyển đổi Method và URL tùy theo chế độ Thêm/Sửa
            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode 
                ? `https://localhost:7284/api/giangvien/quan-ly-lo-trinh/cap-nhat/${editingItem.maLoTrinh}`
                : `https://localhost:7284/api/giangvien/quan-ly-lo-trinh/them-moi`;

            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    YeuCau: editingItem.yeuCau,
                    TrangThai: editingItem.trangThai || 'Hoạt động',
                    NoiDungJSON: finalJSON
                })
            });

            if (response.ok) {
                alert(isEditMode ? "Cập nhật thành công!" : "Đã tạo lộ trình mới thành công!");
                setIsModalOpen(false);
                fetchDanhSach();
            }
        } catch (error) { alert("Lỗi kết nối server!"); }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Xác nhận xóa lộ trình #${id}?`)) return;
        try {
            const token = localStorage.getItem('user_token');
            const response = await fetch(`https://localhost:7284/api/giangvien/quan-ly-lo-trinh/xoa/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                alert("Xóa thành công!");
                setDanhSach(prev => prev.filter(item => item.maLoTrinh !== id));
            }
        } catch (error) { alert("Lỗi khi xóa!"); }
    };

    // Quản lý danh sách khóa học trong Modal
    const handleCourseChange = (idx: number, field: keyof KhoaHocCon, value: string) => {
        setTempCourses(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
    };
    const addCourse = () => setTempCourses([...tempCourses, { id: Date.now(), ten: '', trangThai: 'Chưa học' }]);
    const removeCourse = (idx: number) => setTempCourses(tempCourses.filter((_, i) => i !== idx));

    useEffect(() => { fetchDanhSach(); }, []);

    return (
        <div className="quan-ly-container">
            {/* GIỮ NGUYÊN LAYOUT HEADER - THÊM NÚT MỚI */}
            <div className="quan-ly-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Lộ trình AI của tôi</h1>
                    <p style={{ color: '#64748b' }}>Quản lý các yêu cầu lộ trình đã tạo</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={fetchDanhSach} className="btn-refresh">LÀM MỚI DỮ LIỆU</button>
                    {/* NÚT THÊM MỚI SẾP CẦN */}
                    <button onClick={handleAddClick} className="btn-save" style={{ background: '#2563eb', color: 'white' }}>
                        + THÊM MỚI
                    </button>
                </div>
            </div>

            <div className="lo-trinh-grid">
                {danhSach.map((item) => {
                    let cacKhoaHoc = [];
                    try { cacKhoaHoc = JSON.parse(item.noiDungJSON || "[]"); } catch (e) { cacKhoaHoc = []; }

                    return (
                        <div key={item.maLoTrinh} className="lo-trinh-card">
                            <div className="card-content">
                                <span className="badge badge-active">● {(item.trangThai || "CHỜ XỬ LÝ").toUpperCase()}</span>
                                <h3 className="card-title" style={{ marginTop: '15px', fontWeight: 800 }}>{item.yeuCau}</h3>

                                <div className="roadmap-preview" style={{ marginTop: '15px', padding: '12px', background: '#f1f5f9', borderRadius: '10px' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>CÁC CHẶNG HỌC TẬP:</p>
                                    {cacKhoaHoc.length > 0 ? cacKhoaHoc.map((kh: any, idx: number) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', fontSize: '0.9rem' }}>
                                            <span style={{ width: '20px', height: '20px', background: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>{idx + 1}</span>
                                            <span style={{ flex: 1, fontWeight: 500 }}>{kh.ten}</span>
                                            <span style={{ fontSize: '0.7rem', color: kh.trangThai === 'Bắt buộc' ? '#f90101' : '#f59e0b', fontWeight: 'bold' }}>{kh.trangThai}</span>
                                        </div>
                                    )) : <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có khóa học nào.</span>}
                                </div>

                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '15px' }}>Ngày tạo: {item.ngayTao ? new Date(item.ngayTao).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            </div>

                            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' }}>
                                <span style={{ fontWeight: 800 }}>ID: #{item.maLoTrinh}</span>
                                <div className="btn-group">
                                    <button onClick={() => handleEditClick(item)} className="btn-edit">Sửa</button>
                                    <button onClick={() => handleDelete(item.maLoTrinh)} className="btn-delete">Xóa</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL ĐA NĂNG: SỬ DỤNG CHO CẢ THÊM MỚI VÀ SỬA */}
            {isModalOpen && editingItem && (
                <div className="modal-overlay">
                    <div className="modal-content pro-modal" style={{ width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2>{isEditMode ? 'Sửa Lộ Trình AI' : 'Thêm Lộ Trình Mới'}</h2>
                        <div className="form-group">
                            <label>Yêu cầu lộ trình:</label>
                            <input 
                                type="text" 
                                className="form-input"
                                value={editingItem.yeuCau} 
                                onChange={(e) => setEditingItem({...editingItem, yeuCau: e.target.value})} 
                                placeholder="Nhập tiêu đề lộ trình..."
                            />
                        </div>

                        <div className="roadmap-manager" style={{ marginTop: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3>Các khóa học trong lộ trình</h3>
                                <button onClick={addCourse} className="btn-add-course">+ Thêm bước</button>
                            </div>
                            <div className="course-form-list" style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                                {tempCourses.map((course, idx) => (
                                    <div key={idx} className="course-form-item" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', background: 'white', padding: '10px', borderRadius: '8px' }}>
                                        <div className="pro-step-num">{idx + 1}</div>
                                        <input 
                                            style={{ flex: 2, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                            value={course.ten} 
                                            onChange={(e) => handleCourseChange(idx, 'ten', e.target.value)} 
                                            placeholder="Tên khóa học con"
                                        />
                                        <select 
    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
    value={course.trangThai}
    onChange={(e) => handleCourseChange(idx, 'trangThai', e.target.value)}
>
    <option value="Bắt buộc">Bắt buộc</option>
    <option value="Tự chọn">Tự chọn (Có thể bỏ qua)</option>
    <option value="Nâng cao">Kiến thức nâng cao</option>
</select>
                                        <button onClick={() => removeCourse(idx)} className="btn-remove-course">X</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setIsModalOpen(false)} className="btn-cancel">Hủy</button>
                            <button onClick={handleSave} className="btn-save">Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuanLyLoTrinh;