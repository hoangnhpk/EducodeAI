import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/configs/axios';

interface IProjectResult {
    tenDoAn: string;
    moTa: string;
    yeuCauChucNang: string[];
    cauTrucDatabase: string;
}

const SinhDoAnAI: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'empty' | 'loading' | 'result'>('empty');

    // Form States
    const [mucTieu, setMucTieu] = useState('Backend Developer (Node.js)');
    const [ngonNgu, setNgonNgu] = useState('ReactJS, NodeJS, MongoDB');
    const [capDo, setCapDo] = useState('Thực tế');

    // Result State
    const [resultData, setResultData] = useState<IProjectResult | null>(null);

    const handleGenerate = async () => {
        if (!mucTieu || !ngonNgu || !capDo) return;

        setStatus('loading');
        try {
            const response = await axiosInstance.post('/api/SinhDoAnAI/generate', {
                mucTieuNgheNghiep: mucTieu,
                ngonNguCongNghe: ngonNgu,
                capDo: capDo
            });

            // Because of the custom Axios interceptor, response is already the data body
            setResultData(response as any);
            setStatus('result');
        } catch (error) {
            console.error("Lỗi khi sinh đồ án:", error);
            alert("Có lỗi xảy ra khi tạo đồ án. Vui lòng thử lại!");
            setStatus('empty');
        }
    };

    return (
        <div className="project-gen-room bg-light font-sans text-dark vh-100 d-flex flex-column">
            {/* Header */}
            <header className="bg-white shadow-sm border-bottom py-3 px-4 d-flex align-items-center justify-content-between sticky-top z-3">
                <div className="d-flex align-items-center gap-3">
                    <div className="icon-wrap bg-primary text-white d-flex align-items-center justify-content-center rounded-3 fs-5" style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-layer-group"></i>
                    </div>
                    <h1 className="h5 m-0 fw-bold text-dark">
                        EduCode AI <span className="text-muted fw-normal ms-1">| Sinh Đồ Án</span>
                    </h1>
                </div>
                <button className="btn btn-light fw-bold shadow-sm" onClick={() => navigate(-1)}>
                    Quay lại Trang chủ
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-grow-1 w-100 mx-auto px-3 py-4" style={{ maxWidth: '1200px' }}>
                <div className="row g-4 h-100">

                    {/* Left Column - Input */}
                    <div className="col-lg-4">
                        <div className="bg-white rounded-4 p-4 shadow-sm border border-light h-100">
                            <h2 className="h6 fw-bold text-dark mb-4 d-flex align-items-center">
                                <i className="fas fa-sliders-h text-primary me-2"></i> Thông số Đồ án
                            </h2>
                            <div className="d-flex flex-column gap-4">
                                <div>
                                    <label className="form-label fw-bold text-secondary small mb-2">Mục tiêu nghề nghiệp</label>
                                    <select
                                        className="form-select custom-select-lg"
                                        value={mucTieu}
                                        onChange={(e) => setMucTieu(e.target.value)}
                                    >
                                        <option value="Backend Developer (Node.js)">Backend Developer (Node.js)</option>
                                        <option value="Frontend Developer (ReactJS)">Frontend Developer (ReactJS)</option>
                                        <option value="Fullstack Developer">Fullstack Developer</option>
                                        <option value="Mobile Developer">Mobile Developer</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label fw-bold text-secondary small mb-2">Ngôn ngữ / Công nghệ</label>
                                    <input
                                        type="text"
                                        value={ngonNgu}
                                        onChange={(e) => setNgonNgu(e.target.value)}
                                        className="form-control custom-input-lg"
                                        placeholder="VD: ReactJS, NodeJS, MongoDB"
                                    />
                                </div>
                                <div>
                                    <label className="form-label fw-bold text-secondary small mb-2">Cấp độ</label>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <label className={`level-radio-label border rounded-3 p-3 d-flex align-items-center gap-2 cursor-pointer w-100 ${capDo === 'Cơ bản' ? 'border-primary bg-primary bg-opacity-10 text-primary' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="level"
                                                    value="Cơ bản"
                                                    checked={capDo === 'Cơ bản'}
                                                    onChange={(e) => setCapDo(e.target.value)}
                                                    className="form-check-input mt-0"
                                                /> <span className="fw-semibold">Cơ bản</span>
                                            </label>
                                        </div>
                                        <div className="col-6">
                                            <label className={`level-radio-label border rounded-3 p-3 d-flex align-items-center gap-2 cursor-pointer w-100 ${capDo === 'Thực tế' ? 'border-primary bg-primary bg-opacity-10 text-primary' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="level"
                                                    value="Thực tế"
                                                    checked={capDo === 'Thực tế'}
                                                    onChange={(e) => setCapDo(e.target.value)}
                                                    className="form-check-input mt-0"
                                                /> <span className="fw-semibold">Thực tế</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className={`btn btn-primary text-white btn-lg w-100 fw-bold py-3 mt-2 d-flex align-items-center justify-content-center gap-2 shadow-lg gen-btn ${status === 'loading' ? 'disabled opacity-75' : ''}`}
                                    onClick={handleGenerate}
                                    disabled={status === 'loading'}
                                    style={{ background: '#fb873f', borderColor: '#fb873f' }}
                                >
                                    {status === 'loading' ? (
                                        <><i className="fas fa-circle-notch fa-spin"></i> Đang xử lý...</>
                                    ) : (
                                        <><i className="fas fa-magic"></i> Tạo Đồ Án {status === 'result' ? 'Mới' : 'Ngay'}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Result */}
                    <div className="col-lg-8">
                        <div className="position-relative h-100 min-h-500px">

                            {/* Empty State */}
                            {status === 'empty' && (
                                <div className="absolute-fill bg-white rounded-4 border border-dashed d-flex flex-column align-items-center justify-content-center text-muted">
                                    <i className="fas fa-file-invoice text-black-50 mb-4" style={{ fontSize: '4rem' }}></i>
                                    <p className="fs-5 m-0">Hãy nhập thông tin bên trái để AI bắt đầu thiết kế đồ án</p>
                                </div>
                            )}

                            {/* Loading State */}
                            {status === 'loading' && (
                                <div className="absolute-fill bg-white rounded-4 border shadow-sm d-flex flex-column align-items-center justify-content-center">
                                    <div className="spinner-border text-primary border-4 mb-4" style={{ width: '4rem', height: '4rem' }} role="status"></div>
                                    <p className="text-secondary fw-bold fs-5 text-pulse">AI đang xây dựng kiến trúc hệ thống...</p>
                                </div>
                            )}

                            {/* Result State */}
                            {status === 'result' && resultData && (
                                <div className="absolute-fill bg-white rounded-4 border shadow-sm p-4 p-lg-5 overflow-auto">
                                    <div className="d-flex justify-content-between align-items-start mb-4 pb-4 border-bottom">
                                        <div>
                                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill mb-3 d-inline-flex align-items-center gap-1">
                                                <i className="fas fa-check"></i> HOÀN TẤT
                                            </span>
                                            <h2 className="fs-3 fw-bold text-dark mb-2">{resultData.tenDoAn}</h2>
                                            <p className="text-secondary m-0 fs-6">{resultData.moTa}</p>
                                        </div>
                                        <button
                                            className="btn btn-light text-secondary fs-5"
                                            title="Sao chép"
                                            onClick={() => {
                                                navigator.clipboard.writeText(JSON.stringify(resultData, null, 2));
                                                alert("Đã copy dữ liệu đồ án!");
                                            }}
                                        >
                                            <i className="fas fa-copy"></i>
                                        </button>
                                    </div>

                                    <div className="d-flex flex-column gap-5">
                                        <div>
                                            <h3 className="fw-bold fs-5 text-dark mb-3"><i className="fas fa-tasks text-primary me-2"></i>1. Yêu cầu Chức năng (Features)</h3>
                                            <ul className="text-secondary list-group-numbered ps-0 ps-md-3 d-flex flex-column gap-2" style={{ lineHeight: '1.8' }}>
                                                {resultData.yeuCauChucNang.map((yc, idx) => (
                                                    <li key={idx} className="list-group-item border-0 bg-transparent ps-2">{yc}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="fw-bold fs-5 text-dark mb-3"><i className="fas fa-database text-primary me-2"></i>2. Cấu trúc Database</h3>
                                            <div className="bg-darker text-success p-4 rounded-3 font-monospace fs-6" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                                {resultData.cauTrucDatabase}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .project-gen-room { font-family: 'Inter', sans-serif; }
                .bg-darker { background-color: #0f172a !important; }
                .border-dashed { border-style: dashed !important; border-width: 2px !important; border-color: #cbd5e1 !important; }
                .min-h-500px { min-height: 500px; }
                
                .absolute-fill {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                }

                .custom-select-lg, .custom-input-lg {
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    border-color: #cbd5e1;
                    box-shadow: none !important;
                }
                .custom-select-lg:focus, .custom-input-lg:focus {
                    border-color: #fb873f;
                }

                .level-radio-label { transition: all 0.2s ease; }
                .level-radio-label:hover { background-color: #f8fafc; }
                .level-radio-label input[type="radio"] { accent-color: #fb873f; width: 1.25rem; height: 1.25rem; cursor: pointer; }
                
                .gen-btn { transition: all 0.3s ease; border-radius: 0.75rem; }
                .gen-btn:not(.disabled):hover { background-color: #e06c27 !important; border-color: #e06c27 !important; }

                .text-pulse { animation: pulseText 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulseText {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }

                .list-group-item { color: inherit !important; }
            `}</style>
        </div>
    );
};

export default SinhDoAnAI;
