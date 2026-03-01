import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axiosClient from '@/configs/axios'

// Interfaces
interface TestCase {
    input: string;
    expected: string;
}

interface DuLieuIDE {
    tieuDe: string;
    moTa: string;
    ngonNgu: string; // csharp, python, cpp...
    templateCode: string;
    testCases: TestCase[];
}

interface BaiTapIDEProps {
    duLieu: DuLieuIDE;
    khiHoanThanh?: (phanTram: number, daDat: boolean) => void;
}

export const BaiTapIDE: React.FC<BaiTapIDEProps> = ({ duLieu, khiHoanThanh }) => {
    // States
    const [code, setCode] = useState<string>(duLieu.templateCode);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
    // Lưu kết quả test: mảng các object chứa status và actual output
    const [testResults, setTestResults] = useState<{status: 'idle' | 'running' | 'pass' | 'fail', output: string}[]>(
        duLieu.testCases.map(() => ({ status: 'idle', output: '' }))
    );

    // Hàm gọi API chạy code
    const handleRunCode = async () => {
        setIsSubmitting(true);
        
        // Reset trạng thái các tab thành running
        setTestResults(duLieu.testCases.map(() => ({ status: 'running', output: 'Đang chờ máy chủ biên dịch...' })));

        let passCount = 0;
        const newResults = [...testResults];

        // Lặp qua từng test case để gọi Backend
        for (let i = 0; i < duLieu.testCases.length; i++) {
            try {
                // Gọi endpoint /api/BaiTap/chay-code
                const response: any = await axiosClient.post('/api/BaiTap/chay-code', {
                    NgonNgu: duLieu.ngonNgu,
                    Code: code,
                    Input: duLieu.testCases[i].input
                });

                const data = response.data as any;
                const actualOutput = data.ketQuaInRa ? data.ketQuaInRa.trim() : (data.loi || "Không có dữ liệu trả về").trim();
                const expectedOutput = duLieu.testCases[i].expected.trim();

                if (data.thanhCong && actualOutput === expectedOutput) {
                    newResults[i] = { status: 'pass', output: actualOutput };
                    passCount++;
                } else {
                    newResults[i] = { status: 'fail', output: actualOutput };
                }
            } catch (error) {
                newResults[i] = { status: 'fail', output: 'Lỗi kết nối máy chủ' };
            }
            
            // Cập nhật giao diện ngay lập tức sau mỗi test case
            setTestResults([...newResults]);
        }

        setIsSubmitting(false);

        // Lưu kết quả (Nếu đúng hết thì đạt 100%)
        if (khiHoanThanh) {
            const phanTram = (passCount / duLieu.testCases.length) * 100;
            khiHoanThanh(phanTram, passCount === duLieu.testCases.length);
        }
    };

    return (
        <div className="cp-ide-wrapper">
            {/* CỘT TRÁI: YÊU CẦU BÀI TẬP */}
            <div className="cp-ide-problem-col">
                <div className="cp-ide-problem-header">
                    <i className="fas fa-book-open" style={{ color: '#f69050', marginRight: '8px' }}></i>
                    Yêu cầu bài tập
                </div>
                <div className="cp-ide-problem-content">
                    <h3>{duLieu.tieuDe}</h3>
                    <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                        <i className="far fa-clock"></i> Thực hành lập trình
                    </div>
                    
                    <div dangerouslySetInnerHTML={{ __html: duLieu.moTa }} />
                    
                    {duLieu.testCases.length > 0 && (
                        <>
                            <p><strong>Ví dụ khi nhập:</strong></p>
                            <div className="cp-example-box">{duLieu.testCases[0].input}</div>
                            <p><strong>Kết quả đầu ra sẽ là:</strong></p>
                            <div className="cp-example-box">{duLieu.testCases[0].expected}</div>
                        </>
                    )}
                </div>
            </div>

            {/* CỘT PHẢI: GÕ CODE & CHẠY TEST */}
            <div className="cp-ide-code-col">
                <div className="cp-ide-editor-area">
                    <div className="cp-ide-editor-header">
                        <span><i className="fas fa-code"></i> Code Editor ({duLieu.ngonNgu})</span>
                        <div 
                            style={{ fontSize: '0.8rem', opacity: 0.7, cursor: 'pointer' }} 
                            onClick={() => setCode(duLieu.templateCode)}
                        >
                            <i className="fas fa-undo"></i> Reset
                        </div>
                    </div>
                    
                    {/* Monaco Editor siêu đẹp */}
                    <div style={{ flex: 1 }}>
                        <Editor
                            height="100%"
                            language={duLieu.ngonNgu === 'c++' ? 'cpp' : duLieu.ngonNgu}
                            theme="vs-dark"
                            value={code}
                            onChange={(value: string | undefined) => setCode(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                wordWrap: "on"
                            }}
                        />
                    </div>
                </div>

                <div className="cp-ide-test-area">
                    <div className="cp-test-tabs-header">
                        <div className="cp-test-tab-list">
                            {duLieu.testCases.map((_, idx) => (
                                <button 
                                    key={idx}
                                    className={`cp-test-tab-btn ${activeTab === idx ? 'active' : ''}`}
                                    onClick={() => setActiveTab(idx)}
                                >
                                    {/* Icon trạng thái trên Tab */}
                                    {testResults[idx].status === 'pass' && <i className="fas fa-check" style={{ color: '#16a34a', marginRight: 4 }}></i>}
                                    {testResults[idx].status === 'fail' && <i className="fas fa-times" style={{ color: '#dc2626', marginRight: 4 }}></i>}
                                    {testResults[idx].status === 'running' && <i className="fas fa-circle-notch fa-spin" style={{ color: '#f69050', marginRight: 4 }}></i>}
                                    Bài kiểm tra {idx + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            className="cp-run-float-btn" 
                            onClick={handleRunCode}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <><i className="fas fa-circle-notch fa-spin"></i> ĐANG CHẠY</> : 'KIỂM TRA'}
                        </button>
                    </div>

                    <div className="cp-test-content-wrap">
                        {duLieu.testCases.map((tc, idx) => (
                            <div key={idx} className={`cp-test-pane ${activeTab === idx ? 'active' : ''}`}>
                                <div className="cp-io-label">Đầu vào:</div>
                                <div className="cp-io-box">{tc.input || "Không có đầu vào"}</div>
                                
                                <div className="cp-io-label">Đầu ra mong muốn:</div>
                                <div className="cp-io-box">{tc.expected}</div>
                                
                                {/* Hiện kết quả sau khi bấm chạy */}
                                {testResults[idx].status !== 'idle' && (
                                    <div style={{ marginTop: 10 }}>
                                        <div className="cp-io-label">Kết quả thực tế:</div>
                                        <div 
                                            className="cp-io-box" 
                                            style={{ 
                                                borderLeft: testResults[idx].status === 'pass' ? '4px solid #16a34a' 
                                                          : testResults[idx].status === 'fail' ? '4px solid #dc2626' : 'none' 
                                            }}
                                        >
                                            {testResults[idx].output}
                                        </div>
                                        
                                        {/* Status Text */}
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                                            {testResults[idx].status === 'pass' && <span style={{ color: '#16a34a' }}><i className="fas fa-check"></i> Chính xác</span>}
                                            {testResults[idx].status === 'fail' && <span style={{ color: '#dc2626' }}><i className="fas fa-times"></i> Sai kết quả / Lỗi</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};