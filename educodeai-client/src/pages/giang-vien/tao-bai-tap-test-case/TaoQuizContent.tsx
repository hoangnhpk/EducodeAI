import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { BaiTapService } from '@/services/bai-tap.service';
import './TaoQuiz.css';

const TaoQuizContent = () => {
    const navigate = useNavigate();
    const [danhSachKhoaHoc, setDanhSachKhoaHoc] = useState<any[]>([]);
    const [danhSachChuong, setDanhSachChuong] = useState<any[]>([]);
    const [danhSachBaiHoc, setDanhSachBaiHoc] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        khoaHoc: '',
        chapter: '',
        lesson: '',
        difficulty: 'Easy',
        questionCount: 10
    });

    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchKhoaHoc = async () => {
            try {
                const res = await BaiTapService.getKhoaHocs();
                // Xử lý phòng thủ y như bài tập trước
                setDanhSachKhoaHoc(Array.isArray(res) ? res : (res.data || []));
            } catch (error) {
                console.error("Lỗi lấy danh sách khóa học:", error);
            }
        };
        fetchKhoaHoc();
    }, []);

    useEffect(() => {
        if (formData.khoaHoc) {
            const fetchChuong = async () => {
                try {
                    const res = await BaiTapService.getChuongHocs(Number(formData.khoaHoc));
                    setDanhSachChuong(Array.isArray(res) ? res : (res.data || []));
                } catch (error) {
                    console.error("Lỗi lấy danh sách chương:", error);
                }
            };
            fetchChuong();
        } else {
            setDanhSachChuong([]); // Nếu reset Khóa học thì clear luôn mảng Chương
        }
    }, [formData.khoaHoc]);

    useEffect(() => {
        if (formData.chapter) {
            const fetchBaiHoc = async () => {
                try {
                    const res = await BaiTapService.getBaiHocs(Number(formData.chapter));
                    setDanhSachBaiHoc(Array.isArray(res) ? res : (res.data || []));
                } catch (error) {
                    console.error("Lỗi lấy danh sách bài học:", error);
                }
            };
            fetchBaiHoc();
        } else {
            setDanhSachBaiHoc([]);
        }
    }, [formData.chapter]);

    // Hàm hứng dữ liệu mỗi khi người dùng gõ/chọn
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Hàm gọi API khi giảng viên chốt đơn
    const handleTaoQuizAI = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn trình duyệt load lại trang

        // Validate sương sương
        if (!formData.lesson) {
            Swal.fire({ icon: 'warning', text: "Ê sếp, chọn Bài học trước đã rồi AI mới biết đường chế quiz chứ! 😅" });
            return;
        }

        try {
            setIsGenerating(true);

            // Map data từ form sang đúng DTO mà Backend đang chờ
            const payload = {
                MaBaiHoc: Number(formData.lesson),
                TieuDe: formData.title,
                NoiDungTomTat: formData.summary,
                DoKho: formData.difficulty,
                SoCauHoi: Number(formData.questionCount)
            };

            console.log("Đang gửi yêu cầu cho AI...", payload);

            // Gọi thần linh AI giáng thế
            const response = await BaiTapService.taoQuizBangAI(payload);

            if (response.success) {
                console.log("Thành quả AI nhả ra nè:", response.data);
                Swal.fire({ icon: 'success', text: `Trộm vía! ${response.message} 🎉` });

                let aiData = response.data;
                let danhSachCauHoiChuan = [];

                if (aiData["Câu hỏi"]) {
                    // Trường hợp 1: AI lanh chanh bọc trong key "Câu hỏi"
                    danhSachCauHoiChuan = aiData["Câu hỏi"].map((q: any) => ({
                        cauHoi: q.NoiDung || q.cauHoi, // Ưu tiên NoiDung, không có thì lấy cauHoi
                        // Bóc mảng LuaChon ra thành A, B, C, D
                        dapAnA: q.LuaChon ? q.LuaChon[0] : (q.dapAnA || ""),
                        dapAnB: q.LuaChon ? q.LuaChon[1] : (q.dapAnB || ""),
                        dapAnC: q.LuaChon ? q.LuaChon[2] : (q.dapAnC || ""),
                        dapAnD: q.LuaChon ? q.LuaChon[3] : (q.dapAnD || ""),
                        dapAnDung: q.DapAnDung || q.dapAnDung,
                        giaiThich: q.GiaiThich || q.giaiThich
                    }));
                }
                else if (aiData.CauHoi) {
                    // Trường hợp 1 phẩy: Nó viết không dấu
                    danhSachCauHoiChuan = aiData.CauHoi.map((q: any) => ({
                        cauHoi: q.NoiDung, dapAnA: q.LuaChon[0], dapAnB: q.LuaChon[1], dapAnC: q.LuaChon[2], dapAnD: q.LuaChon[3], dapAnDung: q.DapAnDung, giaiThich: q.GiaiThich
                    }));
                }
                else if (Array.isArray(aiData)) {
                    // Trường hợp 2: AI ngoan ngoãn trả về đúng cái mảng ban đầu
                    danhSachCauHoiChuan = aiData;
                }
                else {
                    // Nếu nó nặn ra cái gì lạ quá thì mình lấy tạm mảng rỗng cho khỏi sập UI
                    danhSachCauHoiChuan = [];
                    console.error("Cấu trúc JSON lạ quá, chưa map được sếp ơi:", aiData);
                }

                sessionStorage.setItem('draftQuizData', JSON.stringify(danhSachCauHoiChuan));
                sessionStorage.setItem('draftQuizSettings', JSON.stringify(payload));

                navigate('/giang-vien/preview-quiz');
            } else {
                Swal.fire({ icon: 'error', text: "Có lỗi òi: " + response.message });
            }

        } catch (error: any) {
            console.error("Lỗi sập nguồn khi gọi AI:", error);
            Swal.fire({ icon: 'error', text: "AI đang dỗi hoặc server ngủ quên mất rồi! 😭" });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="main-content" style={{ padding: '40px 48px', animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            {/* Page Title */}
            <div className="page-title">
                <h2>TẠO QUIZ BẰNG AI 🤖</h2>
            </div>

            {/* Form Card */}
            <div className="form-card">
                <form onSubmit={handleTaoQuizAI}>
                    {/* Tiêu đề quiz */}
                    <div className="form-group">
                        <label className="form-label">Tiêu đề quiz:</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Nhập tiêu đề quiz..."
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Cụm Dropdown Liên Hoàn */}
                    <div className="form-group">
                        <label className="form-label">Thuộc khóa học:</label>
                        <select className="form-select" name="khoaHoc" value={formData.khoaHoc} onChange={handleChange} required>
                            <option value="">-- Chọn Khóa Học --</option>
                            {danhSachKhoaHoc.map(kh => (
                                <option key={kh.maKhoaHoc} value={kh.maKhoaHoc}>{kh.tenKhoaHoc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Thuộc chương:</label>
                            <select className="form-select" name="chapter" value={formData.chapter} onChange={handleChange} required disabled={!formData.khoaHoc}>
                                <option value="">-- Chọn Chương --</option>
                                {danhSachChuong.map(c => (
                                    <option key={c.maChuong} value={c.maChuong}>{c.tenChuong}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Thuộc bài học:</label>
                            <select className="form-select" name="lesson" value={formData.lesson} onChange={handleChange} required disabled={!formData.chapter}>
                                <option value="">-- Chọn Bài Học --</option>
                                {danhSachBaiHoc.map(b => (
                                    <option key={b.maBaiHoc} value={b.maBaiHoc}>{b.tieuDe}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nội dung tóm tắt:</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Nhập tóm tắt nội dung của bài học..."
                            name="summary"
                            value={formData.summary}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Độ khó */}
                    <div className="form-group">
                        <label className="form-label">Độ khó:</label>
                        <div className="difficulty-group">
                            <label className="checkbox-wrapper">
                                <input
                                    type="radio"
                                    name="difficulty"
                                    value="Easy"
                                    checked={formData.difficulty === 'Easy'}
                                    onChange={handleChange}
                                />
                                <span className="radio-label">Easy</span>
                            </label>
                            <label className="checkbox-wrapper">
                                <input
                                    type="radio"
                                    name="difficulty"
                                    value="Medium"
                                    checked={formData.difficulty === 'Medium'}
                                    onChange={handleChange}
                                />
                                <span className="radio-label">Medium</span>
                            </label>
                            <label className="checkbox-wrapper">
                                <input
                                    type="radio"
                                    name="difficulty"
                                    value="Hard"
                                    checked={formData.difficulty === 'Hard'}
                                    onChange={handleChange}
                                />
                                <span className="radio-label">Hard</span>
                            </label>
                        </div>
                    </div>

                    {/* Số câu hỏi */}
                    <div className="form-group">
                        <label className="form-label">Số câu hỏi:</label>
                        <div className="number-input-wrapper">
                            <input
                                type="number"
                                className="number-input"
                                name="questionCount"
                                value={formData.questionCount}
                                onChange={handleChange}
                                min="1"
                                max="50"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="submit-section">
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isGenerating} // Nút mờ đi khi đang chờ AI
                            style={{ opacity: isGenerating ? 0.7 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }}
                        >
                            {isGenerating ? (
                                <>
                                    <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}></i>
                                    AI ĐANG "RẶN" CÂU HỎI... CHỜ XÍU NHA! 🧠
                                </>
                            ) : (
                                "🤖 TẠO QUIZ BẰNG AI"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaoQuizContent;