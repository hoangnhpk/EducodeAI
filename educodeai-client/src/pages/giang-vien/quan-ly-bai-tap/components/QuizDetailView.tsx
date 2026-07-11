import React from 'react';

interface RawQuestion {
  Id?: number;
  NoiDung?: string;
  LuaChon?: string[];
  DapAnDung?: string;
  GiaiThich?: string;
  cauHoi?: string;
  dapAnA?: string;
  dapAnB?: string;
  dapAnC?: string;
  dapAnD?: string;
  dapAnDung?: string;
  giaiThich?: string;
}

interface Props {
  data: {
    tenBaiTap?: string;
    moTa?: string;
    tenKhoaHoc?: string;
    tenChuong?: string;
    tenBaiHoc?: string;
    thoiGianLamBai?: number;
    diemCanDat?: number;
    choPhepLamLai?: boolean;
    daoCauHoi?: boolean;
    danhSachCauHoi?: RawQuestion[];
  };
}

const getQuestionText = (q: RawQuestion) => q.cauHoi || q.NoiDung || '';
const getCorrectAnswer = (q: RawQuestion) => (q.dapAnDung || q.DapAnDung || '').toUpperCase();
const getExplanation = (q: RawQuestion) => q.giaiThich || q.GiaiThich || '';

const getOptions = (q: RawQuestion) => {
  if (Array.isArray(q.LuaChon) && q.LuaChon.length > 0) {
    return q.LuaChon.map((text, index) => ({ label: ['A', 'B', 'C', 'D'][index] || String(index + 1), text }));
  }

  return [
    { label: 'A', text: q.dapAnA || '' },
    { label: 'B', text: q.dapAnB || '' },
    { label: 'C', text: q.dapAnC || '' },
    { label: 'D', text: q.dapAnD || '' },
  ].filter(x => x.text);
};

const QuizDetailView: React.FC<Props> = ({ data }) => {
  const danhSachCauHoi = Array.isArray(data?.danhSachCauHoi) ? data.danhSachCauHoi : [];

  return (
    <div className="quiz-detail-view" style={{ padding: '24px', background: '#f8fafc' }}>
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <div className="d-flex align-items-center mb-2">
          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-3">
            <i className="bi bi-patch-question fs-4" />
          </div>
          <div>
            <h4 className="m-0 fw-bold" style={{ color: '#1e293b' }}>{data?.tenBaiTap || 'Chi tiết Quiz'}</h4>
            {(data?.tenKhoaHoc || data?.tenChuong || data?.tenBaiHoc) && (
              <div className="text-muted mt-1" style={{ fontSize: '13px' }}>
                {[data.tenKhoaHoc, data.tenChuong, data.tenBaiHoc].filter(Boolean).join(' › ')}
              </div>
            )}
          </div>
        </div>

        {data?.moTa && <div className="mt-3 text-muted" style={{ fontSize: '15px', lineHeight: '1.6' }}>{data.moTa}</div>}

        <div className="mt-3 d-flex gap-2 flex-wrap">
          <span className="badge bg-light text-dark border px-3 py-2" style={{ borderRadius: '10px' }}>
            <i className="bi bi-list-ol me-2" />{danhSachCauHoi.length} câu hỏi
          </span>
          {data?.thoiGianLamBai !== undefined && (
            <span className="badge bg-light text-dark border px-3 py-2" style={{ borderRadius: '10px' }}>
              <i className="bi bi-clock me-2" />{data.thoiGianLamBai} phút
            </span>
          )}
          {data?.diemCanDat !== undefined && (
            <span className="badge bg-light text-dark border px-3 py-2" style={{ borderRadius: '10px' }}>
              <i className="bi bi-trophy me-2" />Đạt từ {data.diemCanDat}%
            </span>
          )}
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2" style={{ borderRadius: '10px' }}>
            <i className="bi bi-tag me-2" />Loại: Trắc nghiệm
          </span>
        </div>
      </div>

      {danhSachCauHoi.length === 0 ? (
        <div className="bg-white p-4 rounded-4 shadow-sm border text-center text-muted">
          Không tìm thấy dữ liệu câu hỏi của quiz này.
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {danhSachCauHoi.map((q, index) => {
            const correct = getCorrectAnswer(q);
            const options = getOptions(q);
            return (
              <div key={q.Id || index} className="bg-white rounded-4 shadow-sm border overflow-hidden">
                <div className="px-4 py-3 bg-light bg-opacity-50 border-bottom d-flex align-items-center">
                  <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '28px', height: '28px', fontSize: '14px', fontWeight: 700 }}>
                    {index + 1}
                  </div>
                  <span className="fw-bold text-uppercase" style={{ fontSize: '13px', color: '#64748b', letterSpacing: '0.05em' }}>Câu hỏi {index + 1}</span>
                </div>

                <div className="p-4">
                  <div className="mb-4" style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', lineHeight: '1.6' }}>
                    {getQuestionText(q) || '(Chưa có nội dung câu hỏi)'}
                  </div>

                  <div className="row g-3">
                    {options.map((opt) => {
                      const isCorrect = correct === opt.label;
                      return (
                        <div key={opt.label} className="col-md-6">
                          <div className={`p-3 rounded-3 border d-flex align-items-center gap-3 ${isCorrect ? 'bg-success bg-opacity-10 border-success border-opacity-25' : 'bg-white'}`}>
                            <div className={`fw-bold rounded-circle d-flex align-items-center justify-content-center ${isCorrect ? 'bg-success text-white' : 'bg-light text-secondary border'}`} style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                              {opt.label}
                            </div>
                            <div className={isCorrect ? 'fw-bold text-success' : 'text-dark'}>{opt.text}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25">
                    <div className="d-flex align-items-start gap-2">
                      <i className="bi bi-lightbulb text-warning fs-5" />
                      <div>
                        <div className="fw-bold text-warning-emphasis mb-1" style={{ fontSize: '14px' }}>Giải thích & đáp án:</div>
                        <div style={{ fontSize: '14px', color: '#92400e' }}>
                          <span className="fw-bold me-2">Đáp án đúng: {correct || 'Chưa có'}</span>
                          <span className="text-secondary mx-2">|</span>
                          {getExplanation(q) || 'Không có giải thích cho câu hỏi này.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizDetailView;
