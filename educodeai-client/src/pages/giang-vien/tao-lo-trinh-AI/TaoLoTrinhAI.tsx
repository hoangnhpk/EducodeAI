import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './QuanLyLoTrinh.css';

interface IKhoaHocGoc {
    maKhoaHoc: number;
    tenKhoaHoc: string;
    hinhAnh: string;
}

interface KhoaHocCon {
    maKhoaHoc: number;
    ten: string;
    hinhAnh: string;
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
    const [khoaHocCoSan, setKhoaHocCoSan] = useState<IKhoaHocGoc[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                setDanhSach(result.data.sort((a: any, b: any) => a.maLoTrinh - b.maLoTrinh));
            }
        } catch (error) { console.error(error); }
        finally { setTimeout(() => setIsLoading(false), 300); }
    };

    const fetchKhoaHocCoSan = async () => {
        try {
            const token = localStorage.getItem('user_token');
            const response = await fetch('https://localhost:7284/api/giangvien/quan-ly-lo-trinh/danh-sach-khoa-hoc-co-san', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) setKhoaHocCoSan(result.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchDanhSach(); fetchKhoaHocCoSan(); }, []);

    const notify = (title: string, icon: 'success' | 'error' | 'warning') => {
        Swal.fire({
            title: title,
            icon: icon,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            timerProgressBar: true
        });
    };

    // HÀM XÓA NGUYÊN LỘ TRÌNH LỚN
    const handleDeleteMain = (id: number) => {
        Swal.fire({
            title: 'Xóa toàn bộ lộ trình?',
            text: `Hành động này sẽ xóa vĩnh viễn lộ trình #${id}!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Đồng ý xóa',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('user_token');
                    const res = await fetch(`https://localhost:7284/api/giangvien/quan-ly-lo-trinh/xoa/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        notify("Đã xóa lộ trình thành công!", "success");
                        fetchDanhSach();
                    }
                } catch (error) { notify("Lỗi khi xóa lộ trình!", "error"); }
            }
        });
    };

    const handleSave = async () => {
        if (!editingItem?.yeuCau) return notify("Vui lòng nhập tên lộ trình!", "warning");

        try {
            const token = localStorage.getItem('user_token');
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
                    NoiDungJSON: JSON.stringify(tempCourses)
                })
            });

            if (response.ok) {
                notify(isEditMode ? "Cập nhật thành công!" : "Đã tạo lộ trình mới!", "success");
                setIsModalOpen(false);
                fetchDanhSach();
            }
        } catch (error) { notify("Lỗi kết nối server!", "error"); }
    };

    const addCourse = () => {
        if (khoaHocCoSan.length === 0) return;
        const firstKH = khoaHocCoSan[0];
        setTempCourses([...tempCourses, {
            maKhoaHoc: firstKH.maKhoaHoc, ten: firstKH.tenKhoaHoc, hinhAnh: firstKH.hinhAnh, trangThai: 'Bắt buộc'
        }]);
    };

    const handleCourseSelect = (idx: number, maKH: number) => {
        const skh = khoaHocCoSan.find(k => k.maKhoaHoc === maKH);
        if (skh) setTempCourses(prev => prev.map((c, i) => i === idx ? { ...c, maKhoaHoc: skh.maKhoaHoc, ten: skh.tenKhoaHoc, hinhAnh: skh.hinhAnh } : c));
    };

    return (
        <div className="quan-ly-container">
            <div className="quan-ly-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>Lộ trình AI của tôi</h1>
                    <p style={{ color: '#64748b' }}>Thiết kế trải nghiệm học tập đỉnh cao cho học viên</p>
                </div>
                <button onClick={() => { setIsEditMode(false); setEditingItem({ yeuCau: '', trangThai: 'Hoạt động' }); setTempCourses([]); setIsModalOpen(true); }}
                    className="btn-add-main">+ THÊM LỘ TRÌNH</button>
            </div>

            <div className="lo-trinh-grid">
                {danhSach.map((item) => (
                    <div key={item.maLoTrinh} className="lo-trinh-card pro-card">
                        <div className="card-content">
                            <span className="badge-status">● {item.trangThai}</span>
                            <h3 className="card-title">{item.yeuCau}</h3>
                        </div>
                        <div className="card-footer">
                            <span className="id-tag">ID: #{item.maLoTrinh}</span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => { setIsEditMode(true); setEditingItem(item); setTempCourses(JSON.parse(item.noiDungJSON || "[]")); setIsModalOpen(true); }} className="btn-edit-small">Sửa</button>
                                <button onClick={() => handleDeleteMain(item.maLoTrinh)} className="btn-delete-main-card">Xóa</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingItem && (
                <div className="modal-overlay">
                    <div className="modal-content pro-modal-v2">
                        <div className="modal-header-pro">
                            <h2>{isEditMode ? 'Chỉnh sửa Lộ trình' : 'Tạo mới Lộ trình'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-x">×</button>
                        </div>

                        <div className="modal-body-pro">
                            <div className="form-group-pro" style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>Tên lộ trình tổng quát</label>
                                <input
                                    type="text" className="input-pro"
                                    value={editingItem.yeuCau}
                                    onChange={(e) => setEditingItem({ ...editingItem, yeuCau: e.target.value })}
                                    placeholder="Ví dụ: Lộ trình Back-end chuyên nghiệp..."
                                />
                            </div>

                            <div className="roadmap-section">
                                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Cấu trúc các chặng học</h3>
                                    <button onClick={addCourse} className="btn-select-kh">+ Chọn khóa học</button>
                                </div>

                                <div className="course-scroll-area" style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '5px' }}>
                                    {tempCourses.length === 0 ? (
                                        <div className="empty-roadmap-hint">
                                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📂</div>
                                            <p style={{ fontWeight: 600, color: '#64748b' }}>Lộ trình hiện đang trống</p>
                                            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Hãy nhấn "Chọn khóa học" để bắt đầu thiết kế nhé!</p>
                                        </div>
                                    ) : (
                                        tempCourses.map((course, idx) => (
                                            <div key={idx} className="course-item-card">
                                                <div className="course-rank">{idx + 1}</div>

                                                <img
                                                    src={`/img/${course.hinhAnh}`}
                                                    className="course-img-small"
                                                    onError={(e) => (e.currentTarget.src = 'https://careplusvn.com/Uploads/t/de/default-image_730.jpg')}
                                                />

                                                {/* Fix mất tên: Dùng div flex-grow để đẩy ô chọn ra xa */}
                                                <div style={{ flex: 2, minWidth: '200px' }}>
                                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>KHÓA HỌC:</label>
                                                    <select
                                                        className="select-pro"
                                                        value={course.maKhoaHoc}
                                                        onChange={(e) => handleCourseSelect(idx, parseInt(e.target.value))}
                                                    >
                                                        {khoaHocCoSan.map(k => <option key={k.maKhoaHoc} value={k.maKhoaHoc}>{k.tenKhoaHoc}</option>)}
                                                    </select>
                                                </div>

                                                <div style={{ flex: 1, maxWidth: '150px' }}>
                                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>LOẠI:</label>
                                                    <select
                                                        className={`status-select ${course.trangThai === 'Bắt buộc' ? 'st-req' : 'st-opt'}`}
                                                        style={{ width: '100%' }}
                                                        value={course.trangThai}
                                                        onChange={(e) => setTempCourses(prev => prev.map((c, i) => i === idx ? { ...c, trangThai: e.target.value } : c))}
                                                    >
                                                        <option value="Bắt buộc">Bắt buộc</option>
                                                        <option value="Nâng cao">Nâng cao</option>
                                                        <option value="Tự chọn">Tự chọn</option>
                                                    </select>
                                                </div>

                                                <button onClick={() => setTempCourses(tempCourses.filter((_, i) => i !== idx))} className="btn-del-item">
                                                    <i className="fa fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer-pro">
                            <button onClick={() => setIsModalOpen(false)} className="btn-cancel-pro">HỦY BỎ</button>
                            <button onClick={handleSave} className="btn-save-pro">CẬP NHẬT LỘ TRÌNH</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                .quan-ly-container, .pro-modal-v2 { font-family: 'Inter', sans-serif !important; }

                .btn-add-main {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
                    color: white !important; border: none !important; padding: 12px 25px !important;
                    border-radius: 12px !important; font-weight: 700 !important; cursor: pointer !important;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3) !important;
                    outline: none !important; transition: 0.3s !important;
                }
                .btn-add-main:hover { transform: translateY(-2px); filter: brightness(1.1); }

                .btn-edit-small { border: 2px solid #2563eb; color: #2563eb; font-weight: 700; padding: 6px 15px; border-radius: 8px; background: none; cursor: pointer; }
                .btn-edit-small:hover { background: #2563eb; color: white; }
                
                .btn-delete-main-card { border: 2px solid #ef4444; color: #ef4444; font-weight: 700; padding: 6px 15px; border-radius: 8px; background: none; cursor: pointer; }
                .btn-delete-main-card:hover { background: #ef4444; color: white; }

                .pro-modal-v2 { width: 900px; background: white; border-radius: 24px; display: flex; flex-direction: column; max-height: 92vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
                .modal-header-pro { padding: 20px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; position: relative; }
                .close-x { width: 32px; height: 32px; background: #f1f5f9; border: none; border-radius: 50%; color: #64748b; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .close-x:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }
                
                .course-item-card { display: flex; align-items: flex-end; gap: 20px; background: white; padding: 15px 20px; border-radius: 16px; margin-bottom: 12px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .course-rank { width: 32px; height: 32px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; flex-shrink: 0; margin-bottom: 5px; }
                .course-img-small { width: 70px; height: 70px; border-radius: 12px; object-fit: cover; border: 1px solid #e2e8f0; }
                
                .select-pro { border: 1.5px solid #e2e8f0; background: #f8fafc; padding: 10px; border-radius: 10px; font-weight: 600; width: 100%; font-size: 0.9rem; }
                .status-select { padding: 10px; border-radius: 10px; border: none; font-weight: 700; font-size: 13px; cursor: pointer; }
                .st-req { background: #fee2e2; color: #dc2626; }
                .st-opt { background: #fef3c7; color: #d97706; }

                .empty-roadmap-hint { text-align: center; padding: 40px; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px; }
                .modal-footer-pro { padding: 20px 30px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 15px; background: #fff; }
                .btn-save-pro { background: #10b981; color: white; border: none; padding: 12px 35px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
                .btn-save-pro:hover { background: #059669; transform: translateY(-2px); }
                .btn-cancel-pro { background: #f1f5f9; color: #475569; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 700; cursor: pointer; }
                .btn-select-kh { background: #eff6ff; color: #2563eb; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
                .btn-del-item { background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; transition: 0.2s; margin-bottom: 5px; }
                .btn-del-item:hover { color: #ef4444; }
            `}</style>
        </div>
    );
};

export default QuanLyLoTrinh;
