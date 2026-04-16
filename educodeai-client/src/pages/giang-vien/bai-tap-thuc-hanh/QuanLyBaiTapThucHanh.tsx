import { useState, useCallback, useEffect } from 'react';
import Swal from 'sweetalert2';
import { BaiTapThucHanhService } from '@/services/bai-tap-thuc-hanh.service';
import type {
  GenerateBaiTapThucHanhDTO,
  BaiTapThucHanhData,
  DanhSachBaiTapDTO
} from './BaiTapThucHanhDTO';

import BoChanPage from './BoChanPage';
import FormTaoBaiTapAI from './FormTaoBaiTapAI';
import StatusSinhAI from './StatusSinhAI';
import PreviewBaiTapAI from './PreviewBaiTapAI';
import DanhSachBaiTapThucHanh from './DanhSachBaiTapThucHanh';

import './QuanLyBaiTapThucHanh.css';

type ActiveTab = 'list' | 'create';
type PageState = 'idle' | 'generating' | 'preview' | 'saving';

export default function QuanLyBaiTapThucHanh() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');

  // State quản lý chọn bài học
  const [selectedBaiHocId, setSelectedBaiHocId] = useState<number | null>(null);
  const [tenBaiHoc, setTenBaiHoc] = useState('');

  // State quản lý workflow sinh AI
  const [pageState, setPageState] = useState<PageState>('idle');
  const [previewData, setPreviewData] = useState<BaiTapThucHanhData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    if (activeTab === 'list') {
      fetchDanhSach();
    }
  }, [activeTab, fetchDanhSach]);

  // Handler chuyển đổi Tab
  const switchToCreate = () => {
    setActiveTab('create');
    setPreviewData(null);
    setPageState('idle');
    setErrorMsg(null);
  };

  const handleLessonChange = (id: number | null, title: string) => {
    setSelectedBaiHocId(id);
    setTenBaiHoc(title);
    setPreviewData(null);
    setPageState('idle');
    setErrorMsg(null);
  };

  // Flow: Sinh bài tập
  const handleGenerate = async (dto: GenerateBaiTapThucHanhDTO) => {
    setPageState('generating');
    setErrorMsg(null);
    setPreviewData(null);

    try {
      const res = await BaiTapThucHanhService.generateBaiTap(dto);
      if (res.success) {
        setPreviewData(res.data);
        setPageState('preview');
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      console.error('Lỗi generate:', err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'AI gặp sự cố khi soạn đề. Vui lòng thử lại.');
      setPageState('idle');
    }
  };

  // Flow: Lưu bài tập
  const handleSave = async (updatedData: BaiTapThucHanhData) => {
    if (!selectedBaiHocId) return;
    setPageState('saving');

    try {
      const res = await BaiTapThucHanhService.saveBaiTap(updatedData, selectedBaiHocId);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Lưu thành công!',
          text: 'Bài tập thực hành đã được lưu vào hệ thống.',
          timer: 2000,
          showConfirmButton: false,
        });
        setPreviewData(null);
        setPageState('idle');
        setActiveTab('list');
        fetchDanhSach();
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi lưu',
        text: err?.response?.data?.message || 'Không thể lưu bài tập. Vui lòng thử lại sau.',
      });
      setPageState('preview');
    }
  };

  return (
    <div className="btth-container" style={{ padding: '32px 48px', minHeight: '100vh', background: '#F1F5F9' }}>
      {/* Header Trang */}
      <div className="btth-header mb-4 d-flex justify-content-between align-items-end">
        <div>
          <h2 className="btth-main-title">
            <i className="bi bi-code-square me-2" />
            Quản lý Bài Tập Thực Hành
          </h2>
          <p className="btth-main-subtitle">Thiết kế và soạn thảo bài tập lập trình bằng AI dành riêng cho giảng viên</p>
        </div>
        <div className="btth-breadcrumb">Giảng viên &rsaquo; Bài tập &rsaquo; Thực hành</div>
      </div>

      {/* Tabs Layout */}
      <div className="btth-tabs-wrapper mb-4">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <i className="bi bi-list-ul me-2" />
            Danh sách bài tập
          </button>
          <button
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={switchToCreate}
          >
            <i className="bi bi-robot me-2" />
            Tạo bài tập bằng AI
          </button>
        </div>
      </div>

      {/* Nội dung Tab: DANH SÁCH */}
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

      {/* Nội dung Tab: TẠO MỚI (Flow 3 bước) */}
      {activeTab === 'create' && (
        <div className="fade-in">
          {/* Bước 1 & 2 */}
          <div className="row">
            <div className="col-12">
              <BoChanPage onBaiHocChange={handleLessonChange} />
            </div>
            <div className="col-12">
              <FormTaoBaiTapAI
                baiHocId={selectedBaiHocId}
                tenBaiHoc={tenBaiHoc}
                isGenerating={pageState === 'generating'}
                onGenerate={handleGenerate}
              />
              {errorMsg && (
                <div className="alert alert-danger mb-4 shadow-sm" style={{ borderRadius: '12px' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  {errorMsg}
                </div>
              )}
            </div>
          </div>

          {/* Bước 3: Preview & Status */}
          {previewData && (
            <div className="fade-in">
              <StatusSinhAI />
              <PreviewBaiTapAI
                data={previewData}
                editable={true}
                isSaving={pageState === 'saving'}
                onSave={handleSave}
                onCancel={() => { setPreviewData(null); setPageState('idle'); }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
