import { useState, useCallback, useEffect } from 'react';
import Swal from 'sweetalert2';
import { BaiTapThucHanhService } from '@/services/bai-tap-thuc-hanh.service';
import type {
  GenerateBaiTapThucHanhDTO,
  BaiTapThucHanhData,
  DanhSachBaiTapDTO,
  GenerateQuizAIDTO,
  QuizAIData,
  CreateQuizDTO,
} from './BaiTapThucHanhDTO';

import BoChanPage from './BoChanPage';
import FormTaoBaiTapAI from './FormTaoBaiTapAI';
import FormTaoQuizAI from './FormTaoQuizAI';
import StatusSinhAI from './StatusSinhAI';
import PreviewBaiTapAI from './PreviewBaiTapAI';
import PreviewQuizAI from './PreviewQuizAI';
import DanhSachBaiTapThucHanh from './DanhSachBaiTapThucHanh';

import './QuanLyBaiTapThucHanh.css';

type ActiveTab = 'list' | 'create' | 'quiz';
type PageState = 'idle' | 'generating' | 'preview' | 'saving';

interface QuanLyBaiTapThucHanhProps {
  initialTab?: ActiveTab;
  embedded?: boolean;
  onBackToList?: () => void;
}

export default function QuanLyBaiTapThucHanh({ initialTab = 'list', embedded = false, onBackToList }: QuanLyBaiTapThucHanhProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  // State quản lý chọn bài học (dùng chung 2 tab create/quiz)
  const [selectedBaiHocId, setSelectedBaiHocId] = useState<number | null>(null);
  const [tenBaiHoc, setTenBaiHoc] = useState('');

  // ── State tab Bài tập thực hành ──
  const [practiceState, setPracticeState] = useState<PageState>('idle');
  const [previewData, setPreviewData] = useState<BaiTapThucHanhData | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  // ── State tab Quiz AI ──
  const [quizState, setQuizState] = useState<PageState>('idle');
  const [quizData, setQuizData] = useState<QuizAIData | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  // State danh sách bài tập đã có
  const [danhSach, setDanhSach] = useState<DanhSachBaiTapDTO[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // Load danh sách bài tập
  const fetchDanhSach = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await BaiTapThucHanhService.getDanhSachThucHanh();
      setDanhSach(res.data || res || []);
    } catch (err) {
      console.error('Lỗi tải danh sách:', err);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'list') fetchDanhSach();
  }, [activeTab, fetchDanhSach]);

  // Reset state khi đổi bài học
  const handleLessonChange = (id: number | null, title: string) => {
    setSelectedBaiHocId(id);
    setTenBaiHoc(title);
    setPreviewData(null);
    setPracticeState('idle');
    setPracticeError(null);
    setQuizData(null);
    setQuizState('idle');
    setQuizError(null);
  };

  // Tab switching helpers
  const switchToCreate = () => {
    setActiveTab('create');
    setPreviewData(null);
    setPracticeState('idle');
    setPracticeError(null);
  };

  const switchToQuiz = () => {
    setActiveTab('quiz');
    setQuizData(null);
    setQuizState('idle');
    setQuizError(null);
  };

  // ── Flow: Sinh bài tập thực hành ──
  const handleGenerate = async (dto: GenerateBaiTapThucHanhDTO) => {
    setPracticeState('generating');
    setPracticeError(null);
    setPreviewData(null);
    try {
      const res = await BaiTapThucHanhService.generateBaiTap(dto);
      if (res.success) {
        setPreviewData(res.data);
        setPracticeState('preview');
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setPracticeError(err?.response?.data?.message || err?.message || 'AI gặp sự cố khi soạn đề. Vui lòng thử lại.');
      setPracticeState('idle');
    }
  };

  const handleSavePractice = async (updatedData: BaiTapThucHanhData) => {
    if (!selectedBaiHocId) return;
    setPracticeState('saving');
    try {
      const res = await BaiTapThucHanhService.saveBaiTap(updatedData, selectedBaiHocId);
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Lưu thành công!', text: 'Bài tập thực hành đã được lưu.', timer: 2000, showConfirmButton: false });
        setPreviewData(null);
        setPracticeState('idle');
        if (embedded && onBackToList) {
          onBackToList();
        } else {
          setActiveTab('list');
          fetchDanhSach();
        }
      }
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Lỗi khi lưu', text: err?.response?.data?.message || 'Không thể lưu bài tập.' });
      setPracticeState('preview');
    }
  };

  // ── Flow: Sinh Quiz AI ──
  const handleGenerateQuiz = async (dto: GenerateQuizAIDTO) => {
    setQuizState('generating');
    setQuizError(null);
    setQuizData(null);
    try {
      const res = await BaiTapThucHanhService.generateQuiz(dto);
      const payload = res as any;
      // Backend: { success, message, data: QuizAIData }
      // axiosClient trả về response.data, nên payload = { success, message, data }
      const quiz: QuizAIData = payload?.data ?? payload;
      if (!quiz?.['Câu hỏi'] || quiz['Câu hỏi'].length === 0) {
        throw new Error('AI không sinh được câu hỏi. Vui lòng thử lại với mô tả cụ thể hơn.');
      }
      setQuizData(quiz);
      setQuizState('preview');
    } catch (err: any) {
      setQuizError(err?.response?.data?.message || err?.message || 'AI gặp sự cố khi soạn quiz. Vui lòng thử lại.');
      setQuizState('idle');
    }
  };

  const handleSaveQuiz = async (dto: CreateQuizDTO) => {
    setQuizState('saving');
    try {
      const res = await BaiTapThucHanhService.saveQuiz(dto);
      const raw = res as any;
      if (raw?.success !== false) {
        Swal.fire({ icon: 'success', title: 'Lưu Quiz thành công!', text: 'Quiz đã được lưu vào hệ thống.', timer: 2000, showConfirmButton: false });
        setQuizData(null);
        setQuizState('idle');
        if (embedded && onBackToList) {
          onBackToList();
        } else {
          setActiveTab('list');
          fetchDanhSach();
        }
      } else {
        throw new Error(raw?.message || 'Lỗi không xác định');
      }
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Lỗi khi lưu Quiz', text: err?.response?.data?.message || 'Không thể lưu quiz.' });
      setQuizState('preview');
    }
  };

  return (
    <div className="btth-container" style={{ padding: '32px 48px', minHeight: '100vh', background: '#F1F5F9' }}>
      {embedded && (
        <button className="btn btn-light border mb-4" onClick={onBackToList}>
          <i className="bi bi-arrow-left me-2" /> Quay lại danh sách bài tập
        </button>
      )}

      {!embedded && (
      <><div className="btth-header mb-4 d-flex justify-content-between align-items-end">
        <div>
          <h2 className="btth-main-title">
            <i className="bi bi-code-square me-2" />
            Quản lý Bài Tập & Quiz
          </h2>
          <p className="btth-main-subtitle">Thiết kế bài tập lập trình và câu hỏi trắc nghiệm bằng AI dành riêng cho giảng viên</p>
        </div>
        <div className="btth-breadcrumb">Giảng viên &rsaquo; Bài tập &rsaquo; Thực hành</div>
      </div>

      {/* Tabs */}
      <div className="btth-tabs-wrapper mb-4">
        <div className="tabs">
          <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
            <i className="bi bi-list-ul me-2" />
            Danh sách bài tập
          </button>
          <button className={`tab ${activeTab === 'create' ? 'active' : ''}`} onClick={switchToCreate}>
            <i className="bi bi-robot me-2" />
            Tạo bài tập bằng AI
          </button>
          <button className={`tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={switchToQuiz}>
            <i className="bi bi-patch-question me-2" />
            Tạo Quiz AI
            <span className="ms-2 badge" style={{ background: '#fef9c3', color: '#854d0e', fontSize: '10px', padding: '2px 7px', borderRadius: '999px' }}>Mới</span>
          </button>
        </div>
      </div>

      </>
      )}

      {/* Tab: DANH SÁCH */}
      {activeTab === 'list' && (
        <div className="fade-in">
          <DanhSachBaiTapThucHanh
            danhSach={danhSach}
            isLoading={listLoading}
            onRefresh={fetchDanhSach}
            onClickTaoMoi={switchToCreate}
          />
        </div>
      )}

      {/* Tab: TẠO BÀI TẬP (Coding) */}
      {activeTab === 'create' && (
        <div className="fade-in">
          <div className="row">
            <div className="col-12">
              <BoChanPage onBaiHocChange={handleLessonChange} />
            </div>
            <div className="col-12">
              <FormTaoBaiTapAI
                baiHocId={selectedBaiHocId}
                tenBaiHoc={tenBaiHoc}
                isGenerating={practiceState === 'generating'}
                onGenerate={handleGenerate}
              />
              {practiceError && (
                <div className="alert alert-danger mb-4 shadow-sm" style={{ borderRadius: '12px' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  {practiceError}
                </div>
              )}
            </div>
          </div>
          {previewData && (
            <div className="fade-in">
              <StatusSinhAI />
              <PreviewBaiTapAI
                data={previewData}
                editable={true}
                isSaving={practiceState === 'saving'}
                onSave={handleSavePractice}
                onCancel={() => { setPreviewData(null); setPracticeState('idle'); }}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab: TẠO QUIZ AI */}
      {activeTab === 'quiz' && (
        <div className="fade-in">
          {/* Bước 1: Chọn bài học + Bước 2: Form quiz */}
          {(quizState !== 'preview' && quizState !== 'saving') && (
            <div className="row">
              <div className="col-12">
                <BoChanPage onBaiHocChange={handleLessonChange} />
              </div>
              <div className="col-12">
                <FormTaoQuizAI
                  baiHocId={selectedBaiHocId}
                  tenBaiHoc={tenBaiHoc}
                  isGenerating={quizState === 'generating'}
                  onGenerate={handleGenerateQuiz}
                />
                {quizError && (
                  <div className="alert alert-danger mb-4 shadow-sm" style={{ borderRadius: '12px' }}>
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    {quizError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bước 3: Preview Quiz */}
          {(quizState === 'preview' || quizState === 'saving') && quizData && selectedBaiHocId && (
            <div className="fade-in">
              {/* Tiêu đề preview */}
              <div className="d-flex align-items-center gap-3 mb-4 p-4 bg-white rounded-4 shadow-sm border">
                <div className="p-3 rounded-3" style={{ background: '#fef9c3' }}>
                  <i className="bi bi-check-circle-fill text-warning fs-4" />
                </div>
                <div>
                  <h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>AI đã sinh xong quiz!</h5>
                  <p className="m-0 text-muted" style={{ fontSize: '13px' }}>
                    Kiểm tra, chỉnh sửa câu hỏi và đáp án trước khi lưu. Click vào đáp án để chọn đáp án đúng.
                  </p>
                </div>
                <button className="btn btn-light ms-auto" onClick={() => setQuizState('idle')}>
          <i className="bi bi-arrow-left me-2" /> Quay lại danh sách bài tập
                </button>
              </div>

              <PreviewQuizAI
                data={quizData}
                baiHocId={selectedBaiHocId}
                isSaving={quizState === 'saving'}
                onSave={handleSaveQuiz}
                onCancel={() => { setQuizData(null); setQuizState('idle'); }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
