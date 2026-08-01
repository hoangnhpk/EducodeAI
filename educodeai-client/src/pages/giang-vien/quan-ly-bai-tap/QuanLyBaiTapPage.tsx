import { useEffect, useState, Suspense } from 'react';
import './QuanLyBaiTap.css';
import './components/QuanLyBaiTapThucHanh.css';
import QuizDetailView from './components/QuizDetailView';
import { useExerciseList } from './hooks/useExerciseList';
import { useAIGenerator } from './hooks/useAIGenerator';
import { ExerciseFilter } from './components/ExerciseFilter';
import { ExerciseTable } from './components/ExerciseTable';

import LessonSelector from './components/LessonSelector';
import FormTaoBaiTapAI from './components/FormTaoBaiTapAI';
import FormTaoQuizAI from './components/FormTaoQuizAI';
import PreviewBaiTapAI from './components/PreviewBaiTapAI';
import PreviewQuizAI from './components/PreviewQuizAI';
import StatusSinhAI from './components/StatusSinhAI';

export default function QuanLyBaiTapPage() {
    const [cheDoManHinh, setCheDoManHinh] = useState<'list' | 'createPractice' | 'createQuiz'>('list');

    const {
        isLoading,
        danhSachHienThi,
        filters,
        pagination,
        modalState,
        fetchDanhSach,
        handleDeleteClick,
        handleViewClick
    } = useExerciseList();

    const handleAIGeneratorSuccess = () => {
        setCheDoManHinh('list');
        fetchDanhSach();
    };

    const ai = useAIGenerator(handleAIGeneratorSuccess);

    useEffect(() => {
        if (!modalState.isModalOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' || event.key === 'Esc') {
                modalState.closeModal();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [modalState.isModalOpen, modalState.closeModal]);

    const switchToCreatePractice = () => {
        setCheDoManHinh('createPractice');
        ai.resetState();
    };

    const switchToCreateQuiz = () => {
        setCheDoManHinh('createQuiz');
        ai.resetState();
    };

    const goBackToList = () => {
        setCheDoManHinh('list');
        ai.resetState();
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="mb-2" style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '28px' }}>
                        <i className="bi bi-journal-code text-primary me-2"></i>
                        Quản lý Bài Tập & Quiz
                    </h2>
                    <p className="btth-page-subtitle mb-0">Hệ thống sinh bài tập và câu hỏi trắc nghiệm thông minh bằng AI</p>
                </div>
            </div>

            {/* Các Tab điều hướng chính */}
            <div className="btth-tabs-wrapper mb-4">
                <div className="tabs">
                    <button 
                        className={`tab ${cheDoManHinh === 'list' ? 'active' : ''}`}
                        onClick={goBackToList}
                    >
                        <i className="bi bi-list-ul me-2"></i> Danh sách bài tập
                    </button>
                    <button 
                        className={`tab ${cheDoManHinh === 'createPractice' ? 'active' : ''}`}
                        onClick={switchToCreatePractice}
                    >
                        <i className="bi bi-robot me-2"></i> Tạo bài tập IDE bằng AI
                    </button>
                    <button 
                        className={`tab ${cheDoManHinh === 'createQuiz' ? 'active' : ''}`}
                        onClick={switchToCreateQuiz}
                    >
                        <i className="bi bi-patch-question me-2"></i> Tạo Quiz AI
                        <span className="badge ms-2 btth-new-badge" style={{ background: 'var(--warning-soft)', color: 'var(--warning-strong)', fontSize: '10px', padding: '2px 7px', borderRadius: '999px' }}>MỚI</span>
                    </button>
                </div>
            </div>

            {/* Render Danh Sách */}
            {cheDoManHinh === 'list' && (
                <div className="fade-in">
                    <ExerciseFilter {...filters} />
                    
                    <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <ExerciseTable 
                            isLoading={isLoading} 
                            danhSachHienThi={danhSachHienThi} 
                            onViewClick={handleViewClick} 
                            onDeleteClick={handleDeleteClick} 
                            onCreateClick={switchToCreatePractice}
                        />
                    </div>

                    {pagination.tongSoTrang > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <div className="btn-group shadow-sm" role="group">
                                <button className="btn btn-outline-primary" disabled={pagination.trangHienTai === 1} onClick={() => pagination.setTrangHienTai(prev => prev - 1)}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                {Array.from({ length: pagination.tongSoTrang }, (_, i) => i + 1).map(page => (
                                    <button key={page} className={`btn ${pagination.trangHienTai === page ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => pagination.setTrangHienTai(page)}>
                                        {page}
                                    </button>
                                ))}
                                <button className="btn btn-outline-primary" disabled={pagination.trangHienTai === pagination.tongSoTrang} onClick={() => pagination.setTrangHienTai(prev => prev + 1)}>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {modalState.isModalOpen && (
                        <div className="modal-backdrop-custom" onClick={modalState.closeModal}>
                            <div className="modal-dialog-custom" onClick={(event) => event.stopPropagation()}>
                                <button
                                    type="button"
                                    className="btn-close modal-close-button"
                                    onClick={modalState.closeModal}
                                    aria-label="Đóng"
                                />
                                <div className="modal-scroll-body">
                                    {modalState.isLoadingDetails ? (
                                        <div className="text-center p-5"><i className="bi bi-arrow-repeat fs-1 text-primary" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}></i><div className="mt-2 text-muted">Đang tải dữ liệu...</div></div>
                                    ) : (
                                        <Suspense fallback={<div className="text-center p-5">Đang tải...</div>}>
                                            {modalState.modalType === 'IDE' ? (
                                                <PreviewBaiTapAI data={modalState.chiTietBaiTap} editable={false} onCancel={modalState.closeModal} />
                                            ) : modalState.modalType === 'Quiz' ? (
                                                <QuizDetailView data={modalState.chiTietBaiTap} />
                                            ) : null}
                                        </Suspense>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Render Tạo Thực Hành */}
            {cheDoManHinh === 'createPractice' && (
                <div className="fade-in">
                    <div className="row">
                        <div className="col-12">
                            <LessonSelector onBaiHocChange={ai.handleLessonChange} />
                        </div>
                        <div className="col-12">
                            <FormTaoBaiTapAI 
                                baiHocId={ai.selectedBaiHocId}
                                tenBaiHoc={ai.tenBaiHoc}
                                isGenerating={ai.practice.state === 'generating'}
                                onGenerate={ai.practice.generate}
                            />
                        </div>
                        {ai.practice.state === 'preview' && (
                            <div className="col-12">
                                <StatusSinhAI />
                            </div>
                        )}
                        {ai.practice.data && (
                            <div className="col-12">
                                <PreviewBaiTapAI 
                                    data={ai.practice.data} 
                                    onSave={ai.practice.save} 
                                    onCancel={ai.practice.cancel}
                                    isSaving={ai.practice.state === 'saving'}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Render Tạo Quiz */}
            {cheDoManHinh === 'createQuiz' && (
                <div className="fade-in">
                    <div className="row">
                        <div className="col-12">
                            <LessonSelector onBaiHocChange={ai.handleLessonChange} />
                        </div>
                        <div className="col-12">
                            <FormTaoQuizAI 
                                baiHocId={ai.selectedBaiHocId}
                                tenBaiHoc={ai.tenBaiHoc}
                                isGenerating={ai.quiz.state === 'generating'}
                                onGenerate={ai.quiz.generate}
                            />
                        </div>
                        {ai.quiz.state === 'preview' && (
                            <div className="col-12">
                                <StatusSinhAI />
                            </div>
                        )}
                        {ai.quiz.data && (
                            <div className="col-12">
                                <PreviewQuizAI 
                                    data={ai.quiz.data} 
                                    baiHocId={ai.selectedBaiHocId!} 
                                    onSave={ai.quiz.save} 
                                    onCancel={ai.quiz.cancel}
                                    isSaving={ai.quiz.state === 'saving'}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
