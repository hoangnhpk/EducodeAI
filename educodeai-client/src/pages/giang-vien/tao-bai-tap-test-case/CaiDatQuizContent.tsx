import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateQuizDTO } from './BaiTap';
import { BaiTapService } from '@/services/bai-tap.service';
import './CaiDatQuiz.css'; 
import Swal from 'sweetalert2';

const CaiDatQuizContent = () => {
    const navigate = useNavigate();

    // Rổ đựng cài đặt chuẩn theo ERD
    const [settings, setSettings] = useState({
        ThoiGianLamBai: 30,
        DiemCanDat: 60,
        ChoPhepLamLai: true,
        DaoCauHoi: true // Thêm tính năng đảo câu hỏi
    });

    const [isPublishing, setIsPublishing] = useState(false);

    // Kiểm tra xem có bị rớt data giữa chừng không
    useEffect(() => {
        const draftData = sessionStorage.getItem('draftQuizData');
        const draftSettings = sessionStorage.getItem('draftQuizSettings');
        
        if (!draftData || !draftSettings) {
            Swal.fire({ icon: 'error', text: "Mất kết nối dữ liệu rồi sếp ơi. Tạo lại từ đầu nha!" });
            navigate('/giang-vien/tao-quiz');
        }
    }, [navigate]);

    // Xử lý thay đổi input số
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: Number(value) || 0 }));
    };

    // Chốt đơn: Gom data ném lên server
    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setIsPublishing(true);

            // Móc data từ SessionStorage ra
            const quizQuestionsString = sessionStorage.getItem('draftQuizData') || '[]';
            const initSettings = JSON.parse(sessionStorage.getItem('draftQuizSettings') || '{}');

            // Nặn payload chuẩn 100% theo DTO và ERD
            const payload: CreateQuizDTO = {
                MaBaiHoc: Number(initSettings.MaBaiHoc),
                ThoiGianLamBai: settings.ThoiGianLamBai,
                DiemCanDat: settings.DiemCanDat,
                ChoPhepLamLai: settings.ChoPhepLamLai,
                DaoCauHoi: settings.DaoCauHoi,
                // Ép nguyên mảng câu hỏi thành chuỗi JSON để nhét vừa cột DuLieuCauHoiJSON
                DuLieuCauHoi: quizQuestionsString 
            };

            console.log("Ném data lên BE nè:", payload);

            // Gọi API
            const response = await BaiTapService.xuatBanQuiz(payload);

            if (response.success) {
                Swal.fire({ icon: 'success', text: `${response.message}` });
                sessionStorage.removeItem('draftQuizData');
                sessionStorage.removeItem('draftQuizSettings');
                navigate('/giang-vien/bai-tap'); // Đá về trang danh sách
            } else {
                Swal.fire({ icon: 'error', text: "Úi, có lỗi: " + response.message });
            }

        } catch (error: any) {
            console.error("Lỗi sập nguồn:", error);
            Swal.fire({ icon: 'error', text: "Server đang lỗi, không lưu được rồi!" });
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="main-content" style={{ padding: '40px 48px', animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div className="breadcrumb">
                <span className="breadcrumb-item">TẠO QUIZ</span>
                <span className="breadcrumb-separator">{'>'}</span>
                <span className="breadcrumb-item">PREVIEW QUIZ</span>
                <span className="breadcrumb-separator">{'>'}</span>
                <span className="breadcrumb-item active">CÀI ĐẶT QUIZ</span>
            </div>

            <div className="settings-card">
                <div className="settings-header">
                    <h2>Cấu hình bài thi</h2>
                    <p>Tinh chỉnh các thông số cuối cùng trước khi cho học viên "lên thớt" 🎯</p>
                </div>

                <form onSubmit={handlePublish}>
                    <div className="settings-grid">
                        {/* Thời gian làm bài */}
                        <div className="setting-item">
                            <div className="setting-label"><span className="setting-icon time-icon">⏱️</span> Thời gian (phút):</div>
                            <input 
                                type="number" className="setting-input" 
                                name="ThoiGianLamBai" min="1" max="180"
                                value={settings.ThoiGianLamBai} onChange={handleChange} required 
                            />
                        </div>

                        {/* Điểm đạt */}
                        <div className="setting-item">
                            <div className="setting-label"><span className="setting-icon score-icon">🎯</span> Điểm đạt (%):</div>
                            <input 
                                type="number" className="setting-input" 
                                name="DiemCanDat" min="1" max="100"
                                value={settings.DiemCanDat} onChange={handleChange} required 
                            />
                        </div>
                    </div>

                    {/* Cho phép làm lại */}
                    <div className="setting-item full-width">
                        <div className="setting-label"><span className="setting-icon retake-icon">🔄</span> Cho phép làm lại:</div>
                        <div className="radio-group">
                            <label className={`radio-option ${settings.ChoPhepLamLai ? 'selected' : ''}`} onClick={() => setSettings(p => ({...p, ChoPhepLamLai: true}))}>
                                <input type="radio" checked={settings.ChoPhepLamLai} readOnly />
                                <span className="radio-label">Có, cho xõa thoải mái!</span>
                            </label>
                            <label className={`radio-option ${!settings.ChoPhepLamLai ? 'selected' : ''}`} onClick={() => setSettings(p => ({...p, ChoPhepLamLai: false}))}>
                                <input type="radio" checked={!settings.ChoPhepLamLai} readOnly />
                                <span className="radio-label">Không, thi 1 lần chốt hạ!</span>
                            </label>
                        </div>
                    </div>

                    {/* Đảo câu hỏi */}
                    <div className="setting-item full-width" style={{ marginTop: '24px' }}>
                        <div className="setting-label"><span className="setting-icon shuffle-icon">🔀</span> Đảo vị trí câu hỏi & đáp án:</div>
                        <div className="radio-group">
                            <label className={`radio-option ${settings.DaoCauHoi ? 'selected' : ''}`} onClick={() => setSettings(p => ({...p, DaoCauHoi: true}))}>
                                <input type="radio" checked={settings.DaoCauHoi} readOnly />
                                <span className="radio-label">Bật (Chống copy)</span>
                            </label>
                            <label className={`radio-option ${!settings.DaoCauHoi ? 'selected' : ''}`} onClick={() => setSettings(p => ({...p, DaoCauHoi: false}))}>
                                <input type="radio" checked={!settings.DaoCauHoi} readOnly />
                                <span className="radio-label">Tắt (Giữ nguyên thứ tự)</span>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button type="button" className="btn-action btn-save" onClick={() => navigate('/giang-vien/preview-quiz')} disabled={isPublishing}>
                            <span>←</span> Quay lại sửa
                        </button>
                        <button type="submit" className="btn-action btn-publish" disabled={isPublishing}>
                            {isPublishing ? (
                                <><i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite' }}></i> Đang đưa lên mây...</>
                            ) : (
                                <><span>🚀</span> XUẤT BẢN QUIZ</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CaiDatQuizContent;