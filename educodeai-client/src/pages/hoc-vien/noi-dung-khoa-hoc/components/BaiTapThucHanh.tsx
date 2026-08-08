import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import axiosClient from '@/configs/axios';
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
    loiGiaiMau?: string | null;
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

const parseGoiY = (goiY: string | null) => {
    if (!goiY) return { cleanGoiY: null, vars: [] };
    const match = goiY.match(/\[VARS:\s*(.*?)\]/i);
    if (match) {
        const vars = match[1].split(',').map(v => v.trim()).filter(v => v);
        const cleanGoiY = goiY.replace(match[0], '').trim();
        return { cleanGoiY, vars };
    }
    return { cleanGoiY: goiY, vars: [] };
};

const renderFormattedInput = (input: string, vars: string[]) => {
    if (!vars || vars.length === 0 || !input) return input;
    const lines = input.trim().split('\n');
    return (
        <div className="cp-formatted-input">
            {lines.map((line, i) => {
                const varName = vars[i];
                if (varName) {
                    return (
                        <div key={i} className="cp-input-line">
                            <span className="cp-input-var-name">{varName} = </span>
                            <span className="cp-input-value">{line}</span>
                        </div>
                    );
                }
                return <div key={i} className="cp-input-value">{line}</div>;
            })}
        </div>
    );
};

export const BaiTapIDE: React.FC<BaiTapIDEProps> = ({ maBaiTap, khiHoanThanh }) => {
    // States
    const [duLieu, setDuLieu] = useState<BaiTapThucHanhHocVienRenderDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [code, setCode] = useState<string>('');
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [daSai, setDaSai] = useState(false);

    // Lưu kết quả test: mảng các object chứa status và actual output
    const [testResults, setTestResults] = useState<{ status: 'idle' | 'running' | 'pass' | 'fail', output: string, error?: string }[]>([]);

    // AI Code Doctor states
    const [aiDoctorOpen, setAiDoctorOpen] = useState(false);
    const [aiDoctorLoading, setAiDoctorLoading] = useState(false);
    const [aiDoctorResult, setAiDoctorResult] = useState<string | null>(null);
    const aiDoctorRef = useRef<HTMLDivElement>(null);

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

                const { vars: fetchedVars } = parseGoiY(data.goiY);
                let defaultCode = '';
                const _lang = data.ngonNgu.toLowerCase();

                if (_lang === 'python' || _lang === 'python3') {
                    if (fetchedVars.length > 0) {
                        defaultCode = '# 💡 GỢI Ý ĐỌC DỮ LIỆU:\n';
                        fetchedVars.forEach(v => {
                            defaultCode += `${v} = int(input())\n`;
                        });
                        defaultCode += '\n# Viết code xử lý tại đây\n\n';
                    } else {
                        defaultCode = '# 💡 ĐỌC DỮ LIỆU:\n# - 1 số: n = int(input())\n# - Nhiều số cùng dòng: a, b = map(int, input().split())\n# - Chuỗi: s = input()\n\n';
                    }
                } else if (_lang === 'c++' || _lang === 'cpp') {
                    if (fetchedVars.length > 0) {
                        const varDecl = fetchedVars.map(v => `int ${v};`).join(' ');
                        const varCin = fetchedVars.map(v => v).join(' >> ');
                        defaultCode = `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Khai báo và đọc dữ liệu\n    ${varDecl}\n    cin >> ${varCin};\n    \n    // Viết code xử lý tại đây\n    \n    return 0;\n}`;
                    } else {
                        defaultCode = '#include <iostream>\nusing namespace std;\n\nint main() {\n    // cin >> x; để đọc đầu vào\n    \n    return 0;\n}';
                    }
                } else if (_lang === 'c') {
                    defaultCode = '#include <stdio.h>\n\nint main() {\n    // scanf("%d", &x); để đọc đầu vào\n    \n    return 0;\n}';
                } else if (_lang === 'c#' || _lang === 'csharp') {
                    defaultCode = 'using System;\n\nclass Program {\n    static void Main() {\n        // Console.ReadLine() để đọc đầu vào\n        \n    }\n}';
                } else if (_lang === 'java') {
                    if (fetchedVars.length > 0) {
                        let scanCode = '';
                        fetchedVars.forEach(v => {
                            scanCode += `        int ${v} = sc.nextInt();\n`;
                        });
                        defaultCode = `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Đọc dữ liệu\n${scanCode}\n        // Viết code xử lý tại đây\n        \n    }\n}`;
                    } else {
                        defaultCode = 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // sc.nextInt(), sc.nextLine() để đọc dữ liệu\n        \n    }\n}';
                    }
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

        setAiDoctorOpen(false);
        setAiDoctorResult(null);
        setAiDoctorLoading(false);
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
        setAiDoctorOpen(false);
        setAiDoctorResult(null);
        setAiDoctorLoading(false);

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
                    setDaSai(false);
                    if (khiHoanThanh) {
                        const phanTram = (passCount / duLieu.testCases.length) * 100;
                        khiHoanThanh(phanTram, true);
                    }
                    Swal.fire({ title: 'Thành công!', text: 'Hoàn thành bài tập.', icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                } else {
                    setDaSai(true);
                    Swal.fire({ title: 'Sai kết quả!', text: 'Kiểm tra lại code của bạn.', icon: 'error', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                }
            } else {
                const infrastructureError = data.results.find(r => r.errorMessage?.includes('[INFRA]'))?.errorMessage;
                Swal.fire({
                    title: infrastructureError ? 'Máy chủ chấm đang quá tải' : 'Lỗi biên dịch máy chủ',
                    text: infrastructureError?.replace('[INFRA]', '').trim() || 'Vui lòng thử lại sau.',
                    icon: 'error', toast: true, position: 'top-end', timer: 4000, showConfirmButton: false
                });
                setTestResults(duLieu.testCases.map(() => ({ status: 'fail', output: 'Chưa thể chấm bài', error: infrastructureError || 'Lỗi Call IDE' })));
            }

        } catch (err: unknown) {
            const error = err as any;
            const isUnavailable = error.response?.status === 503;
            Swal.fire({
                title: isUnavailable ? 'Máy chủ chấm đang quá tải' : 'Lỗi API',
                text: isUnavailable ? 'Vui lòng đợi một chút rồi nộp lại bài.' : (error.response?.data?.message || 'Gặp sự cố khi chấm điểm.'),
                icon: 'error', toast: true, position: 'top-end', timer: 4000, showConfirmButton: false
            });
            setTestResults(duLieu.testCases.map(() => ({ status: 'fail', output: 'Chưa thể chấm bài', error: isUnavailable ? 'Máy chủ chấm code đang quá tải.' : 'Lỗi mạng khi gọi API submit.' })));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm gọi AI Code Doctor phân tích lỗi
    const handleAiDoctor = async () => {
        if (!duLieu || !code.trim()) return;
        setAiDoctorLoading(true);
        setAiDoctorResult(null);
        setAiDoctorOpen(true);

        // Thu thập các test case bị sai từ kết quả hiện tại
        const testCasesSai = testResults
            .map((r, i) => ({ r, tc: duLieu.testCases[i] }))
            .filter(({ r }) => r.status === 'fail' && !duLieu.testCases[testResults.indexOf(r)]?.laTestAn)
            .slice(0, 3)
            .map(({ r, tc }) => ({
                Input: tc?.inputDuLieu ?? '',
                KetQuaThucTe: r.output,
                KetQuaMongDoi: tc?.outputMongDoi ?? ''
            }));

        // Lấy thông báo lỗi biên dịch nếu có
        const thongBaoLoi = testResults.find(r => r.error)?.error ?? '';

        try {
            const res = await axiosClient.post(`/api/BaiTap/thuc-hanh/${maBaiTap}/ai-goi-y`, {
                Code: code,
                NgonNgu: duLieu.ngonNgu,
                TieuDeBai: duLieu.tieuDe,
                ThongBaoLoi: thongBaoLoi,
                TestCasesSai: testCasesSai
            }) as { thanhCong: boolean; noiDungPhanTich: string };

            setAiDoctorResult(res.noiDungPhanTich);
        } catch {
            setAiDoctorResult('❌ AI đang bận hoặc gặp lỗi. Vui lòng thử lại sau.');
        } finally {
            setAiDoctorLoading(false);
            // Scroll xuống panel AI
            setTimeout(() => aiDoctorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        }
    };

    if (loading) return <div className="p-4">Đang tải bài tập thực hành...</div>;
    if (error || !duLieu) return <div className="p-4 text-red-500">{error || 'Bài tập không tồn tại.'}</div>;

    const { cleanGoiY, vars } = parseGoiY(duLieu.goiY);

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
                            <div className="cp-example-box" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                {renderFormattedInput(duLieu.testCases[0].inputDuLieu, vars)}
                            </div>
                            <p><strong>Kết quả đầu ra mong đợi:</strong></p>
                            <div className="cp-example-box" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{duLieu.testCases[0].outputMongDoi}</div>
                        </>
                    )}

                    {cleanGoiY && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', borderLeft: '4px solid #fcebb6', background: '#fffbeb', borderRadius: 4 }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#b45309', fontSize: '0.95rem' }}><i className="fas fa-lightbulb"></i> Gợi ý</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350f' }}>{cleanGoiY}</p>
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
                    <div style={{ flex: 1, minHeight: 0 }}>
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

                            {daSai && duLieu.loiGiaiMau && (
                                <button
                                    className={`cp-test-tab-btn ${activeTab === -1 ? 'active' : ''}`}
                                    onClick={() => setActiveTab(-1)}
                                    style={{ color: '#f69050' }}
                                >
                                    <i className="fas fa-lightbulb" style={{ marginRight: 4 }}></i>
                                    Lời giải mẫu
                                </button>
                            )}
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
                                        <div className="cp-io-box" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                            {renderFormattedInput(tc.inputDuLieu, vars) || "Không có đầu vào"}
                                        </div>

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

                        {/* TAB LỜI GIẢI MẪU */}
                        {activeTab === -1 && duLieu.loiGiaiMau && (
                            <div className="cp-test-pane active anim-enter">
                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                                    <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                            <i className="fas fa-code" style={{ color: '#f69050', marginRight: 8 }}></i>
                                            Lời giải tham khảo ({duLieu.ngonNgu})
                                        </span>
                                        <button
                                            onClick={() => {
                                                void navigator.clipboard.writeText(duLieu.loiGiaiMau || '');
                                                Swal.fire({ text: 'Đã sao chép lời giải!', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                                            }}
                                            style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            <i className="far fa-copy"></i> Sao chép
                                        </button>
                                    </div>
                                    <div style={{ padding: '16px', background: '#0f172a', color: '#e2e8f0', fontSize: '0.9rem', overflowX: 'auto' }}>
                                        <pre style={{ margin: 0, fontFamily: 'monospace', lineHeight: 1.6 }}>{duLieu.loiGiaiMau}</pre>
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', padding: '12px', background: '#fffbeb', borderLeft: '4px solid #fcebb6', borderRadius: 4, fontSize: '0.85rem', color: '#78350f' }}>
                                    💡 <strong>Lưu ý:</strong> Hãy cố gắng hiểu logic của lời giải trước khi áp dụng để nâng cao kỹ năng tư duy lập trình của bạn.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI CODE DOCTOR PANEL - hiện khi daSai */}
                {daSai && (
                    <div className="cp-ai-doctor-bar">
                        <div className="cp-ai-doctor-bar__left">
                            <span className="cp-ai-doctor-bar__icon">🤖</span>
                            <span className="cp-ai-doctor-bar__text">
                                <strong>AI Code Doctor</strong>
                                <span> — Bạn muốn AI phân tích lỗi và gợi ý hướng suy nghĩ?</span>
                            </span>
                        </div>
                        <button
                            className="cp-ai-doctor-bar__btn"
                            onClick={handleAiDoctor}
                            disabled={aiDoctorLoading}
                        >
                            {aiDoctorLoading
                                ? <><i className="fas fa-circle-notch fa-spin" /> Đang phân tích...</>
                                : <><i className="fas fa-stethoscope" /> Chẩn đoán lỗi</>
                            }
                        </button>
                    </div>
                )}

                {/* KẾT QUẢ AI CODE DOCTOR */}
                {aiDoctorOpen && (
                    <div className="cp-ai-doctor-panel anim-enter" ref={aiDoctorRef}>
                        <div className="cp-ai-doctor-panel__header">
                            <div className="cp-ai-doctor-panel__title">
                                <span className="cp-ai-doctor-panel__badge">🤖 AI Code Doctor</span>
                                <span className="cp-ai-doctor-panel__subtitle">Phân tích lỗi · Gợi ý hướng suy nghĩ (không viết code thay bạn)</span>
                            </div>
                            <button
                                className="cp-ai-doctor-panel__close"
                                onClick={() => { setAiDoctorOpen(false); setAiDoctorResult(null); }}
                                title="Đóng"
                            >
                                <i className="fas fa-times" />
                            </button>
                        </div>

                        <div className="cp-ai-doctor-panel__body">
                            {aiDoctorLoading && (
                                <div className="cp-ai-doctor-panel__loading">
                                    <div className="cp-ai-doctor-panel__loading-dots">
                                        <span /><span /><span />
                                    </div>
                                    <p>AI đang đọc code của bạn và chuẩn bị gợi ý...</p>
                                </div>
                            )}
                            {!aiDoctorLoading && aiDoctorResult && (
                                <div className="cp-ai-doctor-panel__result">
                                    <ReactMarkdown>{aiDoctorResult}</ReactMarkdown>
                                </div>
                            )}
                        </div>

                        <div className="cp-ai-doctor-panel__footer">
                            <button
                                className="cp-ai-doctor-panel__retry"
                                onClick={handleAiDoctor}
                                disabled={aiDoctorLoading}
                            >
                                <i className="fas fa-redo" /> Hỏi lại AI
                            </button>
                            <span className="cp-ai-doctor-panel__disclaimer">
                                💡 AI chỉ gợi ý hướng suy nghĩ, không viết code giải pháp.
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
