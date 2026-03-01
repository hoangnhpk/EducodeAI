import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './PreviewQuiz.css';

const PreviewQuizContent = () => {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<any[]>([]);

    const [currentIndex, setCurrentIndex] = useState(0);

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const draftData = sessionStorage.getItem('draftQuizData');
        if (draftData) {
            setQuestions(JSON.parse(draftData));
        } else {
            Swal.fire({ icon: 'warning', text: "Ủa alo, chưa tạo câu hỏi nào mà? Quay lại màn 1 nha sếp!" });
            navigate('/giang-vien/quiz');
        }
    }, [navigate]);

    // Lấy data của câu hỏi hiện tại
    const currentQ = questions[currentIndex];

    // Xử lý Gõ chữ lúc Edit
    const handleEditChange = (field: string, value: string) => {
        const newQuestions = [...questions];
        newQuestions[currentIndex] = { ...newQuestions[currentIndex], [field]: value };
        setQuestions(newQuestions);
    };

    // Lưu Edit và cất vào Session
    const handleSaveEdit = () => {
        sessionStorage.setItem('draftQuizData', JSON.stringify(questions));
        setIsEditing(false);
    };

    // Điều hướng câu hỏi
    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setIsEditing(false); // Chuyển câu thì tự động tắt chế độ Edit
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsEditing(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Tới màn Cài đặt (Màn 3)
    const handleTiepTuc = () => {
        navigate('/giang-vien/cai-dat'); // Link sang màn 3
    };

    return (
        <div className="main-content" style={{ padding: '40px 48px', animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div className="breadcrumb">
                <span className="breadcrumb-item">TẠO QUIZ</span>
                <span className="breadcrumb-separator">{'>'}</span>
                <span className="breadcrumb-item active">PREVIEW QUIZ</span>
            </div>

            {/* Chỉ render khi đã có data */}
            {currentQ && (
                <div className="question-card">
                    {/* --- HEADER --- */}
                    <div className="question-header" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="question-number">{currentIndex + 1}</div>
                            <div className="question-label">Câu {currentIndex + 1} / {questions.length}</div>
                        </div>

                        {isEditing ? (
                            <button className="btn-nav btn-nav-next" style={{ padding: '8px 20px', fontSize: '14px' }} onClick={handleSaveEdit}>
                                💾 Lưu câu này
                            </button>
                        ) : (
                            <button className="btn-nav btn-nav-edit" style={{ padding: '8px 20px', fontSize: '14px' }} onClick={() => setIsEditing(true)}>
                                ✏️ Chỉnh sửa
                            </button>
                        )}
                    </div>

                    {/* --- NỘI DUNG CÂU HỎI --- */}
                    {isEditing ? (
                        <div className="edit-mode">
                            <label className="form-label">Nội dung câu hỏi:</label>
                            <textarea
                                className="form-input" style={{ marginBottom: '16px', minHeight: '100px' }}
                                value={currentQ.cauHoi}
                                onChange={(e) => handleEditChange('cauHoi', e.target.value)}
                            />

                            <label className="form-label">Các lựa chọn:</label>
                            {['A', 'B', 'C', 'D'].map(opt => (
                                <div key={opt} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                                    <div className="option-label" style={{ minWidth: '40px' }}>{opt}</div>
                                    <input
                                        type="text" className="form-input"
                                        value={currentQ[`dapAn${opt}`]}
                                        onChange={(e) => handleEditChange(`dapAn${opt}`, e.target.value)}
                                    />
                                </div>
                            ))}

                            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Đáp án đúng:</label>
                                    <select
                                        className="form-input" style={{ width: '120px' }}
                                        value={currentQ.dapAnDung}
                                        onChange={(e) => handleEditChange('dapAnDung', e.target.value)}
                                    >
                                        <option value="A">A</option><option value="B">B</option>
                                        <option value="C">C</option><option value="D">D</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Giải thích:</label>
                                    <input
                                        type="text" className="form-input"
                                        value={currentQ.giaiThich}
                                        onChange={(e) => handleEditChange('giaiThich', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="view-mode">
                            <div className="question-content">
                                <div className="question-text">{currentQ.cauHoi}</div>
                                <div className="options-list">
                                    <div className="option-item">
                                        <div className="option-label" style={{ background: currentQ.dapAnDung === 'A' ? 'var(--lavender)' : '' }}>A</div>
                                        <div className="option-text" style={{ fontWeight: currentQ.dapAnDung === 'A' ? 700 : 500 }}>{currentQ.dapAnA}</div>
                                    </div>
                                    <div className="option-item">
                                        <div className="option-label" style={{ background: currentQ.dapAnDung === 'B' ? 'var(--lavender)' : '' }}>B</div>
                                        <div className="option-text" style={{ fontWeight: currentQ.dapAnDung === 'B' ? 700 : 500 }}>{currentQ.dapAnB}</div>
                                    </div>
                                    <div className="option-item">
                                        <div className="option-label" style={{ background: currentQ.dapAnDung === 'C' ? 'var(--lavender)' : '' }}>C</div>
                                        <div className="option-text" style={{ fontWeight: currentQ.dapAnDung === 'C' ? 700 : 500 }}>{currentQ.dapAnC}</div>
                                    </div>
                                    <div className="option-item">
                                        <div className="option-label" style={{ background: currentQ.dapAnDung === 'D' ? 'var(--lavender)' : '' }}>D</div>
                                        <div className="option-text" style={{ fontWeight: currentQ.dapAnDung === 'D' ? 700 : 500 }}>{currentQ.dapAnD}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="answer-section">
                                <div className="answer-label">Đáp án đúng & Giải thích:</div>
                                <div className="answer-value">
                                    <span className="answer-icon">✅</span> {currentQ.dapAnDung}
                                </div>
                                <div style={{ marginTop: '12px', color: 'var(--slate)', fontStyle: 'italic', fontSize: '15px' }}>
                                    💡 {currentQ.giaiThich}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vạch kẻ ngang */}
                    <div className="divider" style={{ margin: '32px 0 24px 0' }}></div>

                    {/* --- BỘ NÚT ĐIỀU HƯỚNG GÓM GỌN BÊN TRONG --- */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                        {/* Cụm Lướt Trái/Phải */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                className="btn-nav"
                                style={{ background: 'var(--ice)', color: currentIndex === 0 ? 'var(--slate)' : 'var(--ink)', opacity: currentIndex === 0 ? 0.5 : 1, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer' }}
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                            >
                                ← Câu trước
                            </button>
                            <button
                                className="btn-nav"
                                style={{ background: 'var(--ice)', color: currentIndex === questions.length - 1 ? 'var(--slate)' : 'var(--ink)', opacity: currentIndex === questions.length - 1 ? 0.5 : 1, cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer' }}
                                onClick={handleNext}
                                disabled={currentIndex === questions.length - 1}
                            >
                                Câu tiếp →
                            </button>
                        </div>

                        {/* Nút Cài Đặt được in đậm, chà bá lửa ở góc phải */}
                        <button
                            className="btn-nav btn-nav-next"
                            style={{ padding: '12px 28px', fontSize: '16px', fontWeight: 800 }}
                            onClick={handleTiepTuc}
                        >
                            Tới Cài đặt →
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
};

export default PreviewQuizContent;