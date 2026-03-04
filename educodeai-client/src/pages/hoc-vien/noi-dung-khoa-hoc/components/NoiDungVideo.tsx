import { useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import YouTube, { type YouTubeEvent } from 'react-youtube';
import Swal from 'sweetalert2';
import { KhoaHocService, type LuuGhiChuDTO, type LuuTienDoDTO } from '@/services/khoa-hoc.service';

// 1. Định nghĩa kiểu dữ liệu cho Ref để component cha (NoiDungKhoaHoc) hiểu
export interface NoiDungVideoRef {
  seekTo: (seconds: number) => void;
}

interface Props {
  videoUrl?: string | null;
  maBaiHoc: number;
  maNguoiDung: number;
  daXem?: boolean;
  onVideoCompleted?: (maBaiHoc: number) => void;
}

// 2. Bọc component trong forwardRef
export const NoiDungVideo = forwardRef<NoiDungVideoRef, Props>(({ videoUrl, maBaiHoc, maNguoiDung, daXem, onVideoCompleted }, ref) => {
  const playerRef = useRef<any>(null);
  const [daSanSang, setDaSanSang] = useState(false);
  const [thoiLuongVideo, setThoiLuongVideo] = useState(0);
  const [thoiGianHienTai, setThoiGianHienTai] = useState(0);

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

  // Lấy Video ID từ URL
  const videoId = useMemo(() => {
    if (!videoUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }, [videoUrl]);

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

  // --- Loop Check Anti-Cheat ---
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
      if (thoiLuongVideo > 0 && currentVideoTime >= thoiLuongVideo * 0.1) {
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
  }, [videoId]);

  if (!videoId) return (
    <div className="cp-video-frame d-flex align-items-center justify-content-center bg-dark text-white">
      Chưa có video
    </div>
  );

  return (
    <div className="cp-tab-pane active" style={{ display: 'block', height: '100%' }}>
      <YouTube
        videoId={videoId}
        opts={tuyChinh}
        onReady={khiSanSang}
        onStateChange={khiTrangThaiThayDoi}
        className="cp-video-frame w-100 h-100"
        iframeClassName="w-100 h-100"
        style={{ aspectRatio: '16/9', borderRadius: '8px 8px 0 0' }}
      />

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
          <div style={{ fontWeight: '600', color: '#555', fontSize: '0.95rem' }}>
            <i className="far fa-clock me-2"></i>
            {Math.floor(thoiGianHienTai / 60)}:{Math.floor(thoiGianHienTai % 60).toString().padStart(2, '0')} /{' '}
            {Math.floor(thoiLuongVideo / 60)}:{Math.floor(thoiLuongVideo % 60).toString().padStart(2, '0')}
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
    </div>
  );
});