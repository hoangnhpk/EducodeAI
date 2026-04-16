import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axiosClient from '@/configs/axios'
import Swal from 'sweetalert2';

// Interfaces
interface TestCaseHienThiDTO {
    maTestCase: number;
    inputDuLieu: string;
    outputMongDoi: string;
    laTestAn: boolean;
}

interface BaiTapThucHanhHocVienRenderDTO {
    maBaiTap: number;
    tieuDe: string;
    moTaDeBai: string;
    ngonNgu: string;
    mucDo: string;
    goiY: string | null;
    testCases: TestCaseHienThiDTO[];
}

interface TestCaseResultDTO {
    maTestCase: number;
    isPassed: boolean;
    actualOutput: string;
    expectedOutput: string;
    input: string;
    laTestAn: boolean;
    diem: number;
    errorMessage: string;
}

interface KetQuaSubmitDTO {
    thanhCong: boolean;
    passedAll: boolean;
    tongDiem: number;
    results: TestCaseResultDTO[];
}

interface BaiTapIDEProps {
    maBaiTap: number;
    khiHoanThanh?: (phanTram: number, daDat: boolean) => void;
}

export const BaiTapIDE: React.FC<BaiTapIDEProps> = ({ maBaiTap, khiHoanThanh }) => {
    // States
    const [duLieu, setDuLieu] = useState<BaiTapThucHanhHocVienRenderDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [code, setCode] = useState<string>('');
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Lưu kết quả test: mảng các object chứa status và actual output
    const [testResults, setTestResults] = useState<{ status: 'idle' | 'running' | 'pass' | 'fail', output: string, error?: string }[]>([]);

    useEffect(() => {
        const fetchDuLieu = async () => {
            if (maBaiTap <= 0) {
                setError('Chưa có bài tập thực hành.');
                setLoading(false);
                return;
            }
            try {
                const response = await axiosClient.get(`/api/BaiTap/thuc-hanh/${maBaiTap}`);
                const data = response as BaiTapThucHanhHocVienRenderDTO;
                setDuLieu(data);

                let defaultCode = '';
                const _lang = data.ngonNgu.toLowerCase();
                if (_lang === 'python' || _lang === 'python3') {
                    defaultCode = '# 💡 ĐỌC DỮ LIỆU:\n# - 1 số: n = int(input())\n# - Nhiều số cùng dòng: a, b = map(int, input().split())\n# - Chuỗi: s = input()\n\n';
                } else if (_lang === 'c++' || _lang === 'cpp') {
                    defaultCode = '#include <iostream>\nusing namespace std;\n\nint main() {\n    // cin >> x; để đọc đầu vào\n    \n    return 0;\n}';
                } else if (_lang === 'c') {
                    defaultCode = '#include <stdio.h>\n\nint main() {\n    // scanf("%d", &x); để đọc đầu vào\n    \n    return 0;\n}';
                } else if (_lang === 'c#' || _lang === 'csharp') {
                    defaultCode = 'using System;\n\nclass Program {\n    static void Main() {\n        // Console.ReadLine() để đọc đầu vào\n        \n    }\n}';
                } else if (_lang === 'java') {
                    defaultCode = 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // sc.nextInt(), sc.nextLine() để đọc dữ liệu\n        \n    }\n}';
                } else if (_lang === 'javascript' || _lang === 'js' || _lang === 'nodejs') {
                    defaultCode = '// 💡 Đọc dữ liệu đầu vào (stdin) trong Node.js:\nconst readline = require(\'readline\');\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on(\'line\', line => lines.push(line.trim()));\nrl.on(\'close\', () => {\n    // Xử lý dữ liệu ở đây\n    const n = parseInt(lines[0]);\n    console.log(n);\n});\n';
                } else if (_lang === 'typescript' || _lang === 'ts') {
                    defaultCode = 'import * as readline from \'readline\';\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines: string[] = [];\nrl.on(\'line\', (line: string) => lines.push(line.trim()));\nrl.on(\'close\', () => {\n    const n = parseInt(lines[0]);\n    console.log(n);\n});\n';
                } else if (_lang === 'go' || _lang === 'golang') {
                    defaultCode = 'package main\n\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\n\nfunc main() {\n\treader := bufio.NewReader(os.Stdin)\n\tvar n int\n\tfmt.Fscan(reader, &n)\n\tfmt.Println(n)\n}';
                } else if (_lang === 'rust') {
                    defaultCode = 'use std::io::{self, BufRead};\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    let line = lines.next().unwrap().unwrap();\n    println!("{}", line);\n}';
                } else if (_lang === 'ruby') {
                    defaultCode = '# gets.chomp để đọc 1 dòng, gets.split.map(&:to_i) để đọc nhiều số\nn = gets.chomp.to_i\nputs n\n';
                } else if (_lang === 'php') {
                    defaultCode = '<?php\n$n = trim(fgets(STDIN));\necho $n . "\\n";\n';
                } else if (_lang === 'kotlin') {
                    defaultCode = 'fun main() {\n    val n = readLine()!!.trim().toInt()\n    println(n)\n}';
                } else if (_lang === 'swift') {
                    defaultCode = 'import Foundation\nlet n = Int(readLine()!)!\nprint(n)\n';
                } else if (_lang === 'dart') {
                    defaultCode = 'import \'dart:io\';\n\nvoid main() {\n    final n = int.parse(stdin.readLineSync()!);\n    print(n);\n}';
                } else if (_lang === 'r') {
                    defaultCode = 'n <- as.integer(readLines("stdin", n=1))\ncat(n, "\\n")\n';
                } else if (_lang === 'scala') {
                    defaultCode = 'import scala.io.StdIn._\n\nobject Main extends App {\n    val n = readInt()\n    println(n)\n}';
                } else {
                    defaultCode = '// Viết mã của bạn tại đây\n';
                }

                setCode(defaultCode);
                setTestResults(data.testCases.map(() => ({ status: 'idle', output: '' })));
            } catch (err: unknown) {
                const error = err as any;
                setError(error.response?.data?.message || 'Lỗi khi tải bài tập.');
            } finally {
                setLoading(false);
            }
        };

        void fetchDuLieu();
    }, [maBaiTap]);

    // Hàm gọi API chạy code
    const handleRunCode = async () => {
        if (!duLieu) return;
        if (!code.trim()) {
            Swal.fire('Lỗi', 'Vui lòng viết code trước khi kiểm tra.', 'warning');
            return;
        }

        setIsSubmitting(true);

        // Cập nhật giao diện: Tất cả tab chuyển sang running
        setTestResults(duLieu.testCases.map(() => ({ status: 'running', output: 'Đang gửi code lên máy chủ...' })));

        try {
            // Nộp toàn bộ code lên Backend. Backend tự lặp qua các testcases
            const response = await axiosClient.post(`/api/BaiTap/thuc-hanh/${maBaiTap}/submit`, {
                Code: code,
                NgonNgu: duLieu.ngonNgu
            });

            const data = response as KetQuaSubmitDTO;

            if (data.thanhCong) {
                // Map kết quả về hiển thị
                const newResults = data.results.map(r => ({
                    status: r.isPassed ? 'pass' as const : 'fail' as const,
                    output: r.actualOutput || 'Trống',
                    error: r.errorMessage
                }));
                setTestResults(newResults);

                const passCount = data.results.filter(r => r.isPassed).length;

                if (data.passedAll) {
                    if (khiHoanThanh) {
                        const phanTram = (passCount / duLieu.testCases.length) * 100;
                        khiHoanThanh(phanTram, true);
                    }
                    Swal.fire({ title: 'Thành công!', text: 'Hoàn thành bài tập.', icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                } else {
                    Swal.fire({ title: 'Sai kết quả!', text: 'Kiểm tra lại code của bạn.', icon: 'error', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                }
            } else {
                Swal.fire({ title: 'Lỗi', text: 'Lỗi biên dịch máy chủ', icon: 'error', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                setTestResults(duLieu.testCases.map(() => ({ status: 'fail', output: 'Lỗi chấm điểm', error: 'Lỗi Call IDE' })));
            }

        } catch (err: unknown) {
            const error = err as any;
            Swal.fire({ title: 'Lỗi API', text: error.response?.data?.message || 'Gặp sự cố khi chấm điểm.', icon: 'error', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
            setTestResults(duLieu.testCases.map(() => ({ status: 'fail', output: 'Lỗi mạng khi gọi API submit.' })));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-4">Đang tải bài tập thực hành...</div>;
    if (error || !duLieu) return <div className="p-4 text-red-500">{error || 'Bài tập không tồn tại.'}</div>;

    return (
        <div className="cp-ide-wrapper">
            {/* CỘT TRÁI: YÊU CẦU BÀI TẬP */}
            <div className="cp-ide-problem-col">
                <div className="cp-ide-problem-header">
                    <i className="fas fa-book-open" style={{ color: '#f69050', marginRight: '8px' }}></i>
                    Yêu cầu bài tập (IDE)
                </div>
                <div className="cp-ide-problem-content">
                    <h3>{duLieu.tieuDe}</h3>
                    <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                        <i className="far fa-clock"></i> Mức độ: <span style={{ fontWeight: 'bold' }}>{duLieu.mucDo || 'Chưa phân loại'}</span>
                        <span style={{ marginLeft: 16 }}><i className="fas fa-code"></i> Ngôn ngữ: <span style={{ fontWeight: 'bold' }}>{duLieu.ngonNgu}</span></span>
                    </div>

                    <div dangerouslySetInnerHTML={{ __html: duLieu.moTaDeBai }} />

                    {duLieu.testCases.length > 0 && (
                        <>
                            <p><strong>Ví dụ khi nhập:</strong></p>
                            <div className="cp-example-box" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{duLieu.testCases[0].inputDuLieu}</div>
                            <p><strong>Kết quả đầu ra mong đợi:</strong></p>
                            <div className="cp-example-box" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{duLieu.testCases[0].outputMongDoi}</div>
                        </>
                    )}

                    {duLieu.goiY && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', borderLeft: '4px solid #fcebb6', background: '#fffbeb', borderRadius: 4 }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#b45309', fontSize: '0.95rem' }}><i className="fas fa-lightbulb"></i> Gợi ý</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350f' }}>{duLieu.goiY}</p>
                        </div>
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
                            onClick={() => setCode('')}
                        >
                            <i className="fas fa-undo"></i> Reset
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div style={{ flex: 1 }}>
                        <Editor
                            height="100%"
                            language={duLieu.ngonNgu === 'c++' || duLieu.ngonNgu === 'c' ? 'cpp' : (duLieu.ngonNgu === 'c#' ? 'csharp' : duLieu.ngonNgu)}
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
                                    {testResults[idx]?.status === 'pass' && <i className="fas fa-check" style={{ color: '#16a34a', marginRight: 4 }}></i>}
                                    {testResults[idx]?.status === 'fail' && <i className="fas fa-times" style={{ color: '#dc2626', marginRight: 4 }}></i>}
                                    {testResults[idx]?.status === 'running' && <i className="fas fa-circle-notch fa-spin" style={{ color: '#f69050', marginRight: 4 }}></i>}
                                    Bài kiểm tra {idx + 1}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="cp-run-float-btn"
                                style={{ background: '#64748b' }}
                                onClick={() => {
                                    setTestResults(duLieu.testCases.map(() => ({ status: 'idle', output: '' })));
                                    setActiveTab(0);
                                }}
                                disabled={isSubmitting}
                            >
                                <i className="fas fa-redo"></i> LÀM LẠI
                            </button>
                            <button
                                className="cp-run-float-btn"
                                onClick={handleRunCode}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <><i className="fas fa-circle-notch fa-spin"></i> ĐANG CHẤM</> : 'NỘP BÀI'}
                            </button>
                        </div>
                    </div>

                    <div className="cp-test-content-wrap">
                        {duLieu.testCases.map((tc, idx) => (
                            <div key={idx} className={`cp-test-pane ${activeTab === idx ? 'active' : ''}`}>
                                {tc.laTestAn ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                        <i className="fas fa-lock" style={{ fontSize: '2rem', marginBottom: '1rem', color: '#94a3b8' }}></i>
                                        <h4>Test case ẩn</h4>
                                        <p>Thông số đầu vào và đầu ra đã được giấu để đảm bảo bạn không in cứng kết quả.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="cp-io-label">Đầu vào:</div>
                                        <div className="cp-io-box" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{tc.inputDuLieu || "Không có đầu vào"}</div>

                                        <div className="cp-io-label">Đầu ra mong đợi:</div>
                                        <div className="cp-io-box" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{tc.outputMongDoi}</div>
                                    </>
                                )}

                                {/* Hiện kết quả sau khi bấm chạy */}
                                {testResults[idx]?.status !== 'idle' && (
                                    <div style={{ marginTop: 10 }}>
                                        <div className="cp-io-label">Kết quả thực tế (Máy chủ trả về):</div>
                                        <div
                                            className="cp-io-box"
                                            style={{
                                                borderLeft: testResults[idx].status === 'pass' ? '4px solid #16a34a'
                                                    : testResults[idx].status === 'fail' ? '4px solid #dc2626' : 'none',
                                                whiteSpace: 'pre-wrap', fontFamily: 'monospace'
                                            }}
                                        >
                                            {testResults[idx].output}
                                        </div>

                                        {testResults[idx].error && (
                                            <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: 4 }}>
                                                <strong>Lỗi biên dịch: </strong> {testResults[idx].error}
                                            </div>
                                        )}

                                        {/* Status Text */}
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginTop: 8 }}>
                                            {testResults[idx].status === 'pass' && <span style={{ color: '#16a34a' }}><i className="fas fa-check"></i> Chúc mừng! Kết quả trùng khớp hoàn toàn.</span>}
                                            {testResults[idx].status === 'fail' && <span style={{ color: '#dc2626' }}><i className="fas fa-times"></i> Rất tiếc, kết quả không khớp hoặc code bị lỗi.</span>}
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
