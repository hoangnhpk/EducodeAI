import { useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import YouTube, { type YouTubeEvent } from 'react-youtube';
import Swal from 'sweetalert2';
import { KhoaHocService, type LuuGhiChuDTO, type LuuTienDoDTO } from '@/services/khoa-hoc.service';
import { VideoAIService, type VideoChapterDTO } from '@/services/video-ai.service';

// 1. Định nghĩa kiểu dữ liệu cho Ref để component cha (NoiDungKhoaHoc) hiểu
export interface NoiDungVideoRef {
  seekTo: (seconds: number) => void;
}

interface Props {
  videoUrl?: string | null;
  videoSource?: string | null;
  subtitleUrl?: string | null;
  maBaiHoc: number;
  maNguoiDung: number;
  daXem?: boolean;
  onVideoCompleted?: (maBaiHoc: number) => void;
}

// 2. Bọc component trong forwardRef
export const NoiDungVideo = forwardRef<NoiDungVideoRef, Props>(({ videoUrl, videoSource, maBaiHoc, maNguoiDung, daXem, onVideoCompleted }, ref) => {
  const playerRef = useRef<any>(null);
  const [daSanSang, setDaSanSang] = useState(false);
  const [thoiLuongVideo, setThoiLuongVideo] = useState(0);
  const [thoiGianHienTai, setThoiGianHienTai] = useState(0);

  // --- AI Video Interactive ---
  const [chapters, setChapters] = useState<VideoChapterDTO[]>([]);
  const chaptersRef = useRef<VideoChapterDTO[]>([]); // Fix stale closure trong setInterval
  const [quizChapter, setQuizChapter] = useState<VideoChapterDTO | null>(null);
  const [cauHoiHienTai, setCauHoiHienTai] = useState(0);
  const [dapAnDaChon, setDapAnDaChon] = useState<string>("");
  const [ketQuaDung, setKetQuaDung] = useState<boolean | null>(null);

  // Refs cho logic Anti-cheat
  const daLuuTienDoRef = useRef(false);
  const dangCanhBaoRef = useRef(false);
  const lastValidVideoTimeRef = useRef(0);
  const lastRealTimeRef = useRef(Date.now());

  // 3. Expose hàm seekTo ra bên ngoài cho SidebarGhiChu gọi
  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (playerRef.current) {
        // --- QUAN TRỌNG: Bỏ qua Anti-cheat khi tua từ ghi chú ---
        dangCanhBaoRef.current = true; // Tạm khóa cảnh báo

        playerRef.current.seekTo(seconds, true);
        playerRef.current.playVideo();

        // Cập nhật lại mốc chuẩn để Anti-cheat không báo lỗi
        lastValidVideoTimeRef.current = seconds;
        lastRealTimeRef.current = Date.now();
        setThoiGianHienTai(seconds);

        // Mở lại kiểm tra sau 1 giây (để video ổn định)
        setTimeout(() => {
          dangCanhBaoRef.current = false;
        }, 1000);
      }
    }
  }));

  // Lấy Video ID từ URL YouTube
  const videoId = useMemo(() => {
    if (!videoUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }, [videoUrl]);

  // Xác định nguồn video: ưu tiên videoSource từ backend, fallback về parse URL
  const laYouTube = useMemo(() => {
    if (videoSource) return videoSource.toLowerCase() === 'youtube';
    return videoId !== null;
  }, [videoSource, videoId]);

  // Cấu hình Player
  const tuyChinh = useMemo(() => ({
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  }), []);

  // --- API: Lưu tiến độ ---
  const luuTienDo = useCallback(async (thoiGianThuc: number) => {
    if (daLuuTienDoRef.current || thoiLuongVideo === 0) return;
    daLuuTienDoRef.current = true;
    try {
      const payload: LuuTienDoDTO = {
        MaBaiHoc: maBaiHoc,
        MaNguoiDung: maNguoiDung,
        DaXem: true,
        ThoiGianHoc: Math.max(Math.round(thoiGianThuc), 1),
      };

      await KhoaHocService.luuTienDo(payload);
      onVideoCompleted?.(maBaiHoc);
    } catch (loi) { console.error('Lỗi lưu tiến độ:', loi); }
  }, [thoiLuongVideo, maBaiHoc, maNguoiDung, onVideoCompleted]);

  // --- LOGIC: Xử lý Gian lận (Anti-Cheat) ---
  const xuLyGianLan = (currentTime: number, lastValidTime: number) => {
    return;
    if (dangCanhBaoRef.current) return; // Nếu đang tua từ ghi chú thì bỏ qua

    dangCanhBaoRef.current = true;
    playerRef.current.pauseVideo();
    const soGiayGianLan = Math.round(currentTime - lastValidTime);

    Swal.fire({
      icon: 'warning',
      title: 'Phát hiện tua nhanh!',
      html: `Bạn đã tua <b>${soGiayGianLan} giây</b>.<br/>Hệ thống yêu cầu học đúng thời lượng thực tế.`,
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      backdrop: `rgba(0,0,0,0.7)`,
      customClass: { container: 'swal-z-index-fix' }
    }).then(() => {
      playerRef.current.seekTo(lastValidTime, true);
      playerRef.current.playVideo();
      lastRealTimeRef.current = Date.now();
      lastValidVideoTimeRef.current = lastValidTime;
      dangCanhBaoRef.current = false;
    });
  };

  // --- LOGIC: Thêm Ghi Chú ---
  const themGhiChu = () => {
    if (!playerRef.current) return;

    dangCanhBaoRef.current = true;
    playerRef.current.pauseVideo();

    const thoiDiemGiay = Math.floor(playerRef.current.getCurrentTime());
    const thoiGianFormat = `${Math.floor(thoiDiemGiay / 60)}:${Math.floor(thoiDiemGiay % 60).toString().padStart(2, '0')}`;

    Swal.fire({
      title: `<span style="font-size:1.2rem">📝 Ghi chú tại <b>${thoiGianFormat}</b></span>`,
      input: 'textarea',
      inputPlaceholder: 'Nhập nội dung cần ghi nhớ...',
      inputAttributes: { 'aria-label': 'Nội dung ghi chú' },
      showCancelButton: true,
      confirmButtonText: 'Lưu ghi chú',
      confirmButtonColor: '#f69050',
      cancelButtonText: 'Hủy',
      showLoaderOnConfirm: true,
      preConfirm: async (noiDung) => {
        if (!noiDung) {
          Swal.showValidationMessage('Vui lòng nhập nội dung!');
          return;
        }
        try {
          const payload: LuuGhiChuDTO = {
            MaBaiHoc: maBaiHoc,
            MaNguoiDung: maNguoiDung,
            ThoiGianVideo: thoiDiemGiay,
            NoiDung: noiDung
          };

          await KhoaHocService.luuGhiChu(payload);
          return new Promise(resolve => setTimeout(() => resolve(noiDung), 500));
        } catch (error) {
          Swal.showValidationMessage(`Lỗi: ${error}`);
        }
      },
      allowOutsideClick: false
    }).then((result) => {
      lastRealTimeRef.current = Date.now();
      lastValidVideoTimeRef.current = thoiDiemGiay;

      dangCanhBaoRef.current = false;

      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Đã lưu!',
          timer: 1500,
          showConfirmButton: false
        });
        playerRef.current.playVideo();
      } else {
        playerRef.current.playVideo();
      }
    });
  };

  // --- Handlers Video ---
  const khiSanSang = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setDaSanSang(true);
    setThoiLuongVideo(playerRef.current.getDuration() || 0);
    lastValidVideoTimeRef.current = 0;
    lastRealTimeRef.current = Date.now();
  };

  const khiTrangThaiThayDoi = (event: YouTubeEvent) => {
    if (event.data === 0) {
      luuTienDo(playerRef.current?.getDuration() || 0);
    }

    if (event.data === 1) {
      if (dangCanhBaoRef.current) return;

      const currentVideoTime = playerRef.current.getCurrentTime();
      if (!daXem && (currentVideoTime - lastValidVideoTimeRef.current > 2)) {
        xuLyGianLan(currentVideoTime, lastValidVideoTimeRef.current);
        return;
      }
      lastRealTimeRef.current = Date.now();
    }
  };

  // Helper: Đánh dấu Chapter đã kiểm tra → cập nhật cả ref (để interval thấy ngay) và state (để UI re-render)
  const danhDauDaKiemTra = useCallback((maChapter: number) => {
    const updated = chaptersRef.current.map((c: VideoChapterDTO) =>
      c.maChapter === maChapter ? { ...c, daKiemTra: true } : c
    );
    chaptersRef.current = updated; // interval đọc ref này ngay lập tức → không trigger quiz lại
    setChapters(updated);
    setQuizChapter(null);
    dangCanhBaoRef.current = false;
    playerRef.current?.playVideo();
  }, []);

  // --- Lấy dữ liệu Chapters (AI Interactive) ---
  // dangTaiBaiRef chặn gọi API nhiều lần (React StrictMode, parent re-render)
  const dangTaiBaiRef = useRef<number>(0);
  useEffect(() => {
    if (dangTaiBaiRef.current === maBaiHoc) return; // Đã đang tải bài này rồi, bỏ qua
    dangTaiBaiRef.current = maBaiHoc;

    chaptersRef.current = [];
    setChapters([]);

    VideoAIService.khoiTaoVideoInteractive(maBaiHoc).then(data => {
      if (dangTaiBaiRef.current !== maBaiHoc) return; // Học viên đã chuyển sang bài khác rồi
      chaptersRef.current = data;
      setChapters(data);
    });
  }, [maBaiHoc]);

  // --- Loop Check Anti-Cheat & Quiz ---
  useEffect(() => {
    if (!daSanSang || daLuuTienDoRef.current) return;

    const interval = setInterval(() => {
      if (!playerRef.current || dangCanhBaoRef.current) return;

      const playerState = playerRef.current.getPlayerState();
      if (playerState !== 1) {
        lastRealTimeRef.current = Date.now();
        return;
      }

      const currentVideoTime = playerRef.current.getCurrentTime() || 0;
      const currentRealTime = Date.now();

      let realTimePassed = (currentRealTime - lastRealTimeRef.current) / 1000;
      if (realTimePassed > 3) realTimePassed = 1;

      const videoTimePassed = currentVideoTime - lastValidVideoTimeRef.current;
      const playbackRate = playerRef.current.getPlaybackRate() || 1;
      const allowedProgress = (realTimePassed * playbackRate) + 1.5;

      if (!daXem && videoTimePassed > allowedProgress) {
        xuLyGianLan(currentVideoTime, lastValidVideoTimeRef.current);
        return;
      }

      if (videoTimePassed <= allowedProgress || videoTimePassed < 0) {
        lastValidVideoTimeRef.current = currentVideoTime;
        lastRealTimeRef.current = currentRealTime;
        setThoiGianHienTai(currentVideoTime);
      }

      // KIỂM TRA MỐC THỜI GIAN ĐỂ HIỆN QUIZ
      // Chỉ hiện Quiz cho những Chapter có câu hỏi (videoQuizs.length > 0)
      const currentChapters = chaptersRef.current;
      if (currentChapters.length > 0) {
        const chuaKiemTra = currentChapters.find(c => 
          !c.daKiemTra && 
          c.videoQuizs && c.videoQuizs.length > 0 && 
          currentVideoTime >= c.thoiGianKetThuc
        );
        if (chuaKiemTra) {
          setQuizChapter(prev => {
            if (prev?.maChapter === chuaKiemTra.maChapter) return prev; // Đang hiện rồi, không làm gì
            playerRef.current.pauseVideo();
            dangCanhBaoRef.current = true;
            setCauHoiHienTai(0);
            setDapAnDaChon("");
            setKetQuaDung(null);
            return chuaKiemTra;
          });
        }
      }

      if (thoiLuongVideo > 0 && currentVideoTime >= thoiLuongVideo * 0.95) {
        luuTienDo(currentVideoTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [daSanSang, thoiLuongVideo, luuTienDo, daXem]);

  useEffect(() => {
    daLuuTienDoRef.current = false;
    dangCanhBaoRef.current = false;
    lastValidVideoTimeRef.current = 0;
    lastRealTimeRef.current = Date.now();
    setDaSanSang(false);
    setThoiLuongVideo(0);
    setThoiGianHienTai(0);
  }, [videoUrl]);

  if (!videoUrl) return (
    <div className="cp-video-frame d-flex align-items-center justify-content-center bg-dark text-white">
      Chưa có video
    </div>
  );

  return (
    <div className="cp-tab-pane active" style={{ display: 'block', height: '100%' }}>
      {laYouTube ? (
        <YouTube
          videoId={videoId ?? undefined}
          opts={tuyChinh}
          onReady={khiSanSang}
          onStateChange={khiTrangThaiThayDoi}
          className="cp-video-frame w-100 h-100"
          iframeClassName="w-100 h-100"
          style={{ aspectRatio: '16/9', borderRadius: '8px 8px 0 0' }}
        />
      ) : (
        <video
          ref={playerRef}
          controls
          controlsList="nodownload"
          className="cp-video-frame w-100 h-100"
          style={{ aspectRatio: '16/9', borderRadius: '8px 8px 0 0', background: '#000' }}
          src={videoUrl ? videoUrl.replace(/\.[^/.]+$/, '.mp4') : ''}
          poster={videoUrl ? videoUrl.replace(/\.[^/.]+$/, '.jpg') : undefined}
          onLoadedMetadata={(e) => {
            setThoiLuongVideo(e.currentTarget.duration);
            setDaSanSang(true);
            // mock YouTube player functions
            playerRef.current.getCurrentTime = () => playerRef.current?.currentTime || 0;
            playerRef.current.getDuration = () => playerRef.current?.duration || 0;
            playerRef.current.playVideo = () => playerRef.current?.play();
            playerRef.current.pauseVideo = () => playerRef.current?.pause();
            playerRef.current.seekTo = (time: number) => { if (playerRef.current) playerRef.current.currentTime = time; };
            // Trạng thái giống YouTube API: 1 = đang phát, 2 = tạm dừng, 0 = kết thúc
            playerRef.current.getPlayerState = () => {
              const v = playerRef.current;
              if (!v) return 2;
              if (v.ended) return 0;
              return v.paused ? 2 : 1;
            };
            playerRef.current.getPlaybackRate = () => playerRef.current?.playbackRate || 1;
          }}
          onEnded={() => luuTienDo(playerRef.current?.getDuration() || 0)}
          onTimeUpdate={(e) => {
            setThoiGianHienTai(e.currentTarget.currentTime);
          }}
          onPlay={() => {
            if (dangCanhBaoRef.current) return;
            lastRealTimeRef.current = Date.now();
          }}
        />
      )}

      {daSanSang && (
        <div style={{
          padding: '12px',
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontWeight: '600', color: '#555', fontSize: '0.95rem' }}>
              <i className="far fa-clock me-2"></i>
              {Math.floor(thoiGianHienTai / 60)}:{Math.floor(thoiGianHienTai % 60).toString().padStart(2, '0')} /{' '}
              {Math.floor(thoiLuongVideo / 60)}:{Math.floor(thoiLuongVideo % 60).toString().padStart(2, '0')}
            </div>

            {/* Badge hiển thị số mốc Quiz thực sự (có câu hỏi) */}
            {(() => {
              const soMocQuizThucSu = chapters.filter(c => c.videoQuizs && c.videoQuizs.length > 0).length;
              if (soMocQuizThucSu === 0) return null;
              return (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', borderRadius: 20, padding: '3px 10px',
                  fontSize: '0.78rem', fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                }}>
                  🧠 {soMocQuizThucSu} mốc Quiz
                </div>
              );
            })()}

            {/* Hiển thị mốc Quiz tiếp theo sắp đến (chỉ tính chapter có quiz) */}
            {(() => {
              const tiep = chapters.find(c => !c.daKiemTra && c.videoQuizs && c.videoQuizs.length > 0 && c.thoiGianKetThuc > thoiGianHienTai);
              if (!tiep) return null;
              const conLai = Math.max(0, Math.ceil(tiep.thoiGianKetThuc - thoiGianHienTai));
              if (conLai > 30) return null; // Chỉ hiện khi còn ≤30 giây
              return (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: '#fef3c7', color: '#92400e',
                  borderRadius: 20, padding: '3px 10px',
                  fontSize: '0.78rem', fontWeight: 700,
                  border: '1px solid #fcd34d',
                  animation: 'pulse 1s infinite',
                }}>
                  <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
                  ⏰ Quiz sau {conLai}s
                </div>
              );
            })()}
          </div>

          <button
            onClick={themGhiChu}
            className="btn btn-primary btn-sm"
            style={{
              borderRadius: '20px',
              padding: '4px 16px',
              fontWeight: '600',
              backgroundColor: '#f69050',
              borderColor: '#f69050',
              boxShadow: '0 2px 5px rgba(246, 144, 80, 0.3)'
            }}
          >
            <i className="fas fa-plus-circle me-1"></i> Thêm ghi chú
          </button>
        </div>
      )}

      {/* OVERLAY QUIZ INTERACTIVE - PREMIUM UI */}
      {quizChapter && (() => {
        const quiz = quizChapter.videoQuizs?.[cauHoiHienTai];
        const totalQuiz = quizChapter.videoQuizs?.length ?? 0;
        const progressPct = totalQuiz > 0 ? ((cauHoiHienTai) / totalQuiz) * 100 : 0;
        const answerKeys = ['A', 'B', 'C', 'D'] as const;
        type AnsKey = typeof answerKeys[number];
        const answerColors: Record<AnsKey, string> = { A: '#f69050', B: '#0ea5e9', C: '#10b981', D: '#a855f7' };

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(40,20,10,0.97) 50%, rgba(15,23,42,0.98) 100%)',
            zIndex: 99999, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(12px)',
            animation: 'fadeInQuiz 0.3s ease-out',
            overflowY: 'auto',
          }}>
            <style>{`
              @keyframes fadeInQuiz { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
              @keyframes slideUpAns { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
              .quiz-ans-btn { transition: all 0.2s ease; cursor: pointer; border: none; text-align: left; padding: 12px 18px; border-radius: 12px; font-size: 0.95rem; font-weight: 500; width: 100%; display: flex; align-items: center; gap: 12px; animation: slideUpAns 0.3s ease both; }
              .quiz-ans-btn:hover { transform: translateX(5px) scale(1.01); filter: brightness(1.1); }
              .quiz-submit-btn { transition: all 0.2s ease; cursor: pointer; }
              .quiz-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(246,144,80,0.5) !important; }
              .quiz-skip-btn { transition: all 0.2s ease; cursor: pointer; }
              .quiz-skip-btn:hover { background: rgba(255,255,255,0.1) !important; }
            `}</style>

            {/* Tiêu đề top */}
            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #f69050, #e67e22)',
                borderRadius: 30, padding: '6px 18px', marginBottom: 10,
                boxShadow: '0 4px 20px rgba(246,144,80,0.4)'
              }}>
                <span style={{ fontSize: '1.1rem' }}>🧠</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', letterSpacing: 1 }}>
                  KIỂM TRA NHANH
                </span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                {quizChapter.kienThucChinh}
              </div>
            </div>

            {/* Progress bar */}
            {totalQuiz > 1 && (
              <div style={{ width: '100%', maxWidth: 580, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Tiến độ</span>
                  <span style={{ color: '#fed7aa', fontSize: '0.75rem', fontWeight: 600 }}>{cauHoiHienTai + 1} / {totalQuiz}</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #f69050, #e67e22)', borderRadius: 10, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}

            {/* Card câu hỏi */}
            {quiz ? (
              <div style={{ width: '100%', maxWidth: 580 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 20, padding: '1.5rem', marginBottom: 14,
                  backdropFilter: 'blur(10px)'
                }}>
                  {/* Câu hỏi */}
                  <p style={{ color: '#e2e8f0', fontSize: '1.05rem', fontWeight: 600, marginBottom: 16, lineHeight: 1.6 }}>
                    <span style={{
                      display: 'inline-block', background: 'linear-gradient(135deg, #f69050, #e67e22)',
                      color: '#fff', borderRadius: 8, padding: '2px 10px', fontSize: '0.8rem',
                      marginRight: 8, verticalAlign: 'middle', fontWeight: 700
                    }}>
                      C{cauHoiHienTai + 1}
                    </span>
                    {quiz.cauHoi}
                  </p>

                  {/* Các đáp án */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {answerKeys.map((key, i) => {
                      const ansText = quiz[`dapAn${key}` as keyof typeof quiz] as string | undefined;
                      if (!ansText) return null;
                      const isSelected = dapAnDaChon === key;
                      const isCorrect = ketQuaDung === true && isSelected;
                      const isWrong = ketQuaDung === false && isSelected;
                      const color = answerColors[key];

                      return (
                        <button
                          key={key}
                          className="quiz-ans-btn"
                          style={{
                            animationDelay: `${i * 0.06}s`,
                            background: isCorrect
                              ? 'linear-gradient(135deg, #10b981, #059669)'
                              : isWrong
                                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                : isSelected
                                  ? `linear-gradient(135deg, ${color}dd, ${color}aa)`
                                  : 'rgba(255,255,255,0.07)',
                            border: isSelected ? `2px solid ${color}` : '2px solid transparent',
                            color: isSelected ? '#fff' : 'rgba(255,255,255,0.85)',
                            transform: isSelected ? 'translateX(5px)' : 'none',
                          }}
                          onClick={() => { if (ketQuaDung !== true) { setDapAnDaChon(key); setKetQuaDung(null); } }}
                        >
                          <span style={{
                            minWidth: 32, height: 32, borderRadius: 8,
                            background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#fff' : color,
                            flexShrink: 0
                          }}>
                            {isCorrect ? '✓' : isWrong ? '✗' : key}
                          </span>
                          {ansText}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  {ketQuaDung === false && (
                    <div style={{
                      marginTop: 12, padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                      color: '#fca5a5', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                      <span>❌</span> Chưa đúng rồi! Hãy suy nghĩ lại và thử chọn đáp án khác nhé.
                    </div>
                  )}
                  {ketQuaDung === true && (
                    <div style={{
                      marginTop: 12, padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                      color: '#6ee7b7', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                      <span>🎉</span> Xuất sắc! Bạn trả lời chính xác.
                    </div>
                  )}
                </div>

                {/* Nút hành động */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  {!quizChapter.batBuoc ? (
                    <button className="quiz-skip-btn" onClick={() => danhDauDaKiemTra(quizChapter.maChapter)} style={{
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)',
                      borderRadius: 10, padding: '9px 16px', fontSize: '0.85rem', cursor: 'pointer',
                    }}>
                      Bỏ qua ⏭
                    </button>
                  ) : (
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                      🔒 Bắt buộc hoàn thành
                    </div>
                  )}

                  <button className="quiz-submit-btn" onClick={() => {
                    if (!dapAnDaChon || ketQuaDung === true) return;
                    if (dapAnDaChon === quiz.dapAnDung) {
                      setKetQuaDung(true);
                      setTimeout(() => {
                        if (cauHoiHienTai < totalQuiz - 1) {
                          setCauHoiHienTai(cauHoiHienTai + 1); setDapAnDaChon(''); setKetQuaDung(null);
                        } else {
                          danhDauDaKiemTra(quizChapter.maChapter);
                        }
                      }, 1200);
                    } else {
                      setKetQuaDung(false);
                    }
                  }} style={{
                    background: dapAnDaChon ? 'linear-gradient(135deg, #f69050, #e67e22)' : 'rgba(255,255,255,0.1)',
                    color: dapAnDaChon ? '#fff' : 'rgba(255,255,255,0.3)',
                    border: 'none', borderRadius: 12, padding: '10px 28px', fontWeight: 700,
                    fontSize: '0.95rem', cursor: dapAnDaChon ? 'pointer' : 'not-allowed',
                    boxShadow: dapAnDaChon ? '0 4px 15px rgba(246,144,80,0.4)' : 'none',
                    minWidth: 150,
                  }}>
                    {ketQuaDung === true
                      ? (cauHoiHienTai < totalQuiz - 1 ? '➡ Câu tiếp theo' : '🏁 Hoàn tất!')
                      : (dapAnDaChon ? '✔ Xác nhận' : 'Chọn đáp án')}
                  </button>
                </div>
              </div>
            ) : (
              // Không có quiz, chỉ thông báo kiến thức mới
              <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📚</div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: 20 }}>
                  Bạn vừa hoàn thành một phần kiến thức quan trọng!
                </p>
                <button onClick={() => danhDauDaKiemTra(quizChapter.maChapter)} style={{
                  background: 'linear-gradient(135deg, #f69050, #e67e22)', color: '#fff',
                  border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 700,
                  fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(246,144,80,0.4)'
                }}>
                  Tiếp tục xem ▶
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
});