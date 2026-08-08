import React, { useState, useEffect } from 'react';
import axiosClient from '@/configs/axios';
import ReactMarkdown from 'react-markdown';
// THÊM 2 DÒNG IMPORT NÀY VÀO ĐÂY:
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface VideoSummaryProps {
    maBaiHoc: number;
    phuDeGoc: string;
    linkVideo: string;
    tieuDe: string;
}

export const VideoSummary: React.FC<VideoSummaryProps> = ({ maBaiHoc, phuDeGoc, linkVideo, tieuDe }) => {
    const [ketQuaTomTat, setKetQuaTomTat] = useState<string | null>(null);
    const [dangXuLy, setDangXuLy] = useState(false);
    const [loi, setLoi] = useState(false);
    const [daCopy, setDaCopy] = useState(false);

    const storageKey = `ai_summary_lesson_${maBaiHoc}`;

    useEffect(() => {
        const cachedData = localStorage.getItem(storageKey);
        if (cachedData) {
            setKetQuaTomTat(cachedData);
        } else {
            setKetQuaTomTat(null);
        }
        setLoi(false);
        setDaCopy(false);
    }, [maBaiHoc]);

    const xuLyTomTatVideo = async () => {
        setDangXuLy(true);
        setLoi(false);
        try {
            let videoId = "";
            if (linkVideo) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = linkVideo.match(regExp);
                videoId = (match && match[2].length === 11) ? match[2] : "";
            }

            const response: any = await axiosClient.post('/api/ChatBotAI/tom-tat-video', {
                MaBaiHoc: maBaiHoc,
                PhuDeVideo: phuDeGoc || "",
                VideoId: videoId,
                TieuDe: tieuDe || ""
            });

            const ketQua = response.ketQua;
            setKetQuaTomTat(ketQua);
            localStorage.setItem(storageKey, ketQua);

        } catch (error) {
            console.error("Lỗi tóm tắt video:", error);
            setLoi(true);
        } finally {
            setDangXuLy(false);
        }
    };

    const xuLyCopy = async () => {
        if (!ketQuaTomTat) return;
        try {
            await navigator.clipboard.writeText(ketQuaTomTat);
            setDaCopy(true);
            setTimeout(() => setDaCopy(false), 2000);
        } catch (err) {
            console.error("Không thể sao chép:", err);
        }
    };

    // const handleLamMoi = () => {
    //     Swal.fire({
    //         title: 'Bạn muốn AI phân tích và tóm tắt lại từ đầu?',
    //         icon: 'question',
    //         showCancelButton: true,
    //         confirmButtonText: 'Có',
    //         cancelButtonText: 'Hủy'
    //     }).then(result => {
    //         if (result.isConfirmed) {
    //             localStorage.removeItem(storageKey);
    //             xuLyTomTatVideo();
    //         }
    //     });
    // }

    return (
        <div className="ai-summary-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>
                    <i className="fas fa-book-open me-2" style={{ color: 'var(--primary)' }}></i>
                    Tài liệu & Tóm tắt
                </h3>

                {!ketQuaTomTat && !dangXuLy && !loi && (
                    <button className="btn-ai-summarize" onClick={xuLyTomTatVideo}>
                        <i className="fas fa-magic me-1"></i> Tóm tắt Video bằng AI
                    </button>
                )}

                {ketQuaTomTat && !dangXuLy && (
                    <button
                        className="btn-ai-summarize"
                        onClick={xuLyCopy}
                        aria-label="Sao chép kết quả tóm tắt"
                    >
                        <i className={daCopy ? 'fas fa-check me-1' : 'fas fa-copy me-1'}></i>
                        {daCopy ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                )}
            </div>

            {dangXuLy && (
                <div className="ai-loading-pulse" style={{ marginTop: '20px' }}>
                    <i className="fas fa-brain fa-spin me-2" style={{ color: 'var(--primary)' }}></i>
                    EduCode AI đang phân tích video, vui lòng chờ giây lát...
                </div>
            )}

            {loi && !dangXuLy && (
                <div style={{
                    marginTop: '20px', padding: '16px', background: 'var(--danger-soft)',
                    borderRadius: '8px', border: '1px solid var(--danger)', color: 'var(--danger-strong)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
                }}>
                    <span>
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Đã có lỗi xảy ra khi gọi AI. Vui lòng thử lại.
                    </span>
                    <button className="btn-ai-summarize" onClick={xuLyTomTatVideo}>
                        <i className="fas fa-sync-alt me-1"></i> Thử lại
                    </button>
                </div>
            )}

            {ketQuaTomTat && !dangXuLy && (
                <>
                    <div className="ai-summary-result">
                        {/* THAY ĐỔI CÁCH RENDER MARKDOWN Ở ĐÂY */}
                        <ReactMarkdown
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            {...props}
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{
                                                borderRadius: '8px',
                                                padding: '16px',
                                                fontSize: '14px',
                                                marginTop: '10px',
                                                marginBottom: '10px'
                                            }}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code {...props} className={className} style={{
                                            backgroundColor: '#f1f5f9',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            color: 'var(--danger)',
                                            fontFamily: 'monospace'
                                        }}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
                            {ketQuaTomTat}
                        </ReactMarkdown>
                    </div>

                    <div style={{
                        marginTop: '15px', padding: '12px 16px', backgroundColor: 'var(--primary-soft)',
                        borderRadius: '8px', border: '1px dashed var(--primary)', fontSize: '14px',
                        color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <i className="fas fa-comment-dots" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                        <span>
                            Bạn chưa hiểu rõ ý nào trong bản tóm tắt?
                            <strong> Hãy hỏi Trợ lý AI</strong> ở góc dưới bên phải để được giải thích chi tiết nhé!
                        </span>
                    </div>
                </>
            )}

            {!ketQuaTomTat && !dangXuLy && !loi && (
                <div style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>
                    Nhấn nút phía trên để AI giúp bạn tóm tắt nội dung chính của video này.
                </div>
            )}
        </div>
    );
};