import { useState, useEffect } from 'react';
import type { BaiTapThucHanhData, TestCaseDto } from '../types';
import BangTestCase from './BangTestCase';

interface Props {
  data: BaiTapThucHanhData;
  onSave?: (updated: BaiTapThucHanhData) => void;
  onCancel?: () => void;
  isSaving?: boolean;
  editable?: boolean;
}

export default function PreviewBaiTapAI({ data, onSave, onCancel, isSaving, editable = true }: Props) {
  const [localData, setLocalData] = useState<BaiTapThucHanhData>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleMetaUpdate = (field: keyof BaiTapThucHanhData['metadata'], value: any) => {
    setLocalData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value }
    }));
  };

  const handleProblemUpdate = (field: keyof BaiTapThucHanhData['problemContent'], value: any) => {
    setLocalData(prev => ({
      ...prev,
      problemContent: { ...prev.problemContent, [field]: value }
    }));
  };


  const handleSolutionUpdate = (field: keyof BaiTapThucHanhData['solution'], value: any) => {
    setLocalData(prev => ({
      ...prev,
      solution: { ...prev.solution, [field]: value }
    }));
  };

  const handleTestCasesChange = (testCases: TestCaseDto[]) => {
    setLocalData(prev => ({
      ...prev,
      evaluation: { ...prev.evaluation, testCases }
    }));
  };

  const getDifficultyBadge = (d: string) => {
    const cls = d === 'Dễ' ? 'btth-badge-easy' : d === 'Khó' ? 'btth-badge-hard' : 'btth-badge-medium';
    return <span className={`badge ${cls}`}>{d}</span>;
  };

  return (
    <div style={{ background: 'var(--bg-main)' }}>
      {/* 
          REMOVED OLD HEADER: 
          Previously had a bg-white sticky-top header here. 
          Now the header is managed by the parent Modal for a unified experience.
      */}

      <div className="p-4 pb-5 p-lg-5 pb-lg-5">
        <div className="d-flex flex-column gap-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Metadata Row - Lean & Clean */}
          <div className="bg-white p-4 rounded-4 shadow-sm d-flex align-items-center gap-4 flex-wrap border">
            <div style={{ flex: 1, minWidth: '350px' }}>
              <label className="text-uppercase fw-bold mb-1" style={{ fontSize: '11px', color: 'var(--text-light)', letterSpacing: '0.05em' }}>Tiêu đề bài tập</label>
              <input
                className="form-control border-0 p-0 fw-bold"
                style={{ fontSize: '22px', boxShadow: 'none', background: 'transparent', color: 'var(--text-main)' }}
                value={localData?.metadata?.title || ''}
                onChange={(e) => handleMetaUpdate('title', e.target.value)}
                disabled={!editable}
                placeholder="Nhập tiêu đề bài tập..."
              />
            </div>
            <div className="d-flex gap-4 border-start ps-4 align-items-center">
              <div>
                <label className="text-uppercase fw-bold mb-1 d-block" style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Ngôn ngữ</label>
                <div className="px-3 py-2 fw-bold text-center" style={{ borderRadius: 'var(--radius-md)', fontSize: '14px', minWidth: '80px', background: 'var(--primary-soft)', color: 'var(--primary-dark)' }}>
                  {localData?.metadata?.language}
                </div>
              </div>
              <div style={{ minWidth: '120px' }}>
                <label className="text-uppercase fw-bold mb-1 d-block" style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Mức độ</label>
                {getDifficultyBadge(localData?.metadata?.difficulty || 'Dễ')}
              </div>
            </div>
          </div>

          {/* 1. Problem Description - Full Width */}
          <div className="bg-white p-4 rounded-4 shadow-sm border">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 text-success p-2 rounded-3 me-3">
                  <i className="bi bi-markdown fs-5" />
                </div>
                <h5 className="m-0 fw-bold" style={{ color: 'var(--text-main)' }}>Mô tả đề bài</h5>
              </div>
              <textarea
                className="form-control border-0"
                style={{ minHeight: '400px', fontSize: '16px', lineHeight: '1.8', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '20px', color: 'var(--text-main)' }}
                value={localData?.problemContent?.description || ''}
                onChange={(e) => handleProblemUpdate('description', e.target.value)}
                disabled={!editable}
                placeholder="Nội dung đề bài chi tiết bằng Markdown..."
              />
          </div>

          {/* 2. Model Solution - Full Width */}
          <div className="bg-white p-4 rounded-4 shadow-sm border">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-3">
                  <i className="bi bi-code-square fs-5" />
                </div>
                <h5 className="m-0 fw-bold" style={{ color: 'var(--text-main)' }}>Lời giải mẫu</h5>
              </div>
              <textarea
                className="form-control font-monospace border-0"
                style={{ height: '350px', fontSize: '14px', background: '#0f172a', color: '#38bdf8', padding: '20px', borderRadius: '12px', lineHeight: '1.6' }}
                value={localData?.solution?.code || ''}
                onChange={(e) => handleSolutionUpdate('code', e.target.value)}
                disabled={!editable}
                placeholder="Dán mã nguồn lời giải vào đây..."
              />
          </div>

          {/* 3. Explanation/Hints - Full Width */}
          <div className="bg-white p-4 rounded-4 shadow-sm border">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3 me-3">
                  <i className="bi bi-lightbulb fs-5" />
                </div>
                <h5 className="m-0 fw-bold" style={{ color: 'var(--text-main)' }}>Gợi ý & Giải thích thuật toán</h5>
              </div>
              <textarea
                className="form-control border-0"
                style={{ height: '220px', fontSize: '15px', background: 'var(--warning-soft)', color: 'var(--warning-strong)', borderRadius: 'var(--radius-md)', padding: '20px', lineHeight: '1.6' }}
                value={localData?.solution?.explanation || ''}
                onChange={(e) => handleSolutionUpdate('explanation', e.target.value)}
                disabled={!editable}
                placeholder="Giải thích các bước giải hoặc gợi ý cho học sinh..."
              />
          </div>

          {/* 4. Test Cases - Full Width */}
          <BangTestCase
            testCases={localData?.evaluation?.testCases || []}
            onChange={handleTestCasesChange}
            editable={editable}
          />

          {/* Botton Action bar - only if editable */}
          {editable && (
            <div className="d-flex justify-content-end gap-3 pt-4 border-top">
              <button className="btn btn-light px-5 py-3 fw-bold" onClick={() => (onCancel && onCancel())} disabled={isSaving} style={{ borderRadius: '12px' }}>Hủy bỏ</button>
              <button className="btn btn-primary px-5 py-3 fw-bold shadow-sm" onClick={() => (onSave && onSave(localData))} disabled={isSaving} style={{ borderRadius: '12px' }}>
                {isSaving ? 'Đang lưu bài tập...' : 'Lưu bài tập vào hệ thống'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
