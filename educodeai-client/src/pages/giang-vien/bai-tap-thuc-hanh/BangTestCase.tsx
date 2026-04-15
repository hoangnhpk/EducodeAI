import type { TestCaseDto } from './BaiTapThucHanhDTO';

interface Props {
  testCases: TestCaseDto[];
  onChange: (testCases: TestCaseDto[]) => void;
  editable?: boolean;
}

export default function BangTestCase({ testCases, onChange, editable = true }: Props) {
  const handleAddRow = () => {
    const newTC: TestCaseDto = {
      input: '',
      output: '',
      isHidden: false,
      score: 1,
    };
    onChange([...testCases, newTC]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = testCases.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdate = (index: number, field: keyof TestCaseDto, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-4 border overflow-hidden shadow-sm">
      <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
        <div className="d-flex align-items-center">
           <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
              <i className="bi bi-terminal text-primary fs-5" />
           </div>
           <h5 className="m-0 fw-bold" style={{ color: '#1e293b' }}>
            Bộ test case kiểm thử ({testCases.length})
           </h5>
        </div>
        {editable && (
          <button className="btn btn-primary btn-sm px-4 py-2 shadow-sm" onClick={handleAddRow} style={{ borderRadius: '10px', fontWeight: 600 }}>
            <i className="bi bi-plus-lg me-2" /> Thêm Test Case
          </button>
        )}
      </div>
      <div className="table-responsive">
        <table className="table align-middle table-hover mb-0" style={{ tableLayout: 'fixed' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>
              <th className="ps-4" style={{ width: '38%', fontWeight: 700, borderBottom: '1px solid #f1f5f9' }}>Dữ liệu đầu vào (Input)</th>
              <th style={{ width: '38%', fontWeight: 700, borderBottom: '1px solid #f1f5f9' }}>Kết quả mong đợi (Output)</th>
              <th className="text-center" style={{ width: '110px', fontWeight: 700, borderBottom: '1px solid #f1f5f9' }}>Loại</th>
              <th className="text-center" style={{ width: '85px', fontWeight: 700, borderBottom: '1px solid #f1f5f9' }}>Điểm</th>
              {editable && <th className="text-center" style={{ width: '60px', borderBottom: '1px solid #f1f5f9' }}></th>}
            </tr>
          </thead>
          <tbody>
            {testCases.length === 0 ? (
              <tr>
                <td colSpan={editable ? 5 : 4} className="text-center py-5 text-muted fst-italic">
                  <i className="bi bi-info-circle me-1" /> Chưa có test case nào.
                </td>
              </tr>
            ) : (
              testCases.map((tc, idx) => {
                const outputDisplay = tc.output || tc.expectedOutput || '';
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td className="ps-4">
                      <textarea
                        className="form-control font-monospace"
                        style={{ height: '75px', fontSize: '13px', background: '#FDFDFD', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}
                        value={tc.input}
                        onChange={(e) => handleUpdate(idx, 'input', e.target.value)}
                        disabled={!editable}
                        placeholder="Nhập input..."
                      />
                    </td>
                    <td>
                      <textarea
                        className="form-control font-monospace"
                        style={{ height: '75px', fontSize: '13px', background: '#F8FAFC', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}
                        value={outputDisplay}
                        onChange={(e) => handleUpdate(idx, 'output', e.target.value)}
                        disabled={!editable}
                        placeholder="Output mong đợi..."
                      />
                    </td>
                    <td className="text-center">
                      <select
                        className="form-select form-select-sm"
                        style={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        value={tc.isHidden ? 'Hidden' : 'Public'}
                        onChange={(e) => handleUpdate(idx, 'isHidden', e.target.value === 'Hidden')}
                        disabled={!editable}
                      >
                        <option value="Public">Công khai</option>
                        <option value="Hidden">Ẩn</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        className="form-control form-control-sm text-center fw-bold"
                        style={{ fontSize: '13px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#0ea5e9' }}
                        value={tc.score}
                        onChange={(e) => handleUpdate(idx, 'score', Number(e.target.value))}
                        disabled={!editable}
                      />
                    </td>
                    {editable && (
                      <td className="text-center pe-3">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm border-0"
                          style={{ background: 'transparent' }}
                          onClick={() => handleRemoveRow(idx)}
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {testCases.length > 0 && (
         <div className="card-footer bg-white py-2 px-4 border-0 d-flex justify-content-end align-items-center gap-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
               Tổng điểm: <strong style={{ color: '#0ea5e9', fontSize: '14px' }}>{testCases.reduce((sum, tc) => sum + (tc.score || 0), 0)}</strong>
            </span>
            <span style={{ height: '12px', width: '1px', background: '#e2e8f0' }}></span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
               Số test case: <strong>{testCases.length}</strong>
            </span>
         </div>
      )}
    </div>
  );
}
