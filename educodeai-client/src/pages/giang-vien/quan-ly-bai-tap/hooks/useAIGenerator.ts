import { useState } from 'react';
import Swal from 'sweetalert2';
import { BaiTapThucHanhService } from '@/services/bai-tap-thuc-hanh.service';
import type {
  GenerateBaiTapThucHanhDTO,
  BaiTapThucHanhData,
  GenerateQuizAIDTO,
  QuizAIData,
  CreateQuizDTO,
} from '../types';

export type PageState = 'idle' | 'generating' | 'preview' | 'saving';

export const useAIGenerator = (onSuccess: () => void) => {
  const [selectedBaiHocId, setSelectedBaiHocId] = useState<number | null>(null);
  const [tenBaiHoc, setTenBaiHoc] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Practice State
  const [practiceState, setPracticeState] = useState<PageState>('idle');
  const [previewData, setPreviewData] = useState<BaiTapThucHanhData | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  // Quiz State
  const [quizState, setQuizState] = useState<PageState>('idle');
  const [quizData, setQuizData] = useState<QuizAIData | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  const handleLessonChange = (id: number | null, title: string, language: string) => {
    setSelectedBaiHocId(id);
    setTenBaiHoc(title);
    setSelectedLanguage(language);
    setPreviewData(null);
    setPracticeState('idle');
    setPracticeError(null);
    setQuizData(null);
    setQuizState('idle');
    setQuizError(null);
  };

  const resetState = () => {
    setPreviewData(null);
    setPracticeState('idle');
    setPracticeError(null);
    setQuizData(null);
    setQuizState('idle');
    setQuizError(null);
  };

  const handleGeneratePractice = async (dto: GenerateBaiTapThucHanhDTO) => {
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
        resetState();
        onSuccess();
      } else {
          throw new Error(res.message);
      }
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Lỗi khi lưu', text: err?.response?.data?.message || err?.message || 'Không thể lưu bài tập.' });
      setPracticeState('preview');
    }
  };

  const handleGenerateQuiz = async (dto: GenerateQuizAIDTO) => {
    setQuizState('generating');
    setQuizError(null);
    setQuizData(null);
    try {
      const res = await BaiTapThucHanhService.generateQuiz(dto);
      const payload = res as any;
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
        resetState();
        onSuccess();
      } else {
        throw new Error(raw?.message || 'Lỗi không xác định');
      }
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Lỗi khi lưu Quiz', text: err?.response?.data?.message || err?.message || 'Không thể lưu quiz.' });
      setQuizState('preview');
    }
  };

  return {
    selectedBaiHocId,
    tenBaiHoc,
    selectedLanguage,
    handleLessonChange,
    resetState,
    practice: {
      state: practiceState,
      data: previewData,
      error: practiceError,
      generate: handleGeneratePractice,
      save: handleSavePractice,
      cancel: resetState
    },
    quiz: {
      state: quizState,
      data: quizData,
      error: quizError,
      generate: handleGenerateQuiz,
      save: handleSaveQuiz,
      cancel: resetState
    }
  };
};
