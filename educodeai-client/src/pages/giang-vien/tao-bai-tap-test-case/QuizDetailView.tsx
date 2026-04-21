import React from 'react';

interface Question {
  cauHoi: string;
  dapAnA: string;
  dapAnB: string;
  dapAnC: string;
  dapAnD: string;
  dapAnDung: string;
  giaiThich: string;
}

interface Props {
  data: {
    tenBaiTap: string;
    moTa?: string;
    danhSachCauHoi: Question[];
  };
}

const QuizDetailView: React.FC<Props> = ({ data }) => {
  const { tenBaiTap, moTa, danhSachCauHoi } = data;

  return (
    <div className="quiz-detail-view" style={{ padding: '24px', background: '#f8fafc' }}>
      {/* Quiz Header Info */}
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <div className="d-flex align-items-center mb-2">
            <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-3">
                <i className="bi bi-patch-question fs-4" />
            </div>
            <h4 className="m-0 fw-bold" style={{ color: '#1e293b' }}>{tenBaiTap}</h4>
        </div>
        {moTa && (
            <div className="mt-3 text-muted" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                {moTa}
            </div>
        )}
        <div className="mt-3 d-flex gap-3">
            <span className="badge bg-light text-dark border px-3 py-2" style={{ borderRadius: '10px' }}>
                <i className="bi bi-list-ol me-2" />
                {danhSachCauHoi.length} câu hỏi
            </span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2" style={{ borderRadius: '10px' }}>
                <i className="bi bi-tag me-2" />
                Loại: Trắc nghiệm
            </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="d-flex flex-column gap-4">
        {danhSachCauHoi.map((q, index) => (
          <div key={index} className="bg-white rounded-4 shadow-sm border overflow-hidden">
            {/* Question Header */}
            <div className="px-4 py-3 bg-light bg-opacity-50 border-bottom d-flex align-items-center">
                <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '28px', height: '28px', fontSize: '14px', fontWeight: 700 }}>
                    {index + 1}
                </div>
                <span className="fw-bold text-uppercase" style={{ fontSize: '13px', color: '#64748b', letterSpacing: '0.05em' }}>Câu hỏi {index + 1}</span>
            </div>

            <div className="p-4">
              <div className="mb-4" style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', lineHeight: '1.6' }}>
                {q.cauHoi}
              </div>

              {/* Options Grid */}
              <div className="row g-3">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const isCorrect = q.dapAnDung === opt;
                  const optionText = (q as any)[`dapAn${opt}`];
                  
                  return (
                    <div key={opt} className="col-md-6">
                      <div className={`p-3 rounded-3 border d-flex align-items-center gap-3 ${isCorrect ? 'bg-success bg-opacity-10 border-success border-opacity-25' : 'bg-white'}`} style={{ transition: 'all 0.2s' }}>
                        <div className={`fw-bold rounded-circle d-flex align-items-center justify-content-center ${isCorrect ? 'bg-success text-white' : 'bg-light text-secondary border'}`} style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                          {opt}
                        </div>
                        <div className={isCorrect ? 'fw-bold text-success' : 'text-dark'}>
                          {optionText}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Box */}
              <div className="mt-4 p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25">
                <div className="d-flex align-items-start gap-2">
                    <i className="bi bi-lightbulb text-warning fs-5" />
                    <div>
                        <div className="fw-bold text-warning-emphasis mb-1" style={{ fontSize: '14px' }}>Giải thích & Đáp án:</div>
                        <div style={{ fontSize: '14px', color: '#92400e' }}>
                            <span className="fw-bold me-2">Đáp án đúng: {q.dapAnDung}</span>
                            <span className="text-secondary mx-2">|</span>
                            {q.giaiThich || 'Không có giải thích cho câu hỏi này.'}
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizDetailView;
